'use strict';
/* =====================================================================
   ChitraCut UI  –  CapCut-style layout (left library · player · inspector · timeline)
   Engine lives in core.js
   ===================================================================== */

/* ---------------- ICONS ---------------- */
const IC = {
  media:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/>',
  audio:'<path d="M9 18V5.5l11-2V16"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  text:'<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
  sticker:'<path d="M20 12.5A8.5 8.5 0 1 1 11.5 4"/><path d="M20 12.5h-5a3.5 3.5 0 0 1-3.5-3.5V4l8.5 8.5z"/>',
  effects:'<path d="M11 3l1.9 4.6L17.5 9.5l-4.6 1.9L11 16l-1.9-4.6L4.5 9.5l4.6-1.9z"/><path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
  trans:'<path d="M3 5l9 7-9 7zM21 5l-9 7 9 7z"/>',
  captions:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 15h3M12 15h5M7 11.5h10"/>',
  filters:'<circle cx="9" cy="9.5" r="5"/><circle cx="15" cy="9.5" r="5"/><circle cx="12" cy="15" r="5"/>',
  adjust:'<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo:'<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  split:'<path d="M12 3v18"/><path d="M8 7H5v10h3M16 7h3v10h-3"/>',
  delL:'<path d="M15 3v18"/><path d="M11 7H5v10h6"/><path d="M6.5 10l3 4M9.5 10l-3 4"/>',
  delR:'<path d="M9 3v18"/><path d="M13 7h6v10h-6"/><path d="M14.5 10l3 4M17.5 10l-3 4"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  flip:'<path d="M12 3v18"/><path d="M8 7L3 17h5zM16 7l5 10h-5z"/>',
  rotate:'<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5"/><path d="M20 3.5v5h-5"/>',
  reset:'<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"/><path d="M4 3.5v5h5"/>',
  kf:'<path d="M12 3.5l8.5 8.5-8.5 8.5L3.5 12z"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  zin:'<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5l-4.5-4.5M8 11h6M11 8v6"/>',
  zout:'<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5l-4.5-4.5M8 11h6"/>',
  play:'<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
  pause:'<path d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z" fill="currentColor" stroke="none"/>',
  full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  home:'<path d="M4 11l8-7 8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z"/>',
  export:'<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  import:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><path d="M3 3l18 18"/>',
  vol:'<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  volx:'<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  chev:'<path d="M6 9l6 6 6-6"/>',
  wave:'<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
  folder:'<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>',
  wand:'<path d="M4 20L15 9M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
  ban:'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  cursor:'<path d="M5 3l14 8-6 1.5L10 19z"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  center:'<path d="M12 3v18M3 12h18"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  fill:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8v8H8z"/>',
  fit:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 9h6v6H9z"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>', down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  target:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><circle cx="12" cy="12" r="3"/>',
  library:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M15 15.5v5l4.5-2.5z" fill="currentColor"/>',
  music2:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'
};
const ic = n => `<svg class="i" viewBox="0 0 24 24">${IC[n]||''}</svg>`;
const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2a8fa8"/><stop offset="1" stop-color="#6d4bd6"/></linearGradient></defs><rect width="160" height="90" fill="url(#g)"/><circle cx="120" cy="28" r="12" fill="#ffd56b"/><path d="M0 90L50 45l30 25 25-18 55 38z" fill="#183a4a"/></svg>');
const IB = $('#inspBody'), LC = $('#lcontent'), TL = $('#tl');
let HEADW = 150, apEl = null;

/* ---------------- HELPERS ---------------- */
function kindOf(it){ if(!it) return null; if(!it.type) return isImg(it) ? 'clipimg' : 'clip'; return it.type === 'video' ? 'ovvideo' : it.type === 'image' ? 'ovimage' : it.type; }
let curveSel = -1, trackRun = null;
const itemStart = it => it.type ? it.start : derived[it.id].start;
const itemDur = it => it.type ? it.dur : derived[it.id].dur;
function thumbFor(it){ if(it && it.type === 'gfx'){ const c = document.createElement('canvas'); c.width = 160; c.height = 90; paintGfx(c, it.gfx, (GFXMAP[it.gfx]||{}).thumbT||1); return c.toDataURL(); }
  const m = it && media(it.mediaId); return (m && m.thumb && m.type !== 'audio') ? m.thumb : (S.clips[0] && (media(S.clips[0].mediaId)||{}).thumb) || PLACEHOLDER; }
function visTarget(){ const it = selItem(); if(it && (!it.type || isMediaOv(it))) return it; return clipAt(S.time); }
function transTarget(){ const c = selClip(); if(c && S.clips.indexOf(c) > 0) return c; const p = clipAt(S.time); if(p && S.clips.indexOf(p) > 0) return p; return S.clips[1] || null; }
const usedMedia = id => S.clips.some(c=>c.mediaId===id) || S.overlays.some(o=>o.mediaId===id) || S.audios.some(a=>a.mediaId===id);
function setFill(el){ const mn=+el.min||0, mx=+el.max||100, v=+el.value; el.style.setProperty('--p', ((v-mn)/(mx-mn||1)*100)+'%'); }
function fillRanges(root){ root.querySelectorAll('input[type=range]').forEach(setFill); }

/* ---------------- CONTROL BUILDERS ---------------- */
function sl(it,label,path,min,max,step=1){
  const isK = kfList(it).includes(path), v = isK ? ev(it,path) : getP(it,path), kk = isK && it.kf && it.kf.length;
  return `<div class="prow"><div class="plab ${kk?'k':''}" title="${label}">${label}</div><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-p="${path}"><input class="num" type="number" min="${min}" max="${max}" step="${step}" value="${fmtV(v)}" data-p="${path}"></div>`;
}
function chips(it,path,opts,cols=3){
  const v = getP(it,path);
  return `<div class="tiles" style="grid-template-columns:repeat(${cols},1fr)">${opts.map(([k,n])=>`<button class="vtile ${v===k?'on':''}" style="height:auto;padding:8px 4px" data-set="${path}" data-val="${k}">${n}</button>`).join('')}</div><div style="height:10px"></div>`;
}
function sec(id,title,body,o={}){
  const kf = o.kf ? `<span class="kfm"><button class="ib sm" data-kf="prev" title="ಹಿಂದಿನ keyframe">‹</button><button class="ib sm kfbtn" data-kf="toggle" title="Keyframe (K)">${ic('kf')}</button><button class="ib sm" data-kf="next" title="ಮುಂದಿನ keyframe">›</button></span>` : '';
  return `<div class="sec ${S.closed[id]?'closed':''}"><div class="sech"><button class="sect" data-tog="${id}">${title} ${ic('chev')}</button><div class="secr">${o.right||''}${o.reset?`<button class="ib sm" data-act="${o.reset}" title="Reset">${ic('reset')}</button>`:''}${kf}</div></div><div class="secb">${body}</div></div>`;
}
const colorRow = (o,label,path,swatch) => `<div class="crow"><span>${label}</span><input type="color" data-p="${path}" value="${getP(o,path)}"></div>` +
  (swatch ? `<div class="sw">${SWATCHES.map(s=>`<button style="background:${s}" data-set="${path}" data-val="${s}" title="${s}"></button>`).join('')}</div>` : '');
const blendRow = o => `<div class="crow"><span>Blend mode</span><select data-p="blend">${BLENDS.map(([k,n])=>`<option value="${k}" ${o.blend===k?'selected':''}>${n}</option>`).join('')}</select></div>`;
const presetCss = p => `color:${p.color};background:${p.bgOn?hexA(p.bgColor,(p.bgAlpha??100)/100):'#2a2a2f'};-webkit-text-stroke:${p.strokeW?Math.min(1,p.strokeW/7)+'px '+(p.stroke||'#000'):'0'};text-shadow:${p.shadow?`0 0 ${p.shadow/8}px ${p.shadowColor||'#000'}`:'none'};font-family:'${p.font||'Inter'}'`;
function curveSvg(c){
  const W=300,H=90,y=v=>H/2-Math.log10(v)*H/2,pts=[];
  for(let i=0;i<=60;i++){ const p=i/60; pts.push((p*W).toFixed(1)+','+y(clamp(curveAt(c,p),.1,10)).toFixed(1)); }
  return `<svg id="curveSvg" viewBox="0 0 ${W} ${H}" style="width:100%;background:#111113;border-radius:6px;display:block;margin-bottom:12px"><line x1="0" x2="${W}" y1="${H/2}" y2="${H/2}" stroke="#444" stroke-dasharray="4 4"/><polyline fill="none" stroke="#20d5ec" stroke-width="2" points="${pts.join(' ')}"/></svg>`;
}
const FILTER_CSS = {none:'',vivid:'saturate(1.45) contrast(1.15)',warm:'sepia(.35) saturate(1.25)',cool:'hue-rotate(-18deg) saturate(.9) brightness(1.03)',bw:'grayscale(1) contrast(1.2)',
  vintage:'sepia(.55) contrast(.9) brightness(1.05)',cinema:'contrast(1.25) saturate(.8) hue-rotate(-8deg)',fade:'contrast(.78) brightness(1.12)',drama:'contrast(1.5) saturate(.7) brightness(.88)',
  moody:'saturate(.6) brightness(.85) hue-rotate(-10deg)',golden:'sepia(.45) saturate(1.35) brightness(1.08)',film:'sepia(.25) contrast(1.12)'};

/* =====================================================================
   LEFT PANEL
   ===================================================================== */
const LTABS = [['media','Media','media'],['audio','Audio','audio'],['text','Text','text'],['stickers','Stickers','sticker'],['effects','Effects','effects'],['transitions','Transitions','trans'],['captions','Captions','captions'],['filters','Filters','filters'],['adjust','Adjustment','adjust']];
const LSUB = {media:[['all','All'],['video','Videos'],['image','Photos'],['audio','Audio'],['library','Library']], audio:[['sfx','Sound effects'],['yours','Yours'],['voice','Voice-over']],
  text:[['add','Add text'],['styles','Text styles']], stickers:[['emoji','Emoji'],['social','Social'],['badges','Badges & Arrows']], effects:[['video','Video effects']], transitions:[['all','Transitions']],
  captions:[['auto','Auto captions'],['srt','SRT file']], filters:[['filters','Filters']], adjust:[['lut','LUT'],['adjust','Adjust']]};
const TEXT_ADD = [
  ['default','Default text',{text:'ನಿಮ್ಮ ಪಠ್ಯ ಇಲ್ಲಿ'}],
  ['title','Title',{text:'TITLE',size:96,font:'Anton',shadow:40,y:42}],
  ['subtitle','Subtitle',{text:'Subtitle',size:42,bgOn:true,bgColor:'#000000',bgAlpha:60,shadow:0,y:72}],
  ['kannada','ಕನ್ನಡ',{text:'ಕನ್ನಡ',size:84,font:'Baloo Tamma 2',color:'#ffe600',stroke:'#000000',strokeW:7,shadow:0}],
  ['neon','Neon',{text:'NEON',size:80,font:'Montserrat',color:'#ffffff',shadow:90,shadowColor:'#20d5ec'}],
  ['caption','Caption',{text:'Caption text',...CAPTION_STYLE}]
];
function renderLeft(){
  if(S.ltab === 'captions' && capBusy) return;
  $('#ltabs').innerHTML = LTABS.map(([k,n,i])=>`<button data-ltab="${k}" class="${S.ltab===k?'on':''}">${ic(i)}<span>${n}</span></button>`).join('');
  const subs = LSUB[S.ltab], sub = subs.some(s=>s[0]===S.lsub[S.ltab]) ? S.lsub[S.ltab] : subs[0][0];
  $('#lsub').innerHTML = subs.map(([k,n])=>`<button data-lsub="${k}" class="${sub===k?'on':''}">${n}</button>`).join('');
  LC.innerHTML = leftContent(S.ltab, sub); fillRanges(LC); paintGfxTiles();
}
function renderMediaPanel(){ renderLeft(); }
let gfxAnim = null;
function paintGfxTiles(){ LC.querySelectorAll('canvas[data-gfxc]').forEach(c => paintGfx(c, c.dataset.gfxc, (GFXMAP[c.dataset.gfxc]||{}).thumbT || 1)); }
LC.addEventListener('mouseover', e => {
  const c = e.target.closest('[data-gfx]'); if(!c) return; const cv_ = c.querySelector('canvas'); if(!cv_ || (gfxAnim && gfxAnim.c === cv_)) return;
  if(gfxAnim) cancelAnimationFrame(gfxAnim.raf);
  const t0 = performance.now(), loop = () => { const g = GFXMAP[cv_.dataset.gfxc]; paintGfx(cv_, cv_.dataset.gfxc, ((performance.now()-t0)/1000) % Math.min(g.dur, 6)); gfxAnim.raf = requestAnimationFrame(loop); };
  gfxAnim = {c:cv_, raf:requestAnimationFrame(loop)};
});
LC.addEventListener('mouseout', e => { const c = e.target.closest('[data-gfx]'); if(!c || c.contains(e.relatedTarget)) return; if(gfxAnim){ cancelAnimationFrame(gfxAnim.raf); const cv_ = gfxAnim.c; gfxAnim = null; paintGfx(cv_, cv_.dataset.gfxc, (GFXMAP[cv_.dataset.gfxc]||{}).thumbT||1); } });
function refreshLeftLive(){ if(['effects','transitions','filters','adjust','captions'].includes(S.ltab) || (S.ltab==='text' && S.lsub.text==='styles')) renderLeft(); }
function mediaTile(m){
  const bg = m.thumb ? `background-image:url(${m.thumb})` : '';
  return `<div class="mtile ${m.type}" draggable="${!m.missing}" data-mid="${m.id}" title="${esc(m.name)}">
    <div class="mth" style="${bg}">${m.thumb?'':`<div class="ph">${m.type==='audio'?'🎵':'⚠️'}</div>`}
      ${usedMedia(m.id)?'<span class="badge">Added</span>':''}<span class="dur">${m.type==='image'?'IMG':fmtT(m.duration)}</span>
      ${m.missing?'':`<div class="acts">${m.type!=='audio'?`<button class="pip" data-pip="${m.id}" title="Overlay (PiP) ಆಗಿ ಸೇರಿಸಿ">PiP</button>`:''}<button data-addm="${m.id}" title="Timeline ಗೆ ಸೇರಿಸಿ">+</button></div>`}
    </div><div class="mnm">${m.missing?'⚠️ ':''}${esc(m.name)}</div></div>`;
}
function captionsAuto(){
  const src = capSource(), m = src && media(src.mediaId);
  return `<div class="ltitle" style="margin-top:0">✨ AI auto captions</div>
    <div class="crow"><span>Audio source</span><b style="max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m?esc(m.name):'— clip / audio select ಮಾಡಿ'}</b></div>
    <div class="crow"><span>ಭಾಷೆ</span><select id="cLang">${CAP_LANGS.map(([k,n])=>`<option value="${k}" ${S.capLang===k?'selected':''}>${n}</option>`).join('')}</select></div>
    <div class="crow"><span>Model</span><select id="cModel">${[['tiny','Tiny · 40 MB · ವೇಗ'],['base','Base · 75 MB'],['small','Small · 250 MB · ಕನ್ನಡಕ್ಕೆ ಉತ್ತಮ']].map(([k,n])=>`<option value="${k}" ${(S.capModel||'base')===k?'selected':''}>${n}</option>`).join('')}</select></div>
    <div id="cStatus" style="color:var(--mute);min-height:18px"></div><div class="prog"><div id="cBar"></div></div>
    <button id="cRun" class="primary" style="width:100%;padding:9px" ${src?'':'disabled'}>✨ Generate captions</button>
    <div class="lnote">AI model ನಿಮ್ಮ browser ನಲ್ಲೇ ಓಡುತ್ತದೆ (ಉಚಿತ). ಮೊದಲ ಬಾರಿ model download ಆಗುತ್ತದೆ, ನಂತರ cache. ಕನ್ನಡ ನಿಖರತೆ ಮಧ್ಯಮ — captions ಅನ್ನು ನಂತರ edit ಮಾಡಬಹುದು.</div>
    <div class="lnote">🎙 Voice-over record ಮಾಡುವಾಗ <b>Live captions</b> ON ಮಾಡಿದರೆ ಮಾತು ತಕ್ಷಣ captions ಆಗುತ್ತದೆ.</div>`;
}
function leftContent(tab, sub){
  switch(tab){
    case 'media': {
      if(sub === 'library'){
        const cat = S.gfxCat || 'Social', list = GFX.filter(g => g.cat === cat);
        return `<div class="chiprow">${GFX_CATS.map(c=>`<button data-gfxcat="${c}" class="${c===cat?'on':''}">${c}</button>`).join('')}</div>
          <div class="tiles gfx">${list.map(g=>`<button class="tile" data-gfx="${g.id}" draggable="true"><div class="tth gth"><canvas data-gfxc="${g.id}" width="176" height="104"></canvas></div><span>${g.name}</span></button>`).join('')}</div>
          <div class="lnote">✨ ಇವು ChitraCut ನಲ್ಲೇ ತಯಾರಾಗುವ animated stock graphics — <b>copyright ಇಲ್ಲ</b>, download ಬೇಕಿಲ್ಲ. Mouse ಇಟ್ಟರೆ preview · click = playhead ನಲ್ಲಿ ಸೇರಿಸಿ · timeline ಗೆ ಎಳೆಯಬಹುದು. Text / ಬಣ್ಣ ಬದಲಿಸಬಹುದು.</div>`;
      }
      const list = S.media.filter(m => sub === 'all' || m.type === sub);
      return `<div class="lhead"><button class="primary" data-l="import">${ic('import')} Import</button><button data-l="rec">${ic('mic')} Record</button></div>
        ${S.media.length ? '' : `<div class="dropzone" data-l="import"><b>Import media</b>Video, photo, music files ಅನ್ನು ಇಲ್ಲಿ drag ಮಾಡಿ ಅಥವಾ click ಮಾಡಿ</div>`}
        <div class="mgrid">${list.map(mediaTile).join('')}</div>
        ${S.media.length ? `<div class="lnote">💡 Timeline ನ <b>main track</b> ಗೆ ಎಳೆದರೆ clip ಆಗುತ್ತದೆ · ಅದರ <b>ಮೇಲೆ</b> ಎಳೆದರೆ overlay (PiP) · ಕೆಳಗೆ ಎಳೆದರೆ audio.</div>` : ''}`;
    }
    case 'audio': {
      if(sub === 'sfx'){
        const cat = S.sfxCat || 'All', list = SFX.filter(x => cat === 'All' || x.cat === cat);
        return `<div class="chiprow">${SFX_CATS.map(c=>`<button data-sfxcat="${c}" class="${c===cat?'on':''}">${c}</button>`).join('')}</div>
          ${list.map(x=>`<div class="srow"><button class="sico" data-sfxp="${x.id}" title="ಕೇಳಿ">${ic('play')}</button><div class="sinfo"><b>${x.name}</b><span>ChitraCut · ${x.cat} · ${fmtT(Math.max(1,x.dur))}</span></div><button class="sadd" data-sfx="${x.id}" title="Playhead ನಲ್ಲಿ ಸೇರಿಸಿ">${ic('plus')}</button></div>`).join('')}
          <div class="lnote">🔊 ಈ sound effects ChitraCut ನಲ್ಲೇ ತಯಾರಾಗುತ್ತವೆ — copyright ಇಲ್ಲ, internet ಬೇಕಿಲ್ಲ, ಸಂಪೂರ್ಣ ಉಚಿತ.</div>`;
      }
      if(sub === 'yours'){
        const list = S.media.filter(m => m.type === 'audio');
        return `<div class="lhead"><button class="primary" data-l="audioimp">${ic('import')} Import music</button><button data-l="extract">${ic('wave')} Extract from video</button></div>
          ${list.length ? list.map(m=>`<div class="srow"><button class="sico" data-ap="${m.id}" title="ಕೇಳಿ">${ic(apEl&&apEl.dataset.id===m.id&&!apEl.paused?'pause':'play')}</button><div class="sinfo"><b>${esc(m.name)}</b><span>${fmtT(m.duration)}</span></div><button class="sadd" data-addm="${m.id}" title="Playhead ನಲ್ಲಿ ಸೇರಿಸಿ">${ic('plus')}</button></div>`).join('') : '<div class="lnote">ನಿಮ್ಮ music / audio files ಇಲ್ಲಿ ಕಾಣುತ್ತವೆ. MP3, WAV, M4A support ಆಗುತ್ತವೆ.</div>'}`;
      }
      return `<div class="dropzone" data-l="rec"><b>🎙 Voice-over record</b>Playhead (${fmtTC(S.time)}) ಇರುವ ಜಾಗದಿಂದ ನಿಮ್ಮ ಧ್ವನಿ record ಆಗುತ್ತದೆ</div>
        <div class="lnote">Record ಆಗುವಾಗ video play ಆಗುತ್ತದೆ. Headphone ಬಳಸಿದರೆ ಉತ್ತಮ. Live captions ON ಮಾಡಿದರೆ ಮಾತು ತಕ್ಷಣ ಕನ್ನಡ captions ಆಗುತ್ತದೆ (Chrome).</div>`;
    }
    case 'text': {
      if(sub === 'styles'){
        const o = selOv(), on = o && o.type === 'text';
        return `<div class="ltitle" style="margin-top:0">${on ? 'Selected text ಗೆ style ಹಾಕಿ' : 'Click = ಹೊಸ text ಸೇರಿಸಿ'}</div>
          <div class="tiles tstyle">${TEXT_PRESETS.map((p,i)=>`<button class="tile" data-tpreset="${i}"><div class="tth" style="${presetCss(p)}">Aa</div></button>`).join('')}</div>`;
      }
      return `<div class="tiles tstyle">${TEXT_ADD.map(([k,n,p])=>`<button class="tile" data-addtext="${k}"><div class="tth" style="${presetCss({color:'#fff',...p})};font-size:${k==='default'?13:16}px">${k==='default'?'Default text':esc(p.text)}</div><span>${n}</span></button>`).join('')}</div>
        <div class="lnote">Text select ಮಾಡಿದ ನಂತರ ಬಲಗಡೆ font, ಬಣ್ಣ, animation ಬದಲಿಸಿ. ಕನ್ನಡ fonts ಲಭ್ಯ.</div>`;
    }
    case 'stickers':
      if(sub === 'social' || sub === 'badges') return `<div class="tiles small">${STICKER_SETS[sub].map(k=>`<button class="tile emoji" data-stk="svg:${k}"><div class="tth"><img src="${SVG_URL[k]}" style="width:44px;height:44px"></div></button>`).join('')}</div>
        <div class="lnote">ಇವು ChitraCut ನ ಸ್ವಂತ generic icons (Like, Bell, Verified ✓, Share…). YouTube / Facebook / Instagram ನ ನಿಜವಾದ logo ಗಳು trademark ಆಗಿರುವುದರಿಂದ ಸೇರಿಸಿಲ್ಲ.</div>`;
      return `<div class="tiles small">${EMOJIS.map(e=>`<button class="tile emoji" data-stk="${e}"><div class="tth">${e}</div></button>`).join('')}</div>`;
    case 'effects': {
      const it = visTarget(), th = thumbFor(it), cur = it ? it.fx.type : '';
      return `<div class="ltitle" style="margin-top:0">${it ? 'Selected: '+esc((media(it.mediaId)||{}).name||'') : 'ಮೊದಲು clip select ಮಾಡಿ'}</div>
        <div class="tiles">${FX.map(([k,n])=>`<button class="tile ${cur===k?'on':''}" data-fx="${k}"><div class="tth">${k==='none'?ic('ban'):`<div class="pv fx-${k}" style="background-image:url(${th})"></div>`}</div><span>${n}</span></button>`).join('')}</div>
        <div class="lnote">⚡ Effect ಮೇಲೆ click ಮಾಡಿದರೆ Player ನಲ್ಲಿ ತಕ್ಷಣ preview ಆಗುತ್ತದೆ. Intensity/Speed → ಬಲಗಡೆ Video › Effect.</div>`;
    }
    case 'transitions': {
      const c = transTarget(), i = c ? S.clips.indexOf(c) : -1, cur = c ? c.trans.type : '';
      const ta = i > 0 ? thumbFor(S.clips[i-1]) : PLACEHOLDER, tb = c ? thumbFor(c) : PLACEHOLDER;
      return `<div class="ltitle" style="margin-top:0">${c ? `Clip ${i} → Clip ${i+1}` : 'Transition ಗೆ ಕನಿಷ್ಠ 2 clips ಬೇಕು'}</div>
        <div class="tiles">${TRANS.map(([k,n])=>`<button class="tile ${cur===k?'on':''}" data-tr="${k}"><div class="tth">${k==='none'?ic('ban'):`<div class="tpv t-${k}"><i class="ta" style="background-image:url(${ta})"></i><i class="tb" style="background-image:url(${tb})"></i></div>`}</div><span>${n}</span></button>`).join('')}</div>
        ${c ? '<div class="btns" style="margin-top:12px"><button data-all="trans">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>' : ''}
        <div class="lnote">Timeline ನಲ್ಲಿ ಎರಡು clips ನಡುವಿನ <b>⇄</b> ಗುಂಡಿ ಒತ್ತಿದರೂ transition ಆರಿಸಬಹುದು.</div>`;
    }
    case 'captions':
      if(sub === 'srt') return `<div class="ltitle" style="margin-top:0">SRT subtitle file</div>
        <div class="btns"><button id="cSrtIn">${ic('import')} Import .srt</button><button id="cSrtOut">${ic('export')} Export .srt</button></div>
        <div class="btns"><button id="cDelAll">${ic('trash')} ಎಲ್ಲಾ captions delete</button></div>
        <div class="lnote">YouTube ಗೆ subtitles ಬೇಕಿದ್ದರೆ Export .srt ಬಳಸಿ. Caption text ಅನ್ನು timeline ನಲ್ಲಿ select ಮಾಡಿ ಬದಲಿಸಬಹುದು.</div>`;
      return captionsAuto();
    case 'filters': {
      const it = visTarget(), th = thumbFor(it);
      return `<div class="ltitle" style="margin-top:0">${it ? 'Selected: '+esc((media(it.mediaId)||{}).name||'') : 'ಮೊದಲು clip select ಮಾಡಿ'}</div>
        <div class="tiles">${Object.keys(FILTERS).map(k=>`<button class="tile ${it&&it.filter===k?'on':''}" data-filt="${k}"><div class="tth">${k==='none'?ic('ban'):`<div class="pv" style="background-image:url(${th});filter:${FILTER_CSS[k]}"></div>`}</div><span>${FILTER_NAMES[k]}</span></button>`).join('')}</div>
        ${it && it.filter !== 'none' ? `<div style="margin-top:14px">${sl(it,'Strength','filterAmt',0,100)}</div><div class="btns"><button data-all="filter">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>` : ''}`;
    }
    case 'adjust': {
      const it = visTarget();
      if(!it) return '<div class="lnote">ಮೊದಲು clip select ಮಾಡಿ</div>';
      if(sub === 'adjust') return adjustBody(it);
      return lutBody(it);
    }
  }
  return '';
}
function lutBody(it){
  return `<div class="tiles">${[['','None'],...S.luts.map(l=>[l.id,l.name])].map(([k,n],i)=>`<button class="tile ${it.lut===k?'on':''}" data-set="lut" data-val="${k}"><div class="tth" style="${k?`background:linear-gradient(135deg,hsl(${i*47},55%,45%),hsl(${i*47+60},60%,25%))`:''}">${k?'':ic('ban')}</div><span>${esc(n)}</span></button>`).join('')}</div>
    <div style="height:12px"></div>${it.lut?sl(it,'Intensity','lutAmt',0,100):''}
    <div class="btns"><button data-act="importLut">${ic('import')} Import .cube LUT</button>${!it.type?'<button data-all="lut">ಎಲ್ಲಾ clips ಗೆ</button>':''}</div>`;
}
function adjustBody(it){
  return sec('adj','Basic adjust', sl(it,'Brightness','adj.brightness',-100,100)+sl(it,'Contrast','adj.contrast',-100,100)+sl(it,'Saturation','adj.saturation',-100,100)+
      sl(it,'Temperature','adj.temp',-100,100)+sl(it,'Tint','adj.tint',-100,100)+sl(it,'Fade','adj.fade',0,100), {reset:'resetAdj'}) +
    sec('adj2','Effects', sl(it,'Vignette','adj.vignette',-100,100)+sl(it,'Grain','adj.grain',0,100)+sl(it,'Sharpen','adj.sharpen',0,100)) +
    (!it.type ? '<div class="btns"><button data-all="filter">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>' : '');
}
function addTextPreset(k){
  const p = TEXT_ADD.find(x => x[0] === k); if(!p) return;
  const o = newOverlay('text', deep(p[2])); if(p[2].font) ensureFont(p[2].font);
  addOverlay(o, 'text');
}
function openCaptions(){ S.ltab = 'captions'; S.lsub.captions = 'auto'; renderLeft(); $('#left').scrollIntoView({behavior:'smooth',block:'nearest'}); }

$('#ltabs').addEventListener('click', e => { const b = e.target.closest('[data-ltab]'); if(b){ S.ltab = b.dataset.ltab; renderLeft(); } });
$('#lsub').addEventListener('click', e => { const b = e.target.closest('[data-lsub]'); if(b){ S.lsub[S.ltab] = b.dataset.lsub; renderLeft(); } });
LC.addEventListener('click', async e => {
  const t = e.target.closest('button,[data-l],.mtile'); if(!t) return;
  const d = t.dataset;
  if(d.l === 'import') return $('#fileIn').click();
  if(d.l === 'rec') return openRecord();
  if(d.l === 'audioimp') return $('#audioIn').click();
  if(d.l === 'extract'){ const c = selClip() || clipAt(S.time); if(c && !isImg(c)) extractAudio(c); else alert('Video clip select ಮಾಡಿ'); return; }
  if(t.id === 'cRun'){ S.capLang = $('#cLang').value; S.capModel = $('#cModel').value; runCaptions(); return; }
  if(t.id === 'cSrtIn') return $('#srtIn').click();
  if(t.id === 'cSrtOut') return exportSRT();
  if(t.id === 'cDelAll'){ const n = S.overlays.filter(o=>o.caption).length; if(n && confirm(n+' captions delete ಮಾಡಲೇ?')){ pushUndo(); S.overlays = S.overlays.filter(o=>!o.caption); afterEdit(); } return; }
  if(d.pip){ addPip(media(d.pip)); return; }
  const mid = d.addm || (t.classList.contains('mtile') ? d.mid : null);
  if(mid){
    const m = media(mid); if(!m || m.missing) return;
    if(m.type === 'audio') addAudioAt(m, {start:S.time}); else insertMediaClip(m, S.mainEnd + 1);
    renderLeft(); return;
  }
  if(d.ap){
    const m = media(d.ap);
    if(apEl && apEl.dataset.id === d.ap && !apEl.paused){ apEl.pause(); }
    else { if(apEl) apEl.pause(); apEl = new Audio(m.url); apEl.dataset.id = d.ap; apEl.onended = renderLeft; apEl.play(); }
    renderLeft(); return;
  }
  if(d.sfxcat){ S.sfxCat = d.sfxcat; renderLeft(); return; }
  if(d.sfxp){ previewSFX(d.sfxp); return; }
  if(d.sfx){ t.disabled = true; try{ await addSFX(d.sfx); }catch(err){ alert(err.message); } renderLeft(); return; }
  if(d.addtext){ addTextPreset(d.addtext); return; }
  if(d.tpreset != null){
    const o = selOv(), p = deep(TEXT_PRESETS[+d.tpreset]);
    if(o && o.type === 'text'){ pushUndo(); Object.assign(o, p); renderInspector(); }
    else addOverlay(newOverlay('text', {text:'ನಿಮ್ಮ ಪಠ್ಯ ಇಲ್ಲಿ', ...p}), 'text');
    return;
  }
  if(d.gfxcat){ S.gfxCat = d.gfxcat; renderLeft(); return; }
  if(d.gfx){ addGfx(d.gfx, S.time); return; }
  if(d.stk){ addOverlay(newOverlay('sticker', {text:d.stk, anim:{in:'pop',out:'fade',loop:'none',inDur:.5,outDur:.4}}), 'sticker'); return; }
  if(d.fx){
    const it = visTarget(); if(!it) return alert('ಮೊದಲು clip select ಮಾಡಿ');
    pushUndo(); it.fx.type = d.fx; S.sel = it.id; S.rt[kindOf(it)] = 'video'; S.rs.video = 'effect';
    renderTimeline(); renderInspector();
    if(d.fx !== 'none'){ const st = itemStart(it); previewPlay(clamp(S.time, st, st + Math.max(0, itemDur(it) - 2)), 2); }
    return;
  }
  if(d.tr){
    const c = transTarget(); if(!c) return alert('Transition ಗೆ ಕನಿಷ್ಠ 2 clips ಬೇಕು');
    pushUndo(); c.trans.type = d.tr; S.sel = c.id; S.rt[kindOf(c)] = 'trans'; afterEdit();
    if(d.tr !== 'none'){ const dd = derived[c.id]; previewPlay(Math.max(0, dd.start - .8), dd.td + 1.6); }
    return;
  }
  if(d.filt){
    const it = visTarget(); if(!it) return alert('ಮೊದಲು clip select ಮಾಡಿ');
    pushUndo(); it.filter = d.filt; S.sel = it.id; renderTimeline(); renderInspector(); return;
  }
  const it = visTarget();
  if(doClick(t, it)) return;
});
LC.addEventListener('input', e => { if(e.target.id === 'cLang' || e.target.id === 'cModel') return; onParamInput(e, visTarget()); });
LC.addEventListener('change', e => {
  if(e.target.id === 'cLang') S.capLang = e.target.value;
  else if(e.target.id === 'cModel') S.capModel = e.target.value;
  else { editing = false; renderTimeline(); }
});
LC.addEventListener('dragstart', e => {
  const g = e.target.closest('[data-gfx]');
  if(g){ e.dataTransfer.setData('text/plain', 'ccgfx:' + g.dataset.gfx); e.dataTransfer.effectAllowed = 'copy'; TL.classList.add('dragging'); return; }
  const t = e.target.closest('.mtile'); if(!t) return;
  e.dataTransfer.setData('text/plain', 'ccmedia:' + t.dataset.mid); e.dataTransfer.effectAllowed = 'copy';
  TL.classList.add('dragging');
});
LC.addEventListener('dragend', () => { TL.classList.remove('dragging'); setZone(null); });

/* =====================================================================
   RIGHT INSPECTOR
   ===================================================================== */
const RT = {
  clip:[['video','Video'],['audio','Audio'],['speed','Speed'],['anim','Animation'],['trans','Transition'],['adjust','Adjust']],
  clipimg:[['video','Video'],['speed','Duration'],['anim','Animation'],['trans','Transition'],['adjust','Adjust']],
  ovvideo:[['video','Video'],['audio','Audio'],['speed','Speed'],['anim','Animation'],['track','Tracking'],['adjust','Adjust']],
  ovimage:[['video','Image'],['anim','Animation'],['track','Tracking'],['adjust','Adjust']],
  gfx:[['gfx','Graphic'],['anim','Animation'],['track','Tracking']],
  text:[['text','Text'],['anim','Animation'],['track','Tracking']], sticker:[['sticker','Sticker'],['anim','Animation'],['track','Tracking']], audio:[['audio','Audio']]
};
function rsubFor(tab, kind){
  switch(tab){
    case 'video': return [['basic','Basic'],['rmbg','Remove BG'],['mask','Mask'],['retouch','Retouch'],['effect','Effect']];
    case 'audio': return kind === 'ovvideo' ? null : [['basic','Basic'],['voice','Voice changer']];
    case 'speed': return kind === 'clip' ? [['normal','Normal'],['curve','Curve']] : null;
    case 'anim': return [['in','In'],['out','Out'],['combo',(kind==='clip'||kind==='clipimg')?'Combo':'Loop']];
    case 'adjust': return [['basic','Adjust'],['filter','Filter'],['lut','LUT']];
    case 'text': return [['basic','Basic'],['style','Style']];
  }
  return null;
}
function renderInspector(){
  const it = selItem(), kind = kindOf(it);
  if(!it){
    $('#rtabs').innerHTML = ''; $('#rsub').innerHTML = '';
    IB.innerHTML = `<div class="empty">${ic('cursor')}Timeline ನಲ್ಲಿ clip, text ಅಥವಾ audio select ಮಾಡಿ.<br>ಅದರ settings ಇಲ್ಲಿ ಕಾಣುತ್ತವೆ.</div>`;
    refreshLeftLive(); return;
  }
  let tabs = RT[kind];
  if((kind === 'clip' || kind === 'clipimg') && S.clips.indexOf(it) === 0) tabs = tabs.filter(t => t[0] !== 'trans');
  let tab = S.rt[kind]; if(!tabs.some(t => t[0] === tab)) tab = S.rt[kind] = tabs[0][0];
  $('#rtabs').innerHTML = tabs.map(([k,n])=>`<button data-rtab="${k}" class="${k===tab?'on':''}">${n}</button>`).join('');
  const subs = rsubFor(tab, kind); let sub = null;
  if(subs){
    sub = S.rs[tab]; if(!subs.some(s => s[0] === sub)) sub = S.rs[tab] = subs[0][0];
    $('#rsub').innerHTML = `<div class="seg">${subs.map(([k,n])=>`<button data-rsub="${k}" class="${k===sub?'on':''}">${n}</button>`).join('')}</div>`;
  } else $('#rsub').innerHTML = '';
  IB.innerHTML = inspBody(it, kind, tab, sub); fillRanges(IB); updKfBtn(); refreshLeftLive();
}
const KF_NOTE = '<div class="note">◆ <b>Keyframe:</b> playhead ಇಡಿ → ◆ ಒತ್ತಿ → playhead ಮುಂದೆ ಸರಿಸಿ → ಮೌಲ್ಯ ಬದಲಿಸಿ. ಎರಡರ ನಡುವೆ ತಾನಾಗಿ animation ಆಗುತ್ತದೆ.</div>';
function transformSec(it){
  const ov = !!it.type, med = isMediaOv(it);
  let b = ov ? sl(it,'Size','size',5,med?300:400)+sl(it,'Position X','x',-20,120,.5)+sl(it,'Position Y','y',-20,120,.5)
             : sl(it,'Scale','tf.scale',10,400)+sl(it,'Position X','tf.x',-cv.width,cv.width)+sl(it,'Position Y','tf.y',-cv.height,cv.height);
  b += sl(it,'Rotate',ov?'rot':'tf.rot',-180,180);
  const B = (a,i,t) => `<button data-act="${a}" title="${t}">${ic(i)}</button>`;
  b += `<div class="alignbar">${ov?B('center','center','Center'):B('fit','fit','Fit')}${(!ov||med)?B(ov?'fillv':'fill','fill','Fill / full screen')+B('flip','flip','Mirror'):''}${B('rot90','rotate','Rotate 90°')}${ov?B('up','up','Layer ಮೇಲೆ')+B('down','down','Layer ಕೆಳಗೆ'):''}</div>`;
  return sec('tf','Transform',b,{reset:'resetTf',kf:true});
}
function chromaBody(it){
  const k = it.ck;
  return `<div class="crow"><span>Chroma key</span><input type="checkbox" data-p="ck.on" ${k.on?'checked':''}></div>
    ${k.on ? `<div class="crow"><span>Key color</span><input type="color" data-p="ck.color" value="${k.color}"></div>
    <div class="btns"><button data-act="ckPick" class="${S.pick?'primary':''}">🎯 Pick color</button><button data-act="ckAuto">Auto</button><button data-act="ckGreen">Green</button><button data-act="ckBlue">Blue</button></div>
    ${sl(it,'Intensity','ck.sim',0,100)}${sl(it,'Edge smooth','ck.smooth',0,100)}${sl(it,'Spill remove','ck.spill',0,100)}` : ''}
    <div class="note">🟩 Green / Blue screen ಬಣ್ಣ ತೆಗೆಯಲು. ಸರಿಯಾಗದಿದ್ದರೆ 🎯 ಒತ್ತಿ Player ನಲ್ಲಿ ಹಸಿರಿನ ಮೇಲೆ click ಮಾಡಿ.</div>`;
}
function rmbgBody(it){
  const st = !it.rmbg ? '' : SEG ? '<div class="segstat ok">✓ AI model ready</div>' : segErr ? `<div class="segstat err">✗ ${esc(segErr)} — internet ಬೇಕು</div>` : '<div class="segstat">⏳ AI model load ಆಗುತ್ತಿದೆ… (ಮೊದಲ ಬಾರಿ ಮಾತ್ರ)</div>';
  return sec('rm','Auto removal', `<div class="crow"><span>ವ್ಯಕ್ತಿ ಬಿಟ್ಟು ಹಿನ್ನೆಲೆ ತೆಗೆಯಿರಿ</span><input type="checkbox" data-p="rmbg" ${it.rmbg?'checked':''}></div>${st}
      ${it.rmbg?`<div class="crow"><span>ಉಲ್ಟಾ ಆದರೆ (Invert)</span><input type="checkbox" data-p="rmbgInv" ${it.rmbgInv?'checked':''}></div>`:''}
      <div class="note">🤖 AI ನಿಮ್ಮ browser ನಲ್ಲೇ ವ್ಯಕ್ತಿಯನ್ನು ಗುರುತಿಸುತ್ತದೆ (server ಇಲ್ಲ). ${it.type?'ಕೆಳಗಿನ main video ಹಿನ್ನೆಲೆಯಾಗಿ ಕಾಣುತ್ತದೆ.':'ಹಿನ್ನೆಲೆಯಲ್ಲಿ Player ನ Background (Black / White / Blur) ಕಾಣುತ್ತದೆ — <b>Blur</b> ಆರಿಸಿದರೆ portrait effect. ಬೇರೆ ಹಿನ್ನೆಲೆ ಬೇಕಿದ್ದರೆ ಈ clip ಅನ್ನು overlay ಗೆ ಎಳೆಯಿರಿ.'}</div>`)
    + sec('ck','Chroma key', chromaBody(it));
}
function maskBody(it){
  const m = it.mask, t = m.type;
  let h = `<div class="ltitle" style="margin:10px 0 8px">${t==='none' ? '＋ Add mask — ಆಕಾರ ಆರಿಸಿ' : 'Mask shape'}</div>
    <div class="tiles" style="grid-template-columns:repeat(4,1fr)">${MASKS.map(([k,n])=>`<button class="vtile ${t===k?'on':''}" style="height:52px" data-set="mask.type" data-val="${k}">${k==='none'?'✕ Remove':n}</button>`).join('')}</div><div style="height:12px"></div>`;
  if(t !== 'none'){
    let b = sl(it,'Position X','mask.x',-60,60,.5)+sl(it,'Position Y','mask.y',-60,60,.5);
    if(t === 'mirror') b += sl(it,'Width','mask.h',1,200);
    else if(t === 'circle' || t === 'rect') b += sl(it,'Width','mask.w',1,300)+sl(it,'Height','mask.h',1,300);
    else if(t !== 'linear') b += sl(it,'Size','mask.h',1,300);
    b += sl(it,'Rotate','mask.rot',-180,180)+sl(it,'Feather','mask.feather',0,100);
    if(t === 'rect') b += sl(it,'Round corners','mask.round',0,100);
    b += `<div class="crow"><span>Invert</span><input type="checkbox" data-p="mask.invert" ${m.invert?'checked':''}></div>`;
    h += `<div class="note">🖐 ಈ tab ತೆರೆದಿರುವಾಗ Player ನಲ್ಲಿ drag ಮಾಡಿದರೆ <b>mask ಮಾತ್ರ</b> ಸರಿಯುತ್ತದೆ (video ಅಲ್ಲ). Mouse wheel / ಎರಡು ಬೆರಳು = mask size.</div>` + sec('mk','Mask settings', b, {reset:'resetMask'});
  } else h += '<div class="note">Mask ಆರಿಸಿದರೆ ಆ ಆಕಾರದ ಒಳಗಿನ ಭಾಗ ಮಾತ್ರ ಕಾಣುತ್ತದೆ. ನಂತರ Player ನಲ್ಲಿ mask ಅನ್ನು ಎಳೆದು ಸರಿಸಬಹುದು.</div>';
  return h;
}
function fxBody(it){
  const th = thumbFor(it), f = it.fx;
  return `<div class="tiles" style="margin-top:8px">${FX.map(([k,n])=>`<button class="tile ${f.type===k?'on':''}" data-set="fx.type" data-val="${k}" data-prev="fx"><div class="tth">${k==='none'?ic('ban'):`<div class="pv fx-${k}" style="background-image:url(${th})"></div>`}</div><span>${n}</span></button>`).join('')}</div>
    ${f.type!=='none' ? `<div style="height:12px"></div>${sl(it,'Intensity','fx.amount',0,100)}${sl(it,'Speed','fx.speed',0,100)}` : ''}
    ${!it.type ? '<div class="btns"><button data-all="fx">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>' : ''}`;
}
const VOICE_TILES = [['orig','Original'],['michog','Mic Hog'],['echo','Echo'],['bighouse','Big House'],['megaphone','Megaphone'],['telephone','Telephone'],['robot','Robot'],['lofi','Lo-Fi'],['deep','Deep'],['radio','Radio']];
function curVoice(it){ const a = it.audio; if(a.voice !== 'none') return a.voice; if(a.reverb > 0 && !a.echo) return 'bighouse'; if(a.echo > 0 && !a.reverb) return 'echo'; return (a.echo||a.reverb) ? '' : 'orig'; }
function audioBody(it, kind, sub){
  if(sub === 'voice'){
    const cv_ = curVoice(it);
    return `<div style="height:8px"></div><div class="vtiles">${VOICE_TILES.map(([k,n])=>`<button class="vtile ${cv_===k?'on':''}" data-voice="${k}">${n}</button>`).join('')}</div>
      ${sec('vfx','Fine tune', sl(it,'Echo','audio.echo',0,100)+sl(it,'Reverb','audio.reverb',0,100))}
      <div class="note">🎧 Voice ಮೇಲೆ click ಮಾಡಿದರೆ 3 ಸೆಕೆಂಡ್ preview ಕೇಳಿಸುತ್ತದೆ.</div>
      ${!it.type?'<div class="btns"><button data-all="audio">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>':''}`;
  }
  let h = '';
  if(kind === 'audio'){ const m = media(it.mediaId) || {}; h += `<div class="note">${{voice:'🎙 Voice-over',extract:'🔊 Extracted audio',sfx:'🔔 Sound effect'}[it.kind]||'🎵 Music'} · <b>${esc(m.name||'')}</b></div>`; }
  let vb = sl(it,'Volume','volume',0,200);
  if(kind !== 'ovvideo') vb += sl(it,'Fade in','fadeIn',0,5,.1)+sl(it,'Fade out','fadeOut',0,5,.1);
  if(kind === 'audio') vb += sl(it,'Duration','dur',.2,Math.max(.2,((media(it.mediaId)||{duration:1}).duration-it.in)/it.speed),.1);
  h += sec('vol','Basic', vb);
  if(kind !== 'ovvideo'){
    const a = it.audio, chk = (p,t,d,on) => `<div class="chk"><label><input type="checkbox" data-p="${p}" ${on?'checked':''}><b>${t}</b></label><div class="cdesc">${d}</div></div>`;
    const dnOn = kind === 'audio' && !!it.origMediaId;
    h += sec('vt','Voice tools',
      chk('audio.norm','Normalize loudness', `Volume ಅನ್ನು ಸರಿಯಾದ ಮಟ್ಟಕ್ಕೆ ತರುತ್ತದೆ${a.norm&&it.normGain?` · ×${it.normGain.toFixed(2)}`:''}`, a.norm) +
      chk('audio.enhance','Enhance voice','ಧ್ವನಿ ಸ್ಪಷ್ಟ ಮತ್ತು ಜೋರು (EQ + compressor)', a.enhance) +
      `<div class="chk"><label><input type="checkbox" data-dn="1" ${dnOn?'checked':''}><b>Reduce noise</b></label><select data-dnlvl style="margin-left:auto;padding:2px 4px">${['Low','Medium','High'].map((n,i)=>`<option value="${i}" ${(S.dnLvl??1)===i?'selected':''}>${n}</option>`).join('')}</select>
        <div class="cdesc">Fan, hiss, traffic ಮುಂತಾದ ಹಿನ್ನೆಲೆ ಶಬ್ದ ತೆಗೆಯುತ್ತದೆ${kind!=='audio'?' — ಸ್ವಚ್ಛ audio ಹೊಸ audio track ಆಗಿ ಬರುತ್ತದೆ':''}</div><div class="prog" id="dnProg" style="display:none;margin:6px 0 0"><div></div></div></div>` +
      chk('audio.isolate','Isolate voice','ಮಾತಿನ frequency ಮಾತ್ರ ಉಳಿಸುತ್ತದೆ (basic)', a.isolate));
    h += sec('eq','Equalizer', sl(it,'Bass boost','audio.bass',-15,15)+sl(it,'Treble','audio.treble',-15,15));
  } else h += '<div class="note">PiP video ಗೆ Voice tools ಬೇಕಿದ್ದರೆ ಅದನ್ನು main track ಗೆ ಎಳೆಯಿರಿ ಅಥವಾ Extract audio ಮಾಡಿ.</div>';
  const B = (a,i,t) => `<button data-act="${a}">${ic(i)} ${t}</button>`;
  h += `<div class="btns">${kind==='clip'?B('extract','wave','Extract audio'):''}${B('cap','captions','Auto captions')}${kind==='audio'?B('dup','copy','Duplicate')+B('del','trash','Delete'):''}</div>`;
  if(kind === 'clip') h += '<div class="btns"><button data-all="audio">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>';
  return h;
}
function animBody(it, kind, sub){
  const clipLike = !it.type, txt = it.type === 'text' || it.type === 'sticker';
  const opts = sub === 'in' ? (clipLike ? ANIM_IN : OV_IN) : sub === 'out' ? (clipLike ? ANIM_OUT : OV_OUT) : (clipLike ? ANIM_LOOP : OV_LOOP);
  const path = sub === 'in' ? 'anim.in' : sub === 'out' ? 'anim.out' : 'anim.loop', cur = getP(it, path), th = thumbFor(it);
  const face = k => txt ? `<div class="pv txt a-${k} ${sub==='out'?'rev':''}">${it.type==='sticker'?it.text:'Aa'}</div>` : `<div class="pv a-${k} ${sub==='out'?'rev':''}" style="background-image:url(${th})"></div>`;
  let h = `<div class="tiles" style="margin-top:8px">${opts.map(([k,n])=>`<button class="tile ${cur===k?'on':''}" data-set="${path}" data-val="${k}" data-prev="${sub}"><div class="tth">${k==='none'?ic('ban'):face(k)}</div><span>${n}</span></button>`).join('')}</div><div style="height:12px"></div>`;
  if(sub === 'in' && cur !== 'none') h += sl(it,'Duration','anim.inDur',.1,3,.1);
  if(sub === 'out' && cur !== 'none') h += sl(it,'Duration','anim.outDur',.1,3,.1);
  h += `<div class="note">▶ Tile ಮೇಲೆ mouse ಇಟ್ಟರೆ preview; click ಮಾಡಿದರೆ Player ನಲ್ಲಿ ನೋಡಬಹುದು.</div>`;
  h += clipLike ? '<div class="btns"><button data-all="anim">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>' : '<div class="btns"><button data-all="ovanim">ಇದೇ ತರಹದ ಎಲ್ಲಕ್ಕೂ ಹಾಕಿ</button></div>';
  return h;
}
const CW = 300, CH = 150, cY = v => CH/2 - Math.log10(clamp(v,.1,10))*CH/2*.86, cV = y => Math.pow(10, (CH/2 - y)/(CH/2*.86));
function curveEditor(c){
  const pts = c.curve; let d = '';
  for(let i=0;i<=90;i++){ const p = i/90; d += (i?'L':'M') + (p*CW).toFixed(1) + ',' + cY(curveAt(c,p)).toFixed(1); }
  const dd = derived[c.id], ph = dd && S.time >= dd.start && S.time <= dd.start+dd.dur ? (localToSrc(c, S.time-dd.start)-c.in)/(c.out-c.in) : -1;
  return `<svg id="curveEd" viewBox="0 0 ${CW} ${CH}" style="width:100%;background:#111113;border-radius:8px;display:block;touch-action:none;cursor:crosshair">
    ${[10,5,2,1,.5,.2,.1].map(v=>`<line x1="0" x2="${CW}" y1="${cY(v)}" y2="${cY(v)}" stroke="${v===1?'#555':'#26262b'}" ${v===1?'stroke-dasharray="4 4"':''}/><text x="4" y="${cY(v)-2}" fill="#666" font-size="8">${v}x</text>`).join('')}
    ${ph>=0?`<line x1="${ph*CW}" x2="${ph*CW}" y1="0" y2="${CH}" stroke="#fff" stroke-width="1"/>`:''}
    <path d="${d}" fill="none" stroke="#20d5ec" stroke-width="2.2"/>
    ${pts.map((p,i)=>`<circle data-ci="${i}" cx="${p[0]*CW}" cy="${cY(p[1])}" r="${curveSel===i?7:5.5}" fill="${curveSel===i?'#20d5ec':'#fff'}" stroke="#111" stroke-width="2" style="cursor:grab"/>`).join('')}
  </svg>`;
}
function refreshCurve(c){
  layout(); renderTimeline();
  const w = $('#curveWrap'); if(w) w.innerHTML = curveEditor(c);
  const di = $('#durInfo'); if(di) di.textContent = fmtTC(c.out-c.in) + ' → ' + fmtTC(derived[c.id].dur);
  const cv2 = $('#curveVal'), sp = c.curve[curveSel]; if(cv2) cv2.textContent = sp ? sp[1].toFixed(2)+'x' : '—';
}
let cdragC = null;
function curvePt(e){ const r = $('#curveEd').getBoundingClientRect(); return {x:clamp((e.clientX-r.left)/r.width,0,1), y:(e.clientY-r.top)/r.height*CH}; }
IB.addEventListener('pointerdown', e => {
  const svg = e.target.closest('#curveEd'); if(!svg) return; const c = selClip(); if(!c || !c.curve) return;
  const ci = e.target.dataset ? e.target.dataset.ci : null;
  if(ci == null) return;
  pushUndo(); curveSel = +ci; cdragC = c; e.preventDefault(); refreshCurve(c);
  const btn = IB.querySelector('[data-act="cDel"]'); if(btn) btn.disabled = !(curveSel>0 && curveSel<c.curve.length-1);
});
window.addEventListener('pointermove', e => {
  if(!cdragC) return; const c = cdragC, p = curvePt(e), pts = c.curve, i = curveSel;
  if(i > 0 && i < pts.length-1) pts[i][0] = clamp(p.x, pts[i-1][0]+.02, pts[i+1][0]-.02);
  pts[i][1] = clamp(cV(p.y), .1, 10); c.curveName = 'custom'; refreshCurve(c);
});
window.addEventListener('pointerup', () => { if(cdragC){ cdragC = null; if(!S.playing) seek(Math.min(S.time,S.total)); } });
IB.addEventListener('dblclick', e => {
  if(!e.target.closest('#curveEd')) return; const c = selClip(); if(!c || !c.curve) return;
  const p = curvePt(e); addCurvePoint(c, p.x, clamp(cV(p.y),.1,10));
});
function addCurvePoint(c, x, v){
  pushUndo(); const pts = c.curve; if(pts.some(p => Math.abs(p[0]-x) < .03)) return;
  pts.push([x, v ?? curveAt(c,x)]); pts.sort((a,b)=>a[0]-b[0]); curveSel = pts.findIndex(p => p[0] === x); c.curveName = 'custom'; renderInspector(); refreshCurve(c);
}
function speedBody(it, kind, sub){
  if(kind === 'clipimg') return sec('du','Duration', sl(it,'Duration','__imgdur',.3,30,.1)+'<div class="note">Photo ಎಷ್ಟು ಸೆಕೆಂಡ್ ಕಾಣಬೇಕು</div>');
  if(kind === 'ovvideo') return sec('sp','Speed', sl(it,'Speed','speed',.25,4,.05)+sl(it,'Duration','dur',.3,Math.max(.3,(media(it.mediaId).duration-it.in)/it.speed),.1));
  if(sub === 'curve'){
    let h = `<div class="tiles" style="grid-template-columns:repeat(4,1fr);margin-top:8px">${CURVE_OPTS.map(([k,n])=>`<button class="vtile ${it.curveName===k?'on':''}" style="height:48px" data-act="curve" data-val="${k}">${n}</button>`).join('')}</div><div style="height:12px"></div>`;
    if(it.curve){
      if(typeof it.curve[0] === 'number') it.curve = curvePairs(it.curve);
      const sp = it.curve[curveSel];
      h += `<div id="curveWrap">${curveEditor(it)}</div>
        <div class="btns"><button data-act="cAdd">${ic('plus')} Add point</button><button data-act="cDel" ${curveSel>0&&curveSel<it.curve.length-1?'':'disabled'}>${ic('trash')} Delete point</button><button data-act="curve" data-val="custom">${ic('reset')} Reset</button></div>
        <div class="crow"><span>Selected point</span><b id="curveVal" style="color:var(--text)">${sp?sp[1].toFixed(2)+'x':'—'}</b></div>
        <div class="crow"><span>Duration</span><b id="durInfo" style="color:var(--text)">${fmtTC(it.out-it.in)} → ${fmtTC(derived[it.id].dur)}</b></div>`;
    }
    return h + '<div class="note">◉ Point ಗಳನ್ನು ಮೇಲೆ (ವೇಗ) / ಕೆಳಗೆ (slow) ಎಳೆಯಿರಿ · <b>+ Add point</b> ಅಥವಾ ಖಾಲಿ ಜಾಗದಲ್ಲಿ double-click ಮಾಡಿ ಹೊಸ point ಸೇರಿಸಿ.</div>';
  }
  return sec('sp','Speed', sl(it,'Speed','speed',.1,10,.1)+`<div class="crow"><span>Duration</span><b id="durInfo" style="color:var(--text)">${fmtTC(it.out-it.in)} → ${fmtTC(derived[it.id].dur)}</b></div>`);
}
function transBody(it){
  const i = S.clips.indexOf(it), ta = thumbFor(S.clips[i-1]), tb = thumbFor(it);
  return `<div class="tiles" style="margin-top:10px">${TRANS.map(([k,n])=>`<button class="tile ${it.trans.type===k?'on':''}" data-set="trans.type" data-val="${k}" data-prev="trans"><div class="tth">${k==='none'?ic('ban'):`<div class="tpv t-${k}"><i class="ta" style="background-image:url(${ta})"></i><i class="tb" style="background-image:url(${tb})"></i></div>`}</div><span>${n}</span></button>`).join('')}</div><div style="height:12px"></div>
    ${it.trans.type!=='none'?sl(it,'Duration','trans.dur',.1,2,.1):''}
    <div class="btns"><button data-all="trans">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>`;
}
function filterBody(it){
  const th = thumbFor(it);
  return `<div class="tiles" style="margin-top:10px">${Object.keys(FILTERS).map(k=>`<button class="tile ${it.filter===k?'on':''}" data-set="filter" data-val="${k}"><div class="tth">${k==='none'?ic('ban'):`<div class="pv" style="background-image:url(${th});filter:${FILTER_CSS[k]}"></div>`}</div><span>${FILTER_NAMES[k]}</span></button>`).join('')}</div><div style="height:12px"></div>
    ${it.filter!=='none'?sl(it,'Strength','filterAmt',0,100):''}${!it.type?'<div class="btns"><button data-all="filter">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>':''}`;
}
function trackBody(it){
  const on = S.trackEdit === it.id;
  let h = `<div class="tiles" style="grid-template-columns:repeat(3,1fr);margin-top:10px">
    <button class="tile ${!on?'on':''}" data-trk="none"><div class="tth">${ic('ban')}</div><span>None</span></button>
    <button class="tile ${on?'on':''}" data-trk="motion"><div class="tth">${ic('target')}</div><span>Motion tracking</span></button></div><div style="height:10px"></div>`;
  if(on) h += `<div class="note">① Player ನಲ್ಲಿರುವ <b style="color:var(--acc)">ನೀಲಿ ಚೌಕ</b>ವನ್ನು ಹಿಂಬಾಲಿಸಬೇಕಾದ ವಸ್ತುವಿನ (ಮುಖ, ಚೆಂಡು…) ಮೇಲೆ ಇಡಿ — ಕೆಳಗಿನ ಮೂಲೆ ಎಳೆದು size ಬದಲಿಸಿ.<br>② <b>Start tracking</b> ಒತ್ತಿ. ಈ item ಆ ವಸ್ತುವನ್ನು ಹಿಂಬಾಲಿಸುತ್ತದೆ.</div>
    <div class="prog"><div id="trkBar" style="width:${trackRun?Math.round(trackRun.p*100):0}%"></div></div><div id="trkStat" style="color:var(--mute);min-height:18px">${trackRun?'Tracking…':''}</div>
    <div class="btns">${trackRun?'<button data-trk="cancel">Cancel</button>':`<button class="primary" data-trk="start">${ic('target')} Start tracking</button>`}</div>`;
  if(it.tracked) h += `<div class="note">✓ Tracking ಆಗಿದೆ (${(it.kf||[]).length} keyframes). ಮತ್ತೆ ಮಾಡಬಹುದು ಅಥವಾ <button data-trk="clear" style="padding:2px 8px">Clear</button></div>`;
  return h;
}
function opacitySec(it){ return sec('op', it.type ? 'Opacity & Blend' : 'Opacity', sl(it,'Opacity','opacity',0,100)+(it.type?blendRow(it):'')); }
function inspBody(it, kind, tab, sub){
  switch(tab){
    case 'video':
      if(sub === 'rmbg') return rmbgBody(it);
      if(sub === 'mask') return maskBody(it);
      if(sub === 'retouch') return sec('rt','Skin', sl(it,'Smooth','rt.smooth',0,100)+sl(it,'Whitening','rt.bright',0,100)+sl(it,'Clear','rt.clear',0,100)+
        '<div class="note">💆 ಚರ್ಮದ ಬಣ್ಣವನ್ನು ಗುರುತಿಸಿ ಮೃದು / ಬೆಳ್ಳಗೆ ಮಾಡುತ್ತದೆ. 30–60 ಸಾಕು — ಹೆಚ್ಚಾದರೆ ಕೃತಕವಾಗಿ ಕಾಣುತ್ತದೆ.</div>', {reset:'resetRt'})
        + (!it.type ? '<div class="btns"><button data-all="rt">ಎಲ್ಲಾ clips ಗೆ ಹಾಕಿ</button></div>' : '');
      if(sub === 'effect') return fxBody(it);
      return transformSec(it) + opacitySec(it) +
        (it.type ? sec('tm','Timing', sl(it,'Start','start',0,Math.max(10,S.total),.05)+(kind==='ovimage'?sl(it,'Duration','dur',.3,60,.1):'')) +
                   '<div class="btns">'+[['dup','copy','Duplicate'],['del','trash','Delete']].map(([a,i,t])=>`<button data-act="${a}">${ic(i)} ${t}</button>`).join('')+'</div>'
                 : sec('cv','Canvas', `<div class="crow"><span>Background</span><select data-g="bg">${[['black','Black'],['blur','Blur'],['white','White']].map(([k,n])=>`<option value="${k}" ${S.bg===k?'selected':''}>${n}</option>`).join('')}</select></div>
                     <div class="crow"><span>Ratio</span><select data-g="ratio">${['9:16','16:9','1:1','4:5','4:3','21:9','orig'].map(k=>`<option value="${k}" ${S.ratio===k?'selected':''}>${k==='orig'?'Original':k}</option>`).join('')}</select></div>`)) + KF_NOTE;
    case 'audio': return audioBody(it, kind, sub);
    case 'speed': return speedBody(it, kind, sub);
    case 'anim': return animBody(it, kind, sub);
    case 'trans': return transBody(it);
    case 'gfx': { const g = GFXMAP[it.gfx] || {}; let b = '';
      if(g.text != null) b += `<div class="crow"><span>Text</span></div><input type="text" data-p="text" value="${esc(it.text||'')}" style="width:100%;margin:-6px 0 10px">`;
      if(g.text2 != null) b += `<div class="crow"><span>Text 2</span></div><input type="text" data-p="text2" value="${esc(it.text2||'')}" style="width:100%;margin:-6px 0 10px">`;
      b += colorRow(it,'Color','color',true) + sl(it,'Animation speed','gspeed',.25,3,.05);
      return sec('gx', g.name || 'Graphic', b) + (g.full ? '<div class="note">ಇದು full-screen graphic. Opacity / Blend ಬದಲಿಸಿ main video ಜೊತೆ ಸೇರಿಸಬಹುದು.</div>' : transformSec(it)) + opacitySec(it) +
        sec('tm','Timing', sl(it,'Start','start',0,Math.max(10,S.total),.05)+sl(it,'Duration','dur',.3,60,.1)) +
        `<div class="btns"><button data-act="dup">${ic('copy')} Duplicate</button><button data-act="del">${ic('trash')} Delete</button></div>`; }
    case 'track': return trackBody(it);
    case 'adjust': return sub === 'filter' ? filterBody(it) : sub === 'lut' ? '<div style="height:10px"></div>'+lutBody(it) : adjustBody(it);
    case 'text':
      if(sub === 'style') return `<div style="height:10px"></div><div class="tiles tstyle">${TEXT_PRESETS.map((p,i)=>`<button class="tile" data-preset="${i}"><div class="tth" style="${presetCss(p)}">Aa</div></button>`).join('')}</div><div style="height:6px"></div>` +
        sec('ol','Outline', colorRow(it,'Color','stroke')+sl(it,'Width','strokeW',0,20)) +
        sec('bx','Background', `<div class="crow"><span>Background box</span><input type="checkbox" data-p="bgOn" ${it.bgOn?'checked':''}></div>`+colorRow(it,'Color','bgColor')+sl(it,'Opacity','bgAlpha',0,100)) +
        sec('sh','Shadow / Glow', colorRow(it,'Color','shadowColor')+sl(it,'Amount','shadow',0,100)) +
        (it.caption ? '<div class="btns"><button data-act="capall">💬 ಈ style ಎಲ್ಲಾ captions ಗೆ</button></div>' : '');
      return sec('tc','Text', `<textarea data-p="text" rows="3" placeholder="ಇಲ್ಲಿ ಬರೆಯಿರಿ…">${esc(it.text)}</textarea>`) +
        sec('fn','Font', `<div class="fonts">${FONTS.map(([f,n])=>`<button class="${it.font===f?'on':''}" data-set="font" data-val="${f}" style="font-family:'${f}'">${n}</button>`).join('')}</div>
          <div class="tbtns"><button class="${it.bold?'on':''}" data-toggle="bold"><b>B</b></button><button class="${it.italic?'on':''}" data-toggle="italic"><i>I</i></button>${[['left','⯇≡'],['center','≡'],['right','≡⯈']].map(([k,n])=>`<button class="${it.align===k?'on':''}" data-set="align" data-val="${k}">${n}</button>`).join('')}</div>
          ${colorRow(it,'Color','color',true)}`) +
        transformSec(it) + opacitySec(it) + sec('tm','Timing', sl(it,'Start','start',0,Math.max(10,S.total),.05)+sl(it,'Duration','dur',.3,60,.1)) +
        `<div class="btns">${it.caption?'<button data-act="capall">💬 ಈ style ಎಲ್ಲಾ captions ಗೆ</button>':''}<button data-act="dup">${ic('copy')} Duplicate</button><button data-act="del">${ic('trash')} Delete</button></div>`;
    case 'sticker':
      return `<div style="height:10px"></div><div class="tiles small">${[...STICKER_SETS.social,...STICKER_SETS.badges].map(k=>`<button class="tile emoji ${it.text==='svg:'+k?'on':''}" data-set="text" data-val="svg:${k}"><div class="tth"><img src="${SVG_URL[k]}" style="width:36px;height:36px"></div></button>`).join('')}${EMOJIS.map(e=>`<button class="tile emoji ${it.text===e?'on':''}" data-set="text" data-val="${e}"><div class="tth">${e}</div></button>`).join('')}</div><div style="height:6px"></div>` +
        transformSec(it) + opacitySec(it) + sec('tm','Timing', sl(it,'Start','start',0,Math.max(10,S.total),.05)+sl(it,'Duration','dur',.3,60,.1)) +
        `<div class="btns"><button data-act="dup">${ic('copy')} Duplicate</button><button data-act="del">${ic('trash')} Delete</button></div>`;
  }
  return '';
}
function updKfBtn(){
  const it = selItem(), on = !!(it && atKf(it));
  IB.querySelectorAll('[data-kf="toggle"]').forEach(b => b.classList.toggle('on', on));
  const t = $('#tKf'); if(t) t.classList.toggle('on', on);
}
function syncInsp(){
  if(S.playing || editing || cdrag || S.time === lastSyncT) return; lastSyncT = S.time;
  const it = selItem(); if(!it) return;
  if(it.kf && it.kf.length){
    const L = kfList(it);
    IB.querySelectorAll('input[data-p]').forEach(el => {
      const p = el.dataset.p; if(!L.includes(p)) return; const v = ev(it,p);
      el.value = el.type === 'number' ? fmtV(v) : v; if(el.type === 'range') setFill(el);
    });
  }
  updKfBtn();
}
function applyChange(p, it){
  it = it || selItem(); if(!it) return;
  if(it.type === 'audio'){
    if(p.startsWith('audio')) rebuildAudChain(it);
    if(p === 'dur'){ it.dur = Math.min(it.dur, (media(it.mediaId).duration - it.in)/it.speed); layout(); renderTimeline(); }
    return;
  }
  if(it.type){
    if(p === 'dur' || p === 'speed' || p === 'start'){
      if(it.type === 'video') it.dur = Math.min(it.dur, (media(it.mediaId).duration - it.in)/it.speed);
      layout(); renderTimeline();
    }
    return;
  }
  if(p === 'speed' || p === '__imgdur' || p.startsWith('curve') || p.startsWith('trans')){
    layout(); renderTimeline();
    const di = $('#durInfo'); if(di) di.textContent = fmtTC(it.out-it.in) + ' → ' + fmtTC(derived[it.id].dur);
    const sv = $('#curveSvg'); if(sv) sv.outerHTML = curveSvg(it);
    if(!S.playing) seek(Math.min(S.time, S.total));
  } else if(p.startsWith('audio')) rebuildChain(it);
}
function onParamInput(e, it){
  const el = e.target;
  if(el.dataset.g){ if(el.dataset.g === 'bg'){ S.bg = el.value; $('#selBg').value = S.bg; } else { S.ratio = el.value; $('#selRatio').value = S.ratio; setCanvas(); } updatePInfo(); return; }
  const p = el.dataset.p; if(!p || !it) return;
  let val = el.type === 'range' || el.type === 'number' ? parseFloat(el.value) : el.type === 'checkbox' ? el.checked : el.value;
  if(el.type === 'number' && isNaN(val)) return;
  if(!editing){ pushUndo(); editing = true; }
  if(p === '__imgdur') it.out = it.in + Math.max(.2, val);
  else if(kfList(it).includes(p)) setVal(it, p, val); else setP(it, p, val);
  if(p.startsWith('curve.')) it.curveName = 'custom';
  if(p === 'ck.on' && val) autoKey(it);
  if(p === 'rmbg' && val) loadSeg().catch(()=>{});
  const row = el.closest('.prow');
  if(row) row.querySelectorAll('[data-p]').forEach(x => { if(x !== el) x.value = x.type === 'number' ? fmtV(val) : val; if(x.type === 'range') setFill(x); });
  applyChange(p, it); updKfBtn();
  if(el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'number'){ editing = false; if(['ck.on','rmbg','rmbgInv','bgOn'].includes(p)) renderInspector(); renderTimeline(); }
}
function animPreview(it, kind){
  const st = itemStart(it), du = itemDur(it);
  if(kind === 'in') previewPlay(st, Math.min(du, it.anim.inDur + .8));
  else if(kind === 'out') previewPlay(Math.max(st, st + du - it.anim.outDur - .6), it.anim.outDur + .6);
  else if(kind === 'trans'){ const d = derived[it.id]; previewPlay(Math.max(0, d.start - .8), d.td + 1.6); }
  else if(kind === 'fx') previewPlay(clamp(S.time, st, st + Math.max(0, du - 2)), 2);
  else previewPlay(st, Math.min(du, 2.5));
}
function applyVoice(it, k){
  pushUndo(); const a = it.audio;
  a.echo = 0; a.reverb = 0; a.voice = 'none';
  if(k === 'echo') a.echo = 55; else if(k === 'bighouse') a.reverb = 65; else if(k !== 'orig') a.voice = k;
  if(it.type === 'audio') rebuildAudChain(it); else rebuildChain(it);
  renderInspector(); renderTimeline();
  const st = itemStart(it), du = itemDur(it);
  previewPlay(S.time >= st && S.time < st + du - .5 ? S.time : st, Math.min(3, du));
}
function applyAll(k, it, btn){
  if(k === 'ovanim'){ pushUndo(); for(const x of S.overlays) if(x !== it && x.type === it.type) x.anim = deep(it.anim); btn.textContent = '✓ Applied'; return; }
  const c = it && !it.type ? it : (k === 'trans' ? transTarget() : selClip()); if(!c) return;
  pushUndo();
  const keys = {filter:['filter','filterAmt','adj'],lut:['lut','lutAmt'],audio:['audio','volume','fadeIn','fadeOut'],anim:['anim'],trans:['trans'],fx:['fx'],rt:['rt']}[k];
  for(const o of S.clips) if(o !== c) for(const key of keys) o[key] = deep(c[key]);
  if(k === 'trans') S.clips[0].trans = {type:'none',dur:.6};
  if(k === 'audio') S.clips.forEach(rebuildChain);
  layout(); renderTimeline(); if(k === 'trans') seek(Math.min(S.time, S.total));
  btn.textContent = '✓ Applied to all';
}
function doAct(a, it, btn){
  switch(a){
    case 'importLut': $('#lutIn').click(); return;
    case 'cAdd': { const dd = derived[it.id]; let x = dd && S.time > dd.start && S.time < dd.start+dd.dur ? (localToSrc(it,S.time-dd.start)-it.in)/(it.out-it.in) : -1;
      if(x < .03 || x > .97){ let g = 0; for(let i=0;i<it.curve.length-1;i++){ const w = it.curve[i+1][0]-it.curve[i][0]; if(w > g){ g = w; x = it.curve[i][0]+w/2; } } }
      addCurvePoint(it, x); return; }
    case 'cDel': if(curveSel > 0 && curveSel < it.curve.length-1){ pushUndo(); it.curve.splice(curveSel,1); curveSel = -1; it.curveName = 'custom'; renderInspector(); refreshCurve(it); } return;
    case 'ckPick': setPick(!S.pick); renderInspector(); return;
    case 'extract': extractAudio(it); return;
    case 'cap': openCaptions(); return;
    case 'del': del(); return;
    case 'dup': dup(); return;
    case 'flip': flipSel(); renderTimeline(); return;
    case 'rot90': rotateSel(); return;
    case 'up': case 'down': case 'center': case 'fillv': case 'capall': ovAction(a); return;
  }
  pushUndo();
  const m = media(it.mediaId);
  switch(a){
    case 'resetTf':
      if(it.type){ setVal(it,'size',ovDefaults(it.type).size); setVal(it,'x',50); setVal(it,'y',50); setVal(it,'rot',0); it.flip = false; }
      else { setVal(it,'tf.scale',100); setVal(it,'tf.x',0); setVal(it,'tf.y',0); setVal(it,'tf.rot',0); it.tf.flip = false; }
      break;
    case 'fit': setVal(it,'tf.scale',100); setVal(it,'tf.x',0); setVal(it,'tf.y',0); break;
    case 'fill': { const W=cv.width, H=cv.height; setVal(it,'tf.scale',Math.round(Math.max(W/m.w,H/m.h)/Math.min(W/m.w,H/m.h)*100)); setVal(it,'tf.x',0); setVal(it,'tf.y',0); break; }
    case 'resetAdj': for(const k in it.adj) it.adj[k] = 0; break;
    case 'resetMask': it.mask = {...defMask(), type:it.mask.type}; break;
    case 'resetRt': it.rt = {smooth:0,bright:0,clear:0}; break;
    case 'ckAuto': autoKey(it); it.ck.on = true; break;
    case 'ckGreen': it.ck.color = '#00ff00'; it.ck.on = true; break;
    case 'ckBlue': it.ck.color = '#0047bb'; it.ck.on = true; break;
    case 'curve': {
      const v = btn.dataset.val; it.curveName = v;
      it.curve = v === 'none' ? null : v === 'custom' ? [[0,1],[.25,1],[.5,1],[.75,1],[1,1]] : curvePairs(CURVES[v]); curveSel = -1;
      layout(); seek(Math.min(S.time, S.total)); break;
    }
  }
  renderInspector(); renderTimeline();
}
function doClick(t, it){
  const d = t.dataset;
  if(d.tog){ S.closed[d.tog] = !S.closed[d.tog]; t.closest('.sec').classList.toggle('closed'); return true; }
  if(!it) return false;
  if(d.kf){ if(d.kf === 'toggle') toggleKf(); else jumpKf(d.kf === 'next' ? 1 : -1); return true; }
  if(d.voice){ applyVoice(it, d.voice); return true; }
  if(d.set){
    pushUndo(); setP(it, d.set, d.val);
    if(d.set === 'font') ensureFont(d.val);
    if(d.set === 'fx.type' || d.set.startsWith('trans')) layout();
    renderInspector(); renderTimeline(); applyChange(d.set, it);
    if(d.prev && d.val !== 'none') animPreview(it, d.prev);
    return true;
  }
  if(d.toggle){ pushUndo(); it[d.toggle] = !it[d.toggle]; renderInspector(); return true; }
  if(d.preset != null){ pushUndo(); Object.assign(it, deep(TEXT_PRESETS[+d.preset])); renderInspector(); return true; }
  if(d.act){ doAct(d.act, it, t); return true; }
  if(d.all){ applyAll(d.all, it, t); return true; }
  return false;
}
$('#rtabs').addEventListener('click', e => { const b = e.target.closest('[data-rtab]'); if(!b) return; S.rt[kindOf(selItem())] = b.dataset.rtab; renderInspector(); });
$('#rsub').addEventListener('click', e => { const b = e.target.closest('[data-rsub]'); if(!b) return; const tab = $('#rtabs .on'); if(tab) S.rs[tab.dataset.rtab] = b.dataset.rsub; renderInspector(); });
IB.addEventListener('input', e => {
  const el = e.target, it = selItem();
  if(el.dataset.dnlvl != null){ S.dnLvl = +el.value; return; }
  if(el.dataset.dn){ doDenoise(it, el.checked); return; }
  onParamInput(e, it);
  if(el.dataset.p === 'audio.norm' && el.checked && it){ computeNorm(it).then(() => { renderInspector(); }).catch(err => alert(err.message)); }
});
async function doDenoise(it, on){
  if(!it) return;
  if(!on){ if(it.type === 'audio' && it.origMediaId){ pushUndo(); it.mediaId = it.origMediaId; it.in = it.origIn; delete it.origMediaId; delete it.origIn; afterEdit(); } return; }
  const pr = $('#dnProg'), bar = pr && pr.firstElementChild; if(pr) pr.style.display = 'block';
  IB.querySelectorAll('[data-dn]').forEach(x => x.disabled = true);
  try{
    const nm = await reduceNoise(it, S.dnLvl ?? 1, p => { if(bar) bar.style.width = (p*100) + '%'; });
    pushUndo();
    if(it.type === 'audio'){ it.origMediaId = it.mediaId; it.origIn = it.in; it.mediaId = nm.id; it.in = 0; }
    else {
      const st = it.type ? it.start : derived[it.id].start, a = newAudioItem(nm, {kind:'extract', start:st, in:0, dur:nm.duration/(it.speed||1), speed:it.speed||1, volume:it.volume, audio:deep(it.audio||defAudio())});
      a.origMediaId = it.mediaId; a.origIn = it.in; it.volume = 0; S.audios.push(a); S.sel = a.id;
    }
    afterEdit(); renderLeft();
  }catch(err){ alert('Noise reduction ಆಗಲಿಲ್ಲ: ' + err.message); renderInspector(); }
}
IB.addEventListener('change', e => { editing = false; if(e.target.type === 'range') e.target.blur(); renderTimeline(); });
IB.addEventListener('click', e => {
  const t = e.target.closest('button'); if(!t) return; const it = selItem();
  if(t.dataset.trk){ trackAction(t.dataset.trk, it); return; }
  doClick(t, it);
});
function defaultTrackBox(o){
  const g = geo[o.id], W = out.width, H = out.height, s = Math.min(W,H)*.18;
  const cx = g ? g.cx : ev(o,'x')/100*W, cy = g ? g.cy : ev(o,'y')/100*H;
  return {x:cx-s/2, y:cy-s/2, w:s, h:s};
}
async function trackAction(a, o){
  if(!o) return;
  if(a === 'none'){ S.trackEdit = null; renderInspector(); return; }
  if(a === 'motion'){ if(!S.clips.length) return alert('Main track ನಲ್ಲಿ video ಬೇಕು'); seek(o.start + .01); S.trackEdit = o.id; S.trackBox = defaultTrackBox(o); renderInspector(); return; }
  if(a === 'clear'){ pushUndo(); o.kf = []; o.tracked = false; renderInspector(); renderTimeline(); return; }
  if(a === 'cancel'){ if(trackRun) trackRun.flag = true; return; }
  if(a === 'start'){
    pause(); trackRun = {flag:false, p:0}; renderInspector();
    try{
      const pts = await runTracking(o, S.trackBox, p => { trackRun.p = p; const b = $('#trkBar'); if(b) b.style.width = (p*100)+'%'; const st = $('#trkStat'); if(st) st.textContent = `Tracking… ${Math.round(p*100)}%`; }, trackRun);
      if(!trackRun.flag){ applyTracking(o, pts, S.trackBox); S.trackEdit = null; }
    }catch(err){ alert('Tracking ಆಗಲಿಲ್ಲ: ' + err.message); }
    trackRun = null; renderInspector(); renderTimeline(); seek(o.start + .01);
  }
}
function onSegReady(){ if(IB.querySelector('[data-p="rmbg"]')) renderInspector(); }

/* =====================================================================
   TIMELINE
   ===================================================================== */
function lanes(items){
  const lane = {}, ends = [];
  for(const o of [...items].sort((a,b)=>a.start-b.start)){
    let l = ends.findIndex(e => e <= o.start + 1e-6); if(l < 0){ l = ends.length; ends.push(0); }
    ends[l] = o.start + o.dur; lane[o.id] = l;
  }
  return {lane, n:ends.length};
}
function kfDots(it){
  if(!it.kf || !it.kf.length) return '';
  return it.kf.map(k => {
    let x;
    if(it.type){ if(k.t < 0 || k.t > it.dur) return ''; x = k.t*S.pps; }
    else { if(k.t < it.in-1e-6 || k.t > it.out+1e-6) return ''; x = srcToLocal(it,k.t)*S.pps; }
    return `<i class="kfd" style="left:${x}px"></i>`;
  }).join('');
}
function waveStyle(m, inP, speed){
  if(!m || !m.wave) return '';
  return `background-image:url(${m.wave});background-size:${m.duration*S.pps/speed}px 100%;background-position:${-inP*S.pps/speed}px 0;`;
}
function ovItemHTML(o){
  const m = media(o.mediaId), nm = esc(m ? m.name : '');
  const label = o.type==='gfx' ? '✨ '+esc((GFXMAP[o.gfx]||{}).name||'Graphic') : o.type==='text' ? (o.caption?'💬 ':'T  ')+esc((o.text||'').replace(/\n/g,' ')) : o.type==='sticker' ? (o.text.startsWith('svg:')?'⭐':o.text)+' Sticker' : o.type==='video' ? '🎞 '+nm : '🖼 '+nm;
  const fx = [o.mask&&o.mask.type!=='none'?'◐':'', o.ck&&o.ck.on?'🟩':'', o.rmbg?'✂':'', o.blend&&o.blend!=='source-over'?'⧉':'', o.fx&&o.fx.type!=='none'&&isMediaOv(o)?'⚡':''].join('');
  const bg = o.type==='video' && m && m.thumb ? `background-image:linear-gradient(#0008,#0008),url(${m.thumb});` : '';
  return `<div class="it ${o.type} ${o.caption?'cap':''} ${S.sel===o.id?'sel':''}" data-oid="${o.id}" style="left:${o.start*S.pps}px;width:${Math.max(14,o.dur*S.pps-2)}px;${bg}">${fx} ${label}${kfDots(o)}<div class="h l" data-h="l"></div><div class="h r" data-h="r"></div></div>`;
}
function filmstrip(c, m, d){
  const TH = 36, wpx = Math.max(6, d.dur*S.pps - 2);
  if(!m.strip || m.type !== 'video') return `<div class="thumbs" style="background-image:url(${m.thumb||''})"></div>`;
  const tw = Math.max(14, Math.round(TH*m.w/m.h)), n = Math.min(120, Math.ceil(wpx/tw)); let h = '';
  for(let j=0;j<n;j++){ const lt = (j*tw + tw/2)/S.pps, src = localToSrc(c, Math.min(lt, d.dur)), idx = clamp(Math.floor(src/m.duration*m.stripN), 0, m.stripN-1);
    h += `<i style="left:${j*tw}px;width:${tw}px;background-position:${-idx*tw}px 0"></i>`; }
  return `<div class="thumbs strip" style="--strip:url(${m.strip});--sw:${m.stripN*tw}px">${h}</div>`;
}
function clipHTML(c, i){
  const d = derived[c.id]; if(!d) return '';
  const m = media(c.mediaId) || {}, pps = S.pps;
  const badges = [m.type==='image'?'🖼':'', (c.speed!==1||c.curve)?'⏱':'', c.fx&&c.fx.type!=='none'?'⚡':'', c.rmbg?'✂':'', c.filter!=='none'?'🎨':'', c.lut?'LUT':'', c.mask.type!=='none'?'◐':'', c.volume===0&&m.type==='video'?'🔇':'', (c.audio.voice!=='none'||c.audio.echo||c.audio.reverb)?'🎤':'', (c.anim.in!=='none'||c.anim.out!=='none'||c.anim.loop!=='none')?'✨':''].filter(Boolean).join(' ');
  const hasT = c.trans && c.trans.type !== 'none';
  const tm = i > 0 ? `<div class="tmark ${hasT?'on':''}" data-tid="${c.id}" title="Transition" style="left:${(d.start+d.td/2)*pps-10}px">⇄</div>` : '';
  const wv = m.wave && c.volume > 0 && !c.curve && !S.mainMute ? `<div class="wave" style="${waveStyle(m,c.in,c.speed)}"></div>` : '';
  return `<div class="clip ${S.sel===c.id?'sel':''} ${S.mainHide?'hidden':''}" data-id="${c.id}" style="left:${d.start*pps}px;width:${Math.max(6,d.dur*pps-2)}px">
    <div class="cn">${badges} ${esc(m.name||'missing')} &nbsp;${fmtTC(d.dur)}</div>${filmstrip(c,m,d)}${wv}${kfDots(c)}
    <div class="h l" data-h="l"></div><div class="h r" data-h="r"></div></div>${tm}`;
}
function renderTimeline(){
  const pps = S.pps;
  const w = Math.max(S.total*pps + 400, TL.clientWidth - HEADW);
  $('#tlInner').style.width = (HEADW + w) + 'px';
  const step = pps>=80?1:pps>=30?2:pps>=12?5:10, minor = step/(step===2?4:5);
  let r = '';
  for(let t=0; t*pps<w; t+=step) r += `<div class="tick" style="left:${t*pps}px">${fmtT(t)}</div>`;
  for(let t=minor; t*pps<w; t+=minor) if(Math.abs(t/step - Math.round(t/step)) > 1e-6) r += `<div class="tick m" style="left:${t*pps}px"></div>`;
  const L = lanes(S.overlays), A = lanes(S.audios);
  let h = `<div class="trow ruler"><div class="thead"></div><div class="tbody" id="rulerBody">${r}</div></div>`;
  h += `<div class="trow drop ovz" data-zone="overlay"><div class="thead"></div><div class="tbody">⬆ Overlay: video / photo ಇಲ್ಲಿ ಹಾಕಿ (video ಮೇಲೆ video)</div></div>`;
  for(let l = L.n-1; l >= 0; l--){
    const items = S.overlays.filter(o => L.lane[o.id] === l);
    h += `<div class="trow ovrow" data-zone="overlay"><div class="thead">${ic('layers')}<span class="tl">Overlay ${l+1}</span></div><div class="tbody">${items.map(ovItemHTML).join('')}</div></div>`;
  }
  h += `<div class="trow main" data-zone="main"><div class="thead"><button class="ib ${S.mainHide?'off':''}" data-th="hide" title="Main track ತೋರಿಸು / ಮರೆಮಾಡು">${ic(S.mainHide?'eyeoff':'eye')}</button><button class="ib ${S.mainMute?'off':''}" data-th="mute" title="Main track mute">${ic(S.mainMute?'volx':'vol')}</button><span class="tl">Main</span></div>
    <div class="tbody" id="track">${S.clips.length ? S.clips.map(clipHTML).join('') : '<div style="padding:24px 14px;color:var(--mute)">🎬 Video / photo ಅನ್ನು ಇಲ್ಲಿಗೆ ಎಳೆದು ಹಾಕಿ</div>'}</div></div>`;
  for(let l = 0; l < A.n; l++){
    const items = S.audios.filter(a => A.lane[a.id] === l);
    h += `<div class="trow aurow" data-zone="audio"><div class="thead">${ic('music2')}<span class="tl">Audio ${l+1}</span></div><div class="tbody">${items.map(a => {
      const m = media(a.mediaId), icon = {voice:'🎙',extract:'🔊',sfx:'🔔'}[a.kind] || '🎵';
      const fx = (a.audio.voice!=='none'||a.audio.echo||a.audio.reverb||a.audio.bass||a.audio.treble) ? ' 🎛' : '';
      return `<div class="it audio ${a.kind} ${S.sel===a.id?'sel':''}" data-oid="${a.id}" style="left:${a.start*pps}px;width:${Math.max(14,a.dur*pps-2)}px;${waveStyle(m,a.in,a.speed)}">${icon} ${esc(m?m.name:'')}${fx}<div class="h l" data-h="l"></div><div class="h r" data-h="r"></div></div>`;
    }).join('')}</div></div>`;
  }
  h += `<div class="trow drop auz" data-zone="audio"><div class="thead"></div><div class="tbody">🎵 Audio: music / sound ಇಲ್ಲಿ ಹಾಕಿ</div></div>`;
  $('#tlRows').innerHTML = h;
  updatePH();
}
function updatePH(){
  const x = S.time*S.pps; $('#ph').style.left = (HEADW + x) + 'px';
  $('#tcCur').textContent = fmtF(S.time); $('#tcTot').textContent = fmtF(S.total);
  if(S.playing){ const vis = TL.clientWidth - HEADW; if(x > TL.scrollLeft + vis - 40 || x < TL.scrollLeft) TL.scrollLeft = x - 40; }
}
const tAt = x => { const rb = $('#rulerBody'); return rb ? (x - rb.getBoundingClientRect().left)/S.pps : 0; };
function zoneAt(y){ const m = $('.trow.main'); if(!m) return 'main'; const r = m.getBoundingClientRect(); return y < r.top ? 'overlay' : y <= r.bottom ? 'main' : 'audio'; }
function setZone(z){ TL.classList.remove('z-overlay','z-main','z-audio'); if(z) TL.classList.add('z-' + z); }

TL.addEventListener('pointerdown', e => {
  if(exporting || recState || e.button > 0) return;
  const th = e.target.closest('[data-th]');
  if(th){ if(th.dataset.th === 'hide') S.mainHide = !S.mainHide; else { S.mainMute = !S.mainMute; } renderTimeline(); return; }
  if(e.target.closest('.thead')) return;
  const tm = e.target.closest('.tmark');
  if(tm){ S.sel = tm.dataset.tid; S.rt[kindOf(selItem())] = 'trans'; renderTimeline(); renderInspector(); return; }
  const itEl = e.target.closest('.it'), h = e.target.closest('.h'), cl = e.target.closest('.clip');
  if(itEl){
    const o = findFree(itEl.dataset.oid); select(o.id);
    drag = h ? {type:'ovtrim', side:h.dataset.h, o, x0:e.clientX, start0:o.start, dur0:o.dur, in0:o.in, undo:false}
             : {type:'ovmove', o, x0:e.clientX, y0:e.clientY, start0:o.start, undo:false};
    TL.setPointerCapture(e.pointerId); e.preventDefault(); return;
  }
  if(h && cl){
    const c = S.clips.find(x => x.id === cl.dataset.id); S.sel = c.id; pushUndo();
    drag = {type:'trim', side:h.dataset.h, c, x0:e.clientX, in0:c.in, out0:c.out};
    TL.setPointerCapture(e.pointerId); e.preventDefault(); return;
  }
  if(cl){
    const c = S.clips.find(x => x.id === cl.dataset.id); select(c.id);
    drag = {type:'clipmaybe', c, x0:e.clientX, y0:e.clientY, start0:derived[c.id].start};
    TL.setPointerCapture(e.pointerId); return;
  }
  drag = {type:'seek'}; seek(tAt(e.clientX));
  TL.setPointerCapture(e.pointerId); e.preventDefault();
});
TL.addEventListener('pointermove', e => {
  if(!drag) return;
  const pps = S.pps;
  if(drag.type === 'trim'){
    const c = drag.c, ds = (e.clientX - drag.x0)/pps*c.speed, m = media(c.mediaId);
    if(drag.side === 'l') c.in = clamp(drag.in0 + ds, 0, c.out - .2); else c.out = clamp(drag.out0 + ds, c.in + .2, m.type==='image' ? 3600 : m.duration);
    layout(); renderTimeline();
  } else if(drag.type === 'clipmaybe' || drag.type === 'clipdrag'){
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if(drag.type === 'clipmaybe'){ if(Math.hypot(dx,dy) < 6) return; drag.type = 'clipdrag'; TL.classList.add('dragging'); }
    const el = TL.querySelector(`.clip[data-id="${drag.c.id}"]`);
    if(el){ el.classList.add('dragging'); el.style.transform = `translate(${dx}px,${dy}px)`; }
    setZone(zoneAt(e.clientY) === 'audio' ? null : zoneAt(e.clientY));
  } else if(drag.type === 'ovmove' || drag.type === 'ovtrim'){
    const dt = (e.clientX - drag.x0)/pps, o = drag.o;
    if(!drag.undo){ if(Math.abs(e.clientX - drag.x0) < 3 && Math.abs(e.clientY - (drag.y0||e.clientY)) < 3) return; pushUndo(); drag.undo = true; }
    const timed = o.type === 'video' || o.type === 'audio', mdur = timed ? media(o.mediaId).duration : Infinity;
    if(drag.type === 'ovmove'){
      o.start = Math.max(0, drag.start0 + dt);
      setZone(isMediaOv(o) && zoneAt(e.clientY) === 'main' ? 'main' : null);
    } else if(drag.side === 'l'){
      const minS = timed ? Math.max(0, drag.start0 - drag.in0/o.speed) : 0;
      const ns = clamp(drag.start0 + dt, minS, drag.start0 + drag.dur0 - .2), sh = ns - drag.start0;
      o.dur = drag.dur0 - sh; o.start = ns;
      if(timed) o.in = drag.in0 + sh*o.speed;
      if(o.kf) o.kf.forEach(k => { if(k._t0 === undefined) k._t0 = k.t; k.t = k._t0 - sh; });
    } else o.dur = clamp(drag.dur0 + dt, .2, (mdur - o.in)/o.speed);
    layout(); renderTimeline();
  } else if(drag.type === 'seek' && e.buttons) seek(tAt(e.clientX));
});
function endDrag(e){
  const d = drag; drag = null; if(!d) return;
  TL.classList.remove('dragging'); setZone(null);
  if(d.type === 'trim') afterEdit();
  else if(d.type === 'clipdrag'){
    const z = zoneAt(e.clientY), t = d.start0 + (e.clientX - d.x0)/S.pps;
    if(z === 'overlay') clipToOverlay(d.c, t);
    else if(z === 'main'){ moveClipTo(d.c, t + derived[d.c.id].dur/2); renderTimeline(); }
    else renderTimeline();
  }
  else if(d.type === 'ovmove' || d.type === 'ovtrim'){
    if(d.o.kf) d.o.kf.forEach(k => delete k._t0);
    if(d.type === 'ovmove' && isMediaOv(d.o) && e && zoneAt(e.clientY) === 'main'){ d.o.start = d.start0; overlayToClip(d.o, tAt(e.clientX)); return; }
    if(d.undo){ renderInspector(); seek(S.time); }
  }
}
TL.addEventListener('pointerup', endDrag);
TL.addEventListener('pointercancel', e => endDrag(e));
// drag & drop from library / OS
TL.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); TL.classList.add('dragging'); setZone(zoneAt(e.clientY)); });
TL.addEventListener('dragleave', e => { if(!TL.contains(e.relatedTarget)){ setZone(null); TL.classList.remove('dragging'); } });
TL.addEventListener('drop', async e => {
  e.preventDefault(); e.stopPropagation();
  const z = zoneAt(e.clientY), t = Math.max(0, tAt(e.clientX)); setZone(null); TL.classList.remove('dragging');
  const d = e.dataTransfer.getData('text/plain');
  if(d && d.startsWith('ccmedia:')){ dropMedia(media(d.slice(8)), z, t); renderLeft(); return; }
  if(d && d.startsWith('ccgfx:')){ addGfx(d.slice(6), t); return; }
  if(!S.project) return;
  for(const f of e.dataTransfer.files){
    let m = null;
    try{ m = f.type.startsWith('video/') ? await addVideoMedia(f) : f.type.startsWith('image/') ? await addImageMedia(f) : f.type.startsWith('audio/') ? await addAudioMedia(f) : null; }
    catch(err){ alert(f.name + ': ' + err.message); }
    if(m) dropMedia(m, z, t);
  }
  renderLeft();
});
function dropMedia(m, z, t){
  if(!m || m.missing) return;
  if(m.type === 'audio' || z === 'audio'){ addAudioAt(m, {start:t, kind:m.type === 'audio' ? 'music' : 'extract'}); return; }
  if(z === 'overlay'){ S.time = t; addPip(m); return; }
  insertMediaClip(m, t);
}

/* ---------------- TOOLBAR ---------------- */
function renderTools(){
  const b = (id,i,t,cls='') => `<button id="${id}" class="ib ${cls}" title="${t}">${ic(i)}</button>`;
  $('#tools').innerHTML = b('tSel','cursor','Select','on') + '<span class="sep"></span>' + b('tUndo','undo','Undo (Ctrl+Z)') + b('tRedo','redo','Redo (Ctrl+Y)') + '<span class="sep"></span>' +
    b('tSplit','split','Split (S / Ctrl+B)') + b('tDelL','delL','Delete left (Q)') + b('tDelR','delR','Delete right (W)') + b('tDel','trash','Delete (Del)') + b('tDup','copy','Duplicate (Ctrl+D)') + '<span class="sep"></span>' +
    b('tFlip','flip','Mirror') + b('tRot','rotate','Rotate 90°') + b('tKf','kf','Keyframe (K)') + '<span class="sp"></span>' +
    b('tRec','mic','Voice-over record') + '<span class="sep"></span>' + b('tZo','zout','Zoom out') + `<input type="range" id="zoom" min="8" max="200" value="${S.pps}">` + b('tZi','zin','Zoom in');
  fillRanges($('#tools'));
}
$('#tools').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b || exporting) return;
  ({tUndo:undo, tRedo:redo, tSplit:split, tDelL:()=>trimSide('left'), tDelR:()=>trimSide('right'), tDel:del, tDup:dup, tFlip:flipSel, tRot:rotateSel, tKf:toggleKf, tRec:openRecord,
    tZo:()=>setZoom(S.pps/1.4), tZi:()=>setZoom(S.pps*1.4)}[b.id] || (()=>{}))();
});
$('#tools').addEventListener('input', e => { if(e.target.id === 'zoom') setZoom(+e.target.value); });
function setZoom(v){ S.pps = clamp(v, 8, 200); const z = $('#zoom'); if(z){ z.value = S.pps; setFill(z); } renderTimeline(); }

/* =====================================================================
   HOME (CapCut-style start page)
   ===================================================================== */
function hideHome(){ $('#home').style.display = 'none'; }
async function showHome(){
  pause(); await saveProject();
  let list = [], store = '';
  if(DB){ try{ list = (await idbAll('projects')).sort((a,b)=>b.updated-a.updated); }catch(e){} }
  try{ const est = await navigator.storage.estimate(); store = `💾 ${(est.usage/1048576).toFixed(0)} MB used · ${(est.quota/1073741824).toFixed(1)} GB available on this device`; }catch(e){}
  const Q = [['captions','captions','Auto captions','ಮಾತನ್ನು ತಾನಾಗಿ text ಮಾಡಿ'],['rmbg','wand','Remove background','AI ಮೂಲಕ ಹಿನ್ನೆಲೆ ತೆಗೆಯಿರಿ'],['voice','mic','Voice-over','ನಿಮ್ಮ ಧ್ವನಿ record ಮಾಡಿ'],['sfx','wave','Sound effects','Free sound effects']];
  $('#homeBox').innerHTML = `<aside class="hside"><div class="hlogo"><span class="logo"><i>${ic('play')}</i></span>ChitraCut</div>
      <button class="hnav on">${ic('home')} Home</button><button class="hnav" data-hscroll="1">${ic('folder')} Projects</button>
      ${S.project ? `<button class="hnav" id="hBack">${ic('edit')} Editor ಗೆ ಹಿಂದಿರುಗಿ</button>` : ''}
      <div class="hsp"></div><div class="hpro">ChitraCut<small>Free professional video editor · ಕನ್ನಡದಲ್ಲಿ</small></div></aside>
    <main class="hmain">
      <button class="hbanner" data-new="1"><span class="hplus">${ic('plus')}</span>Create project</button>
      <div class="hquick">${Q.map(([k,i,t,d])=>`<button class="hq" data-quick="${k}"><span class="qi">${ic(i)}</span><b>${t}</b><span>${d}</span></button>`).join('')}</div>
      <h3 id="hProj">Projects ${list.length?`<span style="color:var(--mute);font-weight:400">(${list.length})</span>`:''}</h3>
      ${!DB ? '<div class="note">⚠ ಈ browser ನಲ್ಲಿ project save ಆಗುವುದಿಲ್ಲ (private mode?). Edit ಮಾಡಿ export ಮಾಡಬಹುದು.</div>' : ''}
      ${list.length ? `<div class="plist">${list.map(p=>`<div class="pcard" data-open="${p.id}"><div class="pt" style="${p.thumb?`background-image:url(${p.thumb})`:''}">${p.thumb?'':ic('film')}</div><div class="pn">${esc(p.name)}</div>
          <div class="pd"><span>${new Date(p.updated).toLocaleDateString()} ${new Date(p.updated).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span><span class="pb"><button class="ib sm" data-ren="${p.id}" title="Rename">${ic('edit')}</button><button class="ib sm" data-delp="${p.id}" title="Delete">${ic('trash')}</button></span></div></div>`).join('')}</div>`
        : '<div class="hempty">ಇನ್ನೂ project ಇಲ್ಲ — ಮೇಲಿನ <b>Create project</b> ಒತ್ತಿ ಶುರು ಮಾಡಿ</div>'}
      <div class="hstore">${store}</div></main>`;
  $('#home').style.display = 'flex';
}
$('#home').addEventListener('click', async e => {
  const t = e.target;
  if(t.closest('#hBack')){ hideHome(); return; }
  if(t.closest('[data-hscroll]')){ $('#hProj').scrollIntoView({behavior:'smooth'}); return; }
  const ren = t.closest('[data-ren]'), dp = t.closest('[data-delp]');
  if(ren){
    const rec = await idbGet('projects', ren.dataset.ren), nm = prompt('Project name', rec.name);
    if(nm && nm.trim()){ rec.name = nm.trim(); await idbPut('projects', rec); if(S.project && S.project.id === rec.id){ S.project.name = rec.name; updateProjName(); } showHome(); }
    return;
  }
  if(dp){
    if(!confirm('ಈ project ಶಾಶ್ವತವಾಗಿ delete ಮಾಡಲೇ?')) return;
    const id = dp.dataset.delp; await idbDel('projects', id); await idbDelBlobs(id);
    if(S.project && S.project.id === id){ resetState(); S.project = null; afterEdit(); renderLeft(); }
    showHome(); return;
  }
  const q = t.closest('[data-quick]');
  if(q){
    await newProject();
    const k = q.dataset.quick;
    if(k === 'captions'){ S.ltab = 'captions'; S.lsub.captions = 'auto'; }
    if(k === 'rmbg'){ S.ltab = 'media'; S.rt.clip = 'video'; S.rs.video = 'rmbg'; }
    if(k === 'voice'){ S.ltab = 'audio'; S.lsub.audio = 'voice'; }
    if(k === 'sfx'){ S.ltab = 'audio'; S.lsub.audio = 'sfx'; }
    renderLeft(); if(k === 'rmbg' || k === 'captions') $('#fileIn').click();
    return;
  }
  if(t.closest('[data-new]')){ await newProject(); S.ltab = 'media'; renderLeft(); return; }
  const op = t.closest('[data-open]'); if(op) openProject(op.dataset.open);
});
$('#projName').onclick = () => { if(!S.project) return; const nm = prompt('Project name', S.project.name); if(nm && nm.trim()){ S.project.name = nm.trim(); updateProjName(); saveProject(true); } };
function syncSelects(){ $('#selRatio').value = S.ratio; $('#selBg').value = S.bg; updatePInfo(); }
function updatePInfo(){ $('#pInfo').textContent = `${S.ratio==='orig'?'Original':S.ratio} · ${out.width}×${out.height}`; }

/* ---------------- EXPORT DIALOG ---------------- */
function openExport(){
  if(!S.total) return alert('ಮೊದಲು media ಸೇರಿಸಿ');
  pause();
  showModal(`<h3 style="margin-top:0">${ic('export')} Export</h3>
    <div class="crow"><span>Name</span><b style="color:var(--text)">${esc(S.project?S.project.name:'ChitraCut')}</b></div>
    <div class="crow"><span>Duration</span><b style="color:var(--text)">${fmtTC(S.total)}</b></div>
    <div style="color:var(--mute);margin-top:6px">Resolution</div>
    <div class="qopts">${[[480,'480p','ಚಿಕ್ಕ file'],[720,'720p','Recommended'],[1080,'1080p','Full HD']].map(([q,n,d])=>`<button data-q="${q}" class="${S.quality===q?'on':''}">${n}<small>${d}</small></button>`).join('')}</div>
    <div class="note">Chrome ನಲ್ಲಿ MP4 · 30 fps. Export real-time ನಲ್ಲಿ ಆಗುತ್ತದೆ (${fmtT(S.total)}) — ಆ ಸಮಯದಲ್ಲಿ ಈ tab ತೆರೆದಿಡಿ.</div>
    <div class="btns" style="justify-content:flex-end"><button id="xCancel">Cancel</button><button class="primary" id="xGo">${ic('export')} Export</button></div>`);
}
$('#modal').addEventListener('click', e => {
  const q = e.target.closest('[data-q]');
  if(q){ S.quality = +q.dataset.q; $('#modalBox').querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b === q)); return; }
  if(e.target.closest('#xCancel')) hideModal();
  if(e.target.closest('#xGo')){ hideModal(); setCanvas(); updatePInfo(); exportVideo(); }
});

/* =====================================================================
   WIRING
   ===================================================================== */
$('#btnHome').innerHTML = ic('home'); $('#logoIc').innerHTML = ic('play');
$('#btnExport').innerHTML = ic('export') + '<span>Export</span>'; $('#btnFull').innerHTML = ic('full');
$('#btnHome').onclick = showHome;
$('#btnExport').onclick = openExport;
$('#btnPlay').onclick = () => S.playing ? pause() : play();
$('#btnFull').onclick = () => { const s = $('#stage'); if(document.fullscreenElement) document.exitFullscreen(); else if(s.requestFullscreen) s.requestFullscreen(); };
$('#selRatio').onchange = e => { S.ratio = e.target.value; setCanvas(); updatePInfo(); renderInspector(); };
$('#selBg').onchange = e => { S.bg = e.target.value; renderInspector(); };
$('#fileIn').onchange = e => { importFiles([...e.target.files]); e.target.value = ''; };
$('#audioIn').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if(!f) return;
  try{ const m = await addAudioMedia(f); addAudioAt(m, {start:S.audios.length ? S.time : 0}); renderLeft(); }catch(err){ alert(err.message); }
};
$('#lutIn').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if(!f) return;
  try{ const {n,data} = parseCube(await f.text()); const l = addLut(f.name.replace(/\.cube$/i,''), n, data, null, true); const it = visTarget(); if(it){ pushUndo(); it.lut = l.id; } renderInspector(); renderLeft(); renderTimeline(); }
  catch(err){ alert(err.message); }
};
$('#pipIn').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if(!f) return;
  try{ const m = f.type.startsWith('video/') ? await addVideoMedia(f) : await addImageMedia(f); renderLeft(); addPip(m); }catch(err){ alert(err.message); }
};
document.addEventListener('keydown', e => {
  if(exporting || recState || e.target.matches('input,select,textarea')) return;
  if($('#home').style.display === 'flex' || $('#modal').style.display === 'flex') return;
  const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if(e.code === 'Space'){ e.preventDefault(); S.playing ? pause() : play(); }
  else if(mod && k === 'z'){ e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if(mod && k === 'y'){ e.preventDefault(); redo(); }
  else if(mod && k === 's'){ e.preventDefault(); saveProject(true); }
  else if(mod && k === 'd'){ e.preventDefault(); dup(); }
  else if((mod && k === 'b') || (!mod && k === 's')){ e.preventDefault(); split(); }
  else if(!mod && k === 'q'){ trimSide('left'); }
  else if(!mod && k === 'w'){ trimSide('right'); }
  else if(!mod && k === 't'){ e.preventDefault(); addTextPreset('default'); }
  else if(!mod && k === 'k'){ e.preventDefault(); toggleKf(); }
  else if(k === 'escape'){ setPick(false); renderInspector(); }
  else if(k === 'delete' || k === 'backspace'){ del(); }
  else if(k === 'arrowleft'){ seek(S.time - 1/30); }
  else if(k === 'arrowright'){ seek(S.time + 1/30); }
  else if(k === 'home'){ seek(0); }
  else if(k === 'end'){ seek(S.total); }
});
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => { e.preventDefault(); if(S.project && e.dataTransfer.files.length) importFiles([...e.dataTransfer.files]); });
new ResizeObserver(fitCanvas).observe($('#stage'));
window.addEventListener('resize', () => { HEADW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 150; renderTimeline(); });
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});

/* =====================================================================
   PREVIEW GIZMOS: mask editing & tracking box (captures pointer before default drag)
   ===================================================================== */
function maskEditTarget(){
  const it = selItem(); if(!it || it.type === 'audio' || it.type === 'text' || it.type === 'sticker' || it.type === 'gfx') return null;
  const k = kindOf(it); if(S.rt[k] !== 'video' || S.rs.video !== 'mask' || !it.mask || it.mask.type === 'none' || !geo[it.id]) return null;
  return it;
}
const trackEditTarget = () => { const it = selItem(); return it && S.trackEdit === it.id && S.trackBox ? it : null; };
function drawGizmos(ctx){
  const u = Math.min(out.width, out.height), lw = Math.max(2, u/320);
  const mi = maskEditTarget();
  if(mi){
    const g = geo[mi.id], m = mi.mask, L = 2*g.hh;
    ctx.save(); ctx.translate(g.cx, g.cy); ctx.rotate(g.rot); if(g.flip) ctx.scale(-1,1);
    ctx.translate(m.x/100*2*g.hw, m.y/100*2*g.hh); ctx.rotate(m.rot*Math.PI/180);
    const sx = m.w/200*L, sy = m.h/200*L;
    ctx.lineWidth = lw; ctx.strokeStyle = '#fff'; ctx.shadowColor = '#000'; ctx.shadowBlur = 4; ctx.setLineDash([lw*5, lw*3]);
    ctx.beginPath();
    if(m.type === 'circle') ctx.ellipse(0,0,Math.max(1,sx),Math.max(1,sy),0,0,Math.PI*2);
    else if(m.type === 'rect') rr(ctx,-sx,-sy,sx*2,sy*2,m.round/100*Math.min(sx,sy));
    else if(m.type === 'linear'){ ctx.moveTo(-L*3,0); ctx.lineTo(L*3,0); }
    else if(m.type === 'mirror'){ ctx.moveTo(-L*3,-sy); ctx.lineTo(L*3,-sy); ctx.moveTo(-L*3,sy); ctx.lineTo(L*3,sy); }
    else if(m.type === 'star'){ for(let i=0;i<10;i++){ const a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? sy*.42 : sy; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); } ctx.closePath(); }
    else if(m.type === 'heart'){ const s = sy*1.8; ctx.moveTo(0,s*.55); ctx.bezierCurveTo(-s*.95,-.05*s,-s*.5,-s*.62,0,-s*.25); ctx.bezierCurveTo(s*.5,-s*.62,s*.95,-.05*s,0,s*.55); }
    ctx.stroke(); ctx.setLineDash([]); ctx.shadowBlur = 0;
    ctx.fillStyle = '#20d5ec'; ctx.beginPath(); ctx.arc(0,0,lw*3.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  const ti = trackEditTarget();
  if(ti){
    const b = S.trackBox; ctx.save(); ctx.lineWidth = lw; ctx.strokeStyle = '#20d5ec'; ctx.fillStyle = 'rgba(32,213,236,.12)';
    ctx.fillRect(b.x,b.y,b.w,b.h); ctx.strokeRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle = '#20d5ec'; ctx.fillRect(b.x+b.w-lw*5, b.y+b.h-lw*5, lw*10, lw*10);
    ctx.font = `700 ${Math.round(u/36)}px Inter,sans-serif`; ctx.fillText('TRACK', b.x, b.y - lw*3); ctx.restore();
  }
}
let gz = null;
const gzPts = new Map();
out.addEventListener('pointerdown', e => {
  if(exporting || S.pick) return;
  const ti = trackEditTarget(), mi = !ti && maskEditTarget(); if(!ti && !mi) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const p = toCv(e); gzPts.set(e.pointerId, p); out.setPointerCapture(e.pointerId);
  if(gzPts.size === 2 && gz && gz.kind === 'mask'){ const [a,b] = [...gzPts.values()]; gz.pinch = {d0:Math.hypot(a.x-b.x,a.y-b.y), w0:mi.mask.w, h0:mi.mask.h}; return; }
  if(ti){ const b = S.trackBox, near = Math.abs(p.x-(b.x+b.w)) < 26 && Math.abs(p.y-(b.y+b.h)) < 26; gz = {kind:'track', mode:near?'size':'move', p0:p, b0:{...b}}; return; }
  pushUndo(); gz = {kind:'mask', it:mi, p0:p, x0:mi.mask.x, y0:mi.mask.y};
}, true);
out.addEventListener('pointermove', e => {
  if(!gz || !gzPts.has(e.pointerId)) return; e.stopImmediatePropagation();
  const p = toCv(e); gzPts.set(e.pointerId, p); const dx = p.x - gz.p0.x, dy = p.y - gz.p0.y;
  if(gz.kind === 'track'){
    const b = S.trackBox, b0 = gz.b0;
    if(gz.mode === 'move'){ b.x = b0.x + dx; b.y = b0.y + dy; } else { b.w = Math.max(16, b0.w + dx); b.h = Math.max(16, b0.h + dy); }
    return;
  }
  const it = gz.it, g = geo[it.id]; if(!g) return;
  if(gz.pinch && gzPts.size >= 2){ const [a,b] = [...gzPts.values()], k = Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,gz.pinch.d0); it.mask.w = clamp(gz.pinch.w0*k,1,300); it.mask.h = clamp(gz.pinch.h0*k,1,300); syncMaskInputs(it); return; }
  const c = Math.cos(g.rot), s = Math.sin(g.rot); let lx = dx*c + dy*s, ly = -dx*s + dy*c; if(g.flip) lx = -lx;
  it.mask.x = clamp(gz.x0 + lx/(2*g.hw)*100, -60, 60); it.mask.y = clamp(gz.y0 + ly/(2*g.hh)*100, -60, 60);
  syncMaskInputs(it);
}, true);
const gzEnd = e => { gzPts.delete(e.pointerId); if(!gz) return; e.stopImmediatePropagation(); if(gzPts.size === 0) gz = null; else if(gz.kind === 'mask'){ gz.pinch = null; const p = [...gzPts.values()][0]; gz.p0 = p; gz.x0 = gz.it.mask.x; gz.y0 = gz.it.mask.y; } };
out.addEventListener('pointerup', gzEnd, true);
out.addEventListener('pointercancel', gzEnd, true);
out.addEventListener('wheel', e => {
  const mi = maskEditTarget(); if(!mi) return; e.preventDefault(); e.stopImmediatePropagation();
  const k = e.deltaY < 0 ? 1.06 : 1/1.06; mi.mask.w = clamp(mi.mask.w*k,1,300); mi.mask.h = clamp(mi.mask.h*k,1,300); syncMaskInputs(mi);
}, {capture:true, passive:false});
function syncMaskInputs(it){
  IB.querySelectorAll('input[data-p^="mask."]').forEach(el => { const v = getP(it, el.dataset.p); if(typeof v !== 'number') return; el.value = el.type === 'number' ? fmtV(v) : v; if(el.type === 'range') setFill(el); });
}

/* ---------------- INIT ---------------- */
HEADW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--head')) || 150;
renderTools(); updatePlayBtn();
makeBuiltinLuts(); setCanvas(); updatePInfo(); layout(); renderLeft(); renderTimeline(); renderInspector();
requestAnimationFrame(tick);
(async () => {
  try{ DB = await idbOpen(); if(navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(()=>{}); }catch(e){ DB = null; }
  showHome();
})();
