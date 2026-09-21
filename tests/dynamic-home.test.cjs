const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function load(file, mocks = {}) {
  const filename = path.resolve(__dirname, '..', file), mod = new Module(filename, module);
  mod.filename = filename; mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = id => Object.hasOwn(mocks,id) ? mocks[id] : original(id);
  mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
  return mod.exports;
}
const clubs = load('lib/club-name.ts');
const selection = load('lib/match-selection.ts', { './club-name': clubs });
const modules = load('lib/home-modules.ts');
const highlight = load('lib/top-highlights.ts');

test('home configuration keeps defaults, excludes unknown modules and validates persisted settings', () => {
  const result = modules.normalizeHomeModules([{id:'news',enabled:false,order:0},{id:'cup',enabled:true,order:1},{id:'team',enabled:'false',order:-5},{id:'injected',enabled:true,order:0}]);
  assert.equal(result.length, modules.HOME_MODULES.length);
  assert.equal(result.find(x=>x.id==='news').enabled,false);
  assert.equal(result.find(x=>x.id==='team').enabled,true);
  assert.ok(!result.some(x=>x.id==='injected'));
  assert.ok(result.findIndex(x=>x.id==='cup') < result.findIndex(x=>x.id==='match'));
  assert.equal(modules.normalizeHomeModules(null).every(x=>x.enabled),true);
});
test('league selection skips earlier cup, friendly and unrelated name; cup selects away name variant', async () => {
  const rows = [
    {id:'other', home_team:'Middelich',away_team:'Other',competition:'Kreisliga'},
    {id:'cup', home_team:'Gegner',away_team:'SpVgg Middelich Resse 71/81',competition:'Kreispokal'},
    {id:'friendly',home_team:'Middelich-Resse',away_team:'Gegner',competition:'Freundschaftsspiel'},
    {id:'league',home_team:'SPVGG MIDDELICH–RESSE',away_team:'Gegner',competition:'Kreisliga B'},
  ];
  const supabase = {from(table) { const q={select(){return q},eq(){return q},or(){return q},gte(){return q},order(){return q},limit(){return q},then(resolve){return Promise.resolve({data:table==='matches'?rows:[],error:null}).then(resolve)}};return q;}};
  const {getNextMatch}=load('lib/matches.ts',{'./supabase':{supabase},'./match-selection':selection});
  assert.equal((await getNextMatch()).id,'league');assert.equal((await getNextMatch('cup')).id,'cup');
});
test('top highlights require finished match AND marked video; unmark removes visibility', () => {
  assert.equal(highlight.isTopHighlight({is_highlight:true,video_url:'clip'},'live'),false);
  assert.equal(highlight.isTopHighlight({is_highlight:true,video_url:'clip'},'finished'),true);
  assert.equal(highlight.isTopHighlight({is_highlight:false,video_url:'clip'},'finished'),false);
  assert.equal(highlight.isTopHighlight({is_highlight:true,video_url:null},'finished'),false);
});
function harness({ deny=false, linked={id:'goal',video_url:null}, match={home_team:'Gegner',away_team:'Middelich Resse',home_score:1,away_score:2}, event={id:'goal',event_type:'goal',player_id:'p1',description:null} }={}) {
  const writes=[], filters=[];
  const supabase={auth:{getUser:async()=>({data:{user:{id:'operator'}}})},storage:{from:()=>({getPublicUrl:p=>({data:{publicUrl:'https://example.test/'+p}}),remove:async()=>({error:null})})},from(table){
    let op,payload;const q={select(){return q},eq(k,v){filters.push([table,k,v]);return q},is(){return q},order(){return q},limit(){return q},
      maybeSingle:async()=>({data:table==='matches'?match:(filters.some(x=>x[1]==='id')?linked:event),error:null}),
      insert(p){op='insert';payload=p;return q},update(p){op='update';payload=p;return q},upsert(p){op='upsert';payload=p;return q},delete(){op='delete';return q},
      then(resolve){writes.push({table,op,payload});return Promise.resolve({data:[{id:'goal'}],error:null}).then(resolve)}};return q;}};
  const mocks={'next/cache':{revalidatePath(){}},'next/navigation':{redirect(url){throw Error('redirect:'+url)}},'../../../lib/auth/roles':{requireRole:async()=>{if(deny)throw Error('forbidden')}},'../../../lib/supabase/server':{createClient:async()=>supabase},'../../../lib/live-clock':{calculateLiveMinute:()=>67},'../../../lib/club-name':clubs,'../../../lib/push/server':{sendLivePush:async()=>{}}};
  return {writes,filters,actions:load('app/admin/live/actions.ts',mocks),settings:load('app/admin/startseite/actions.ts',{...mocks,'../../../lib/home-modules':modules})};
}
test('linked top video updates original event only and preserves goal metadata, score, clock and match status', async () => {
  const h=harness();await h.actions.addLiveMoment({matchId:'m',minute:1,eventType:'moment',description:'stale',eventId:'goal',videoPath:'operator/m/clip.mp4',topMoment:true});
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].table,'match_events');assert.equal(h.writes[0].op,'update');
  assert.deepEqual(Object.keys(h.writes[0].payload).sort(),['is_highlight','video_path','video_url']);
  assert.equal(h.writes[0].payload.is_highlight,true);assert.ok(h.filters.some(x=>x[1]==='match_id'&&x[2]==='m'));
});
test('video rejects missing/cross-match event, already occupied event and foreign storage path',async()=>{
  for(const linked of [null,{id:'goal',video_url:'existing'}]) {const h=harness({linked});await assert.rejects(h.actions.addLiveMoment({matchId:'m',eventId:'goal',videoPath:'operator/m/clip.mp4'}),/Ereignis/);assert.equal(h.writes.length,0);}
  const h=harness();await assert.rejects(h.actions.addLiveMoment({matchId:'m',videoPath:'other/m/clip.mp4'}),/Pfad/);assert.equal(h.writes.length,0);
});
test('standalone replay does not reopen finished game or change scores',async()=>{
  const h=harness();await h.actions.addLiveMoment({matchId:'m',minute:92,eventType:'moment',videoPath:'operator/m/clip.mp4',topMoment:true});
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].payload.minute,92);assert.equal(h.writes[0].payload.event_type,'note');
});
test('home settings and uploads reject unauthorized caller before any write',async()=>{
  const h=harness({deny:true});await assert.rejects(h.settings.saveHomeModules(new FormData()),/forbidden/);await assert.rejects(h.actions.addLiveMoment({}),/forbidden/);assert.equal(h.writes.length,0);
});
test('home settings persist disabled modules and sorting',async()=>{
  const h=harness(), form=new FormData();form.set('cup_enabled','on');form.set('cup_order','1');
  await assert.rejects(h.settings.saveHomeModules(form),/redirect/);const stored=h.writes[0].payload;
  assert.equal(stored.key,'home_modules');assert.equal(stored.value.find(x=>x.id==='news').enabled,false);assert.equal(stored.value.find(x=>x.id==='cup').order,1);
});
test('away goal undo reduces away score and deletes event; opponent goal reduces home score',async()=>{
  for(const opponent of [false,true]){const h=harness({event:{id:'goal',event_type:'goal',player_id:opponent?null:'p1',description:opponent?'Tor für den Gegner':null}});const form=new FormData();form.set('match_id','m');await assert.rejects(h.actions.undoLastEvent(form),/redirect/);const score=h.writes.find(x=>x.table==='matches').payload;assert.equal(score.home_score,opponent?0:1);assert.equal(score.away_score,opponent?2:1);assert.equal(h.writes.at(-1).op,'delete');}
});
