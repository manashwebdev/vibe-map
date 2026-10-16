import { io } from 'socket.io-client';
import './style.css';

const $=s=>document.querySelector(s);
const MOODS=[["Calm","🌊","#35e6c8"],["Hyped","⚡","#ff5cc8"],["Lost","🌫️","#ffb347"],["Lonely","🌙","#6aa8ff"],["Joyful","☀️","#ffe14d"]];
const OWNER='Manash';let role='guest',uid=null,uname='',pins=[],cur=0,pend=null,sel=null,ry=0,tilt=.38,drag=0,sx=0,sy=0,moved=0,lastDrop=0,live=false,dbc=null;
const me=(()=>{try{let v=localStorage.getItem('vm-id');if(!v){v=Math.random().toString(36).slice(2,10);localStorage.setItem('vm-id',v)}return v}catch(e){return Math.random().toString(36).slice(2,10)}})();
/* mood chips */
MOODS.forEach((m,i)=>{const b=document.createElement('button');b.className='m'+(i?'':' on');b.style.setProperty('--c',m[2]);b.textContent=m[1]+' '+m[0];b.onclick=()=>{cur=i;document.querySelectorAll('.m').forEach((x,j)=>x.classList.toggle('on',i==j))};$('#moods').append(b)});
/* globe */
const cv=$('#g'),g=cv.getContext('2d');let W,Hh,R,cx,cy,dpr=1,tR=0,tcx=0,tcy=0,sc=0,warp=0,px=0,py=0,snap=1;const nb=$('#neb');
const LR=['','15-26,32-34','12-26,32-34,40-41,44-49,52-53','0-26,31-59','0-18,20-27,31-59','3-13,18-20,29-59','4-19,21,28-54,57-59','9-20,28-33,37-54','9-18,28-54','10-18,28-53','11-17,27-52','4,12-17,27-39,42-50','15-16,27-38,42-44,46-48,50-51','16-20,27-38,43,46-47,49-51','17-23,28-38,46-51','16-23,31-37,46-50,52-54','17-24,32-37,47-51,53-55','17-24,32-38,50-54','18-24,32-38,49-55','18-22,32-36,49-55','18-21,32-36,49-55','18-20,54-55,58-59','18-19,54,57-58','18-19','18','19-20','0-59','2-15,23-57','0-59','0-59'];
const LG=Array.from({length:30},()=>Array(60).fill(0));
LR.forEach((q,r)=>q&&q.split(',').forEach(p=>{const[a,b=a]=p.split('-').map(Number);for(let c=a;c<=b;c++)LG[r][c]=1}));
const land=(la,lo)=>LG[Math.min(29,(Math.PI/2-la)/Math.PI*30|0)][Math.min(59,(lo+Math.PI)/(2*Math.PI)*60|0)];
const DOTS=[],N=6500;for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*2.39996,la=Math.asin(y),lo=Math.atan2(Math.sin(a)*r,Math.cos(a)*r);DOTS.push([la,lo,land(la,lo)])}
const CL=Array.from({length:420},()=>[Math.asin(Math.random()*1.7-.85),Math.random()*6.28-3.14]);
const ST=Array.from({length:260},()=>[Math.random(),Math.random(),.5+Math.random()*2,Math.random()<.15?2:1]);
const SS={l:0,x:0,y:0};
function rs(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;Hh=innerHeight;cv.width=W*dpr;cv.height=Hh*dpr;g.setTransform(dpr,0,0,dpr,0,0);lay();if(snap){R=tR;cx=tcx;cy=tcy;snap=0}}
function lay(){if(document.body.classList.contains('in')){tR=Math.min(W*.42,Hh*.34);tcx=W/2;tcy=Hh*.44}else{const wd=W>800,LW=$('#land').clientWidth||W,cw=Math.min(1100,LW-40);tR=(wd?Math.min(cw*.22,Hh*.3,240):Math.min(LW*.4,Hh*.25))*(1+sc*.6);tcx=wd?LW/2+cw/4:LW/2;tcy=(wd?Hh*.5+40:Hh*.3)-sc*Hh*.15}}
addEventListener('resize',rs);rs();
function proj(la,lo){const l=lo+ry,x=Math.cos(la)*Math.sin(l),y=Math.sin(la),z=Math.cos(la)*Math.cos(l),c=Math.cos(tilt),s=Math.sin(tilt);const y2=y*c-z*s,z2=y*s+z*c;return[cx+R*x,cy-R*y2,z2]}
function inv(px,py){const nx=(px-cx)/R,ny=(cy-py)/R;if(nx*nx+ny*ny>1)return null;const nz=Math.sqrt(1-nx*nx-ny*ny),c=Math.cos(tilt),s=Math.sin(tilt);const y=ny*c+nz*s,z=-ny*s+nz*c;return[Math.asin(y),Math.atan2(nx,z)-ry]}
function frame(t){g.clearRect(0,0,W,Hh);
cx+=(tcx-cx)*.05;cy+=(tcy-cy)*.05;R+=(tR-R)*.05;warp*=.965;
if(!drag&&!document.body.classList.contains('in'))tilt+=((.38-py*.3)-tilt)*.03;
nb.style.transform=`translate(${-px*40+Math.sin(t/9000)*20}px,${-py*30+Math.cos(t/11000)*14}px) scale(${1.12+Math.sin(t/14000)*.05+warp*.25})`;
g.globalCompositeOperation='lighter';
for(let i=0;i<5;i++){const a=t/(7000+i*1700)+i*2,x=W*(.5+.45*Math.sin(a)),y=Hh*(.5+.4*Math.cos(a*.8+i)),r=Math.max(W,Hh)*(.28+.08*Math.sin(a*1.3)),gg=g.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,i%2?'rgba(70,140,255,.13)':'rgba(255,150,70,.09)');gg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gg;g.fillRect(0,0,W,Hh)}
g.globalCompositeOperation='source-over';
for(const q of ST){const x=((q[0]*W-ry*q[3]*40-px*q[3]*24)%W+W)%W,y=q[1]*Hh-py*q[3]*16;g.globalAlpha=.35+.65*Math.abs(Math.sin(t/900*q[2]+q[0]*50));g.fillStyle='#cfe3ff';if(warp>.03){g.strokeStyle=`rgba(200,225,255,${Math.min(1,warp+.2)})`;g.lineWidth=q[3];g.beginPath();g.moveTo(x,y);g.lineTo(x+(x-W/2)*warp*.5,y+(y-Hh/2)*warp*.5);g.stroke()}else g.fillRect(x,y,q[3],q[3])}g.globalAlpha=1;
if(SS.l<=0&&Math.random()<.004)Object.assign(SS,{x:Math.random()*W,y:Math.random()*Hh*.5,l:1});
if(SS.l>0){g.strokeStyle=`rgba(200,230,255,${SS.l})`;g.lineWidth=1.5;g.beginPath();g.moveTo(SS.x,SS.y);g.lineTo(SS.x-70,SS.y-30);g.stroke();SS.x+=14;SS.y+=6;SS.l-=.03}
const pu=.5+.5*Math.sin(t/1400);
const ring=f=>{g.save();const ry2=R*1.45*Math.abs(Math.sin(tilt+.5))+4;g.strokeStyle=`rgba(160,140,255,${f?.75:.25})`;g.lineWidth=f?2:1.2;g.shadowColor='#9f8bff';g.shadowBlur=f?16:0;g.beginPath();g.ellipse(cx,cy,R*1.45,ry2,-.25,f?0:Math.PI,f?Math.PI:Math.PI*2);g.stroke();
const a=t/2500,sx=Math.cos(a),sy=Math.sin(a);if((sy>0)==!!f){const ex=R*1.45*sx,ey=ry2*sy,c=Math.cos(-.25),s2=Math.sin(-.25);g.fillStyle='#fff';g.shadowColor='#fff';g.shadowBlur=18;g.beginPath();g.arc(cx+ex*c-ey*s2,cy+ex*s2+ey*c,3.2,0,7);g.fill()}g.restore()};
const moon=f=>{const a=t/7000+1,mx=cx+Math.cos(a)*R*1.9,my=cy+Math.sin(a)*R*.55-R*.25,z=Math.sin(a);if((z>0)!=!!f)return;const mr=R*.13*(1+z*.25),mg=g.createRadialGradient(mx-mr*.3,my-mr*.3,mr*.1,mx,my,mr);mg.addColorStop(0,'#fff');mg.addColorStop(1,'#8a86a8');g.save();g.shadowColor='#cfc8ff';g.shadowBlur=26;g.fillStyle=mg;g.beginPath();g.arc(mx,my,mr,0,7);g.fill();g.restore()};
const ag=g.createRadialGradient(cx,cy,R*.9,cx,cy,R*(1.55+pu*.1));ag.addColorStop(0,'rgba(110,190,255,.75)');ag.addColorStop(.2,'rgba(70,130,255,.35)');ag.addColorStop(1,'rgba(40,80,255,0)');g.fillStyle=ag;g.beginPath();g.arc(cx,cy,R*1.7,0,7);g.fill();
moon(0);ring(0);
const bg=g.createRadialGradient(cx-R*.4,cy-R*.4,R*.05,cx,cy,R);bg.addColorStop(0,'#3a95ff');bg.addColorStop(.45,'#0d4bb0');bg.addColorStop(1,'#030c2c');g.fillStyle=bg;g.beginPath();g.arc(cx,cy,R,0,7);g.fill();
const ds=Math.max(1.8,R/110);
g.globalCompositeOperation='lighter';
for(let i=0;i<DOTS.length;i++){const[d,o,L]=DOTS[i],[x,y,z]=proj(d,o);if(z<=0)continue;const b=Math.max(.06,((x-cx)/R)*-.45+((cy-y)/R)*.35+z*.8);
if(L){g.fillStyle=`hsla(${140+b*30},80%,${35+b*30}%,${.35+b*.65})`;g.fillRect(x,y,ds*1.4,ds*1.4);if(b<.3&&i%5==0){g.fillStyle=`rgba(255,200,90,${.5+.5*Math.sin(t/300+i)})`;g.fillRect(x,y,ds,ds)}}
else{g.fillStyle=`rgba(90,170,255,${b*.22})`;g.fillRect(x,y,ds,ds)}}
for(const[d,o]of CL){const[x,y,z]=proj(d,o+t/9000);if(z<=0)continue;g.fillStyle=`rgba(255,255,255,${z*.2})`;g.fillRect(x,y,ds*2.2,ds*1.4)}
g.globalCompositeOperation='source-over';
const sp=g.createRadialGradient(cx-R*.45,cy-R*.45,0,cx-R*.45,cy-R*.45,R*.55);sp.addColorStop(0,'rgba(255,255,255,.22)');sp.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sp;g.beginPath();g.arc(cx,cy,R,0,7);g.fill();
g.strokeStyle='rgba(150,220,255,.95)';g.lineWidth=2.5;g.shadowColor='#5cb8ff';g.shadowBlur=34+pu*14;g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();g.shadowBlur=0;
if(!drag)ry+=.0018+warp*.02;
for(const p of pins){const[x,y,z]=proj(p.lat,p.lon);if(z<=0)continue;p.sx=x;p.sy=y;const c=MOODS[p.m][2],ph=((t/1400)+p.lat*3)%1,k=1+Math.min(p.kind||0,12)*.12;
for(const o of[0,.5]){const q=(ph+o)%1;g.globalAlpha=z*(1-q)*.7;g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.arc(x,y,4+q*26*k,0,7);g.stroke()}
g.globalAlpha=Math.min(1,.4+z);g.fillStyle=c;g.shadowColor=c;g.shadowBlur=18;g.beginPath();g.arc(x,y,3.5*k,0,7);g.fill();g.shadowBlur=0;
if(sel&&sel.id==p.id){g.globalAlpha=1;g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.arc(x,y,13,0,7);g.stroke()}}
g.globalAlpha=1;
if(pend){const[x,y,z]=proj(pend[0],pend[1]);if(z>0){g.strokeStyle=MOODS[cur][2];g.lineWidth=2;g.shadowColor=MOODS[cur][2];g.shadowBlur=20;g.beginPath();g.arc(x,y,9+Math.sin(t/200)*3,0,7);g.stroke();g.shadowBlur=0}}
ring(1);moon(1);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
/* input */
const can=()=>role=='member'||role=='admin';
function setBadge(){const t=role=='guest'?'👁 Guest · read-only':(role=='admin'?'🛡 Admin':role=='viewer'?'👁 Viewer · read-only':'✅ Member')+' · '+uname;$('#badge').textContent=t;$('#who').textContent=t}
setBadge();
const goIn=()=>{document.body.classList.add('in');warp=1;lay()};
addEventListener('pointermove',e=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5});
$('#land').onscroll=()=>{sc=Math.min(1,$('#land').scrollTop/innerHeight);lay()};
$('#enter').onclick=$('#enter2').onclick=goIn;$('#home').onclick=()=>{document.body.classList.remove('in');warp=.6;sc=0;$('#land').scrollTop=0;lay()};
cv.onpointerdown=e=>{drag=1;moved=0;sx=e.clientX;sy=e.clientY;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'};
cv.onpointermove=e=>{if(!drag)return;const dx=e.clientX-sx,dy=e.clientY-sy;moved+=Math.abs(dx)+Math.abs(dy);ry+=dx*.006;tilt=Math.max(-.9,Math.min(.9,tilt+dy*.004));sx=e.clientX;sy=e.clientY};
cv.onpointerup=e=>{drag=0;cv.style.cursor='grab';if(moved>6)return;
let best=null,bd=18;for(const p of pins){if(p.sx==null)continue;const d=Math.hypot(p.sx-e.clientX,p.sy-e.clientY);if(d<bd){bd=d;best=p}}
if(best){pick(best);return}
const l=inv(e.clientX,e.clientY);if(l){pend=l;if(can()){$('#drop').disabled=false;$('#hint').textContent='Spot chosen. Pick a mood and drop your pin.'}else $('#hint').textContent='Log in to drop pins.'}};
function pick(p){sel=p;$('#sel').classList.add('on');const m=MOODS[p.m];$('#sm').textContent=m[1]+' '+m[0]+' · '+(p.kind||0)+' kind word'+(p.kind==1?'':'s');$('#sm').style.color=m[2];$('#sn').textContent=p.note?'“'+p.note+'”':'(no note, just a feeling)';const dl=$('#del');dl.style.display=(!p.demo&&(role=='admin'||(uid&&p.by==uid)))?'block':'none'}
$('#kw').onclick=async()=>{if(!sel)return;if(!can()){$('#hint').textContent='Log in to send kind words.';return}sel.kind=(sel.kind||0)+1;pick(sel);burst(sel);if(live&&!sel.demo){try{const r=await api('/pins/'+sel.id+'/kind',{method:'POST'});sel.kind=r.kind;pick(sel)}catch(e){sel.kind=Math.max(0,sel.kind-1);pick(sel);$('#hint').textContent=e.message}}};
$('#del').onclick=async()=>{if(!sel)return;const p=sel;if(!(role=='admin'||(uid&&p.by==uid)))return;pins=pins.filter(q=>q.id!=p.id);sel=null;$('#sel').classList.remove('on');stats();if(live&&!p.demo){try{await api('/pins/'+p.id,{method:'DELETE'})}catch(e){$('#hint').textContent=e.message}}};
$('#drop').onclick=async()=>{if(!pend||Date.now()-lastDrop<5000){$('#hint').textContent='Easy there. Wait a few seconds between pins.';return}
lastDrop=Date.now();const id=Date.now().toString(36)+me.slice(0,4),p={lat:pend[0],lon:pend[1],m:cur,note:$('#note').value.trim().slice(0,80),kind:0,t:Date.now(),by:uid||me};
add(Object.assign({id},p));pend=null;$('#note').value='';$('#drop').disabled=true;
$('#hint').textContent=live?'Your pin is live for everyone. Thank you for sharing.':'Dropped on your device. Shared saving is off in this view.';
try{const r=await api('/pins',{method:'POST',body:JSON.stringify({lat:p.lat,lon:p.lon,m:p.m,note:p.note})});pins=pins.filter(q=>q.id!=id);add(r)}catch(e){pins=pins.filter(q=>q.id!=id);stats();$('#hint').textContent=e.message}};
function burst(p){const[x,y]=proj(p.lat,p.lon);g.save();g.fillStyle='#fff';g.fillText('💛',x,y-10);g.restore()}
/* data */
function add(p){const i=pins.findIndex(q=>q.id==p.id);if(i>-1)Object.assign(pins[i],p);else pins.push(p);stats();feed(p)}
function stats(){const n=pins.length;$('#cnt').textContent=n;$('#lc').textContent=n;const c=MOODS.map((_,i)=>pins.filter(p=>p.m==i).length),mx=Math.max(1,...c);
$('#bars').innerHTML=MOODS.map((m,i)=>`<div class="bar" style="--c:${m[2]}"><span style="width:52px">${m[1]} ${m[0]}</span><i style="width:${c[i]/mx*60}px"></i><b>${c[i]}</b></div>`).join('')}
function feed(p){if(!p.note)return;const d=document.createElement('div');d.className='f glass';d.style.setProperty('--c',MOODS[p.m][2]);d.textContent=MOODS[p.m][1]+' '+p.note;const f=$('#feed');f.prepend(d);while(f.children.length>4)f.lastChild.remove()}
const DEMO=[[28,77,0,'Chai on the balcony, finally quiet'],[40,-74,1,'Concert tonight!!'],[-33,151,2,'New city, no map yet'],[51,0,3,'Rain again. Missing home'],[-23,-46,4,'Got the job'],[35,139,0,'Slow morning walk'],[6,3,1,'Exam is over'],[64,-21,3,'Long night, long sky']];
function demo(){if(pins.length)return;DEMO.forEach((d,i)=>pins.push({id:'d'+i,demo:1,lat:d[0]*Math.PI/180,lon:d[1]*Math.PI/180,m:d[2],note:d[3],kind:i%3}));stats()}
const API=(import.meta.env.VITE_API_URL||'')+'/api';
let token=null;try{token=localStorage.getItem('vm-token')}catch(e){}
async function api(path,o={}){const r=await fetch(API+path,{...o,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Request failed');return d}
function setUser(u,t){if(u){uid=u.id;uname=u.name;role=u.role;if(t){token=t;try{localStorage.setItem('vm-token',t)}catch(e){}}}else{uid=null;uname='';role='guest';token=null;try{localStorage.removeItem('vm-token')}catch(e){}}setBadge();$('#login').textContent=u?'Log out':'Log in'}
let mode='login';
function authUI(){$('#au').classList.add('on');$('#aerr').textContent='';$('#an').style.display=mode=='register'?'block':'none';$('#at').textContent=mode=='login'?'Log in':'Create account';$('#as').textContent=mode=='login'?'Log in':'Sign up';$('#aw').textContent=mode=='login'?'New here? Create an account':'Have an account? Log in'}
$('#login').onclick=()=>{if(token){setUser(null);return}mode='login';authUI()};
$('#aw').onclick=()=>{mode=mode=='login'?'register':'login';authUI()};
$('#ax').onclick=()=>$('#au').classList.remove('on');
$('#as').onclick=async()=>{try{const d=await api('/auth/'+mode,{method:'POST',body:JSON.stringify({name:$('#an').value,email:$('#ae').value,password:$('#ap').value})});setUser(d.user,d.token);$('#au').classList.remove('on');$('#ap').value=''}catch(e){$('#aerr').textContent=e.message}};
(async()=>{stats();
if(token){try{setUser((await api('/auth/me')).user)}catch(e){setUser(null)}}
try{const d=await api('/pins');live=true;pins=d.pins;stats();$('#hint').textContent='Live: '+pins.length+' pins from people right now.'}catch(e){}
const so=io(import.meta.env.VITE_API_URL||undefined);
so.on('pin:new',p=>add(p));
so.on('pin:kind',({id,kind})=>{const q=pins.find(x=>x.id==id);if(q){q.kind=kind;if(sel&&sel.id==id)pick(q)}});
so.on('pin:del',id=>{pins=pins.filter(x=>x.id!=id);if(sel&&sel.id==id){sel=null;$('#sel').classList.remove('on')}stats()});
setTimeout(()=>{if(!pins.length){demo();$('#hint').textContent=live?'No pins yet, so these are demo pins. Be the first to drop one.':'Server offline: showing demo pins.'}},1500)})();
