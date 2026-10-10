'use strict';
const params=new URLSearchParams(location.search), mode=params.get('mode')||'turn';
const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
const colors=['#22d5ed','#ffd740','#ad56ef','#45d467','#f45151','#4285ff','#ffad35'];
let seed,grid,bag,next,held,piece,over,canHold,score,lines;
const board=document.querySelector('#board'),ctx=board.getContext('2d');
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function take(){if(!bag.length){bag=[0,1,2,3,4,5,6];for(let i=6;i>0;i--){let j=Math.floor(rand()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}return bag.pop();}
function make(id){return {id,m:shapes[id].map(r=>r.slice()),x:3,y:0};}
function valid(p,x=p.x,y=p.y,m=p.m){return m.every((r,dy)=>r.every((v,dx)=>!v||(x+dx>=0&&x+dx<10&&y+dy>=0&&y+dy<20&&!grid[y+dy][x+dx])));}
function spawn(){piece=make(next);next=take();canHold=true;if(!valid(piece))over=true;}
function lock(){piece.m.forEach((r,dy)=>r.forEach((v,dx)=>{if(v)grid[piece.y+dy][piece.x+dx]=piece.id+1;}));let n=0;grid=grid.filter(r=>{if(r.every(Boolean)){n++;return false;}return true;});while(grid.length<20)grid.unshift(Array(10).fill(0));lines+=n;score+=[0,100,300,500,800][n];spawn();}
function down(points=0){if(valid(piece,piece.x,piece.y+1)){piece.y++;score+=points;}else lock();}
function rotate(ccw){let m=piece.m[0].map((_,x)=>piece.m.map(r=>r[x]).reverse());if(ccw){for(let i=0;i<2;i++)m=m[0].map((_,x)=>m.map(r=>r[x]).reverse());}for(let d of [0,-1,1,-2,2])if(valid(piece,piece.x+d,piece.y,m)){piece.m=m;piece.x+=d;break;}}
function cell(c,x,y,color,size=24,ghost=false){c.fillStyle=color;if(ghost){c.strokeStyle=color;c.lineWidth=2;c.strokeRect(x*size+3,y*size+3,size-6,size-6);}else{c.fillRect(x*size+1,y*size+1,size-2,size-2);c.fillStyle='#ffffff35';c.fillRect(x*size+3,y*size+3,size-6,3);}}
function preview(selector,id){let c=document.querySelector(selector).getContext('2d');c.clearRect(0,0,100,80);if(id!==null)shapes[id].forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(c,x,y,colors[id],20);}));}
function draw(){ctx.clearRect(0,0,240,480);ctx.strokeStyle='#202635';for(let x=0;x<=10;x++){ctx.beginPath();ctx.moveTo(x*24,0);ctx.lineTo(x*24,480);ctx.stroke();}for(let y=0;y<=20;y++){ctx.beginPath();ctx.moveTo(0,y*24);ctx.lineTo(240,y*24);ctx.stroke();}grid.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(ctx,x,y,colors[v-1]);}));if(!over){let gy=piece.y;while(valid(piece,piece.x,gy+1))gy++;piece.m.forEach((r,y)=>r.forEach((v,x)=>{if(v){cell(ctx,piece.x+x,gy+y,colors[piece.id],24,true);cell(ctx,piece.x+x,piece.y+y,colors[piece.id]);}}));}document.querySelector('#score').textContent=score;document.querySelector('#lines').textContent=lines;document.querySelector('#status').textContent=over?'Game over — restart':'Playing';preview('#next',next);preview('#held',held);}
function reset(){seed=Number(params.get('seed')||42)>>>0;grid=Array.from({length:20},()=>Array(10).fill(0));bag=[];held=null;over=false;score=0;lines=0;next=take();spawn();draw();}
addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','z','Z','c','C',' '].includes(e.key))return;e.preventDefault();if(over)return;let p=piece;if(e.key==='ArrowLeft'&&valid(p,p.x-1))p.x--;if(e.key==='ArrowRight'&&valid(p,p.x+1))p.x++;if(e.key==='ArrowUp')rotate(false);if(e.key.toLowerCase()==='z')rotate(true);if(e.key==='ArrowDown')down(1);if(e.key===' '){while(valid(piece,piece.x,piece.y+1)){piece.y++;score+=2;}lock();}if(e.key.toLowerCase()==='c'&&canHold){let id=piece.id;if(held===null)spawn();else{piece=make(held);if(!valid(piece))over=true;}held=id;canHold=false;}draw();});
// Turn mode has no autonomous gravity: latency cannot consume a piece's positioning time.
setInterval(()=>{if(mode==='realtime'&&!over){down();draw();}},700);
document.querySelector('#reset').onclick=reset;document.querySelector('#mode').textContent=`Mode: ${mode==='realtime'?'real-time gravity':'turn-based (no automatic gravity)'} · Seed: ${params.get('seed')||42}`;reset();
