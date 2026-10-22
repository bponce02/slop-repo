import {startScene} from './scene.js';
const $=id=>document.getElementById(id),log=t=>{$('terminal').textContent+=t+'\n';$('terminal').scrollTop=1e9;};
let files=JSON.parse(localStorage.getItem('robot-files-v2')||'null')||await(await fetch('starter.json')).json();
let robotReady=false,tickPending=false;
let worker,runner,busy=false,history=[],pending=null;
function controls(ready){$('eval').disabled=$('run').disabled=!ready;}
function idle(){busy=false;controls(true);$('status').textContent='Ready • WPILib 2025.3.2';}
function start(){controls(false);$('status').textContent='Loading compiler + bundled WPILib…';worker=new Worker('./compiler-worker.js',{type:'module'});worker.onerror=e=>{log('Worker error: '+e.message);$('status').textContent='Failed';};worker.onmessage=({data:d})=>{
 if(d.type==='ready'){idle();log('Java compiler ready. WPILib JARs loaded locally.');}
 else if(d.type==='compiled'){runner?.terminate();runner=new Worker('./run-worker.js',{type:'module'});runner.onerror=e=>{log(e.message);pending=null;idle();};runner.onmessage=({data:r})=>{if(r.type==='state')window.dispatchEvent(new CustomEvent('robot-state',{detail:r.values}));if(r.type==='ticked')tickPending=false;if(r.type==='robot-ready'){robotReady=true;tickPending=false;idle();log('[robot running]');}if(r.text)log(r.text);if(r.type==='done'){if(pending!==null)history.push(pending);pending=null;idle();log('[finished]');}if(r.type==='error'){robotReady=false;tickPending=false;window.dispatchEvent(new Event('robot-disconnected'));pending=null;idle();}};runner.postMessage({wasm:d.wasm});}
 else if(d.type==='error'||d.type==='failed'){if(d.text)log(d.text);log('[compilation failed]');pending=null;idle();}
 else if(d.text)log(d.text);
};}
function save(){files[$('file').value]=$('editor').value;localStorage.setItem('robot-files-v2',JSON.stringify(files));}
function showFiles(){ $('file').replaceChildren(...Object.keys(files).map(name=>new Option(name,name)));if(files['src/main/java/frc/robot/Robot.java'])$('file').value='src/main/java/frc/robot/Robot.java';$('editor').value=files[$('file').value];}
let selectedFile=$('file').value;
$('file').onchange=()=>{files[selectedFile]=$('editor').value;localStorage.setItem('robot-files-v2',JSON.stringify(files));selectedFile=$('file').value;$('editor').value=files[selectedFile];};$('save').onclick=save;
$('run').onclick=()=>{save();compile(files,'frc.robot.Main');};
function compile(sources,mainClass){if(busy)return;robotReady=false;tickPending=false;window.dispatchEvent(new Event('robot-disconnected'));window.dispatchEvent(new Event('blur'));runner?.terminate();busy=true;controls(false);$('status').textContent='Compiling Java → Wasm…';log('$ javac + TeaVM');worker.postMessage({files:sources,mainClass});}
$('eval').onclick=()=>{pending=$('snippet').value;compile({'Repl.java':`import edu.wpi.first.math.*;\nimport edu.wpi.first.math.util.*;\nimport edu.wpi.first.math.system.plant.*;\npublic class Repl { public static void main(String[] args) {\n${[...history,pending].join('\n')}\n}}`},'Repl');};
$('clear').onclick=()=>{history=[];log('[REPL history cleared]');};$('stop').onclick=()=>{robotReady=false;window.dispatchEvent(new Event('robot-disconnected'));window.dispatchEvent(new Event('blur'));worker?.terminate();runner?.terminate();busy=false;pending=null;log('[workers stopped; restarting]');start();};
$('reset').onclick=async()=>{if(!confirm('Replace saved files with starter?'))return;files=await(await fetch('starter.json')).json();showFiles();selectedFile=$('file').value;renderTree();save();refreshEditor();};
showFiles();selectedFile=$('file').value;start();startScene();

function selectTab(driving){
 document.getElementById('editor-panel').hidden=driving;
 document.getElementById('driving-panel').hidden=!driving;
 $('editor-tab').setAttribute('aria-selected',String(!driving));
 $('driving-tab').setAttribute('aria-selected',String(driving));
 window.dispatchEvent(new Event('blur'));
}
$('editor-tab').onclick=()=>selectTab(false);
$('driving-tab').onclick=()=>selectTab(true);
function renderTree(){
 $('file-tree').replaceChildren(...Object.keys(files).map(name=>{const b=document.createElement('button');b.textContent='J '+name;b.title=name;b.onclick=()=>{save();$('file').value=name;selectedFile=name;$('editor').value=files[name];};return b;}));
}
renderTree();
$('editor').addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const el=e.target,a=el.selectionStart,b=el.selectionEnd;el.setRangeText('  ',a,b,'end');}});
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();save();log('[saved]');}});

window.addEventListener('robot-input',({detail})=>{if(robotReady&&!tickPending){tickPending=true;runner.postMessage({type:'tick',...detail});}});

const codeEditor=window.CodeMirror.fromTextArea($('editor'),{mode:'text/x-java',lineNumbers:true,indentUnit:2,tabSize:2,lineWrapping:false});
codeEditor.on('change',()=>{$('editor').value=codeEditor.getValue();});
function refreshEditor(){codeEditor.setValue($('editor').value);codeEditor.refresh();}
$('file').addEventListener('change',refreshEditor);
$('file-tree').addEventListener('click',refreshEditor);
$('editor-tab').addEventListener('click',()=>codeEditor.refresh());
$('editor').addEventListener('input',()=>{if(codeEditor.getValue()!==$('editor').value)refreshEditor();});
