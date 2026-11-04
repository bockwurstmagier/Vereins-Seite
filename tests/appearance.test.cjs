const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),ts=require('typescript');
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/appearance.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObject});
const {normalizeAppearance,APPEARANCE_BOOTSTRAP}=exportsObject;
test('appearance rejects unknown values and external background URLs',()=>{
 const result=normalizeAppearance({mode:'invalid',background:'https://example.com/tracker',effects:'false'});
 assert.equal(result.mode,'dark');assert.equal(result.background,'stadium');assert.equal(result.effects,true);
});
for(const systemDark of [true,false]) test(`prepaint resolves system theme (${systemDark}) and honours reduced motion`,()=>{
 const root={dataset:{},style:{}};
 vm.runInNewContext(APPEARANCE_BOOTSTRAP,{document:{documentElement:root},localStorage:{getItem:()=>JSON.stringify({mode:'system',background:'crest',effects:true})},matchMedia:q=>({matches:q.includes('reduced-motion')||systemDark})});
 assert.equal(root.dataset.theme,systemDark?'dark':'light');assert.equal(root.dataset.background,'crest');assert.equal(root.dataset.effects,'off');assert.equal(root.style.colorScheme,root.dataset.theme);
});
test('unavailable or corrupt storage never prevents initial page rendering',()=>{
 for(const getItem of [()=>{throw Error('blocked')},()=>'{broken']) assert.doesNotThrow(()=>vm.runInNewContext(APPEARANCE_BOOTSTRAP,{localStorage:{getItem}}));
});
test('all four backgrounds and explicit effects preference survive prepaint',()=>{
 for(const background of ['stadium','smoke','crest','plain']){
 const root={dataset:{},style:{}};
 vm.runInNewContext(APPEARANCE_BOOTSTRAP,{document:{documentElement:root},localStorage:{getItem:()=>JSON.stringify({mode:'light',background,effects:false})},matchMedia:()=>({matches:false})});
 assert.equal(root.dataset.background,background);assert.equal(root.dataset.theme,'light');assert.equal(root.dataset.effects,'off');
 }
});
