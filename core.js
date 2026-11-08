'use strict';
/* ================= STATE ================= */
const $ = s => document.querySelector(s);
const S = {project:null,media:[],clips:[],overlays:[],audios:[],luts:[],sel:null,time:0,total:0,mainEnd:0,playing:false,pps:40,ratio:'9:16',quality:720,bg:'black',pick:false,mainMute:false,mainHide:false,rt:{},rs:{},closed:{},ltab:'media',lsub:{}};
const nid = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const vids = {};          // clipId -> <video> (main track)
const ovVids = {};        // overlayId -> <video> (PiP)
const ovAud = {};         // overlayId -> GainNode
const audEls = {};        // audioItemId -> <audio>
const audChains = {};     // audioItemId -> effect chain
const images = {};        // mediaId -> <img>
const mediaBlobs = {};    // mediaId -> File/Blob
const derived = {};       // clipId -> {start,dur,cum,len,td}
const hits = new Map();
const geo = {};           // last drawn on-screen geometry per item (for mask / tracking gizmos)
const undoS = [], redoS = [];
let active = null, editing = false, exporting = false, rec = null, drag = null, cdrag = null, recState = null;

const pad = n => String(n).padStart(2,'0');
const fmtT = t => { t = Math.max(0,t||0); return pad(Math.floor(t/60)) + ':' + pad(Math.floor(t%60)); };
const fmtTC = t => { t = Math.max(0,t||0); return pad(Math.floor(t/60)) + ':' + pad(Math.floor(t%60)) + '.' + pad(Math.floor((t%1)*100)); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
const media = id => S.media.find(m => m.id === id);
const isImg = c => (media(c.mediaId)||{}).type === 'image';
const isMediaOv = o => o.type === 'image' || o.type === 'video';
const selClip = () => S.clips.find(c => c.id === S.sel);
const selOv = () => S.overlays.find(o => o.id === S.sel);
const selAud = () => S.audios.find(a => a.id === S.sel);
const selItem = () => selClip() || selOv() || selAud();
const findFree = id => S.overlays.find(o => o.id === id) || S.audios.find(a => a.id === id);
function selFree(){ const o=selOv(); if(o) return [o,S.overlays]; const a=selAud(); if(a) return [a,S.audios]; return null; }
const getP = (o,p) => p.split('.').reduce((x,k) => x == null ? x : x[k], o);
const setP = (o,p,v) => { const k = p.split('.'); const last = k.pop(); k.reduce((x,kk) => x[kk], o)[last] = v; };
const fmtV = v => (Math.round(v*10)/10).toString();
const hexA = (h,a) => { const n = parseInt((h||'#000000').slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };
const toHex = (r,g,b) => '#' + [r,g,b].map(x => Math.round(clamp(x,0,255)).toString(16).padStart(2,'0')).join('');
const seg = (window.Intl && Intl.Segmenter) ? new Intl.Segmenter('kn',{granularity:'grapheme'}) : null;
const graphemes = s => seg ? Array.from(seg.segment(s), x => x.segment) : Array.from(s);
const deep = o => JSON.parse(JSON.stringify(o));

/* ================= DEFAULTS ================= */
const defMask = () => ({type:'none',x:0,y:0,w:60,h:60,rot:0,feather:5,round:0,invert:false});
const defAdj = () => ({brightness:0,contrast:0,saturation:0,temp:0,tint:0,fade:0,vignette:0,grain:0,sharpen:0});
const defFx = () => ({type:'none',amount:60,speed:50});
const defAudio = () => ({voice:'none',bass:0,treble:0,echo:0,reverb:0,enhance:false,isolate:false,norm:false});
const clipDefaults = () => ({in:0, out:3, speed:1, curve:null, curveName:'none', volume:100, fadeIn:0, fadeOut:0, opacity:100,
  tf:{scale:100,x:0,y:0,rot:0,flip:false}, kf:[], rt:{smooth:0,bright:0,clear:0}, rmbg:false, rmbgInv:false, ck:{on:false,color:'#00ff00',sim:35,smooth:10,spill:30}, filter:'none', filterAmt:80, adj:defAdj(), lut:'', lutAmt:100, mask:defMask(), fx:defFx(),
  anim:{in:'none',out:'none',loop:'none',inDur:0.5,outDur:0.5}, trans:{type:'none',dur:0.6}, audio:defAudio()});
const ovDefaults = type => ({text:'', mediaId:null, start:0, dur:3, x:50, y:50,
  size: type==='image' ? 40 : type==='video' ? 50 : type==='sticker' ? 90 : 48, rot:0, opacity:100, kf:[], blend:'source-over', flip:false, rt:{smooth:0,bright:0,clear:0}, rmbg:false, rmbgInv:false,
  in:0, speed:1, volume:100, caption:false,
  font:'Noto Sans Kannada', bold:true, italic:false, align:'center',
  color:'#ffffff', stroke:'#000000', strokeW:0, bgOn:false, bgColor:'#000000', bgAlpha:70, shadow:30, shadowColor:'#000000',
  filter:'none', filterAmt:80, adj:defAdj(), lut:'', lutAmt:100, mask:defMask(), fx:defFx(),
  ck:{on:false,color:'#00ff00',sim:35,smooth:10,spill:30},
  anim: (type==='image'||type==='video') ? {in:'none',out:'none',loop:'none',inDur:0.5,outDur:0.5} : {in:'fade',out:'fade',loop:'none',inDur:0.5,outDur:0.5}});
const audDefaults = () => ({type:'audio', kind:'music', start:0, dur:1, in:0, speed:1, volume:100, fadeIn:0, fadeOut:0, audio:defAudio()});
function newClip(m){ return {...clipDefaults(), id:nid(), mediaId:m.id, out:m.type==='image' ? 3 : m.duration}; }
function newOverlay(type, extra){ return {...ovDefaults(type), id:nid(), type, start:S.time, ...extra}; }
function newAudioItem(m, extra){ return {...audDefaults(), id:nid(), mediaId:m.id, start:S.time, dur:m.duration, ...extra}; }
const CAPTION_STYLE = {caption:true,size:38,y:82,bgOn:true,bgColor:'#000000',bgAlpha:55,shadow:0,strokeW:0,color:'#ffffff',anim:{in:'fade',out:'fade',loop:'none',inDur:.15,outDur:.15}};

/* ================= PRESETS ================= */
const FILTERS = {
  none:{}, vivid:{saturation:35,contrast:15}, warm:{temp:45,saturation:10}, cool:{temp:-45,tint:-5},
  bw:{saturation:-100,contrast:20}, vintage:{temp:30,saturation:-30,fade:50,vignette:40,grain:25},
  cinema:{contrast:25,saturation:-15,temp:-15,vignette:35}, fade:{fade:70,contrast:-15},
  drama:{contrast:45,saturation:-25,vignette:50,brightness:-10}, moody:{temp:-20,saturation:-35,brightness:-12,fade:20},
  golden:{temp:60,brightness:8,saturation:20}, film:{grain:40,fade:30,contrast:10}
};
const FILTER_NAMES = {none:'None',vivid:'Vivid',warm:'Warm',cool:'Cool',bw:'B&W',vintage:'Vintage',cinema:'Cinematic',fade:'Faded',drama:'Drama',moody:'Moody',golden:'Golden',film:'Film'};
const CURVES = {montage:[2.5,.6,2.5,.6,2.5], hero:[2,2,.3,2,2], bullet:[3,.25,.25,.25,3], jumper:[.5,3,.5,3,.5], flashIn:[4,2,1,1,1], flashOut:[1,1,1,2,4]};
const CURVE_OPTS = [['none','None'],['montage','Montage'],['hero','Hero'],['bullet','Bullet'],['jumper','Jump Cut'],['flashIn','Flash In'],['flashOut','Flash Out'],['custom','Custom']];
const ANIM_IN = [['none','None'],['fade','Fade In'],['zoomIn','Zoom In'],['zoomOut','Zoom Out'],['slideL','Slide Left'],['slideR','Slide Right'],['slideU','Slide Up'],['slideD','Slide Down'],['spin','Spin'],['shake','Shake'],['rotateIn','Rotate In'],['flipX','Flip X'],['flipY','Flip Y'],['dropIn','Drop'],['riseUp','Rise Up'],['blurIn','Blur In'],['glitchIn','Glitch In'],['swingIn','Swing'],['shrinkIn','Shrink'],['growIn','Grow'],['wipeIn','Wipe'],['circleIn','Circle'],['flashIn','Flash'],['pixelIn','Pixelate'],['tiltIn','Tilt']];
const ANIM_OUT = ANIM_IN.map(([k,n]) => [k, n.replace(' In',' Out')]);
const ANIM_LOOP = [['none','None'],['kenburns','Ken Burns'],['zoomOutSlow','Slow Zoom Out'],['pulse','Pulse'],['sway','Sway'],['zoomInOut','Zoom In-Out'],['rock','Rock'],['wobble','Wobble'],['jelly','Jelly'],['glitchLoop','Glitch'],['flashLoop','Flash'],['rotateLoop','Rotate'],['shakeLoop','Shake'],['heartbeat','Heartbeat'],['bounceLoop','Bounce'],['blurPulse','Blur Pulse']];
const VOICES = [['none','None'],['michog','Mic Hog'],['megaphone','Megaphone'],['telephone','Telephone'],['robot','Robot'],['lofi','Lo-Fi'],['deep','Deep'],['radio','Radio']];
const TRANS = [['none','None'],['fade','Dissolve'],['black','Fade Black'],['white','Flash White'],['slideL','Slide Left'],['slideR','Slide Right'],['slideU','Slide Up'],['slideD','Slide Down'],['wipeL','Wipe Left'],['wipeR','Wipe Right'],['zoomIn','Zoom In'],['zoomOut','Zoom Out'],['spin','Spin'],['glitch','Glitch'],['circleOpen','Circle Open'],['circleClose','Circle Close'],['diamond','Diamond'],['clock','Clock Wipe'],['blinds','Blinds'],['blindsV','Blinds V'],['dissolve','Pixel Dissolve'],['doors','Doors'],['barn','Barn Door'],['heart','Heart'],['star','Star'],['luma','Luma Fade'],['blurDissolve','Blur'],['pixelT','Pixelate'],['zoomBlur','Zoom Blur'],['whipL','Whip Left'],['whipR','Whip Right'],['flashShake','Shake & Flash'],['rgbGlitch','RGB Glitch'],['spinZoom','Spin Zoom'],['flip','Flip'],['cube','Cube'],['dropIn','Drop In']];
const FONTS = [['Noto Sans Kannada','ಕನ್ನಡ Sans'],['Baloo Tamma 2','ಬಲೂ ತಮ್ಮ'],['Anek Kannada','ಅನೇಕ್'],['Tiro Kannada','ತಿರೋ'],['Noto Serif Kannada','ಕನ್ನಡ Serif'],['Poppins','Poppins'],['Montserrat','Montserrat'],['Oswald','Oswald'],['Bebas Neue','Bebas Neue'],['Anton','Anton'],['Pacifico','Pacifico'],['Lobster','Lobster'],['Dancing Script','Dancing'],['Permanent Marker','Marker']];
const TEXT_PRESETS = [
  {color:'#ffffff',strokeW:0,bgOn:false,shadow:30,shadowColor:'#000000'},
  {color:'#ffffff',stroke:'#000000',strokeW:6,bgOn:false,shadow:0},
  {color:'#ffe600',stroke:'#000000',strokeW:7,bgOn:false,shadow:0},
  {color:'#000000',strokeW:0,bgOn:true,bgColor:'#ffffff',bgAlpha:100,shadow:0},
  {color:'#ffffff',strokeW:0,bgOn:true,bgColor:'#e53935',bgAlpha:100,shadow:0},
  {color:'#ffffff',strokeW:0,bgOn:true,bgColor:'#000000',bgAlpha:60,shadow:0},
  {color:'#ffffff',strokeW:0,bgOn:false,shadow:80,shadowColor:'#1fd1d1'},
  {color:'#ff4fa3',stroke:'#ffffff',strokeW:6,bgOn:false,shadow:0}
];
const SWATCHES = ['#ffffff','#000000','#ffe600','#ff3b30','#ff9500','#34c759','#1fd1d1','#007aff','#af52de','#ff4fa3'];
const EMOJIS = '❤️ 😂 😍 🔥 👍 🎉 ✨ ⭐ 💯 😎 🥳 😢 😡 🤔 👏 🙏 💪 🎂 🎁 🌸 🌹 ☀️ 🌙 ⚡ 💥 💫 🎵 🎶 📍 ✅ ❌ ⚠️ 👉 👈 👆 👇 😮 🤩 😇 🥰 😜 🙌 💖 💔 🏆 🎓 📚 🪔'.split(' ');
const OV_IN = [['none','None'],['fade','Fade'],['pop','Pop'],['zoom','Zoom'],['slideUp','Slide Up'],['slideDown','Slide Down'],['slideL','Slide Left'],['slideR','Slide Right'],['typewriter','Typewriter'],['bounce','Bounce'],['spin','Spin'],['blur','Blur'],['letterPop','Letter Pop'],['letterFade','Letter Fade'],['letterBounce','Letter Bounce'],['wordPop','Word Pop'],['flipX','Flip X'],['flipY','Flip Y'],['dropIn','Drop'],['riseUp','Rise Up'],['rotateIn','Rotate In'],['growIn','Grow'],['shrinkIn','Shrink'],['glitchIn','Glitch'],['swingIn','Swing'],['tiltIn','Tilt'],['wipeIn','Wipe'],['flashIn','Flash']];
const OV_OUT = OV_IN.filter(x => x[0] !== 'bounce' && x[0] !== 'pop');
const OV_LOOP = [['none','None'],['pulse','Pulse'],['shake','Shake'],['float','Float'],['swing','Swing'],['blink','Blink'],['heartbeat','Heartbeat'],['rotate','Rotate'],['wave','Wave'],['jelly','Jelly'],['rock','Rock'],['bounceLoop','Bounce'],['zoomInOut','Zoom In-Out'],['glitchLoop','Glitch'],['rainbow','Rainbow']];
const MASKS = [['none','None'],['linear','Linear'],['mirror','Mirror'],['circle','Circle'],['rect','Rectangle'],['heart','❤ Heart'],['star','★ Star']];
const MASK_T = {none:0,linear:1,mirror:2,circle:3,rect:4,heart:5,star:6};
const BLENDS = [['source-over','Normal'],['multiply','Multiply'],['screen','Screen'],['overlay','Overlay'],['darken','Darken'],['lighten','Lighten'],['color-dodge','Color Dodge'],['color-burn','Color Burn'],['hard-light','Hard Light'],['soft-light','Soft Light'],['difference','Difference'],['exclusion','Exclusion'],['hue','Hue'],['saturation','Saturation'],['color','Color'],['luminosity','Luminosity']];
const FX = [['none','None'],['rgbsplit','RGB Split'],['glitch','Glitch'],['vhs','VHS'],['oldfilm','Old Film'],['shake','Shake'],['zoompulse','Zoom Pulse'],['flash','Flash'],['rainbow','Rainbow'],['pixelate','Pixelate'],['blur','Blur'],['mirror','Mirror'],['kaleido','4-Split'],['invert','Invert']];
const FX_T = {none:0,rgbsplit:1,glitch:2,vhs:3,pixelate:4,mirror:5,kaleido:6,invert:7,blur:8,oldfilm:9,shake:10,zoompulse:11,flash:12,bright:13,rainbow:14};
const CAP_LANGS = [['kannada','ಕನ್ನಡ'],['english','English'],['hindi','हिन्दी'],['tamil','தமிழ்'],['telugu','తెలుగు'],['marathi','मराठी'],['malayalam','മലയാളം']];
const SR_LANGS = [['kn-IN','ಕನ್ನಡ'],['en-IN','English (India)'],['hi-IN','हिन्दी'],['ta-IN','தமிழ்'],['te-IN','తెలుగు'],['mr-IN','मराठी'],['ml-IN','മലയാളം']];

/* ================= KEYFRAMES ================= */
const KF_CLIP = ['tf.scale','tf.x','tf.y','tf.rot','opacity'];
const KF_OV = ['x','y','size','rot','opacity'];
const KF_EPS = 1/30;
const kfList = it => it.type === 'audio' ? [] : it.type ? KF_OV : KF_CLIP;
function kfTime(it){ if(it.type) return S.time - it.start; const d = derived[it.id]; return d ? localToSrc(it, S.time - d.start) : 0; }
function ev(it,path,t){
  const kf = it.kf;
  if(!kf || !kf.length || !kfList(it).includes(path)) return getP(it,path);
  if(t === undefined) t = kfTime(it);
  if(t <= kf[0].t) return kf[0].v[path];
  const last = kf[kf.length-1]; if(t >= last.t) return last.v[path];
  for(let i=0;i<kf.length-1;i++) if(t < kf[i+1].t){
    const a=kf[i], b=kf[i+1], f=(t-a.t)/(b.t-a.t), e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2;
    return a.v[path] + (b.v[path]-a.v[path])*e;
  }
  return last.v[path];
}
function atKf(it){ if(!it || !it.kf || !it.kf.length) return null; const t = kfTime(it); return it.kf.find(k => Math.abs(k.t-t) < KF_EPS) || null; }
function setVal(it,path,v){
  if(it.kf && it.kf.length && kfList(it).includes(path)){
    let k = atKf(it);
    if(!k){ const t = kfTime(it); k = {t, v:{}}; for(const p of kfList(it)) k.v[p] = ev(it,p,t); it.kf.push(k); it.kf.sort((a,b)=>a.t-b.t); }
    k.v[path] = v;
  } else setP(it,path,v);
}
function inRange(it){ if(it.type) return S.time >= it.start && S.time <= it.start+it.dur; const d=derived[it.id]; return S.time >= d.start && S.time <= d.start+d.dur; }
function toggleKf(){
  const it = selItem(); if(!it || !kfList(it).length) return;
  if(!inRange(it)) return alert('Playhead ಅನ್ನು ಈ item ಒಳಗೆ ತನ್ನಿ, ನಂತರ ◆ ಒತ್ತಿ');
  pushUndo(); it.kf = it.kf || [];
  const k = atKf(it);
  if(k){
    if(it.kf.length === 1) for(const p of kfList(it)) setP(it,p,k.v[p]);
    it.kf.splice(it.kf.indexOf(k),1);
  } else {
    const t = kfTime(it), v = {}; for(const p of kfList(it)) v[p] = ev(it,p,t);
    it.kf.push({t,v}); it.kf.sort((a,b)=>a.t-b.t);
  }
  renderTimeline(); renderInspector();
}
function jumpKf(dir){
  const it = selItem(); if(!it || !it.kf || !it.kf.length) return; const t = kfTime(it);
  const k = dir > 0 ? it.kf.find(k => k.t > t+KF_EPS) : [...it.kf].reverse().find(k => k.t < t-KF_EPS);
  if(!k) return;
  seek(it.type ? it.start + k.t : derived[it.id].start + srcToLocal(it, k.t));
  renderInspector();
}

/* ================= TIMELINE MATH ================= */
const N = 100;
function curveAt(c,p){
  if(!c.curve || !c.curve.length) return 1; const a=c.curve; p=clamp(p,0,1);
  if(typeof a[0]==='number'){ const n=a.length-1, x=p*n, i=Math.min(Math.floor(x),n-1), f=x-i; return a[i]+(a[i+1]-a[i])*f; }
  if(p<=a[0][0]) return a[0][1];
  for(let i=0;i<a.length-1;i++) if(p<=a[i+1][0]){ const f=(p-a[i][0])/Math.max(1e-6,a[i+1][0]-a[i][0]), e=f*f*(3-2*f); return Math.pow(2, Math.log2(a[i][1])*(1-e)+Math.log2(a[i+1][1])*e); }
  return a[a.length-1][1];
}
const curvePairs = arr => arr.map((v,i)=>[i/(arr.length-1), v]);
function rateAt(c,p){ return clamp(c.speed*curveAt(c,p), 0.1, 10); }
function layout(){
  let t = 0, prev = null;
  for(const c of S.clips){
    const len = Math.max(0.05, c.out - c.in), cum = new Float64Array(N+1);
    for(let i=0;i<N;i++) cum[i+1] = cum[i] + len/N/rateAt(c,(i+.5)/N);
    let td = 0;
    if(prev && c.trans && c.trans.type !== 'none') td = Math.min(c.trans.dur, derived[prev.id].dur*.45, cum[N]*.45);
    const start = t - td;
    derived[c.id] = {start, dur:cum[N], cum, len, td};
    t = start + cum[N]; prev = c;
  }
  S.mainEnd = t;
  S.total = Math.max(t, 0, ...S.overlays.map(o => o.start + o.dur), ...S.audios.map(a => a.start + a.dur));
}
function srcToLocal(c,src){ const d=derived[c.id]; const p=clamp((src-c.in)/d.len,0,1)*N; const i=Math.min(Math.floor(p),N-1); return d.cum[i]+(d.cum[i+1]-d.cum[i])*(p-i); }
function localToSrc(c,lt){
  const d=derived[c.id], cum=d.cum; lt=clamp(lt,0,cum[N]);
  let lo=0, hi=N; while(hi-lo>1){ const m=(lo+hi)>>1; if(cum[m]<=lt) lo=m; else hi=m; }
  const sg=cum[lo+1]-cum[lo], f=sg>0?(lt-cum[lo])/sg:0;
  return c.in+(lo+f)/N*d.len;
}
function clipAt(t){
  for(const c of S.clips){ const d=derived[c.id]; if(t < d.start+d.dur) return c; }
  const last = S.clips[S.clips.length-1];
  return last && t <= S.mainEnd + 1e-6 ? last : null;
}
function currentPair(){
  const a = active; if(!a || !derived[a.id]) return null;
  const b = S.clips[S.clips.indexOf(a)+1];
  if(b && b.trans && b.trans.type !== 'none'){
    const db = derived[b.id];
    if(db && db.td > 0 && S.time >= db.start) return {a, b, p:clamp((S.time-db.start)/db.td,0,1)};
  }
  return {a};
}

/* ================= MEDIA ELEMENTS ================= */
const POOL = (() => { const d=document.createElement('div'); d.id='mediaPool'; d.style.cssText='position:fixed;left:0;top:0;width:4px;height:4px;overflow:hidden;opacity:.01;pointer-events:none;z-index:-1'; (document.body||document.documentElement).appendChild(d); return d; })();
function mkVideo(url){ const v=document.createElement('video'); v.preload='auto'; v.playsInline=true; v.setAttribute('playsinline',''); v.style.cssText='width:4px;height:4px'; POOL.appendChild(v); if(url) v.src=url; return v; }
function dropEl(v){ try{ v.pause(); v.removeAttribute('src'); v.load(); v.remove(); }catch(e){} }
function getVid(c){
  let v = vids[c.id];
  if(!v){ v = mkVideo(media(c.mediaId).url); v.currentTime = c.in; vids[c.id] = v; }
  return v;
}
function ovVid(o){
  let v = ovVids[o.id];
  if(!v){ v = mkVideo(media(o.mediaId).url); v.currentTime = o.in; ovVids[o.id] = v; }
  return v;
}
function audEl(a){
  let el = audEls[a.id];
  if(el && el.dataset.mid !== a.mediaId){ dropEl(el); delete audEls[a.id]; if(audChains[a.id]){ killChain(audChains[a.id]); delete audChains[a.id]; } el = null; }
  if(!el){ el = new Audio(); el.preload = 'auto'; el.dataset.mid = a.mediaId; const m = media(a.mediaId); if(m && m.url) el.src = m.url; audEls[a.id] = el; }
  return el;
}

/* ================= AUDIO ENGINE ================= */
let AC=null, master, spk, recDest, impulse=null;
const srcNodes = new WeakMap();
const chains = new Map();
function initAudio(){
  if(AC) return;
  AC = new (window.AudioContext||window.webkitAudioContext)();
  master = AC.createGain(); spk = AC.createGain();
  master.connect(spk); spk.connect(AC.destination);
  recDest = AC.createMediaStreamDestination(); master.connect(recDest);
}
function nodeFor(el){ let n=srcNodes.get(el); if(!n){ n=AC.createMediaElementSource(el); srcNodes.set(el,n); } return n; }
function shaperCurve(k){ const n=1024, a=new Float32Array(n); for(let i=0;i<n;i++){ const x=i*2/n-1; a[i]=(1+k)*x/(1+k*Math.abs(x)); } return a; }
function getImpulse(){
  if(impulse) return impulse;
  const len=Math.floor(AC.sampleRate*2.2), b=AC.createBuffer(2,len,AC.sampleRate);
  for(let ch=0;ch<2;ch++){ const d=b.getChannelData(ch); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3); }
  return impulse=b;
}
function buildChain(c){
  const a=c.audio, nodes=[], input=AC.createGain(); let cur=input;
  const link = n => { cur.connect(n); cur=n; nodes.push(n); return n; };
  const filt = (type,f,q,g) => { const n=AC.createBiquadFilter(); n.type=type; n.frequency.value=f; if(q!=null) n.Q.value=q; if(g!=null) n.gain.value=g; return n; };
  const shaper = k => { const s=AC.createWaveShaper(); s.curve=shaperCurve(k); s.oversample='4x'; return s; };
  const gain = v => { const g=AC.createGain(); g.gain.value=v; return g; };
  link(filt('lowshelf',200,null,a.bass));
  link(filt('highshelf',3500,null,a.treble));
  if(a.isolate){ link(filt('highpass',150,.7)); link(filt('lowpass',5000,.7)); link(filt('peaking',2500,1,3)); }
  if(a.enhance){ link(filt('highpass',85,.7)); link(filt('peaking',300,1,-3)); link(filt('peaking',3200,1.2,4)); link(filt('highshelf',9000,null,2.5));
    const cp=AC.createDynamicsCompressor(); cp.threshold.value=-26; cp.knee.value=8; cp.ratio.value=3.5; cp.attack.value=.005; cp.release.value=.15; link(cp); link(gain(1.5)); }
  switch(a.voice){
    case 'michog':   link(filt('highpass',250,.7)); link(filt('peaking',2200,1,9)); link(shaper(40)); link(filt('lowpass',5500,.7)); link(gain(.55)); break;
    case 'megaphone':link(filt('highpass',600,1)); link(filt('lowpass',3000,1)); link(shaper(15)); link(gain(.7)); break;
    case 'telephone':link(filt('highpass',400,1)); link(filt('lowpass',3400,1)); break;
    case 'robot':   { const g=gain(0), o=AC.createOscillator(); o.frequency.value=60; o.connect(g.gain); o.start(); nodes.push(o); link(g); break; }
    case 'lofi':     link(filt('lowpass',2200,.5)); link(shaper(4)); break;
    case 'deep':     link(filt('lowshelf',150,null,10)); link(filt('highshelf',2500,null,-10)); break;
    case 'radio':    link(filt('highpass',500,1)); link(filt('lowpass',4500,1)); link(filt('peaking',1500,1,6)); link(shaper(6)); break;
  }
  const vol=gain(1); nodes.push(vol);
  const dry=gain(1); cur.connect(dry); dry.connect(vol); nodes.push(dry);
  if(a.echo>0){
    const d=AC.createDelay(2); d.delayTime.value=.28;
    const fb=gain(Math.min(.75,a.echo/100*.75)), wet=gain(a.echo/100*.8);
    cur.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(vol); nodes.push(d,fb,wet);
  }
  if(a.reverb>0){
    const cv=AC.createConvolver(); cv.buffer=getImpulse(); const wet=gain(a.reverb/100*1.2);
    cur.connect(cv); cv.connect(wet); wet.connect(vol); nodes.push(cv,wet);
  }
  vol.connect(master);
  return {input, vol, nodes};
}
function killChain(ch){
  try{ ch.src.disconnect(); }catch(e){}
  try{ ch.input.disconnect(); }catch(e){}
  ch.nodes.forEach(n => { try{ n.disconnect(); if(n.stop) n.stop(); }catch(e){} });
}
function dropChainFor(id){ const ch = chains.get(id); if(!ch) return; killChain(ch); chains.delete(id); }
function dropAllChains(){ [...chains.keys()].forEach(dropChainFor); }
function ensureChain(c){
  if(!AC || isImg(c)) return null;
  let ch = chains.get(c.id); if(ch) return ch;
  const sn = nodeFor(getVid(c)); try{ sn.disconnect(); }catch(e){}
  ch = buildChain(c); sn.connect(ch.input); ch.src = sn; chains.set(c.id, ch);
  return ch;
}
function rebuildChain(c){ if(chains.has(c.id)){ dropChainFor(c.id); ensureChain(c); } }
function syncAudio(){
  if(!AC) return;
  const pr = currentPair(), want = pr ? [pr.a, pr.b].filter(Boolean) : [];
  for(const id of [...chains.keys()]) if(!want.some(c => c.id === id)) dropChainFor(id);
  want.forEach(ensureChain);
}
function ensureOvAudio(o,v){
  if(!AC || ovAud[o.id]) return;
  const g = AC.createGain(); nodeFor(v).connect(g); g.connect(master); ovAud[o.id] = g;
}
function audChain(a){
  if(!AC) return null;
  let ch = audChains[a.id]; if(ch) return ch;
  const sn = nodeFor(audEl(a)); try{ sn.disconnect(); }catch(e){}
  ch = buildChain(a); sn.connect(ch.input); ch.src = sn; audChains[a.id] = ch;
  return ch;
}
function rebuildAudChain(a){ const ch = audChains[a.id]; if(!ch) return; killChain(ch); delete audChains[a.id]; audChain(a); }
function dropAudChains(){ for(const id in audChains){ killChain(audChains[id]); delete audChains[id]; } }

/* ================= PLAYBACK ================= */
function activate(c,src){
  if(active !== c){
    for(const k in vids) if(k !== c.id) vids[k].pause();
    active = c;
  }
  if(!isImg(c)){
    const v = getVid(c);
    if(Math.abs(v.currentTime - src) > (S.playing ? .2 : .04)) v.currentTime = src;
  }
  const nx = S.clips[S.clips.indexOf(c)+1];
  if(nx && !isImg(nx) && S.time < derived[nx.id].start){
    const nv = getVid(nx); if(nv.paused && Math.abs(nv.currentTime-nx.in) > .1) nv.currentTime = nx.in;
  }
}
function deactivate(){ if(active && !isImg(active) && vids[active.id]) vids[active.id].pause(); active = null; }
function syncSecondary(){
  const pr = currentPair(); if(!pr || !pr.b || isImg(pr.b)) return;
  const b = pr.b, v = getVid(b), want = localToSrc(b, S.time - derived[b.id].start);
  if(S.playing){
    if(v.paused){ v.currentTime = want; v.play().catch(()=>{}); }
    else if(Math.abs(v.currentTime - want) > .3) v.currentTime = want;
    const r = Math.round(rateAt(b,(v.currentTime-b.in)/derived[b.id].len)*20)/20;
    if(v.playbackRate !== r) v.playbackRate = r;
  } else if(Math.abs(v.currentTime - want) > .04) v.currentTime = want;
}
// keep a free-running media element (PiP video / audio item) in sync with the timeline
function syncEl(el,it,on){
  if(!on){ if(!el.paused) el.pause(); return; }
  const want = it.in + (S.time - it.start)*it.speed;
  if(S.playing){
    if(el.playbackRate !== it.speed) el.playbackRate = it.speed;
    if(el.paused){ el.currentTime = want; el.play().catch(()=>{}); }
    else if(Math.abs(el.currentTime - want) > .3) el.currentTime = want;
  } else {
    if(!el.paused) el.pause();
    if(Math.abs(el.currentTime - want) > .04) el.currentTime = want;
  }
}
function syncOvVideos(){
  for(const o of S.overlays){
    if(o.type !== 'video') continue;
    const v = ovVid(o), on = S.time >= o.start && S.time < o.start + o.dur;
    if(AC) ensureOvAudio(o,v);
    if(ovAud[o.id]) ovAud[o.id].gain.value = on ? o.volume/100 : 0;
    syncEl(v,o,on);
  }
  for(const id in ovVids) if(!S.overlays.some(o => o.id === id)){ ovVids[id].pause(); if(ovAud[id]) ovAud[id].gain.value = 0; }
}
function syncAudItems(){
  for(const a of S.audios){
    const el = audEl(a), on = S.time >= a.start && S.time < a.start + a.dur, ch = audChain(a);
    if(ch){
      const lt = S.time - a.start; let g = on ? a.volume/100*(a.audio.norm && a.normGain ? a.normGain : 1) : 0;
      if(a.fadeIn > 0) g *= clamp(lt/a.fadeIn, 0, 1);
      if(a.fadeOut > 0) g *= clamp((a.dur-lt)/a.fadeOut, 0, 1);
      ch.vol.gain.value = g;
    }
    syncEl(el,a,on);
  }
  for(const id in audEls) if(!S.audios.some(a => a.id === id)){ audEls[id].pause(); if(audChains[id]) audChains[id].vol.gain.value = 0; }
}
function seek(t){
  S.time = clamp(t, 0, S.total||0);
  const c = clipAt(S.time);
  if(c){
    activate(c, localToSrc(c, S.time - derived[c.id].start));
    syncSecondary();
    if(S.playing && !isImg(c)) getVid(c).play().catch(()=>{});
  } else deactivate();
  syncOvVideos(); syncAudItems(); syncAudio(); updatePH();
}
async function play(){
  if(!S.total) return;
  initAudio(); if(AC.state === 'suspended') await AC.resume();
  if(S.time >= S.total - .05) S.time = 0;
  S.playing = true; seek(S.time); updatePlayBtn();
}
function pause(){
  S.playing = false;
  for(const k in vids) vids[k].pause();
  for(const k in ovVids) ovVids[k].pause();
  for(const k in audEls) audEls[k].pause();
  updatePlayBtn();
}
function updatePlayBtn(){ const b=$('#btnPlay'); if(b) b.innerHTML = ic(S.playing ? 'pause' : 'play'); }

let lastNow = 0, pairKey = '', lastSyncT = -1;
function tick(now){
  requestAnimationFrame(tick);
  const dt = Math.min(.1, (now - lastNow)/1000 || 0); lastNow = now;
  if(S.playing){
    if(!active && S.time < S.mainEnd - 1e-4){
      const c = clipAt(S.time);
      if(c){ activate(c, localToSrc(c, S.time - derived[c.id].start)); if(!isImg(c)) getVid(c).play().catch(()=>{}); }
    }
    const c = active;
    if(c && S.time < S.mainEnd - 1e-4){
      const d = derived[c.id], end = d.start + d.dur; let done = false;
      if(isImg(c)){ S.time += dt; done = S.time >= end; }
      else {
        const v = vids[c.id];
        if(v.currentTime >= c.out - .02 || v.ended) done = true;
        else {
          const r = Math.round(rateAt(c,(v.currentTime-c.in)/d.len)*20)/20;
          if(v.playbackRate !== r) v.playbackRate = r;
          S.time = d.start + srcToLocal(c, v.currentTime);
        }
      }
      if(done){
        const nx = S.clips[S.clips.indexOf(c)+1];
        if(nx){
          if(!isImg(c)) vids[c.id].pause();
          S.time = end; activate(nx, localToSrc(nx, S.time - derived[nx.id].start));
          if(!isImg(nx)) getVid(nx).play().catch(()=>{});
        } else S.time = end;
      }
    } else {
      S.time += dt;
      if(active && S.time > S.mainEnd + 1e-4) deactivate();
    }
    if(S.time >= S.total - 1e-4){ S.time = S.total; pause(); onPlaybackEnd(); }
    else { syncSecondary(); syncOvVideos(); syncAudItems(); }
  }
  const pr = currentPair();
  const key = pr ? pr.a.id + '|' + (pr.b ? pr.b.id : '') : '';
  if(key !== pairKey){ pairKey = key; syncAudio(); }
  if(pr){
    for(const [c,role] of [[pr.a,'a'],[pr.b,'b']]){
      if(!c) continue; const ch = chains.get(c.id); if(!ch) continue;
      const d = derived[c.id], lt = S.time - d.start; let g = S.mainMute ? 0 : c.volume/100*(c.audio.norm && c.normGain ? c.normGain : 1);
      if(c.fadeIn > 0)  g *= clamp(lt/c.fadeIn, 0, 1);
      if(c.fadeOut > 0) g *= clamp((d.dur-lt)/c.fadeOut, 0, 1);
      if(pr.b) g *= role === 'a' ? 1 - pr.p : pr.p;
      ch.vol.gain.value = g;
    }
  }
  render(now);
  updatePH();
  syncInsp();
  if(exporting) $('#ovBar').style.width = (S.total ? S.time/S.total*100 : 0) + '%';
  if(recState) $('#recTime') && ($('#recTime').textContent = fmtTC((performance.now()-recState.w0)/1000));
}

/* ================= WEBGL RENDERER ================= */
const out = $('#out'), octx = out.getContext('2d');
const cv = document.createElement('canvas'); cv.width = 720; cv.height = 1280;
const gl = cv.getContext('webgl', {alpha:true, premultipliedAlpha:true, preserveDrawingBuffer:true});
const VS = `attribute vec2 a;varying vec2 uv;uniform vec2 u_half,u_off,u_canvas;uniform float u_rot;
void main(){uv=vec2(a.x*.5+.5,.5-a.y*.5);vec2 p=a*u_half;float cs=cos(u_rot),sn=sin(u_rot);
p=vec2(p.x*cs-p.y*sn,p.x*sn+p.y*cs)+u_off;gl_Position=vec4(p/(u_canvas*.5),0.,1.);}`;
const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;uniform sampler2D u_tex,u_lut;uniform vec2 u_px;
uniform float u_lutN,u_lutAmt,u_alpha,u_time,u_b,u_c,u_s,u_t,u_ti,u_f,u_v,u_g,u_sh,u_blur;
uniform float u_mT,u_mRot,u_mF,u_mR,u_mInv,u_asp;uniform vec2 u_mC,u_mS;
uniform float u_ck,u_ckSim,u_ckSm,u_ckSp;uniform vec3 u_ckC;
uniform float u_fx,u_fxA,u_sec;
uniform sampler2D u_seg;uniform float u_segOn,u_segInv,u_rtS,u_rtB,u_trT,u_trP;uniform vec2 u_res;
const vec3 LW=vec3(.299,.587,.114);
vec3 lut(vec3 c){float n=u_lutN;float b=c.b*(n-1.);float b0=floor(b);float b1=min(b0+1.,n-1.);float f=b-b0;
 float x=c.r*(n-1.)+.5;float y=(c.g*(n-1.)+.5)/n;
 return mix(texture2D(u_lut,vec2((b0*n+x)/(n*n),y)).rgb,texture2D(u_lut,vec2((b1*n+x)/(n*n),y)).rgb,f);}
float rnd(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float dot2(vec2 v){return dot(v,v);}
float sdHeart(vec2 p){p.x=abs(p.x);
 if(p.y+p.x>1.)return sqrt(dot2(p-vec2(.25,.75)))-sqrt(2.)/4.;
 return sqrt(min(dot2(p-vec2(0.,1.)),dot2(p-.5*max(p.x+p.y,0.))))*sign(p.x-p.y);}
float sdStar(vec2 p,float r,float rf){
 const vec2 k1=vec2(.809016994375,-.587785252292);const vec2 k2=vec2(-.809016994375,-.587785252292);
 p.x=abs(p.x);p-=2.*max(dot(k1,p),0.)*k1;p-=2.*max(dot(k2,p),0.)*k2;p.x=abs(p.x);p.y-=r;
 vec2 ba=rf*vec2(-k1.y,k1.x)-vec2(0.,1.);float h=clamp(dot(p,ba)/dot(ba,ba),0.,r);
 return length(p-ba*h)*sign(p.y*ba.x-p.x*ba.y);}
float maskA(){
 if(u_mT<.5)return 1.;
 vec2 p=uv-u_mC;p.x*=u_asp;
 float cs=cos(u_mRot),sn=sin(u_mRot);p=vec2(p.x*cs+p.y*sn,-p.x*sn+p.y*cs);
 float d;
 if(u_mT<1.5)d=p.y;
 else if(u_mT<2.5)d=abs(p.y)-u_mS.y;
 else if(u_mT<3.5){vec2 r=max(u_mS,vec2(.001));d=(length(p/r)-1.)*min(r.x,r.y);}
 else if(u_mT<4.5){vec2 q=abs(p)-u_mS+u_mR;d=length(max(q,0.))+min(max(q.x,q.y),0.)-u_mR;}
 else if(u_mT<5.5){float s=max(u_mS.y*1.8,.001);d=sdHeart(vec2(p.x,-p.y)/s+vec2(0.,.55))*s;}
 else d=sdStar(vec2(p.x,-p.y),u_mS.y,.45);
 float f=u_mF+.0015;float a=1.-smoothstep(-f,f,d);
 return u_mInv>.5?1.-a:a;}
vec2 cuv(vec3 c){float y=dot(c,LW);return vec2(c.b-y,c.r-y);}
float sedge(float v,float e){return smoothstep(e+.006,e-.006,v);}
float trMask(){
 if(u_trT<.5)return 1.;
 vec2 q=gl_FragCoord.xy/u_res;q.y=1.-q.y;float p=u_trP;vec2 d=q-.5;d.x*=u_res.x/u_res.y;
 if(u_trT<1.5)return sedge(length(d),p*1.25);
 if(u_trT<2.5)return 1.-sedge(length(d),(1.-p)*1.25);
 if(u_trT<3.5)return sedge(abs(d.x)+abs(d.y),p*1.6);
 if(u_trT<4.5){float a=atan(d.x,-d.y)/6.28318+.5;return sedge(a,p);}
 if(u_trT<5.5)return sedge(fract(q.y*10.),p);
 if(u_trT<6.5)return sedge(fract(q.x*10.),p);
 if(u_trT<7.5)return step(rnd(floor(q*vec2(60.,60.*u_res.y/u_res.x))),p);
 if(u_trT<8.5)return sedge(abs(q.x-.5)*2.,p);
 if(u_trT<9.5)return sedge(abs(q.y-.5)*2.,p);
 if(u_trT<10.5){float s=max(p*2.4,.001);return sedge(sdHeart(vec2(d.x,-d.y)/s+vec2(0.,.55))*s,0.);}
 if(u_trT<11.5)return sedge(sdStar(vec2(d.x,-d.y),p*1.3,.45),0.);
 if(u_trT>12.5&&u_trT<13.5)return sedge(q.x,p);
 return 1.;}
vec3 hueRot(vec3 c,float a){vec3 k=vec3(.57735);float cs=cos(a);return c*cs+cross(k,c)*sin(a)+k*dot(k,c)*(1.-cs);}
vec4 tx(vec2 u){vec4 t=texture2D(u_tex,u);
 if(u_ck>.5){float d=distance(cuv(t.rgb),cuv(u_ckC))-u_ckSim;t.a*=pow(clamp(d/u_ckSm,0.,1.),1.5);
  float sp=pow(clamp(d/u_ckSp,0.,1.),1.5);t.rgb=mix(vec3(dot(t.rgb,LW)),t.rgb,sp);}
 return t;}
float skin(vec3 c){float y=dot(c,LW);float cb=(c.b-y)*.564+.5;float cr=(c.r-y)*.713+.5;
 return (1.-smoothstep(.08,.14,abs(cb-.40)))*(1.-smoothstep(.06,.12,abs(cr-.60)))*smoothstep(.12,.25,y);}
vec3 surf(vec2 u,vec3 c0){vec3 acc=c0;float ws=1.;
 for(int i=0;i<8;i++){float a=float(i)*.785398;vec2 d=vec2(cos(a)*u_px.x/u_px.y,sin(a))*.0045;
  for(int r=1;r<=2;r++){vec3 s=tx(u+d*float(r)).rgb;float w=exp(-dot(s-c0,s-c0)*35.);acc+=s*w;ws+=w;}}
 return acc/ws;}
vec4 split3(vec2 u,vec2 o){vec4 a=tx(u+o),b=tx(u),c=tx(u-o);return vec4(a.r,b.g,c.b,max(b.a,max(a.a,c.a)));}
vec4 fetch(vec2 u){float I=u_fxA;
 if(u_fx<.5)return tx(u);
 if(u_fx<1.5)return split3(u,vec2(.015*I,.004*I));
 if(u_fx<2.5){float tt=floor(u_sec*12.);float ln=floor(u.y*24.);
  if(rnd(vec2(ln,tt))<.35*I)u.x+=(rnd(vec2(tt,ln+7.))-.5)*.25*I;
  return split3(u,vec2(.012*I*step(.5,rnd(vec2(tt,1.))),0.));}
 if(u_fx<3.5){u.x+=sin(u.y*40.+u_sec*8.)*.003*I+(rnd(vec2(floor(u.y*240.),floor(u_sec*30.)))-.5)*.006*I;
  return split3(u,vec2(.006*I,0.));}
 if(u_fx<4.5){vec2 b=u_px*mix(2.,48.,I);return tx((floor(u/b)+.5)*b);}
 if(u_fx<5.5){u.x=u.x<.5?u.x:1.-u.x;return tx(u);}
 if(u_fx<6.5){vec2 f=floor(u*2.);vec2 v=fract(u*2.);v=mix(v,1.-v,f);return tx(v);}
 if(u_fx>7.5&&u_fx<8.5){vec4 s=vec4(0.);vec2 r=u_px*(1.+I*14.);
  for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++)s+=tx(u+vec2(float(i),float(j))*r);return s/25.;}
 return tx(u);}
void main(){vec3 c;float ta=1.;float I=u_fxA;
 if(u_blur>0.){c=vec3(0.);for(int i=-3;i<=3;i++)for(int j=-3;j<=3;j++)c+=texture2D(u_tex,uv+vec2(float(i),float(j))*.012).rgb;c/=49.;}
 else{vec4 t=fetch(uv);c=t.rgb;ta=t.a;
  if(u_rtS>0.||u_rtB>0.){float sk=skin(c);if(u_rtS>0.)c=mix(c,surf(uv,c),clamp(sk*u_rtS*1.2,0.,1.));
   if(u_rtB>0.)c=mix(c,c+(1.-c)*.35,sk*u_rtB);}
  if(u_sh>0.){vec3 n=texture2D(u_tex,uv+vec2(u_px.x,0.)).rgb+texture2D(u_tex,uv-vec2(u_px.x,0.)).rgb+texture2D(u_tex,uv+vec2(0.,u_px.y)).rgb+texture2D(u_tex,uv-vec2(0.,u_px.y)).rgb;c+=(c*4.-n)*u_sh;}}
 c+=u_b*.25;
 c=(c-.5)*(1.+u_c)+.5;
 float l=dot(c,LW);c=mix(vec3(l),c,1.+u_s);
 c.r+=u_t*.08;c.b-=u_t*.08;c.g+=u_ti*.06;
 c=c*(1.-u_f*.3)+u_f*.15;
 c=clamp(c,0.,1.);
 if(u_lutN>0.)c=mix(c,lut(c),u_lutAmt);
 if(u_fx>2.5&&u_fx<3.5){c*=.88+.12*sin(uv.y/u_px.y*1.7);c+=(rnd(uv*500.+u_sec)-.5)*.12*I;c=mix(c,vec3(dot(c,LW)),.2*I);}
 else if(u_fx>6.5&&u_fx<7.5)c=mix(c,1.-c,I);
 else if(u_fx>8.5&&u_fx<9.5){float lm=dot(c,LW);c=mix(c,vec3(lm*1.07+.05,lm*.95+.02,lm*.75),I);
  c*=1.-.18*I*rnd(vec2(floor(u_sec*18.),3.));
  float sx=rnd(vec2(floor(u_sec*6.),7.));c-=.4*I*(1.-smoothstep(0.,.0025,abs(uv.x-sx)))*step(.4,rnd(vec2(floor(u_sec*6.),9.)));
  c+=(rnd(uv*800.+u_sec)-.5)*.18*I;}
 else if(u_fx>11.5&&u_fx<12.5){c+=(1.-smoothstep(0.,.3,fract(u_sec)))*.7*I;}
 else if(u_fx>12.5&&u_fx<13.5)c=c+I*.85*(1.-c*.3);
 else if(u_fx>13.5&&u_fx<14.5)c=mix(c,hueRot(c,u_sec*2.),I);
 c*=1.-u_v*smoothstep(.25,.85,distance(uv,vec2(.5)));
 c+=(rnd(uv*1000.+u_time)-.5)*u_g*.2;
 float A=u_alpha*ta*maskA()*trMask();
 if(u_trT>11.5&&u_trT<12.5){float lm=dot(clamp(c,0.,1.),LW);A*=smoothstep(lm-.08,lm+.08,u_trP*1.16-.08);}
 if(u_segOn>.5){float m=texture2D(u_seg,uv).r;if(u_segInv>.5)m=1.-m;A*=smoothstep(.3,.7,m);}
 gl_FragColor=vec4(clamp(c,0.,1.)*A,A);}`;
function mkShader(type,src){ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram();
gl.attachShader(prog, mkShader(gl.VERTEX_SHADER,VS)); gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER,FS));
gl.linkProgram(prog); gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
const aLoc = gl.getAttribLocation(prog,'a'); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc,2,gl.FLOAT,false,0,0);
const U = {};
['u_half','u_off','u_rot','u_canvas','u_tex','u_lut','u_lutN','u_lutAmt','u_alpha','u_time','u_b','u_c','u_s','u_t','u_ti','u_f','u_v','u_g','u_sh','u_px','u_blur',
 'u_mT','u_mC','u_mS','u_mRot','u_mF','u_mR','u_mInv','u_asp','u_ck','u_ckC','u_ckSim','u_ckSm','u_ckSp','u_fx','u_fxA','u_sec','u_seg','u_segOn','u_segInv','u_rtS','u_rtB','u_trT','u_trP','u_res'].forEach(n => U[n]=gl.getUniformLocation(prog,n));
gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
function mkTex(){
  const t=gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  return t;
}
const texA = mkTex(), texB = mkTex(), texO = mkTex(), texSeg = mkTex();
const dummy = mkTex(); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
gl.uniform1i(U.u_tex,0); gl.uniform1i(U.u_lut,1); gl.uniform1i(U.u_seg,2);
const EX0 = {s:1,sx:1,dx:0,dy:0,a:1,r:0};

function fxParams(c){ const p={...c.adj}, f=FILTERS[c.filter]||{}, k=c.filterAmt/100; for(const key in f) p[key]=(p[key]||0)+f[key]*k; return p; }
function setFx(c){
  const p = fxParams(c);
  gl.uniform1f(U.u_b,p.brightness/100); gl.uniform1f(U.u_c,p.contrast/100); gl.uniform1f(U.u_s,p.saturation/100);
  gl.uniform1f(U.u_t,p.temp/100); gl.uniform1f(U.u_ti,p.tint/100); gl.uniform1f(U.u_f,p.fade/100);
  const rt=c.rt||{};
  gl.uniform1f(U.u_v,p.vignette/100); gl.uniform1f(U.u_g,p.grain/100); gl.uniform1f(U.u_sh,(p.sharpen+(rt.clear||0)*.6)/100*1.5);
  gl.uniform1f(U.u_rtS,(rt.smooth||0)/100); gl.uniform1f(U.u_rtB,(rt.bright||0)/100);
  const l = c.lut && S.luts.find(x => x.id === c.lut);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, l ? l.tex : dummy); gl.activeTexture(gl.TEXTURE0);
  gl.uniform1f(U.u_lutN, l ? l.n : 0); gl.uniform1f(U.u_lutAmt, c.lutAmt/100);
}
const fxRate = f => f ? .3 + 2.7*f.speed/100 : 1;
function setEffect(it){
  const f = it.fx, T = f ? FX_T[f.type] || 0 : 0;
  gl.uniform1f(U.u_fx, T); gl.uniform1f(U.u_fxA, f ? f.amount/100 : 0); gl.uniform1f(U.u_sec, S.time*fxRate(f));
}
function fxMotion(it,W,H){
  const f = it.fx, r = {dx:0,dy:0,s:1}; if(!f || f.type==='none') return r;
  const I = f.amount/100, t = S.time*fxRate(f), u = Math.min(W,H);
  if(f.type==='shake'){ r.dx=(Math.sin(t*31)+Math.sin(t*17.3))*.5*u*.03*I; r.dy=(Math.cos(t*27)+Math.sin(t*13.1))*.5*u*.03*I; }
  if(f.type==='zoompulse') r.s = 1 + .18*I*Math.pow(Math.max(0,Math.sin(t*Math.PI*2)),6);
  return r;
}
function setMask(it,vw,vh){
  const m = it.mask, T = m ? MASK_T[m.type] || 0 : 0;
  gl.uniform1f(U.u_mT, T); if(!T) return;
  const sx = m.w/200, sy = m.h/200;
  gl.uniform1f(U.u_asp, vw/vh);
  gl.uniform2f(U.u_mC, .5 + m.x/100, .5 + m.y/100);
  gl.uniform2f(U.u_mS, sx, sy);
  gl.uniform1f(U.u_mRot, m.rot*Math.PI/180);
  gl.uniform1f(U.u_mF, m.feather/100*.25);
  gl.uniform1f(U.u_mR, m.round/100*Math.min(sx,sy));
  gl.uniform1f(U.u_mInv, m.invert ? 1 : 0);
}
function setChroma(it){
  const k = it.ck, on = !!(k && k.on && !(S.pick && S.sel === it.id));
  gl.uniform1f(U.u_ck, on ? 1 : 0); if(!on) return;
  const n = parseInt(k.color.slice(1),16);
  gl.uniform3f(U.u_ckC, (n>>16&255)/255, (n>>8&255)/255, (n&255)/255);
  gl.uniform1f(U.u_ckSim, k.sim/100*.6);
  gl.uniform1f(U.u_ckSm, Math.max(.002, k.smooth/100*.3));
  gl.uniform1f(U.u_ckSp, Math.max(.002, k.spill/100*.5));
}
const bounceOut = k => { const n=7.5625,d=2.75; if(k<1/d) return n*k*k; if(k<2/d) return n*(k-=1.5/d)*k+.75; if(k<2.5/d) return n*(k-=2.25/d)*k+.9375; return n*(k-=2.625/d)*k+.984375; };
const backOut = k => { const q=k-1; return 1+2.70158*q*q*q+1.70158*q*q; };
function animState(c,lt,dur){
  const R={s:1,sx:1,sy:1,dx:0,dy:0,r:0,a:1,fx:null,mT:0,mP:0}; const W=cv.width, H=cv.height;
  const ap = (name,k) => { k=clamp(k,0,1); const e=1-Math.pow(1-k,3);
    switch(name){
      case 'fade': R.a*=e; break;
      case 'zoomIn': R.s*=.5+.5*e; R.a*=e; break;
      case 'zoomOut': R.s*=1.6-.6*e; R.a*=e; break;
      case 'slideL': R.dx+=(1-e)*W; break;
      case 'slideR': R.dx-=(1-e)*W; break;
      case 'slideU': R.dy+=(1-e)*H; break;
      case 'slideD': R.dy-=(1-e)*H; break;
      case 'spin': R.r+=(1-e)*Math.PI*2; R.s*=.3+.7*e; R.a*=e; break;
      case 'shake': R.dx+=Math.sin(k*40)*(1-k)*W*.04; break;
      case 'rotateIn': R.r-=(1-e)*Math.PI/2; R.s*=.7+.3*e; R.a*=e; break;
      case 'flipX': R.sx*=Math.max(.001,e); break;
      case 'flipY': R.sy*=Math.max(.001,e); break;
      case 'dropIn': R.dy-=(1-bounceOut(k))*H; break;
      case 'riseUp': R.dy+=(1-e)*H*.12; R.a*=e; break;
      case 'blurIn': R.fx=['blur',1-e]; R.a*=Math.min(1,k*2); break;
      case 'glitchIn': R.fx=['rgbsplit',1-k]; R.dx+=Math.sin(k*97)*W*.03*(1-k); break;
      case 'swingIn': R.r+=Math.sin(k*Math.PI*3)*(1-k)*.35; R.a*=Math.min(1,k*3); break;
      case 'shrinkIn': R.s*=1.5-.5*e; break;
      case 'growIn': R.s*=Math.max(.001,backOut(k)); break;
      case 'wipeIn': R.mT=13; R.mP=e; break;
      case 'circleIn': R.mT=1; R.mP=e; break;
      case 'flashIn': R.fx=['bright',1-e]; break;
      case 'pixelIn': R.fx=['pixelate',1-e]; break;
      case 'tiltIn': R.r+=(1-e)*.25; R.dx+=(1-e)*W*.25; R.a*=e; break;
    }};
  if(c.anim.in!=='none' && lt < c.anim.inDur) ap(c.anim.in, lt/c.anim.inDur);
  if(c.anim.out!=='none' && lt > dur-c.anim.outDur) ap(c.anim.out, (dur-lt)/c.anim.outDur);
  const q = dur>0 ? lt/dur : 0;
  switch(c.anim.loop){
    case 'kenburns': R.s*=1+.15*q; break;
    case 'zoomOutSlow': R.s*=1.15-.15*q; break;
    case 'pulse': R.s*=1+.04*Math.sin(lt*6); break;
    case 'sway': R.r+=.04*Math.sin(lt*2.5); break;
    case 'zoomInOut': R.s*=1+.12*Math.sin(q*Math.PI); break;
    case 'rock': R.r+=.06*Math.sin(lt*4); break;
    case 'wobble': R.dx+=Math.sin(lt*7)*W*.015; R.r+=.03*Math.sin(lt*5); break;
    case 'jelly': R.sx*=1+.05*Math.sin(lt*9); R.sy*=1-.05*Math.sin(lt*9); break;
    case 'glitchLoop': if(Math.sin(lt*13)>.7){ R.fx=['rgbsplit',.8]; R.dx+=Math.sin(lt*91)*W*.01; } break;
    case 'flashLoop': R.fx=['bright',Math.max(0,1-(lt*1.5%1)*4)*.6]; break;
    case 'rotateLoop': R.r+=lt*1.2; break;
    case 'shakeLoop': R.dx+=Math.sin(lt*41)*W*.012; R.dy+=Math.cos(lt*37)*H*.008; break;
    case 'heartbeat': { const p=lt%1; if(p<.5) R.s*=1+.08*Math.max(0,Math.sin(p*Math.PI*4)); break; }
    case 'bounceLoop': R.dy-=Math.abs(Math.sin(lt*4))*H*.03; break;
    case 'blurPulse': R.fx=['blur',(.5+.5*Math.sin(lt*3))*.6]; break;
  }
  return R;
}
function transState(type,p,W,H){
  const A={...EX0}, B={...EX0}; let sc=null, clear=null;
  const e = p<.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2, bell = Math.sin(p*Math.PI);
  const mask = t => { B.mT=t; B.mP=e; };
  switch(type){
    case 'fade': B.a=e; break;
    case 'black': case 'white':
      clear = type==='black' ? 0 : 1;
      if(p<.5){ A.a=1-2*p; B.a=0; } else { A.a=0; B.a=2*p-1; } break;
    case 'slideL': A.dx=-e*W; B.dx=(1-e)*W; break;
    case 'slideR': A.dx=e*W; B.dx=-(1-e)*W; break;
    case 'slideU': A.dy=-e*H; B.dy=(1-e)*H; break;
    case 'slideD': A.dy=e*H; B.dy=-(1-e)*H; break;
    case 'wipeL': sc=[Math.round(W*(1-e)),0,Math.ceil(W*e),H]; break;
    case 'wipeR': sc=[0,0,Math.ceil(W*e),H]; break;
    case 'zoomIn': A.s=1+e*.8; A.a=1-e; B.a=e; break;
    case 'zoomOut': A.s=1-.3*e; B.s=1.8-.8*e; B.a=e; break;
    case 'spin': B.r=(1-e)*Math.PI; B.s=Math.max(.01,e); B.a=e; break;
    case 'glitch': { const j=Math.sin(p*90)*W*.05*(1-Math.abs(2*p-1)); A.dx=j; B.dx=-j; B.a = p>.5 ? 1 : (Math.random()<p*2 ? 1 : 0); break; }
    case 'circleOpen': mask(1); break;
    case 'circleClose': mask(2); break;
    case 'diamond': mask(3); break;
    case 'clock': mask(4); break;
    case 'blinds': mask(5); break;
    case 'blindsV': mask(6); break;
    case 'dissolve': mask(7); break;
    case 'doors': mask(8); break;
    case 'barn': mask(9); break;
    case 'heart': mask(10); break;
    case 'star': mask(11); break;
    case 'luma': B.mT=12; B.mP=p; break;
    case 'blurDissolve': B.a=e; A.fx=['blur',bell]; B.fx=['blur',bell]; break;
    case 'pixelT': A.fx=['pixelate',bell]; B.fx=['pixelate',bell]; B.a=clamp((p-.45)/.1,0,1); break;
    case 'zoomBlur': A.s=1+e*.6; B.s=1.6-.6*e; B.a=e; A.fx=['blur',bell*.8]; B.fx=['blur',bell*.8]; break;
    case 'whipL': A.dx=-e*W; B.dx=(1-e)*W; A.fx=['blur',bell]; B.fx=['blur',bell]; break;
    case 'whipR': A.dx=e*W; B.dx=-(1-e)*W; A.fx=['blur',bell]; B.fx=['blur',bell]; break;
    case 'flashShake': { const j=Math.sin(p*70)*W*.03*bell; A.dx=j; B.dx=-j; A.fx=['bright',bell]; B.fx=['bright',bell]; B.a=p>.5?1:0; break; }
    case 'rgbGlitch': { const j=Math.sin(p*90)*W*.04*bell; A.dx=j; B.dx=-j; A.fx=['rgbsplit',bell]; B.fx=['rgbsplit',bell]; B.a=p>.5?1:0; break; }
    case 'spinZoom': A.r=e*Math.PI; A.s=1+e; A.a=1-e; B.a=e; B.s=.5+.5*e; break;
    case 'flip': if(p<.5){ A.sx=Math.max(.001,1-2*p); B.a=0; } else { A.a=0; B.sx=Math.max(.001,2*p-1); } break;
    case 'cube': A.dx=-e*W*.5; A.sx=Math.max(.001,1-e); B.dx=(1-e)*W*.5; B.sx=Math.max(.001,e); break;
    case 'dropIn': B.dy=-(1-bounceOut(p))*H; break;
  }
  return {A,B,sc,clear};
}
function drawClip(c,tex,ex){
  if(ex.a <= 0.001) return;
  const el = isImg(c) ? images[c.mediaId] : vids[c.id]; if(!el) return;
  const isI = el.tagName === 'IMG';
  const vw = isI ? el.naturalWidth : el.videoWidth, vh = isI ? el.naturalHeight : el.videoHeight;
  if(!vw || (!isI && el.readyState < 2)) return;
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
  try{ gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,el); }catch(e){ return; }
  const W=cv.width, H=cv.height, d=derived[c.id], lt=S.time-d.start, st=localToSrc(c,lt);
  gl.uniform2f(U.u_px,1/vw,1/vh);
  gl.uniform1f(U.u_trT, ex.mT||0); gl.uniform1f(U.u_trP, ex.mP||0);
  setFx(c); gl.uniform1f(U.u_ck,0); gl.uniform1f(U.u_segOn,0);
  if(S.bg==='blur'){
    const k=Math.max(W/vw,H/vh);
    gl.uniform1f(U.u_rtS,0); gl.uniform1f(U.u_rtB,0); gl.uniform1f(U.u_mT,0); gl.uniform1f(U.u_fx,0);
    gl.uniform2f(U.u_half,vw*k/2,vh*k/2); gl.uniform2f(U.u_off,ex.dx,-ex.dy); gl.uniform1f(U.u_rot,0);
    gl.uniform1f(U.u_alpha,ex.a); gl.uniform1f(U.u_blur,1);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  setFx(c); setMask(c,vw,vh); setEffect(c); setChroma(c); setSeg(c,el);
  const an = animState(c,lt,d.dur), fm = fxMotion(c,W,H);
  const fo = ex.fx || an.fx; if(fo){ gl.uniform1f(U.u_fx, FX_T[fo[0]]||0); gl.uniform1f(U.u_fxA, fo[1]); gl.uniform1f(U.u_sec, S.time); }
  if(!ex.mT && an.mT){ gl.uniform1f(U.u_trT, an.mT); gl.uniform1f(U.u_trP, an.mP); }
  const k = Math.min(W/vw,H/vh)*ev(c,'tf.scale',st)/100*an.s*ex.s*fm.s;
  const hw = vw*k/2*an.sx*(ex.sx||1), hh = vh*k/2*an.sy;
  const ox = ev(c,'tf.x',st)+an.dx+ex.dx+fm.dx, oy = ev(c,'tf.y',st)-an.dy-ex.dy-fm.dy, rot = ev(c,'tf.rot',st)*Math.PI/180+an.r+ex.r;
  gl.uniform2f(U.u_half, hw*(c.tf.flip?-1:1), hh);
  gl.uniform2f(U.u_off, ox, oy);
  gl.uniform1f(U.u_rot, -rot);
  gl.uniform1f(U.u_alpha,an.a*ex.a*ev(c,'opacity',st)/100); gl.uniform1f(U.u_blur,0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  geo[c.id] = {cx:W/2+ox, cy:H/2-oy, rot, hw, hh, flip:!!c.tf.flip};
  gl.uniform1f(U.u_trT, 0);
}
function render(now){
  const W=cv.width, H=cv.height;
  gl.viewport(0,0,W,H);
  const pr = currentPair(), tr = pr && pr.b ? transState(pr.b.trans.type, pr.p, W, H) : null;
  const bgc = tr && tr.clear != null ? tr.clear : (S.bg==='white' ? 1 : 0);
  gl.clearColor(bgc,bgc,bgc,1); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(U.u_canvas,W,H); gl.uniform2f(U.u_res,W,H); gl.uniform1f(U.u_trT,0); gl.uniform1f(U.u_time,((now||0)%1000)/1000);
  if(pr && !S.mainHide){
    drawClip(pr.a, texA, tr ? tr.A : EX0);
    if(pr.b){
      if(tr.sc){ gl.enable(gl.SCISSOR_TEST); gl.scissor(...tr.sc); }
      drawClip(pr.b, texB, tr.B);
      gl.disable(gl.SCISSOR_TEST);
    }
  }
  octx.globalAlpha = 1; octx.filter = 'none'; octx.globalCompositeOperation = 'source-over';
  octx.drawImage(cv,0,0);
  drawOverlays(octx);
  if(!exporting && typeof drawGizmos === 'function') drawGizmos(octx);
}

/* ================= OVERLAYS ================= */
const loadedFonts = new Set();
function ensureFont(f){
  if(loadedFonts.has(f) || !document.fonts) return; loadedFonts.add(f);
  document.fonts.load(`700 40px "${f}"`, 'ಕನ್ನಡ Aa').catch(()=>{});
  document.fonts.load(`400 40px "${f}"`, 'ಕನ್ನಡ Aa').catch(()=>{});
}
function rr(ctx,x,y,w,h,r){ ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h); }
const LETTER_ANIMS = ['letterPop','letterFade','letterBounce','wordPop'];
function ovAnim(o,lt,u){
  const R={s:1,sx:1,sy:1,dx:0,dy:0,r:0,a:1,ch:1,blur:0,fx:null,mT:0,mP:0,wipe:1,hue:0,inK:1,outK:1};
  const ap = (n,k) => { k=clamp(k,0,1); const e=1-Math.pow(1-k,3);
    switch(n){
      case 'fade': R.a*=e; break;
      case 'pop': R.s*=Math.max(0,backOut(k)); R.a*=Math.min(1,k*3); break;
      case 'zoom': R.s*=1.8-.8*e; R.a*=e; break;
      case 'slideUp': R.dy+=(1-e)*u*.25; R.a*=e; break;
      case 'slideDown': R.dy-=(1-e)*u*.25; R.a*=e; break;
      case 'slideL': R.dx+=(1-e)*u*.35; R.a*=e; break;
      case 'slideR': R.dx-=(1-e)*u*.35; R.a*=e; break;
      case 'typewriter': R.ch=Math.min(R.ch,k); break;
      case 'bounce': R.dy-=Math.abs(Math.cos(k*Math.PI*2.5))*(1-k)*u*.15; R.a*=Math.min(1,k*4); break;
      case 'spin': R.r+=(1-e)*Math.PI*2; R.s*=e; break;
      case 'blur': R.blur+=(1-e)*20; R.a*=e; break;
      case 'flipX': R.sx*=Math.max(.001,e); break;
      case 'flipY': R.sy*=Math.max(.001,e); break;
      case 'dropIn': R.dy-=(1-bounceOut(k))*u*.6; R.a*=Math.min(1,k*5); break;
      case 'riseUp': R.dy+=(1-e)*u*.08; R.a*=e; break;
      case 'rotateIn': R.r-=(1-e)*Math.PI/2; R.a*=e; R.s*=.7+.3*e; break;
      case 'growIn': R.s*=Math.max(0,backOut(k)); break;
      case 'shrinkIn': R.s*=1.6-.6*e; R.a*=e; break;
      case 'glitchIn': R.fx=['rgbsplit',1-k]; R.dx+=Math.sin(k*97)*u*.025*(1-k); R.a*=k>.15?1:k/.15; break;
      case 'swingIn': R.r+=Math.sin(k*Math.PI*3)*(1-k)*.5; R.a*=Math.min(1,k*3); break;
      case 'tiltIn': R.r+=(1-e)*.3; R.dx+=(1-e)*u*.2; R.a*=e; break;
      case 'wipeIn': R.wipe=Math.min(R.wipe,e); R.mT=13; R.mP=e; break;
      case 'flashIn': R.fx=['bright',1-e]; R.a*=Math.min(1,k*4); break;
    }};
  const A=o.anim, D=o.dur;
  if(A.in!=='none' && lt < A.inDur){ R.inK=clamp(lt/A.inDur,0,1); ap(A.in, R.inK); }
  if(A.out!=='none' && lt > D-A.outDur){ R.outK=clamp((D-lt)/A.outDur,0,1); ap(A.out, R.outK); }
  switch(A.loop){
    case 'pulse': R.s*=1+.06*Math.sin(lt*6); break;
    case 'shake': R.dx+=Math.sin(lt*50)*u*.006; R.dy+=Math.cos(lt*43)*u*.004; break;
    case 'float': R.dy+=Math.sin(lt*2.5)*u*.02; break;
    case 'swing': R.r+=.12*Math.sin(lt*3); break;
    case 'blink': if(Math.sin(lt*8) < -.3) R.a*=.15; break;
    case 'heartbeat': { const p=lt%1; if(p<.5) R.s*=1+.12*Math.max(0,Math.sin(p*Math.PI*4)); break; }
    case 'rotate': R.r+=lt*2; break;
    case 'jelly': R.sx*=1+.08*Math.sin(lt*9); R.sy*=1-.08*Math.sin(lt*9); break;
    case 'rock': R.r+=.1*Math.sin(lt*4); break;
    case 'bounceLoop': R.dy-=Math.abs(Math.sin(lt*4))*u*.04; break;
    case 'zoomInOut': R.s*=1+.12*Math.sin(lt*2); break;
    case 'glitchLoop': if(Math.sin(lt*13)>.75){ R.fx=['rgbsplit',.8]; R.dx+=Math.sin(lt*91)*u*.01; } break;
    case 'rainbow': R.hue=(lt*120)%360+1; break;
  }
  return R;
}
function wrapLine(ctx,line,maxW){
  const words=line.split(' '), out=[]; let cur='';
  for(const w of words){ const t=cur?cur+' '+w:w; if(cur && ctx.measureText(t).width>maxW){ out.push(cur); cur=w; } else cur=t; }
  out.push(cur); return out;
}
function drawText(ctx,o,an,u,size,maxW,lt){
  ensureFont(o.font);
  const px = size*u/720, lh = px*1.3;
  ctx.font = `${o.italic?'italic ':''}${o.bold?700:400} ${px}px "${o.font}","Noto Sans Kannada",sans-serif`;
  let lines = (o.text || '').split('\n');
  if(maxW) lines = lines.flatMap(l => wrapLine(ctx,l,maxW));
  if(!lines.length) lines=[' '];
  const w = Math.max(px*.5, ...lines.map(l => ctx.measureText(l).width)), h = lh*lines.length;
  const padX = px*.35, padY = px*.18, color = an.hue ? `hsl(${an.hue},95%,62%)` : o.color;
  if(an.wipe < 1){ ctx.save(); ctx.beginPath(); ctx.rect(-w/2-padX,-h/2-padY,(w+padX*2)*an.wipe,h+padY*2); ctx.clip(); }
  if(o.bgOn){ ctx.fillStyle = hexA(o.bgColor, o.bgAlpha/100); rr(ctx,-w/2-padX,-h/2-padY,w+padX*2,h+padY*2,px*.22); ctx.fill(); }
  ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const glyph = (s,x,y) => {
    if(o.shadow > 0){ ctx.shadowColor = o.shadowColor; ctx.shadowBlur = o.shadow*px/50; }
    if(o.strokeW > 0){ ctx.strokeStyle = o.stroke; ctx.lineWidth = o.strokeW*px/40; ctx.strokeText(s,x,y); ctx.shadowColor = 'transparent'; }
    ctx.fillStyle = color; ctx.fillText(s,x,y); ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  };
  const A = o.anim, inL = an.inK < 1 && LETTER_ANIMS.includes(A.in), outL = an.outK < 1 && LETTER_ANIMS.includes(A.out);
  if(!inL && !outL && A.loop !== 'wave'){
    let show = lines;
    if(an.ch < 1){
      let n = Math.ceil(graphemes(lines.join('\n')).length*an.ch); show = [];
      for(const l of lines){ const g = graphemes(l); if(n <= 0) break; show.push(g.slice(0,n).join('')); n -= g.length + 1; }
    }
    ctx.textAlign = o.align;
    const x = o.align==='left' ? -w/2 : o.align==='right' ? w/2 : 0;
    show.forEach((l,i) => glyph(l, x, -h/2 + lh*(i+.5)));
  } else {
    ctx.textAlign = 'left';
    const words = (inL && A.in==='wordPop') || (outL && A.out==='wordPop');
    const all = lines.map(l => graphemes(l)), total = all.reduce((a,g)=>a+g.length,0) || 1;
    const wordsTotal = (lines.join(' ').match(/\S+/g) || ['']).length;
    let idx = 0, widx = 0;
    const kOf = (k,unit,units) => clamp((k - unit/Math.max(1,units)*.7)/.3, 0, 1);
    all.forEach((g,li) => {
      const lw = ctx.measureText(lines[li]).width; let x = o.align==='left' ? -w/2 : o.align==='right' ? w/2-lw : -lw/2;
      const y = -h/2 + lh*(li+.5);
      for(const ch of g){
        const cw = ctx.measureText(ch).width, unit = words ? widx : idx, units = words ? wordsTotal : total;
        let a = 1, sc = 1, dy = 0;
        const fx = (type,k) => {
          if(type==='letterPop' || type==='wordPop'){ sc*=Math.max(0,backOut(k)); a*=Math.min(1,k*3); }
          else if(type==='letterFade'){ a*=k; dy+=(1-k)*px*.5; }
          else if(type==='letterBounce'){ dy-=(1-bounceOut(k))*px*1.4; a*=Math.min(1,k*4); }
        };
        if(inL) fx(A.in, kOf(an.inK,unit,units));
        if(outL) fx(A.out, kOf(an.outK,unit,units));
        if(A.loop==='wave') dy += Math.sin(lt*5 - idx*.55)*px*.18;
        if(a > .003 && sc > .003){ ctx.save(); ctx.globalAlpha *= a; ctx.translate(x+cw/2, y+dy); ctx.scale(sc,sc); glyph(ch,-cw/2,0); ctx.restore(); }
        x += cw; idx++; if(ch === ' ') widx++;
      }
      widx++;
    });
  }
  if(an.wipe < 1) ctx.restore();
  return {hw:w/2+padX, hh:h/2+padY};
}
function drawSticker(ctx,o,u,size){
  const px = size*u/720;
  if(o.text && o.text.startsWith('svg:')){
    const img = typeof SVGIMG !== 'undefined' ? SVGIMG[o.text.slice(4)] : null;
    if(img && img.complete && img.naturalWidth) ctx.drawImage(img,-px*.6,-px*.6,px*1.2,px*1.2);
    return {hw:px*.6, hh:px*.6};
  }
  ctx.font = `${px}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(o.text, 0, px*.05);
  return {hw:px*.6, hh:px*.6};
}
function mediaEl(o){ return o.type === 'image' ? images[o.mediaId] : ovVids[o.id]; }
function elSize(el){ return el.tagName === 'IMG' ? [el.naturalWidth, el.naturalHeight] : [el.videoWidth, el.videoHeight]; }
function drawMediaLayer(ctx,o,an,cx,cy,rot,size,opacity,u){
  const el = mediaEl(o); if(!el) return null;
  const [vw,vh] = elSize(el);
  if(!vw || (el.tagName === 'VIDEO' && el.readyState < 2)) return null;
  const W=cv.width, H=cv.height, w=u*size/100, h=w*vh/vw, a=clamp(opacity/100*an.a,0,1), fm=fxMotion(o,W,H);
  const hw = w*an.s*fm.s*an.sx/2, hh = h*an.s*fm.s*an.sy/2;
  if(a > .001){
    gl.viewport(0,0,W,H); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texO);
    try{ gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,el); }catch(e){ return null; }
    gl.uniform2f(U.u_px,1/vw,1/vh); setFx(o); setMask(o,vw,vh); setChroma(o); setEffect(o); setSeg(o,el);
    if(an.fx){ gl.uniform1f(U.u_fx, FX_T[an.fx[0]]||0); gl.uniform1f(U.u_fxA, an.fx[1]); gl.uniform1f(U.u_sec, S.time); }
    gl.uniform1f(U.u_trT, an.mT||0); gl.uniform1f(U.u_trP, an.mP||0);
    gl.uniform2f(U.u_half,(o.flip?-1:1)*hw, hh); gl.uniform2f(U.u_off,cx+fm.dx-W/2,H/2-cy-fm.dy);
    gl.uniform1f(U.u_rot,-rot); gl.uniform1f(U.u_alpha,1); gl.uniform1f(U.u_blur,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.uniform1f(U.u_trT, 0);
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = o.blend || 'source-over';
    if(an.blur > .5) ctx.filter = `blur(${an.blur*u/720}px)`;
    ctx.drawImage(cv,0,0); ctx.restore();
  }
  geo[o.id] = {cx:cx+fm.dx, cy:cy+fm.dy, rot, hw, hh, flip:!!o.flip};
  return {hw:w/2, hh:h/2};
}
function drawSel(ctx,h,u){
  ctx.save(); ctx.translate(h.cx,h.cy); ctx.rotate(h.rot); ctx.scale(h.s||.001,h.s||.001);
  ctx.strokeStyle = '#1fd1d1'; ctx.lineWidth = Math.max(2,u/360)/Math.max(.2,h.s); ctx.setLineDash([8,6]);
  ctx.strokeRect(-h.hw,-h.hh,h.hw*2,h.hh*2); ctx.restore();
}
function drawOverlays(ctx){
  const W=out.width, H=out.height, u=Math.min(W,H), t=S.time;
  hits.clear();
  for(const o of S.overlays){
    if(t < o.start || t >= o.start+o.dur) continue;
    const lt = t - o.start, an = ovAnim(o, lt, u);
    const X=ev(o,'x',lt), Y=ev(o,'y',lt), SZ=ev(o,'size',lt), R=ev(o,'rot',lt), OP=ev(o,'opacity',lt);
    const cx = X/100*W + an.dx, cy = Y/100*H + an.dy, rot = R*Math.PI/180 + an.r;
    let box = null;
    if(isMediaOv(o)) box = drawMediaLayer(ctx,o,an,cx,cy,rot,SZ,OP,u);
    else if(o.type==='gfx'){ box = typeof drawGfxItem === 'function' ? drawGfxItem(ctx,o,an,cx,cy,rot,SZ,OP,u,lt) : null; }
    else {
      ctx.save(); ctx.globalCompositeOperation = o.blend || 'source-over';
      ctx.translate(cx,cy); ctx.rotate(rot); ctx.scale(an.s*an.sx, an.s*an.sy);
      ctx.globalAlpha = clamp(OP/100*an.a, 0, 1);
      if(an.blur > .5) ctx.filter = `blur(${an.blur*u/720}px)`;
      box = o.type==='text' ? drawText(ctx,o,an,u,SZ,o.caption ? W*.86/Math.max(.2,an.s) : 0,lt) : drawSticker(ctx,o,u,SZ);
      ctx.restore();
      if(box) geo[o.id] = {cx, cy, rot, hw:box.hw*an.s, hh:box.hh*an.s, flip:false};
    }
    if(box){
      const h = {cx, cy, rot, s:an.s, hw:box.hw, hh:box.hh};
      hits.set(o.id, h);
      if(S.sel === o.id && !exporting && !S.pick) drawSel(ctx,h,u);
    }
  }
}

/* ================= LUTs ================= */
function addLut(name,n,data,id,custom){
  const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if(n*n > max) throw new Error(`LUT size ${n} ತುಂಬಾ ದೊಡ್ಡದು (ಈ device max ${Math.floor(Math.sqrt(max))})`);
  const t = mkTex(); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,n*n,n,0,gl.RGBA,gl.UNSIGNED_BYTE,data);
  const l = {id:id||nid(), name, n, tex:t, custom:!!custom, data:custom?data:null}; S.luts.push(l); return l;
}
function parseCube(txt){
  let n=0; const vals=[];
  for(const line of txt.split(/\r?\n/)){
    const t=line.trim(); if(!t || t[0]==='#') continue;
    if(/^LUT_3D_SIZE/i.test(t)){ n=parseInt(t.split(/\s+/)[1]); continue; }
    if(/^[A-Za-z_]/.test(t)) continue;
    const p=t.split(/\s+/).map(Number); if(p.length>=3 && !isNaN(p[0])) vals.push(p[0],p[1],p[2]);
  }
  if(!n || vals.length < n*n*n*3) throw new Error('ಸರಿಯಾದ 3D .cube LUT ಅಲ್ಲ');
  const data = new Uint8Array(n*n*n*4);
  for(let b=0;b<n;b++) for(let g=0;g<n;g++) for(let r=0;r<n;r++){
    const i=(r+g*n+b*n*n)*3, o=(g*n*n+b*n+r)*4;
    data[o]=clamp(vals[i]*255,0,255); data[o+1]=clamp(vals[i+1]*255,0,255); data[o+2]=clamp(vals[i+2]*255,0,255); data[o+3]=255;
  }
  return {n, data};
}
function makeLut(id,name,fn,n=17){
  const data=new Uint8Array(n*n*n*4);
  for(let b=0;b<n;b++) for(let g=0;g<n;g++) for(let r=0;r<n;r++){
    const o=fn(r/(n-1),g/(n-1),b/(n-1)), idx=(g*n*n+b*n+r)*4;
    data[idx]=clamp(o[0]*255,0,255); data[idx+1]=clamp(o[1]*255,0,255); data[idx+2]=clamp(o[2]*255,0,255); data[idx+3]=255;
  }
  addLut(name,n,data,id,false);
}
function makeBuiltinLuts(){
  const lum=(r,g,b)=>.299*r+.587*g+.114*b, sc=x=>x*x*(3-2*x);
  makeLut('lut_teal','Teal & Orange',(r,g,b)=>{const l=lum(r,g,b)-.5;return [sc(r)+l*.25,g+l*.05,sc(b)-l*.25];});
  makeLut('lut_warm','Warm Film',(r,g,b)=>[Math.pow(r,.88)*1.02,Math.pow(g,.95),Math.pow(b,1.12)*.92+.03]);
  makeLut('lut_cyber','Cyberpunk',(r,g,b)=>[r*.9+b*.25,g*.8,b*1.1+.08]);
  makeLut('lut_bleach','Bleach',(r,g,b)=>{const l=lum(r,g,b);return [sc(r*.5+l*.5),sc(g*.5+l*.5),sc(b*.5+l*.5)];});
  makeLut('lut_sepia','Sepia',(r,g,b)=>[r*.393+g*.769+b*.189,r*.349+g*.686+b*.168,r*.272+g*.534+b*.131]);
  makeLut('lut_matrix','Matrix',(r,g,b)=>[r*.7,g*1.15+.03,b*.7]);
  makeLut('lut_noir','Noir',(r,g,b)=>{const l=sc(sc(lum(r,g,b)));return [l,l,l];});
}

/* ================= CHROMA KEY HELPERS ================= */
function autoKey(o){
  const el = mediaEl(o); if(!el) return;
  const [vw] = elSize(el); if(!vw) return;
  const c = document.createElement('canvas'); c.width = 32; c.height = 32;
  const x = c.getContext('2d', {willReadFrequently:true}); x.drawImage(el,0,0,32,32);
  const d = x.getImageData(0,0,32,32).data; let r=0,g=0,b=0,n=0;
  for(const [sx,sy] of [[0,0],[28,0],[0,28],[28,28]]) for(let yy=sy;yy<sy+4;yy++) for(let xx=sx;xx<sx+4;xx++){
    const i=(yy*32+xx)*4; r+=d[i]; g+=d[i+1]; b+=d[i+2]; n++;
  }
  o.ck.color = toHex(r/n,g/n,b/n);
}
function setPick(on){ S.pick = on; out.classList.toggle('pick', on); $('#pickTip').style.display = on ? 'block' : 'none'; }

/* ================= IMPORT ================= */
function waitFrame(v){ return new Promise(r=>{ let done=false; const fin=()=>{ if(!done){ done=true; r(); } }; if(v.requestVideoFrameCallback) v.requestVideoFrameCallback(fin); setTimeout(fin,300); }); }
function seekTo(v,t){ return new Promise(res=>{ let done=false; const fin=()=>{ if(done) return; done=true; v.removeEventListener('seeked',fin); res(); }; v.addEventListener('seeked',fin); v.currentTime=t; setTimeout(fin,4000); }); }
function frameLuma(c){ const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let s=0,n=0; for(let i=0;i<d.length;i+=32){ s+=d[i]+d[i+1]+d[i+2]; n++; } return s/n/3; }
async function probe(url){
  const v=mkVideo(null); v.muted=true;
  try{
    await new Promise((res,rej)=>{ v.onloadedmetadata=res; v.onerror=()=>rej(new Error('ಈ video ಓದಲು ಆಗುತ್ತಿಲ್ಲ — MP4 (H.264) ಆಗಿ convert ಮಾಡಿ ಪ್ರಯತ್ನಿಸಿ')); v.src=url; });
    if(!isFinite(v.duration)) await seekTo(v,1e7);
    const dur=v.duration||1;
    if(!v.videoWidth) throw new Error('Video ಚಿತ್ರ decode ಆಗುತ್ತಿಲ್ಲ (HEVC/H.265 ಇರಬಹುದು). Phone camera settings ನಲ್ಲಿ "Most compatible / H.264" ಆರಿಸಿ ಅಥವಾ MP4 H.264 ಗೆ convert ಮಾಡಿ.');
    const c=document.createElement('canvas'); c.width=160; c.height=Math.round(160*v.videoHeight/v.videoWidth)||90;
    let best=null, bestL=-1;
    for(const t of [Math.min(1,dur/2), dur*.35, dur*.65, .05]){
      await seekTo(v, clamp(t,0,Math.max(0,dur-.05))); await waitFrame(v);
      c.getContext('2d').drawImage(v,0,0,c.width,c.height); const L=frameLuma(c);
      if(L>bestL){ bestL=L; best=c.toDataURL('image/jpeg',.75); }
      if(L>14) break;
    }
    return {duration:dur,w:v.videoWidth,h:v.videoHeight,thumb:best};
  } finally { dropEl(v); }
}
async function genStrip(m){
  if(!m || m.type!=='video' || !m.url || m.strip || m._stripping) return;
  m._stripping=true;
  const v=mkVideo(null); v.muted=true;
  try{
    await new Promise((res,rej)=>{ v.onloadedmetadata=res; v.onerror=rej; v.src=m.url; });
    const n=clamp(Math.ceil(m.duration/1.5),4,30), fh=48, fw=Math.max(16,Math.round(fh*m.w/m.h));
    const c=document.createElement('canvas'); c.width=fw*n; c.height=fh; const x=c.getContext('2d');
    for(let i=0;i<n;i++){ await seekTo(v,Math.min(m.duration-.05,(i+.5)*m.duration/n)); await waitFrame(v); x.drawImage(v,i*fw,0,fw,fh); }
    m.strip=c.toDataURL('image/jpeg',.6); m.stripN=n;
    if(typeof renderTimeline==='function'){ layout(); renderTimeline(); }
  }catch(e){} finally{ m._stripping=false; dropEl(v); }
}
function loadImg(url){ return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>res(img); img.onerror=()=>rej(new Error('ಈ photo ಓದಲು ಆಗುತ್ತಿಲ್ಲ')); img.src=url; }); }
async function probeImage(url){
  const img=await loadImg(url);
  const c=document.createElement('canvas'); c.width=160; c.height=Math.round(160*img.naturalHeight/img.naturalWidth)||90;
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  return {img,w:img.naturalWidth,h:img.naturalHeight,thumb:c.toDataURL('image/png')};
}
function probeAudio(url){
  return new Promise((res,rej)=>{
    const a=new Audio(); a.preload='auto';
    a.onloadedmetadata=()=>{
      if(isFinite(a.duration)) return res(a.duration);
      a.ontimeupdate=()=>{ if(isFinite(a.duration)){ a.ontimeupdate=null; res(a.duration); } };
      a.currentTime=1e7;
    };
    a.onerror=()=>rej(new Error('ಈ audio ಓದಲು ಆಗುತ್ತಿಲ್ಲ'));
    a.src=url;
  });
}
function registerMedia(m,f){
  mediaBlobs[m.id]=f; S.media.push(m);
  if(DB && S.project) idbPut('blobs',{id:m.id,project:S.project.id,blob:f}).catch(()=>{});
  computeWave(m);
  return m;
}
async function addVideoMedia(f){
  const url=URL.createObjectURL(f), info=await probe(url);
  const m=registerMedia({id:nid(),name:f.name,url,type:'video',duration:info.duration,thumb:info.thumb,w:info.w,h:info.h},f);
  genStrip(m); return m;
}
async function addImageMedia(f){
  const url=URL.createObjectURL(f), info=await probeImage(url);
  const m={id:nid(),name:f.name,url,type:'image',duration:3600,thumb:info.thumb,w:info.w,h:info.h};
  images[m.id]=info.img; return registerMedia(m,f);
}
async function addAudioMedia(f,knownDur){
  const url=URL.createObjectURL(f);
  let dur=knownDur; try{ dur=await probeAudio(url); }catch(e){ if(!knownDur) throw e; }
  if(!isFinite(dur)||!dur) dur=knownDur||1;
  return registerMedia({id:nid(),name:f.name,url,type:'audio',duration:dur,thumb:'',w:0,h:0},f);
}
async function importFiles(files){
  for(const f of files){
    try{
      if(f.type.startsWith('video/')){ const m=await addVideoMedia(f); pushUndo(); S.clips.push(newClip(m)); }
      else if(f.type.startsWith('image/')){ const m=await addImageMedia(f); pushUndo(); S.clips.push(newClip(m)); }
      else if(f.type.startsWith('audio/')){ const m=await addAudioMedia(f); pushUndo(); S.audios.push(newAudioItem(m,{start:0})); }
    }catch(e){ alert(f.name+': '+e.message); }
  }
  if(S.ratio==='orig') setCanvas();
  if(!S.sel && S.clips[0]) S.sel = S.clips[0].id;
  afterEdit(); renderMediaPanel();
}
function addPip(m){
  const o = m.type === 'video'
    ? newOverlay('video',{mediaId:m.id, dur:m.duration, size:50})
    : newOverlay('image',{mediaId:m.id});
  addOverlay(o,'ovbasic');
}
function addAudioAt(m,extra){ pushUndo(); const a=newAudioItem(m,extra); S.audios.push(a); S.sel=a.id; afterEdit(); }

/* ---- waveform (decoded at 8 kHz to save memory) ---- */
async function computeWave(m){
  try{
    const blob=mediaBlobs[m.id]; if(!blob || m.type==='image' || blob.size>300e6) return;
    const ab=await new OfflineAudioContext(1,1,8000).decodeAudioData(await blob.arrayBuffer());
    const ch=ab.getChannelData(0), perSec=40, n=Math.max(1,Math.ceil(ab.duration*perSec)), step=ab.sampleRate/perSec;
    const peaks=new Float32Array(n); let mx=1e-4;
    for(let i=0;i<n;i++){ let p=0; const s=Math.floor(i*step), e=Math.min(ch.length,Math.floor((i+1)*step)); for(let j=s;j<e;j+=2){ const v=Math.abs(ch[j]); if(v>p) p=v; } peaks[i]=p; if(p>mx) mx=p; }
    if(mx<.002) return;   // silent / no audio track
    const draw=(W,H,col)=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); x.fillStyle=col;
      for(let i=0;i<W;i++){ const p=peaks[Math.floor(i*n/W)]/mx, h=Math.max(1,p*(H-2)); x.fillRect(i,(H-h)/2,1,h); } return c; };
    draw(Math.min(n,16000),40,'rgba(255,255,255,.6)').toBlob(b=>{ if(m.wave) URL.revokeObjectURL(m.wave); m.wave=URL.createObjectURL(b); layout(); renderTimeline(); });
    if(m.type==='audio'){ m.thumb=draw(160,70,'#b9a6ff').toDataURL('image/png'); renderMediaPanel(); }
  }catch(e){}
}

/* ================= EDIT OPERATIONS ================= */
function snap(){ return JSON.stringify({c:S.clips, o:S.overlays, a:S.audios}); }
function pushUndo(){ undoS.push(snap()); if(undoS.length>80) undoS.shift(); redoS.length=0; }
function restore(s){
  pause(); const d=JSON.parse(s); S.clips=d.c; S.overlays=d.o||[]; S.audios=d.a||[];
  active=null; dropAllChains(); dropAudChains(); pairKey='';
  if(!selItem()) S.sel = S.clips[0] ? S.clips[0].id : null;
  afterEdit();
}
function undo(){ if(!undoS.length) return; redoS.push(snap()); restore(undoS.pop()); }
function redo(){ if(!redoS.length) return; undoS.push(snap()); restore(redoS.pop()); }
function afterEdit(){ layout(); renderTimeline(); renderInspector(); seek(Math.min(S.time,S.total)); $('#hint').style.display=(S.clips.length||S.overlays.length||S.audios.length)?'none':''; }
function split(){
  const fr=selFree();
  if(fr){
    const [o,arr]=fr;
    if(S.time-o.start<.1 || o.start+o.dur-S.time<.1) return;
    pushUndo(); const b=deep(o); b.id=nid();
    const cut=S.time-o.start;
    b.start=S.time; b.dur=o.dur-cut; o.dur=cut;
    if(o.anim){ o.anim.out='none'; b.anim.in='none'; }
    if(o.type==='audio'){ o.fadeOut=0; b.fadeIn=0; }
    b.in=o.in+cut*o.speed; if(b.kf) b.kf=b.kf.map(k=>({...k,t:k.t-cut}));
    arr.splice(arr.indexOf(o)+1,0,b); S.sel=b.id; afterEdit(); return;
  }
  const c=clipAt(S.time); if(!c) return;
  const d=derived[c.id], lt=S.time-d.start; if(lt<.1 || d.dur-lt<.1) return;
  pushUndo();
  const src=localToSrc(c,lt), b=deep(c); b.id=nid();
  c.out=src; b.in=src; c.anim.out='none'; b.anim.in='none'; b.trans={type:'none',dur:.6};
  S.clips.splice(S.clips.indexOf(c)+1,0,b); S.sel=b.id; afterEdit();
}
function del(){
  const fr=selFree();
  if(fr){ const [o,arr]=fr; pushUndo(); arr.splice(arr.indexOf(o),1); S.sel=null; afterEdit(); return; }
  const c=selClip(); if(!c) return;
  pushUndo(); const i=S.clips.indexOf(c); S.clips.splice(i,1);
  if(vids[c.id]) vids[c.id].pause();
  if(active===c){ active=null; dropChainFor(c.id); }
  S.sel=(S.clips[i]||S.clips[i-1]||{}).id||null; afterEdit();
}
function dup(){
  const fr=selFree();
  if(fr){ const [o,arr]=fr; pushUndo(); const b=deep(o); b.id=nid(); b.start=o.start+o.dur; arr.push(b); S.sel=b.id; afterEdit(); return; }
  const c=selClip(); if(!c) return;
  pushUndo(); const b=deep(c); b.id=nid();
  S.clips.splice(S.clips.indexOf(c)+1,0,b); S.sel=b.id; afterEdit();
}
function move(dir){
  const fr=selFree();
  if(fr){ pushUndo(); fr[0].start=Math.max(0,fr[0].start+dir*.1); layout(); renderTimeline(); return; }
  const c=selClip(); if(!c) return; const i=S.clips.indexOf(c), j=i+dir;
  if(j<0 || j>=S.clips.length) return;
  pushUndo(); [S.clips[i],S.clips[j]]=[S.clips[j],S.clips[i]]; afterEdit();
}
function select(id){
  S.sel=id; setPick(false);
  const o=selOv()||selAud(), c=selClip();
  if(o){ if(S.time<o.start || S.time>=o.start+o.dur) seek(o.start+.01); }
  else if(c){ const d=derived[c.id]; if(S.time<d.start || S.time>=d.start+d.dur) seek(d.start+.01); }
  renderTimeline(); renderInspector();
}
function addOverlay(o, tab){ pushUndo(); S.overlays.push(o); S.sel=o.id; S.tabOv=tab; afterEdit(); }
function ovAction(a){
  const o=selOv(); if(!o) return;
  if(a==='del') return del();
  if(a==='dup') return dup();
  pushUndo();
  if(a==='center'){ setVal(o,'x',50); setVal(o,'y',50); }
  if(a==='fillv' && isMediaOv(o)){ const el=mediaEl(o); if(el){ const [vw,vh]=elSize(el); const W=out.width,H=out.height,u=Math.min(W,H); setVal(o,'size',Math.round(Math.max(W/u,H/u*vw/vh)*100)); setVal(o,'x',50); setVal(o,'y',50); } }
  if(a==='capall'){ const keys=['font','bold','italic','align','color','stroke','strokeW','bgOn','bgColor','bgAlpha','shadow','shadowColor','size','y','anim']; for(const x of S.overlays) if(x!==o && x.caption) for(const k of keys) x[k]=deep(o[k]); }
  const i=S.overlays.indexOf(o);
  if(a==='up' && i<S.overlays.length-1){ S.overlays.splice(i,1); S.overlays.splice(i+1,0,o); }
  if(a==='down' && i>0){ S.overlays.splice(i,1); S.overlays.splice(i-1,0,o); }
  renderInspector(); renderTimeline();
}
function extractAudio(c){
  const m=media(c.mediaId); if(!m || m.type!=='video') return;
  pushUndo();
  const d=derived[c.id];
  const a=newAudioItem(m,{kind:'extract',start:d.start,in:c.in,dur:(c.out-c.in)/c.speed,speed:c.speed,audio:deep(c.audio),volume:c.volume});
  c.volume=0; S.audios.push(a); S.sel=a.id; afterEdit();
}

/* ================= UI: CANVAS ================= */
function setCanvas(){
  const q=S.quality; let a,b;
  if(S.ratio==='orig'){ const m=S.media.find(x=>x.w); a=m?m.w:9; b=m?m.h:16; } else [a,b]=S.ratio.split(':').map(Number);
  let W,H; if(a>=b){ H=q; W=Math.round(q*a/b); } else { W=q; H=Math.round(q*b/a); }
  cv.width=out.width=W-W%2; cv.height=out.height=H-H%2; fitCanvas();
}
function fitCanvas(){
  const r=$('#stage').getBoundingClientRect(), k=Math.min((r.width-20)/out.width,(r.height-20)/out.height);
  out.style.width=Math.max(10,out.width*k)+'px'; out.style.height=Math.max(10,out.height*k)+'px';
}

/* ---- preview drag / pinch / wheel / color pick ---- */
const pts = new Map(); let wheelT = 0, wheelTimer = 0;
function toCv(e){ const r=out.getBoundingClientRect(); return {x:(e.clientX-r.left)/r.width*out.width, y:(e.clientY-r.top)/r.height*out.height}; }
function hitAt(p){
  for(let i=S.overlays.length-1;i>=0;i--){
    const o=S.overlays[i], h=hits.get(o.id); if(!h) continue;
    const dx=p.x-h.cx, dy=p.y-h.cy, cs=Math.cos(-h.rot), sn=Math.sin(-h.rot), s=Math.max(.05,h.s);
    const x=(dx*cs-dy*sn)/s, y=(dx*sn+dy*cs)/s;
    if(Math.abs(x)<=h.hw+8 && Math.abs(y)<=h.hh+8) return o;
  }
  return null;
}
const sizePath = it => it.type ? 'size' : 'tf.scale';
const sizeOf = it => ev(it, sizePath(it));
function setSize(it,v){ setVal(it, sizePath(it), Math.round(clamp(v,5,it.type ? (isMediaOv(it)?300:400) : 400))); }
function startCDrag(it,p,undone){ cdrag={it,p0:p,x0:ev(it,it.type?'x':'tf.x'),y0:ev(it,it.type?'y':'tf.y'),undo:!!undone}; }
out.addEventListener('pointerdown',e=>{
  if(exporting) return;
  const p=toCv(e);
  if(S.pick){
    const it=selItem(); if(it && it.ck){
      const d=octx.getImageData(clamp(p.x|0,0,out.width-1),clamp(p.y|0,0,out.height-1),1,1).data;
      pushUndo(); it.ck.color=toHex(d[0],d[1],d[2]); it.ck.on=true;
    }
    setPick(false); renderInspector(); return;
  }
  pts.set(e.pointerId,p); out.setPointerCapture(e.pointerId);
  if(pts.size===2 && cdrag){ const [a,b]=[...pts.values()]; cdrag.pinch={d0:Math.hypot(a.x-b.x,a.y-b.y),s0:sizeOf(cdrag.it)}; return; }
  const it = hitAt(p) || active; if(!it) return;
  if(S.sel!==it.id){ S.sel=it.id; renderTimeline(); renderInspector(); }
  cdrag=null; startCDrag(it,p);
});
out.addEventListener('pointermove',e=>{
  if(!cdrag || !pts.has(e.pointerId)) return;
  const p=toCv(e); pts.set(e.pointerId,p); const it=cdrag.it;
  if(cdrag.pinch && pts.size>=2){
    if(!cdrag.undo){ pushUndo(); cdrag.undo=true; }
    const [a,b]=[...pts.values()]; setSize(it,cdrag.pinch.s0*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,cdrag.pinch.d0)); return;
  }
  const dx=p.x-cdrag.p0.x, dy=p.y-cdrag.p0.y;
  if(!cdrag.undo){ if(Math.hypot(dx,dy)<3) return; pushUndo(); cdrag.undo=true; }
  if(it.type){ setVal(it,'x',clamp(cdrag.x0+dx/out.width*100,-20,120)); setVal(it,'y',clamp(cdrag.y0+dy/out.height*100,-20,120)); }
  else { setVal(it,'tf.x',Math.round(cdrag.x0+dx)); setVal(it,'tf.y',Math.round(cdrag.y0-dy)); }
});
const endCDrag=e=>{
  pts.delete(e.pointerId);
  if(!cdrag) return;
  if(pts.size===0){ if(cdrag.undo){ renderInspector(); renderTimeline(); } cdrag=null; }
  else { cdrag.pinch=null; startCDrag(cdrag.it,[...pts.values()][0],cdrag.undo); }
};
out.addEventListener('pointerup',endCDrag); out.addEventListener('pointercancel',endCDrag);
out.addEventListener('wheel',e=>{
  const it=selItem(); if(!it || exporting || it.type==='audio') return; e.preventDefault();
  const now=performance.now(); if(now-wheelT>600) pushUndo(); wheelT=now;
  setSize(it,sizeOf(it)*(e.deltaY<0?1.06:1/1.06));
  clearTimeout(wheelTimer); wheelTimer=setTimeout(()=>{ renderInspector(); renderTimeline(); },300);
},{passive:false});

/* ================= MODAL ================= */
function showModal(html){ $('#modalBox').innerHTML=html; $('#modal').style.display='flex'; }
function hideModal(){ $('#modal').style.display='none'; }
$('#modal').addEventListener('click',e=>{ if(e.target.id==='modal' && !recState && !capBusy) hideModal(); });

/* ================= VOICE-OVER RECORDING (+ live captions) ================= */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function openRecord(){
  if(!navigator.mediaDevices || !window.MediaRecorder) return alert('ಈ browser ನಲ್ಲಿ recording support ಇಲ್ಲ. Chrome ಬಳಸಿ.');
  pause();
  showModal(`<h3 style="margin-top:0">🎙 Voice-over</h3>
    <div class="note">Playhead (${fmtTC(S.time)}) ಇರುವ ಸ್ಥಳದಿಂದ record ಆಗುತ್ತದೆ. Video ಜೊತೆಗೆ play ಆಗುತ್ತದೆ — ಮಾತನಾಡಿ. Headphone ಬಳಸಿದರೆ ಉತ್ತಮ.</div>
    <div class="row crow"><span>Record ಮಾಡುವಾಗ video ಸದ್ದು mute</span><input type="checkbox" id="rMute" checked></div>
    <div class="row crow"><span>Live captions (ಮಾತು → text)</span><input type="checkbox" id="rCap" ${SR?'checked':'disabled'}></div>
    <div class="row crow"><span>ಭಾಷೆ</span><select id="rLang">${SR_LANGS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select></div>
    ${SR?'':'<div class="note">Live captions ಗೆ Chrome ಬೇಕು.</div>'}
    <div id="recTime">00:00.00</div>
    <div class="btns" style="justify-content:center"><button id="rStart" class="danger">● Start</button><button id="rStop" disabled>■ Stop</button><button id="rClose">Close</button></div>`);
}
async function startRec(){
  let stream;
  try{ stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}); }
  catch(e){ return alert('Microphone ಅನುಮತಿ ಸಿಗಲಿಲ್ಲ: '+e.message); }
  initAudio(); await AC.resume();
  const mt=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg'].find(t=>MediaRecorder.isTypeSupported(t));
  const mr=new MediaRecorder(stream, mt?{mimeType:mt}:{}), chunks=[];
  mr.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  recState={stream,mr,chunks,t0:S.time,w0:performance.now(),caps:[]};
  if($('#rMute').checked) spk.gain.value=0;
  if($('#rCap').checked && SR) startSR(recState,$('#rLang').value);
  mr.start(250);
  $('#rStart').disabled=true; $('#rStop').disabled=false; $('#rClose').disabled=true; $('#recTip').style.display='block';
  if(S.time < S.total) play();
}
function startSR(r,lang){
  const sr=new SR(); sr.lang=lang; sr.continuous=true; sr.interimResults=true; let starts={};
  const now=()=>r.t0+(performance.now()-r.w0)/1000;
  sr.onstart=()=>{ starts={}; };
  sr.onresult=e=>{
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(starts[i]==null) starts[i]=Math.max(r.t0, now()-1);
      if(e.results[i].isFinal){ const txt=e.results[i][0].transcript.trim(); if(txt) r.caps.push({start:starts[i],end:now(),text:txt}); starts[i]=Infinity; }
    }
  };
  sr.onerror=()=>{};
  sr.onend=()=>{ if(recState===r){ try{ sr.start(); }catch(e){} } };   // Chrome stops after silence → restart
  try{ sr.start(); r.sr=sr; }catch(e){}
}
function stopRec(){
  const r=recState; if(!r) return; recState=null;
  $('#recTip').style.display='none';
  if(r.sr){ try{ r.sr.stop(); }catch(e){} }
  r.mr.onstop=async()=>{
    r.stream.getTracks().forEach(t=>t.stop());
    const dur=(performance.now()-r.w0)/1000;
    const blob=new Blob(r.chunks,{type:r.mr.mimeType||'audio/webm'});
    const ext=(r.mr.mimeType||'').includes('mp4')?'m4a':(r.mr.mimeType||'').includes('ogg')?'ogg':'webm';
    const n=S.audios.filter(a=>a.kind==='voice').length+1;
    try{
      const m=await addAudioMedia(new File([blob],`Voice ${n}.${ext}`,{type:blob.type}),dur);
      pushUndo();
      const a=newAudioItem(m,{kind:'voice',start:r.t0,dur:Math.min(m.duration,dur)}); S.audios.push(a); S.sel=a.id;
      for(const s of r.caps.flatMap(splitSeg)) S.overlays.push(newOverlay('text',{...deep(CAPTION_STYLE),text:s.text,start:s.start,dur:Math.max(.5,s.end-s.start)}));
      afterEdit(); renderMediaPanel();
    }catch(e){ alert('Recording save ಆಗಲಿಲ್ಲ: '+e.message); }
    hideModal();
  };
  r.mr.stop(); pause(); spk.gain.value=1;
}
$('#modal').addEventListener('click',e=>{
  const id=e.target.id;
  if(id==='rStart') startRec();
  if(id==='rStop') stopRec();
  if(id==='rClose'||id==='cClose') hideModal();
});

/* ================= CAPTIONS (Whisper in browser + SRT) ================= */
let capBusy=false, capWorker=null;
function splitSeg(s){
  const w=s.text.trim().split(/\s+/); if(w.length<=8) return [s];
  const n=Math.ceil(w.length/7), per=Math.ceil(w.length/n), out=[], d=(s.end-s.start)/w.length;
  for(let i=0;i<w.length;i+=per) out.push({start:s.start+i*d, end:s.start+Math.min(w.length,i+per)*d, text:w.slice(i,i+per).join(' ')});
  return out;
}
function capSource(){
  const it=selItem();
  const ok = x => x && x.mediaId && media(x.mediaId) && media(x.mediaId).type!=='image' && mediaBlobs[x.mediaId];
  if(ok(it) && (!it.type || it.type==='video' || it.type==='audio')) return it;
  return S.clips.find(ok) || S.audios.find(ok) || null;
}
function srcRange(it){
  if(!it.type){ const d=derived[it.id]; return {from:it.in, to:it.out, map:t=>d.start+srcToLocal(it,clamp(t,it.in,it.out))}; }
  return {from:it.in, to:it.in+it.dur*it.speed, map:t=>it.start+(t-it.in)/it.speed};
}
const WORKER_SRC = `
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';
env.allowLocalModels = false;
let asr = null, cur = '';
self.onmessage = async e => {
  const { audio, model, language } = e.data;
  try {
    if (!asr || cur !== model) {
      asr = await pipeline('automatic-speech-recognition', model, { progress_callback: p => self.postMessage({ type: 'progress', p }) });
      cur = model;
    }
    self.postMessage({ type: 'status', msg: 'transcribe' });
    const r = await asr(audio, { language, task: 'transcribe', return_timestamps: true, chunk_length_s: 30, stride_length_s: 5 });
    self.postMessage({ type: 'done', chunks: r.chunks && r.chunks.length ? r.chunks : [{ timestamp: [0, audio.length / 16000], text: r.text }] });
  } catch (err) { self.postMessage({ type: 'error', msg: String(err && err.message || err) }); }
};`;
async function runCaptions(){
  const src=capSource(); if(!src || capBusy) return;
  const st=$('#cStatus'), bar=$('#cBar'), btn=$('#cRun');
  capBusy=true; btn.disabled=true; st.textContent='🎧 Audio ಓದುತ್ತಿದೆ…';
  try{
    const {from,to,map}=srcRange(src);
    const ab=await new OfflineAudioContext(1,1,16000).decodeAudioData(await mediaBlobs[src.mediaId].arrayBuffer());
    const s0=Math.floor(from*16000), s1=Math.min(ab.length,Math.ceil(to*16000)), len=Math.max(1,s1-s0);
    const audio=new Float32Array(len);
    for(let c=0;c<ab.numberOfChannels;c++){ const d=ab.getChannelData(c); for(let i=0;i<len;i++) audio[i]+=d[s0+i]/ab.numberOfChannels; }
    if(!capWorker) capWorker=new Worker(URL.createObjectURL(new Blob([WORKER_SRC],{type:'text/javascript'})),{type:'module'});
    const files={};
    const res=await new Promise((resolve,reject)=>{
      capWorker.onmessage=e=>{
        const d=e.data;
        if(d.type==='progress' && d.p && d.p.status==='progress' && d.p.total){
          files[d.p.file]=[d.p.loaded,d.p.total];
          const L=Object.values(files).reduce((a,b)=>a+b[0],0), T=Object.values(files).reduce((a,b)=>a+b[1],0);
          st.textContent=`⬇ Model download: ${(L/1048576).toFixed(0)} / ${(T/1048576).toFixed(0)} MB`; bar.style.width=(L/T*100)+'%';
        } else if(d.type==='status'){ st.textContent='✍ ಮಾತನ್ನು text ಆಗಿ ಬದಲಿಸುತ್ತಿದೆ… (ಸ್ವಲ್ಪ ಸಮಯ ಬೇಕು)'; bar.style.width='100%'; }
        else if(d.type==='done') resolve(d.chunks);
        else if(d.type==='error') reject(new Error(d.msg));
      };
      capWorker.onerror=e=>reject(new Error(e.message||'Worker error (internet ಬೇಕು)'));
      capWorker.postMessage({audio,model:'Xenova/whisper-'+$('#cModel').value,language:$('#cLang').value},[audio.buffer]);
    });
    const segs=res.map(ch=>{ const a=ch.timestamp[0]||0, b=ch.timestamp[1]!=null?ch.timestamp[1]:a+2; return {start:map(from+a), end:map(from+b), text:(ch.text||'').trim()}; })
      .filter(s=>s.text && s.end>s.start).flatMap(splitSeg);
    if(!segs.length) throw new Error('ಮಾತು ಕೇಳಿಸಲಿಲ್ಲ');
    addCaptions(segs);
    st.textContent=`✅ ${segs.length} captions ಸೇರಿಸಲಾಗಿದೆ`;
  }catch(e){ st.textContent='❌ '+e.message; capWorker&&capWorker.terminate(); capWorker=null; }
  capBusy=false; if($('#cRun')) $('#cRun').disabled=false;
}
function addCaptions(segs){
  pushUndo();
  for(const s of segs) S.overlays.push(newOverlay('text',{...deep(CAPTION_STYLE),text:s.text,start:s.start,dur:Math.max(.4,s.end-s.start)}));
  afterEdit();
}
const srtT = t => { const ms=Math.round(Math.max(0,t)*1000); return `${pad(Math.floor(ms/3600000))}:${pad(Math.floor(ms/60000)%60)}:${pad(Math.floor(ms/1000)%60)},${String(ms%1000).padStart(3,'0')}`; };
const srtP = s => { const m=s.match(/(\d+):(\d+):(\d+)[,.](\d+)/); return m ? +m[1]*3600 + +m[2]*60 + +m[3] + +m[4]/1000 : 0; };
function exportSRT(){
  let caps=S.overlays.filter(o=>o.type==='text'&&o.caption); if(!caps.length) caps=S.overlays.filter(o=>o.type==='text');
  if(!caps.length) return alert('Captions ಇಲ್ಲ');
  caps=[...caps].sort((a,b)=>a.start-b.start);
  const txt=caps.map((o,i)=>`${i+1}\n${srtT(o.start)} --> ${srtT(o.start+o.dur)}\n${o.text}\n`).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'})); a.download=(S.project?S.project.name:'captions')+'.srt'; a.click();
}
function importSRT(txt){
  const segs=[];
  for(const blk of txt.replace(/\r/g,'').split(/\n\s*\n/)){
    const L=blk.trim().split('\n'), i=L.findIndex(l=>l.includes('-->')); if(i<0) continue;
    const [a,b]=L[i].split('-->').map(x=>srtP(x.trim())); const text=L.slice(i+1).join('\n').trim();
    if(text && b>a) segs.push({start:a,end:b,text});
  }
  if(!segs.length) return alert('SRT ನಲ್ಲಿ captions ಸಿಗಲಿಲ್ಲ');
  addCaptions(segs);
}
$('#modal').addEventListener('click',e=>{
  const id=e.target.id;
  if(id==='cRun') runCaptions();
  if(id==='cSrtOut') exportSRT();
  if(id==='cSrtIn') $('#srtIn').click();
  if(id==='cDelAll'){ const n=S.overlays.filter(o=>o.caption).length; if(n && confirm(n+' captions delete ಮಾಡಲೇ?')){ pushUndo(); S.overlays=S.overlays.filter(o=>!o.caption); afterEdit(); } }
});
$('#srtIn').onchange=async e=>{ const f=e.target.files[0]; e.target.value=''; if(f){ importSRT(await f.text()); hideModal(); } };

/* ================= PROJECTS (IndexedDB, autosave) ================= */
let DB=null, lastSaved='', saving=false;
function idbOpen(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open('chitracut',1);
    r.onupgradeneeded=()=>{ const d=r.result; d.createObjectStore('projects',{keyPath:'id'}); d.createObjectStore('blobs',{keyPath:'id'}).createIndex('project','project'); };
    r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);
  });
}
function idbReq(store,mode,fn){
  return new Promise((res,rej)=>{ const tx=DB.transaction(store,mode); const r=fn(tx.objectStore(store)); tx.oncomplete=()=>res(r&&r.result); tx.onerror=()=>rej(tx.error); tx.onabort=()=>rej(tx.error); });
}
const idbPut=(s,v)=>idbReq(s,'readwrite',st=>st.put(v));
const idbGet=(s,k)=>idbReq(s,'readonly',st=>st.get(k));
const idbAll=s=>idbReq(s,'readonly',st=>st.getAll());
const idbDel=(s,k)=>idbReq(s,'readwrite',st=>st.delete(k));
function idbDelBlobs(pid){
  return idbReq('blobs','readwrite',st=>{ const r=st.index('project').openCursor(IDBKeyRange.only(pid)); r.onsuccess=()=>{ const c=r.result; if(c){ c.delete(); c.continue(); } }; return null; });
}
function projectData(){
  return {clips:deep(S.clips), overlays:deep(S.overlays), audios:deep(S.audios),
    media:S.media.map(({id,name,type,duration,thumb,w,h,strip,stripN})=>({id,name,type,duration,thumb,w,h,strip,stripN})),
    ratio:S.ratio, quality:S.quality, bg:S.bg, time:S.time, mainMute:S.mainMute, mainHide:S.mainHide,
    luts:S.luts.filter(l=>l.custom).map(l=>({id:l.id,name:l.name,n:l.n,data:l.data}))};
}
function makeThumb(){
  if(!S.clips.length && !S.overlays.length) return '';
  const c=document.createElement('canvas'), k=160/Math.max(out.width,out.height); c.width=Math.round(out.width*k); c.height=Math.round(out.height*k);
  c.getContext('2d').drawImage(out,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.6);
}
const sig = () => snap()+'|'+S.ratio+S.quality+S.bg+S.mainMute+S.mainHide+'|'+S.media.length+'|'+S.luts.length+'|'+(S.project&&S.project.name);
async function saveProject(force){
  if(!DB || !S.project || saving) return;
  const s=sig(); if(!force && s===lastSaved) return;
  saving=true;
  try{ await idbPut('projects',{id:S.project.id,name:S.project.name,updated:Date.now(),thumb:makeThumb(),data:projectData()}); lastSaved=s; setSaved('✓ Saved'); }
  catch(e){ setSaved('⚠ Save failed'); }
  saving=false;
}
function setSaved(t){ $('#saveState').textContent=t; }
setInterval(()=>{ if(!exporting && !recState && !document.hidden) saveProject(); },2500);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) saveProject(); });
function updateProjName(){ $('#projName').textContent=S.project?S.project.name:'Project'; document.title=(S.project?S.project.name+' · ':'')+'ChitraCut'; }
function resetState(){
  pause(); setPick(false);
  for(const map of [vids,ovVids,audEls]) for(const k in map){ dropEl(map[k]); delete map[k]; }
  dropAllChains(); dropAudChains();
  for(const k in ovAud){ try{ ovAud[k].disconnect(); }catch(e){} delete ovAud[k]; }
  for(const m of S.media){ if(m.url) URL.revokeObjectURL(m.url); if(m.wave) URL.revokeObjectURL(m.wave); }
  for(const k in images) delete images[k];
  for(const k in mediaBlobs) delete mediaBlobs[k];
  S.media=[]; S.clips=[]; S.overlays=[]; S.audios=[]; S.sel=null; S.time=0; active=null; pairKey='';
  undoS.length=0; redoS.length=0; S.mainMute=false; S.mainHide=false;
  for(const k in segCache) delete segCache[k];
  S.luts=S.luts.filter(l=>!l.custom);
}
async function newProject(){
  resetState();
  let n=1; if(DB){ try{ n=(await idbAll('projects')).length+1; }catch(e){} }
  S.project={id:nid(),name:'Project '+n};
  syncSelects(); setCanvas(); hideHome(); layout(); afterEdit(); renderMediaPanel(); updateProjName();
  await saveProject(true);
}
async function openProject(id){
  const rec=await idbGet('projects',id); if(!rec) return;
  resetState();
  S.project={id:rec.id,name:rec.name}; const d=rec.data||{};
  S.ratio=d.ratio||'9:16'; S.quality=d.quality||720; S.bg=d.bg||'black'; S.mainMute=!!d.mainMute; S.mainHide=!!d.mainHide; syncSelects();
  for(const l of d.luts||[]){ try{ addLut(l.name,l.n,l.data,l.id,true); }catch(e){} }
  for(const mm of d.media||[]){
    const m={...mm}; const b=await idbGet('blobs',m.id).catch(()=>null);
    if(b && b.blob){
      mediaBlobs[m.id]=b.blob; m.url=URL.createObjectURL(b.blob);
      if(m.type==='image'){ try{ images[m.id]=await loadImg(m.url); }catch(e){ m.missing=true; } }
    } else m.missing=true;
    S.media.push(m);
  }
  const okM = x => { const m=media(x.mediaId); return m && !m.missing; };
  S.clips=(d.clips||[]).map(c=>({...clipDefaults(),...c})).filter(okM);
  S.overlays=(d.overlays||[]).map(o=>({...ovDefaults(o.type),...o})).filter(o=>!isMediaOv(o)||okM(o));
  S.audios=(d.audios||[]).map(a=>({...audDefaults(),...a})).filter(okM);
  S.time=0; setCanvas(); hideHome(); layout();
  S.sel=S.clips[0]?S.clips[0].id:null;
  afterEdit(); seek(clamp(d.time||0,0,S.total)); renderMediaPanel(); updateProjName();
  lastSaved=sig(); setSaved('✓ Opened');
  S.media.filter(m=>!m.missing).forEach(m=>{ computeWave(m); genStrip(m); });
}
/* ================= EXPORT ================= */
function showOverlay(title,msg,btns){
  $('#overlay').style.display='flex'; $('#ovT').textContent=title; $('#ovMsg').textContent=msg; $('#ovBtns').innerHTML=btns;
}
async function exportVideo(){
  if(!S.total) return alert('ಮೊದಲು video / photo import ಮಾಡಿ');
  if(!window.MediaRecorder) return alert('ಈ browser export support ಮಾಡುವುದಿಲ್ಲ. Chrome ಬಳಸಿ.');
  pause(); setPick(false); initAudio(); await AC.resume();
  const mt=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  const stream=new MediaStream([...out.captureStream(30).getVideoTracks(), ...recDest.stream.getAudioTracks()]);
  const chunks=[];
  rec=new MediaRecorder(stream,{mimeType:mt, videoBitsPerSecond:S.quality>=1080?12e6:S.quality>=720?6e6:3e6});
  rec.ondataavailable=e=>{ if(e.data.size) chunks.push(e.data); };
  rec.onstop=()=>{
    exporting=false; spk.gain.value=1;
    const blob=new Blob(chunks,{type:mt.split(';')[0]}), url=URL.createObjectURL(blob);
    const name=(S.project?S.project.name.replace(/[^\wಀ-೿ -]/g,''):'ChitraCut')+'_'+Date.now()+(mt.includes('mp4')?'.mp4':'.webm');
    const a=document.createElement('a'); a.href=url; a.download=name; a.click();
    showOverlay('✅ Export ಮುಗಿಯಿತು', name+' ('+(blob.size/1048576).toFixed(1)+' MB)', `<a href="${url}" download="${name}"><button class="primary">Download again</button></a><button id="ovClose">Close</button>`);
  };
  exporting=true; spk.gain.value=0;
  showOverlay('Exporting…','ಈ tab ತೆರೆದಿಡಿ — video real-time ನಲ್ಲಿ render ಆಗುತ್ತದೆ','<button id="ovCancel">Cancel</button>');
  seek(0);
  setTimeout(()=>{ if(!exporting) return; rec.start(250); play(); }, 400);
}
function onPlaybackEnd(){ if(exporting && rec && rec.state==='recording') setTimeout(()=>rec.stop(),200); }
$('#overlay').addEventListener('click',e=>{
  if(e.target.id==='ovCancel'){ exporting=false; spk.gain.value=1; if(rec){ rec.onstop=null; if(rec.state!=='inactive') rec.stop(); } pause(); $('#overlay').style.display='none'; }
  if(e.target.id==='ovClose') $('#overlay').style.display='none';
});


/* ================= AUTO BACKGROUND REMOVAL (MediaPipe selfie segmentation, runs in browser) ================= */
const MP_VER = '0.10.14';
let SEG = null, segLoading = null, segErr = '', segTs = 0;
const segCache = {};
function loadSeg(){
  if(SEG) return Promise.resolve(SEG);
  if(!segLoading) segLoading = (async () => {
    const v = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}/vision_bundle.mjs`);
    const fs = await v.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}/wasm`);
    const opts = d => ({baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite', delegate:d},
      runningMode:'VIDEO', outputCategoryMask:false, outputConfidenceMasks:true});
    try{ SEG = await v.ImageSegmenter.createFromOptions(fs, opts('GPU')); }
    catch(e){ SEG = await v.ImageSegmenter.createFromOptions(fs, opts('CPU')); }
    segErr = ''; if(typeof onSegReady === 'function') onSegReady();
    return SEG;
  })().catch(e => { segErr = e.message || String(e); segLoading = null; if(typeof onSegReady === 'function') onSegReady(); throw e; });
  return segLoading;
}
function setSeg(it, el){
  gl.uniform1f(U.u_segOn, 0);
  if(!it.rmbg || !el) return;
  if(!SEG){ if(!segErr) loadSeg().catch(()=>{}); return; }
  const key = el.tagName === 'IMG' ? 'img' : el.currentTime.toFixed(3);
  let c = segCache[it.id];
  if(!c || c.key !== key || c.src !== el){
    try{
      segTs = Math.max(segTs + 1, performance.now());
      SEG.segmentForVideo(el, segTs, r => {
        const m = r.confidenceMasks && r.confidenceMasks[0]; if(!m) return;
        const f = m.getAsFloat32Array(), u8 = (c && c.u8 && c.u8.length === f.length) ? c.u8 : new Uint8Array(f.length);
        for(let i = 0; i < f.length; i++) u8[i] = f[i]*255;
        c = segCache[it.id] = {key, src:el, u8, w:m.width, h:m.height};
      });
    }catch(e){ segErr = e.message || String(e); }
  }
  if(!c) return;
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texSeg);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, c.w, c.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, c.u8);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1f(U.u_segOn, 1); gl.uniform1f(U.u_segInv, it.rmbgInv ? 1 : 0);
}

/* ================= FREE SOUND EFFECTS (synthesised – no copyright, no download) ================= */
const SFX = [
  {id:'click',   name:'Mouse Click',     cat:'UI',      dur:.12},
  {id:'pop',     name:'Pop',             cat:'UI',      dur:.15},
  {id:'bubble',  name:'Bubbles',         cat:'UI',      dur:.6},
  {id:'ding',    name:'Ding',            cat:'UI',      dur:1.5},
  {id:'coin',    name:'Coin',            cat:'UI',      dur:.5},
  {id:'error',   name:'Error Buzz',      cat:'UI',      dur:.45},
  {id:'whoosh',  name:'Whoosh',          cat:'Swooshes',dur:.8},
  {id:'swoosh',  name:'Fast Swoosh',     cat:'Swooshes',dur:.35},
  {id:'riser',   name:'Riser',           cat:'Swooshes',dur:2},
  {id:'drop',    name:'Drop Down',       cat:'Swooshes',dur:1.1},
  {id:'boing',   name:'Boing',           cat:'Funny',   dur:.8},
  {id:'slideup', name:'Slide Whistle Up',cat:'Funny',   dur:.75},
  {id:'slidedn', name:'Slide Whistle Down',cat:'Funny', dur:.75},
  {id:'rimshot', name:'Ba Dum Tss',      cat:'Funny',   dur:1.4},
  {id:'fail',    name:'Sad Trombone',    cat:'Funny',   dur:2.2},
  {id:'boom',    name:'Boom',            cat:'Impact',  dur:1.6},
  {id:'punch',   name:'Punch',           cat:'Impact',  dur:.3},
  {id:'thud',    name:'Thud',            cat:'Impact',  dur:.35},
  {id:'shutter', name:'Camera Shutter',  cat:'Everyday',dur:.3},
  {id:'typing',  name:'Keyboard Typing', cat:'Everyday',dur:1.7},
  {id:'tick',    name:'Clock Tick',      cat:'Everyday',dur:2},
  {id:'bell',    name:'Door Bell',       cat:'Everyday',dur:1.6},
  {id:'heart',   name:'Heartbeat',       cat:'Everyday',dur:1.9},
  {id:'success', name:'Success Chime',   cat:'Musical', dur:1.1},
  {id:'magic',   name:'Magic Sparkle',   cat:'Musical', dur:1.5},
  {id:'drumroll',name:'Drum Roll',       cat:'Musical', dur:2.2},
  {id:'applause',name:'Applause',        cat:'Musical', dur:3}
];
const SFX_CATS = ['All','UI','Swooshes','Funny','Impact','Everyday','Musical'];
const sfxCache = {};
async function synthSFX(id){
  if(sfxCache[id]) return sfxCache[id];
  const def = SFX.find(x => x.id === id), SR_ = 44100;
  const ctx = new OfflineAudioContext(1, Math.ceil(def.dur*SR_), SR_), out_ = ctx.createGain(); out_.connect(ctx.destination);
  const nb = ctx.createBuffer(1, SR_*3, SR_), nd = nb.getChannelData(0); for(let i=0;i<nd.length;i++) nd[i] = Math.random()*2-1;
  const env = (t0, a, d, peak=1, node) => { const g = ctx.createGain(); g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(peak,t0+a); g.gain.exponentialRampToValueAtTime(.0005,t0+a+d); if(node) node.connect(g); g.connect(out_); return g; };
  const osc = (type, f0, f1, t0, len, a, d, peak, curve) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0,t0); if(f1!=null) (curve==='lin'?o.frequency.linearRampToValueAtTime(f1,t0+len):o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t0+len)); env(t0,a,d,peak,o); o.start(t0); o.stop(t0+a+d+.05); return o; };
  const noise = (t0, a, d, peak, ftype, f0, f1, q=1, len) => { const n = ctx.createBufferSource(); n.buffer = nb; const f = ctx.createBiquadFilter(); f.type = ftype; f.Q.value = q; f.frequency.setValueAtTime(f0,t0); if(f1!=null) f.frequency.exponentialRampToValueAtTime(f1,t0+(len||a+d)); n.connect(f); env(t0,a,d,peak,f); n.start(t0, Math.random()*1.5); n.stop(t0+a+d+.05); return f; };
  switch(id){
    case 'click': noise(0,.001,.02,.8,'highpass',2500); osc('sine',2200,null,0,0,.001,.015,.3); break;
    case 'pop': osc('sine',350,1300,0,.035,.002,.08,.9); break;
    case 'bubble': [0,.15,.32].forEach((t,i)=>osc('sine',280+i*60,900+i*150,t,.07,.003,.09,.6)); break;
    case 'ding': osc('sine',1320,null,0,0,.003,1.3,.6); osc('sine',2640,null,0,0,.003,.8,.2); break;
    case 'coin': osc('square',988,null,0,0,.002,.07,.25); osc('square',1319,null,.08,0,.002,.35,.25); break;
    case 'error': osc('square',150,null,0,0,.005,.12,.3); osc('square',140,null,.2,0,.005,.15,.3); break;
    case 'whoosh': noise(0,.35,.4,.9,'bandpass',300,3200,1.2,.45); break;
    case 'swoosh': noise(0,.08,.2,.9,'bandpass',1500,6000,1.5,.25); break;
    case 'riser': noise(0,1.85,.1,.6,'bandpass',200,4000,2,1.9); osc('sawtooth',120,1200,0,1.9,1.85,.1,.15); break;
    case 'drop': osc('sine',1200,60,0,1,.01,1,.8); break;
    case 'boing': { const o=ctx.createOscillator(), l=ctx.createOscillator(), lg=ctx.createGain(); o.frequency.value=180; l.frequency.value=14; lg.gain.setValueAtTime(90,0); lg.gain.exponentialRampToValueAtTime(1,.7); l.connect(lg); lg.connect(o.frequency); o.frequency.linearRampToValueAtTime(320,.7); env(0,.005,.7,.7,o); o.start(0); l.start(0); o.stop(.8); l.stop(.8); break; }
    case 'slideup': case 'slidedn': { const up=id==='slideup', o=ctx.createOscillator(), l=ctx.createOscillator(), lg=ctx.createGain(); o.frequency.setValueAtTime(up?400:1600,0); o.frequency.exponentialRampToValueAtTime(up?1600:350,.65); l.frequency.value=7; lg.gain.value=18; l.connect(lg); lg.connect(o.frequency); env(0,.03,.65,.5,o); o.start(0); l.start(0); o.stop(.75); l.stop(.75); break; }
    case 'rimshot': osc('sine',190,110,0,.15,.002,.2,.9); osc('sine',150,90,.18,.15,.002,.25,.9); noise(.45,.002,.9,.5,'highpass',6000); break;
    case 'fail': [[392,0,.4],[370,.45,.4],[349,.9,.4],[330,1.35,.8]].forEach(([f,t,l])=>{ const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=f; const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1200; o.connect(lp); env(t,.03,l,.35,lp); if(l>.5){ const v=ctx.createOscillator(), vg=ctx.createGain(); v.frequency.value=6; vg.gain.value=8; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t+l+.1); } o.start(t); o.stop(t+l+.1); }); break;
    case 'boom': osc('sine',90,28,0,1.2,.005,1.4,1); noise(0,.005,1,.7,'lowpass',400,60); break;
    case 'punch': noise(0,.002,.08,1,'lowpass',1400); osc('sine',160,55,0,.12,.002,.15,.9); break;
    case 'thud': osc('sine',95,45,0,.2,.003,.25,1); noise(0,.002,.05,.4,'lowpass',500); break;
    case 'shutter': noise(0,.001,.03,.9,'bandpass',3000,null,2); noise(.09,.001,.05,.7,'bandpass',2200,null,2); break;
    case 'typing': { let t=0; while(t<1.55){ noise(t,.001,.025,.5+Math.random()*.4,'bandpass',2000+Math.random()*1500,null,3); t+=.06+Math.random()*.09; } break; }
    case 'tick': [0,.5,1,1.5].forEach(t=>osc('sine',3000,null,t,0,.001,.02,.5)); break;
    case 'bell': osc('sine',659,null,0,0,.005,.9,.6); osc('sine',523,null,.55,0,.005,1,.6); break;
    case 'heart': [0,.24,.95,1.19].forEach((t,i)=>osc('sine',i%2?50:62,40,t,.12,.01,.18,1)); break;
    case 'success': [523,659,784,1047].forEach((f,i)=>osc('triangle',f,null,i*.09,0,.005,i===3?.9:.2,.4)); break;
    case 'magic': for(let i=0;i<16;i++){ const t=i*.07+Math.random()*.03; osc('sine',1500+Math.random()*2800,null,t,0,.002,.25,.18); } break;
    case 'drumroll': { let t=0; while(t<1.6){ noise(t,.002,.04,.25+t*.35,'bandpass',900,null,1.2); t+=.03; } osc('sine',120,60,1.65,.2,.002,.4,.9); noise(1.65,.002,.5,.5,'highpass',5000); break; }
    case 'applause': for(let i=0;i<260;i++){ const t=Math.random()*2.6, k=Math.min(1,t/.4)*Math.min(1,(2.9-t)/.6); noise(t,.001,.02+Math.random()*.03,.15*k+.02,'bandpass',1500+Math.random()*2500,null,1.5); } break;
    default: if(typeof synthExtra==='function') synthExtra(id,{ctx,out_,env,osc,noise,nb});
  }
  const buf = await ctx.startRendering();
  sfxCache[id] = buf; return buf;
}
function wavBlob(buf){
  const d = buf.getChannelData(0), n = d.length, ab = new ArrayBuffer(44 + n*2), v = new DataView(ab);
  const w = (o,s) => { for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
  w(0,'RIFF'); v.setUint32(4,36+n*2,true); w(8,'WAVE'); w(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,buf.sampleRate,true); v.setUint32(28,buf.sampleRate*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,'data'); v.setUint32(40,n*2,true);
  for(let i=0;i<n;i++) v.setInt16(44+i*2, clamp(d[i],-1,1)*32767, true);
  return new Blob([ab], {type:'audio/wav'});
}
let sfxPlaying = null;
async function previewSFX(id){
  initAudio(); await AC.resume();
  if(sfxPlaying){ try{ sfxPlaying.stop(); }catch(e){} }
  const b = AC.createBufferSource(); b.buffer = await synthSFX(id); b.connect(AC.destination); b.start(); sfxPlaying = b;
}
async function addSFX(id){
  const def = SFX.find(x => x.id === id), buf = await synthSFX(id);
  const m = await addAudioMedia(new File([wavBlob(buf)], `SFX - ${def.name}.wav`, {type:'audio/wav'}), buf.duration);
  addAudioAt(m, {kind:'sfx', start:S.time});
  return m;
}

/* ================= EXTRA EDIT OPERATIONS ================= */
// CapCut-style "delete left / right of playhead"
function trimSide(side){
  const fr = selFree();
  if(fr){
    const o = fr[0]; if(S.time <= o.start + .05 || S.time >= o.start + o.dur - .05) return;
    pushUndo(); const cut = S.time - o.start;
    if(side === 'left'){ o.start = S.time; o.dur -= cut; o.in += cut*o.speed; if(o.kf) o.kf.forEach(k => k.t -= cut); }
    else o.dur = cut;
    afterEdit(); return;
  }
  const c = selClip() || clipAt(S.time); if(!c) return;
  const d = derived[c.id], lt = S.time - d.start; if(lt < .05 || d.dur - lt < .05) return;
  pushUndo(); const src = localToSrc(c, lt);
  if(side === 'left'){ c.in = src; } else c.out = src;
  S.sel = c.id; afterEdit();
  if(side === 'left') seek(derived[c.id].start);
}
function flipSel(){ const it = selItem(); if(!it || it.type === 'audio' || it.type === 'text' || it.type === 'sticker') return; pushUndo(); if(it.type) it.flip = !it.flip; else it.tf.flip = !it.tf.flip; renderInspector(); }
function rotateSel(){ const it = selItem(); if(!it || it.type === 'audio') return; pushUndo(); const p = it.type ? 'rot' : 'tf.rot'; let r = ev(it,p) + 90; if(r > 180) r -= 360; setVal(it, p, r); renderInspector(); }
const OV_COPY = ['filter','filterAmt','adj','lut','lutAmt','mask','fx','rt','rmbg','rmbgInv','ck','volume'];
function clipToOverlay(c, start){
  const m = media(c.mediaId); if(!m) return;
  pushUndo();
  const o = newOverlay(m.type === 'video' ? 'video' : 'image', {mediaId:m.id, start:Math.max(0,start), in:c.in, speed:c.speed, dur:(c.out-c.in)/c.speed, size:Math.round(100*Math.min(out.width,out.height)/Math.min(out.width,out.height)), flip:c.tf.flip});
  const W = out.width, H = out.height, u = Math.min(W,H); o.size = Math.round(Math.min(W/m.w, H/m.h)*m.w/u*100);
  for(const k of OV_COPY) if(c[k] !== undefined) o[k] = deep(c[k]);
  S.clips.splice(S.clips.indexOf(c), 1); if(active === c){ deactivate(); dropChainFor(c.id); }
  S.overlays.push(o); S.sel = o.id; S.rt = S.rt || {}; afterEdit();
}
function insertIndexAt(t, exclude){
  const others = S.clips.filter(c => c !== exclude); let i = 0;
  for(const c of others){ const d = derived[c.id]; if(d && d.start + d.dur/2 < t) i++; }
  return i;
}
function overlayToClip(o, t){
  const m = media(o.mediaId); if(!m || !isMediaOv(o)) return;
  pushUndo();
  const c = newClip(m);
  if(o.type === 'video'){ c.in = o.in; c.out = Math.min(m.duration, o.in + o.dur*o.speed); c.speed = o.speed; }
  else { c.in = 0; c.out = o.dur; }
  c.tf.flip = !!o.flip;
  for(const k of OV_COPY) if(o[k] !== undefined) c[k] = deep(o[k]);
  S.overlays.splice(S.overlays.indexOf(o), 1);
  S.clips.splice(insertIndexAt(t), 0, c); S.sel = c.id; afterEdit();
}
function insertMediaClip(m, t){
  pushUndo(); const c = newClip(m); S.clips.splice(insertIndexAt(t), 0, c); S.sel = c.id; afterEdit();
}
function moveClipTo(c, t){
  const i = S.clips.indexOf(c), j = insertIndexAt(t, c); if(i === j) return;
  pushUndo(); S.clips.splice(i,1); S.clips.splice(j,0,c); afterEdit();
}
let previewTimer = 0;
function previewPlay(from, sec){
  clearTimeout(previewTimer);
  if(S.playing) pause();
  seek(clamp(from, 0, S.total)); play();
  previewTimer = setTimeout(() => { if(!exporting && !recState){ pause(); seek(clamp(from,0,S.total)); } }, sec*1000);
}
const fmtF = t => { t = Math.max(0, t||0); const f = Math.floor((t%1)*30); return `${pad(Math.floor(t/3600))}:${pad(Math.floor(t/60)%60)}:${pad(Math.floor(t%60))}:${pad(f)}`; };
