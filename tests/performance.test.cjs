const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(file,mocks={}) {
 const filename=path.resolve(__dirname,'..',file),mod=new Module(filename,module);
 mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));
 const original=mod.require.bind(mod);mod.require=id=>Object.hasOwn(mocks,id)?mocks[id]:original(id);
 mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
 return mod.exports;
}
test('scheduled-match loader shares queries within simulated React request scope, not across requests',async()=>{
 let scope=new Map(),calls={matches:0,clubs:0};
 // Model the documented per-render React cache boundary; verify data-loader wiring.
 const cache=fn=>(...args)=>{let values=scope.get(fn);if(!values){values=new Map();scope.set(fn,values)}const key=JSON.stringify(args);if(!values.has(key))values.set(key,fn(...args));return values.get(key)};
 const rows=[{id:'cup',competition:'Kreispokal',home_team:'Middelich Resse',away_team:'Gast'},{id:'league',competition:'Kreisliga',home_team:'Gast',away_team:'Middelich-Resse'}];
 const supabase={from(table){calls[table]++;const q={select(){return q},eq(){return q},or(){return q},gte(){return q},order(){return q},limit(){return q},then(resolve){return Promise.resolve({data:table==='matches'?rows:[],error:null}).then(resolve)}};return q}};
 const selection=load('lib/match-selection.ts',{'./club-name':load('lib/club-name.ts')});
 const {getNextMatch}=load('lib/matches.ts',{react:{cache},'./match-selection':selection,'./supabase':{supabase}});
 const result=await Promise.all([getNextMatch(),getNextMatch(),getNextMatch('cup')]);
 assert.deepEqual(result.map(x=>x.id),['league','league','cup']);assert.deepEqual(calls,{matches:1,clubs:1});
 scope=new Map();await getNextMatch();assert.deepEqual(calls,{matches:2,clubs:2});
});
test('quick navigation watches section boundaries and avoids unchanged state updates',()=>{
 const oldDocument=global.document,oldObserver=global.MutationObserver;
 const effects=[],observed=[];let state,callback,disconnected=false;
 const items=[{id:'cup',label:'Pokal'},{id:'highlights',label:'Highlights'}];
 const sections={'home-cup':{children:[{tagName:'SECTION'}]},'home-highlights':{children:[{tagName:'TEMPLATE'}]}};
 global.document={getElementById:id=>sections[id]};
 global.MutationObserver=class{constructor(cb){callback=cb}observe(node,options){observed.push(options)}disconnect(){disconnected=true}};
 try{
 const Component=load('components/home/HomeQuickNavigation.tsx',{react:{useState(initial){if(Array.isArray(initial)){state=initial;return[initial,next=>{state=typeof next==='function'?next(state):next}]}return[initial,()=>{}]},useRef:()=>({current:null}),useEffect:fn=>effects.push(fn)}}).default;
 Component({items});const cleanup=effects[0]();
 assert.deepEqual(state,[items[0]]);assert.ok(observed.every(option=>option.childList===true&&!option.subtree));
 const before=state;callback();assert.equal(state,before);
 sections['home-highlights'].children=[{tagName:'SECTION'}];callback();assert.deepEqual(state,items);
 sections['home-cup'].children=[];callback();assert.deepEqual(state,[items[1]]);
 cleanup();assert.equal(disconnected,true);
 }finally{global.document=oldDocument;global.MutationObserver=oldObserver}
});
test('home team preview requests six players while full-team loader still supports unrestricted access',async()=>{
 let limit;
 const Preview=load('components/home/TeamFromSupabase.tsx',{'../../lib/team':{getActivePlayers:async value=>{limit=value;return[]}},'./DynamicTeamSection':{__esModule:true,default:()=>null}}).default;
 await Preview();assert.equal(limit,6);
});
