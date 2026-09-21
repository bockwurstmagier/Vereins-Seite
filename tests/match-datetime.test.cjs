const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
function load(file,mocks={}) {
 const filename=path.resolve(__dirname,'..',file),mod=new Module(filename,module);
 mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));
 const original=mod.require.bind(mod);mod.require=id=>Object.hasOwn(mocks,id)?mocks[id]:original(id);
 mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
 return mod.exports;
}
const dates=load('lib/match-datetime.ts');
test('Berlin 19:30 round trips in summer/winter independently of server timezone',()=>{
 const previous=process.env.TZ;
 try{for(const zone of ['UTC','Europe/Berlin','America/New_York']){
  process.env.TZ=zone;
  assert.equal(dates.parseMatchDateTime('2026-09-22','19:30'),'2026-09-22T17:30:00.000Z');
  assert.equal(dates.parseMatchDateTime('2026-12-22','19:30'),'2026-12-22T18:30:00.000Z');
  assert.equal(dates.parseMatchDateTime('2026-09-22','00:30'),'2026-09-21T22:30:00.000Z');
 }}finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
test('DST boundary, nonexistent/ambiguous times and invalid dates are handled explicitly',()=>{
 assert.equal(dates.parseMatchDateTime('2026-03-29','03:30'),'2026-03-29T01:30:00.000Z');
 assert.equal(dates.parseMatchDateTime('2026-10-25','03:30'),'2026-10-25T02:30:00.000Z');
 assert.throws(()=>dates.parseMatchDateTime('2026-03-29','02:30'),/existiert/);
 assert.throws(()=>dates.parseMatchDateTime('2026-10-25','02:30'),/zweimal/);
 for(const [date,time] of [['2026-02-30','19:30'],['2026-09-22','24:00'],['bad','19:30']])assert.throws(()=>dates.parseMatchDateTime(date,time),/ungültig/);
});
for(const action of ['createMatch','updateMatch'])test(`${action} stores Berlin 19:30 as 17:30 UTC on the server`,async()=>{
 const writes=[];
 const supabase={auth:{getUser:async()=>({data:{user:{id:'user'}}})},from(){const q={insert(value){writes.push(value);return q},update(value){writes.push(value);return q},eq(){return q},then(resolve){return Promise.resolve({error:null}).then(resolve)}};return q;}};
 const actions=load('app/admin/spiele/actions.ts',{'../../../lib/match-datetime':dates,'../../../lib/supabase/server':{createClient:async()=>supabase},'next/cache':{revalidatePath(){}},'next/navigation':{redirect(){throw Error('redirect')}}});
 const form=new FormData();for(const [key,value]of Object.entries({id:'match',competition:'Kreispokal',home_team:'Middelich-Resse',away_team:'Gast',date:'2026-09-22',time:'19:30',location:'Platz',status:'scheduled'}))form.set(key,value);
 await assert.rejects(actions[action](form),/redirect/);
 assert.equal(writes[0].match_date,'2026-09-22T17:30:00.000Z');
});
