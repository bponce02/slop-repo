import {load} from './vendor/compiler.wasm-runtime.js';
let compiler;
const send=(type,data={})=>postMessage({type,...data});
async function bytes(path){const r=await fetch(path);if(!r.ok)throw Error(`${path}: ${r.status}`);return new Int8Array(await r.arrayBuffer());}
async function init(){
 const vm=await load('./vendor/compiler.wasm'); compiler=vm.exports.createCompiler();
 compiler.setSdk(await bytes('./vendor/compile-classlib-teavm.bin'));
 compiler.setTeaVMClasslib(await bytes('./vendor/runtime-classlib-teavm.bin'));
 const manifest=await (await fetch('./assets.json')).json();
 for(const a of manifest.filter(a=>a.path.endsWith('.jar'))){const b=await bytes('./'+a.path);compiler.addJarFile(b);}
 compiler.onDiagnostic(d=>send('diagnostic',{text:`${d.severity}: ${d.fileName||''}:${d.lineNumber||''} ${d.message}`}));
 send('ready');
}
const ready=init().catch(e=>send('error',{text:e.stack||String(e)}));
onmessage=async({data})=>{await ready;try{
 compiler.clearSourceFiles();compiler.clearOutputFiles();
 for(const [path,text] of Object.entries(data.files))if(path.endsWith(".java"))compiler.addSourceFile(path.replace(/^src\/main\/java\//,""),text);
 if(data.mainClass==="frc.robot.Main") {const bridge=await(await fetch("./bridge.json")).json();for(const [path,text] of Object.entries(bridge))compiler.addSourceFile(path,text);}
 send("diagnostic",{text:"[javac]"});if(!compiler.compile())return send('failed');
  send("diagnostic",{text:"[TeaVM]"});if(!compiler.generateWebAssembly({outputName:'robot',mainClass:data.mainClass}))return send('failed');
 send('compiled',{wasm:compiler.getWebAssemblyOutputFile('robot.wasm')});
}catch(e){send('error',{text:e.stack||String(e)});}};
