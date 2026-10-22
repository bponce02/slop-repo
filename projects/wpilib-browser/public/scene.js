export function startScene(){
 const canvas=document.getElementById('field'),ctx=canvas.getContext('2d'),keys=new Set();let enabled=false,estop=false,x=0,y=0,h=0,l=0,r=0,dl=0,dr=0;
 const $=id=>document.getElementById(id),disable=()=>{enabled=false;keys.clear();};
 $('enable').onclick=()=>{if(!estop)enabled=true;};$('disable').onclick=disable;$('estop').onclick=()=>{estop=true;disable();};$('pose-reset').onclick=()=>{disable();estop=false;x=y=h=l=r=dl=dr=0;};
 addEventListener('blur',disable);document.addEventListener('visibilitychange',()=>{if(document.hidden)disable();});
 addEventListener('keydown',e=>{if(['TEXTAREA','INPUT','SELECT'].includes(e.target.tagName))return;if(['w','s','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();keys.add(e.key);}});addEventListener('keyup',e=>keys.delete(e.key));
 function project(a,b,z=0){return [450+(a-b)*45,300+(a+b)*22-z*70];}
 function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([a,b,z],i)=>{const [u,v]=project(a,b,z);i?ctx.lineTo(u,v):ctx.moveTo(u,v);});ctx.closePath();ctx.fill();ctx.strokeStyle='#07121c';ctx.stroke();}
 function box(cx,cy,w,d,z,height,color,rotate=false){let p=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>rotate?[x+cx*Math.cos(h)-cy*Math.sin(h)+a*Math.cos(h)-b*Math.sin(h),y+cx*Math.sin(h)+cy*Math.cos(h)+a*Math.sin(h)+b*Math.cos(h)]:[cx+a,cy+b]);polygon(p.map(([a,b])=>[a,b,z+height]),color);for(let i=1;i<4;i++)polygon([[...p[i-1],z],[...p[i],z],[...p[i],z+height],[...p[i-1],z+height]],color);}
 setInterval(()=>{const auto=$('mode').value==='Autonomous';const ul=enabled?(auto?.35:(keys.has('w')?1:0)-(keys.has('s')?1:0)):0,ur=enabled?(auto?.35:(keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0)):0;l+=(ul*3-l)*.12;r+=(ur*3-r)*.12;dl+=l*.02;dr+=r*.02;h+=(r-l)/.62*.02;x+=(l+r)/2*Math.cos(h)*.02;y+=(l+r)/2*Math.sin(h)*.02;
 ctx.clearRect(0,0,900,600);ctx.strokeStyle='#315052';for(let i=-7;i<=7;i++){for(const line of [[[-7,i],[7,i]],[[i,-7],[i,7]]]){ctx.beginPath();line.forEach(([a,b],j)=>{const p=project(a,b);j?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();}}
 box(0,0,.9,.8,.15,.25,'#c93d50',true);box(0,0,.68,.58,.4,.08,'#a7bac4',true);for(const side of [-1,1]){for(const a of [-.32,0,.32])box(a,side*.36,.19,.12,.03,.22,'#17202a',true);for(const a of [-.2,.2])box(a,side*.23,.16,.10,.47,.08,'#d39248',true);}
 $('ds').textContent=estop?'E-STOP LATCHED':enabled?'ENABLED • '+$('mode').value:'DISABLED';$('telemetry').textContent=`4 × Kraken X60 • 2 per side\nLeft ${l.toFixed(2)} m/s | Right ${r.toFixed(2)} m/s\nEncoders ${dl.toFixed(2)} / ${dr.toFixed(2)} m\nPose ${x.toFixed(2)}, ${y.toFixed(2)} m • ${(h*180/Math.PI).toFixed(1)}°\nPreview physics: approximate JS model (not WPILib HAL)`;
 },20);
}
