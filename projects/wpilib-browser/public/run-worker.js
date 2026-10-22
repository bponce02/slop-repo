import {load} from './vendor/compiler.wasm-runtime.js';
onmessage=async({data})=>{let buffers=['',''];function put(i,ch){if(ch===10){postMessage({type:'output',text:buffers[i]});buffers[i]='';}else buffers[i]+=String.fromCharCode(ch);}
 try{const vm=await load(data.wasm,{installImports(o){o.teavmConsole.putcharStdout=c=>put(0,c);o.teavmConsole.putcharStderr=c=>put(1,c);}});vm.exports.main([]);for(const text of buffers)if(text)postMessage({type:'output',text});postMessage({type:'done'});}catch(e){postMessage({type:'error',text:e.stack||String(e)});}};
