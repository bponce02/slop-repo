import * as THREE from './vendor/three.module.js';
export function createRobotView(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(900,600,false);renderer.setClearColor(0x171e25);
 const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xd7eeff,0x45554a,2.5));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(4,8,3);scene.add(sun);
 const camera=new THREE.PerspectiveCamera(45,1.5,.1,150);camera.position.set(4,4.5,5);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(24,16),new THREE.MeshStandardMaterial({color:0x304249,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.005;scene.add(ground);scene.add(new THREE.GridHelper(24,24,0x83949a,0x526369));
 const robot=new THREE.Group();scene.add(robot);
 function box(w,h,d,x,y,z,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,metalness:.3,roughness:.6}));m.position.set(x,y,z);robot.add(m);return m;}
 box(.9,.2,.78,0,.3,0,0xbc3049);box(.72,.06,.57,0,.44,0,0xb8c4c8);box(.3,.18,.2,-.1,.56,0,0x202631);box(.16,.05,.12,.23,.51,0,0x228ad3);
 const wheels=[];for(const side of [-1,1]){for(const x of [-.32,0,.32]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.0762,.0762,.075,24),new THREE.MeshStandardMaterial({color:0x15191e}));wheel.rotation.x=Math.PI/2;wheel.position.set(x,.15,side*.36);robot.add(wheel);wheels.push(wheel);}for(const x of [-.2,.2]){const motor=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.085,16),new THREE.MeshStandardMaterial({color:0xc88c43,metalness:.7,roughness:.4}));motor.rotation.x=Math.PI/2;motor.position.set(x,.49,side*.23);robot.add(motor);}}
 // Blue forward marker; robot's local +X is forward.
 box(.12,.02,.18,.4,.47,0,0x39c0e5);
 let azimuth=.75,elevation=.65,distance=5,drag=null;
 canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointermove',e=>{if(!drag)return;azimuth-=(e.clientX-drag[0])*.008;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-drag[1])*.008,.15,1.4);drag=[e.clientX,e.clientY];});canvas.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.005,1.5,15);},{passive:false});
 return (x,y,heading)=>{robot.position.set(x,0,-y);robot.rotation.y=heading;const w=canvas.clientWidth,h=Math.max(300,Math.min(600,innerHeight*.55));if(canvas.width!==w||canvas.height!==h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}camera.position.set(x+Math.cos(azimuth)*Math.cos(elevation)*distance,Math.sin(elevation)*distance,-y+Math.sin(azimuth)*Math.cos(elevation)*distance);camera.lookAt(x,.2,-y);renderer.render(scene,camera);};
}
