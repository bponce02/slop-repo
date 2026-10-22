import {load} from './vendor/compiler.wasm-runtime.js';
let vm;
let buffers=['',''];function put(i,ch){if(ch===10){const text=buffers[i];if(text.startsWith('@STATE '))postMessage({type:'state',values:text.slice(7).split(',').map(Number)});else postMessage({type:'output',text});buffers[i]='';}else buffers[i]+=String.fromCharCode(ch);}
onmessage=async({data})=>{try{if(data.type==='tick'){if(vm?.exports.tick)vm.exports.tick(data.enabled,data.autonomous,data.left,data.right,data.reset);postMessage({type:'ticked'});return;}
 vm=await load(data.wasm,{installImports(o){o.teavmConsole.putcharStdout=c=>put(0,c);o.teavmConsole.putcharStderr=c=>put(1,c);}});vm.exports.main([]);for(const text of buffers)if(text)postMessage({type:'output',text});buffers=['',''];postMessage({type:vm.exports.tick?'robot-ready':'done'});}catch(e){postMessage({type:'error',text:e.stack||String(e)});}};
