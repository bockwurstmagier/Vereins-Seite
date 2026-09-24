const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(file,mocks={}) {
 const filename=path.resolve(__dirname,'..',file),mod=new Module(filename,module);
 mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));
 const original=mod.require.bind(mod);mod.require=id=>Object.hasOwn(mocks,id)?mocks[id]:original(id);
 mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
 return mod.exports;
}
const helper=load('lib/match-scorers.ts');
const players=[{id:'p1',first_name:'Max',last_name:'Muster'},{id:'p2',first_name:'Jan',last_name:'Test'}];
const goal=(minute,player_id='p1',description=null)=>({event_type:'goal',minute,player_id,description});
test('scorers include all minutes, added time and multiple players without duplicating attached video',()=>{
 assert.deepEqual(helper.scorersFromEvents([goal(92),goal(12),goal(50,'p2'),{...goal(20),event_type:'note'},{...goal(12),event_type:'yellow_card'}],players),['Max Muster (12′, 92′)','Jan Test (50′)']);
});
test('opponent goals are excluded and missing names are not invented',()=>{
 assert.deepEqual(helper.scorersFromEvents([goal(3,null,'Tor für den Gegner'),goal(8,null),goal(9,'deleted')],players),['Torschütze nicht zugeordnet (8′)','Torschütze nicht zugeordnet (9′)']);
 assert.deepEqual(helper.scorersFromEvents([goal(3,'p1','Tor für den Gegner')],players),['Max Muster (3′)']);
});
test('last-match reader derives scorers for already finished games and reflects corrections without writes',async()=>{
 let goals=[goal(12),goal(67)]; const filters=[];
 const match={id:'match',home_team:'Gast',away_team:'Middelich-Resse',status:'finished',scorers:['Manuell 1']};
 const supabase={from(table){const q={select(){return q},eq(k,v){filters.push([table,k,v]);return q},or(){return q},order(){return q},limit(){return q},in(){return q},maybeSingle:async()=>({data:match,error:null}),then(resolve){return Promise.resolve({data:table==='match_events'?goals:players,error:null}).then(resolve)}};return q}};
 const {getLastFinishedMatch}=load('lib/public-content.ts',{'./match-scorers':helper,'./matches':{getNextMatch:async()=>null},'./supabase/server':{createClient:async()=>supabase},'./clubs':{getClubIdentityMap:async()=>new Map()}});
 assert.deepEqual((await getLastFinishedMatch()).scorers,['Max Muster (12′, 67′)']);
 goals=[goal(12,'p2')];assert.deepEqual((await getLastFinishedMatch()).scorers,['Jan Test (12′)']);
 goals=[goal(12,null,'Tor für den Gegner')];assert.deepEqual((await getLastFinishedMatch()).scorers,[]);
 goals=[];assert.deepEqual((await getLastFinishedMatch()).scorers,['Manuell 1']);
 assert.ok(filters.some(([table,key,value])=>table==='match_events'&&key==='match_id'&&value==='match'));
});
