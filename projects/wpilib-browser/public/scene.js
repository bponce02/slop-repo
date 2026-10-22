import {createRobotView} from './robot-view.js';
export function startScene(){
 const canvas=document.getElementById('field'),keys=new Set();let draw=()=>{};try{draw=createRobotView(canvas);}catch(e){document.getElementById('terminal').textContent+='3D unavailable: '+e.message+' (simulation controls still active)\n';}let reset=false,connected=false,lv=0,rv=0;let enabled=false,estop=false,x=0,y=0,h=0,l=0,r=0,dl=0,dr=0;
 const $=id=>document.getElementById(id),disable=()=>{enabled=false;keys.clear();};
 $('enable').onclick=()=>{if(!estop&&connected)enabled=true;};$('disable').onclick=disable;$('estop').onclick=()=>{estop=true;disable();};$('pose-reset').onclick=()=>{disable();estop=false;reset=true;};
 $('mode').addEventListener('change',disable);
 window.addEventListener('robot-disconnected',()=>{disable();connected=false;lv=rv=0;});
 addEventListener('blur',disable);document.addEventListener('visibilitychange',()=>{if(document.hidden)disable();});
 addEventListener('keydown',e=>{if(['TEXTAREA','INPUT','SELECT'].includes(e.target.tagName))return;if(['w','s','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();keys.add(e.key);}});addEventListener('keyup',e=>keys.delete(e.key));
 window.addEventListener('robot-state',({detail:v})=>{connected=true;[x,y,h,l,r,dl,dr,lv,rv]=v;});
 setInterval(()=>{const auto=$('mode').value==='Autonomous';const left=enabled?((keys.has('w')?1:0)-(keys.has('s')?1:0)):0,right=enabled?((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0)):0;
 window.dispatchEvent(new CustomEvent('robot-input',{detail:{enabled,autonomous:auto,left,right,reset}}));reset=false;

 if(!document.getElementById("driving-panel").hidden)draw(x,y,h);
 $('ds').textContent=estop?'E-STOP LATCHED':enabled?'ENABLED • '+$('mode').value:'DISABLED'+(connected?' • JAVA CONNECTED':' • BUILD PROJECT FIRST');$('telemetry').textContent=`4 × Kraken X60 • 2 per side\nLeft ${l.toFixed(2)} m/s | Right ${r.toFixed(2)} m/s\nEncoders ${dl.toFixed(2)} / ${dr.toFixed(2)} m\nPose ${x.toFixed(2)}, ${y.toFixed(2)} m • ${(h*180/Math.PI).toFixed(1)}°\nJava → WPILib DifferentialDrivetrainSim\nMotor voltage ${lv.toFixed(1)} / ${rv.toFixed(1)} V`;
 },20);
}
