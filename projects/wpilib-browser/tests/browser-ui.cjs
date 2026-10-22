const {chromium}=require('playwright');const assert=require('assert/strict');
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});try{
 const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8080');
 await p.waitForFunction(()=>!document.querySelector('#run').disabled,null,{timeout:120000});
 async function build(){const n=await p.locator('#terminal').innerText();await p.click('#run');await p.waitForFunction(n=>document.querySelector('#terminal').textContent.slice(n.length).includes('[robot running]'),n,{timeout:120000});}
 async function voltage(v){await p.waitForFunction(v=>document.querySelector('#telemetry').textContent.includes(v+' / '+v+' V'),v,{timeout:15000});}
 await build();await p.screenshot({path:'tests/editor-tab.png',fullPage:true});
 await p.click('#driving-tab');await p.waitForFunction(()=>document.querySelector('#ds').textContent.includes('JAVA CONNECTED'));await p.click('#enable');await p.keyboard.down('w');await p.keyboard.down('ArrowUp');await voltage('6.0');await p.waitForFunction(()=>!document.querySelector('#telemetry').textContent.includes('Pose 0.00, 0.00'));
 await p.screenshot({path:'tests/driving-tab.png',fullPage:true});
 await p.click('#estop');await voltage('0.0');await p.click('#enable');assert((await p.locator('#ds').innerText()).includes('E-STOP'));
 await p.keyboard.up('w');await p.keyboard.up('ArrowUp');await p.click('#pose-reset');await p.selectOption('#mode','Autonomous');await p.click('#enable');await voltage('2.1');await p.selectOption('#mode','Teleop');await voltage('0.0');
 await p.click('#editor-tab');await p.selectOption('#file','src/main/java/frc/robot/subsystems/DriveSubsystem.java');
 await p.evaluate(()=>{const cm=document.querySelector('.CodeMirror').CodeMirror;cm.setValue(cm.getValue().replaceAll('* 6.0','* 3.0'));});
 await build();await p.click('#driving-tab');await p.waitForFunction(()=>document.querySelector('#ds').textContent.includes('JAVA CONNECTED'));await p.click('#enable');await p.keyboard.down('w');await p.keyboard.down('ArrowUp');await voltage('3.0');await p.click('#disable');await voltage('0.0');await p.keyboard.up('w');await p.keyboard.up('ArrowUp');assert.deepEqual(errors,[]);
 await p.setViewportSize({width:390,height:844});await p.click('#editor-tab');await p.screenshot({path:'tests/mobile-editor.png',fullPage:true});console.log('PASS: compiled project; Java-driven movement; E-stop latch; autonomous 2.1V; mode change disables; edit Java 6V→3V changes output; disable zero; no page errors; desktop/mobile screenshots.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
