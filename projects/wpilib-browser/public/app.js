import {startScene} from './scene.js';
const $=id=>document.getElementById(id),log=t=>{$('terminal').textContent+=t+'\n';$('terminal').scrollTop=1e9;};
let files=JSON.parse(localStorage.getItem('robot-files')||'null')||{'Main.java':'import edu.wpi.first.math.MathUtil;\npublic class Main { public static void main(String[] args) { System.out.println("WPILib: " + MathUtil.clamp(2.0, -1, 1)); } }'};
let worker,runner,busy=false,history=[],pending=null;
function controls(ready){$('eval').disabled=$('run').disabled=!ready;}
function idle(){busy=false;controls(true);$('status').textContent='Ready • WPILib 2025.3.2';}
function start(){controls(false);$('status').textContent='Loading compiler + bundled WPILib…';worker=new Worker('./compiler-worker.js',{type:'module'});worker.onerror=e=>{log('Worker error: '+e.message);$('status').textContent='Failed';};worker.onmessage=({data:d})=>{
 if(d.type==='ready'){idle();log('Java compiler ready. WPILib JARs loaded locally.');}
 else if(d.type==='compiled'){runner?.terminate();runner=new Worker('./run-worker.js',{type:'module'});runner.onerror=e=>{log(e.message);pending=null;idle();};runner.onmessage=({data:r})=>{if(r.text)log(r.text);if(r.type==='done'){if(pending!==null)history.push(pending);pending=null;idle();log('[finished]');}if(r.type==='error'){pending=null;idle();}};runner.postMessage({wasm:d.wasm});}
 else if(d.type==='error'||d.type==='failed'){if(d.text)log(d.text);log('[compilation failed]');pending=null;idle();}
 else if(d.text)log(d.text);
};}
function save(){files[$('file').value]=$('editor').value;localStorage.setItem('robot-files',JSON.stringify(files));}
function showFiles(){ $('file').replaceChildren(...Object.keys(files).map(name=>new Option(name,name)));$('editor').value=files[$('file').value];}
$('file').onchange=()=>{$('editor').value=files[$('file').value];};$('save').onclick=save;
$('run').onclick=()=>{save();compile(files,'Main');};
function compile(sources,mainClass){if(busy)return;busy=true;controls(false);$('status').textContent='Compiling Java → Wasm…';log('$ javac + TeaVM');worker.postMessage({files:sources,mainClass});}
$('eval').onclick=()=>{pending=$('snippet').value;compile({'Repl.java':`import edu.wpi.first.math.*;\nimport edu.wpi.first.math.util.*;\nimport edu.wpi.first.math.system.plant.*;\npublic class Repl { public static void main(String[] args) {\n${[...history,pending].join('\n')}\n}}`},'Repl');};
$('clear').onclick=()=>{history=[];log('[REPL history cleared]');};$('stop').onclick=()=>{worker?.terminate();runner?.terminate();busy=false;pending=null;log('[workers stopped; restarting]');start();};
$('reset').onclick=async()=>{if(!confirm('Replace saved files with starter?'))return;files=await(await fetch('starter.json')).json();showFiles();save();};
showFiles();start();startScene();
