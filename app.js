(function(){
const D=window.DATA,C=window.CONFIG||{},MON=['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'];
const MFULL=['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
const $=id=>document.getElementById(id),fmt=n=>Math.round(n).toLocaleString('id-ID');
const wStart=[];let acc=1;D.weeks.forEach(w=>{wStart.push(acc);acc+=w});
const mOf=w=>{let i=0;while(i<11&&w>=wStart[i+1])i++;return i};
let S=D.struct.map((s,i)=>({i,spg:s[0],toko:s[1],sku:s[2],br:s[3],ch:s[4],area:s[5],pr:D.price[s[2]]||1}));
let F=C.FEED_URL?[]:D.feed.map(f=>({s:f[0],w:f[1],t:f[2],a:f[3]}));window.__st=C.FEED_URL?'⏳ Memuat data dari spreadsheet...':'';
let demo=false;
function rnd(seed){return()=>(seed=(seed*16807)%2147483647)/2147483647}
function makeDemo(){ // data contoh supaya desain kelihatan hidup
  const r=rnd(7),cur=40;F=[];
  const base={};
  S.forEach(s=>{base[s.i]=s.pr*(s.br=='GG'?0.5:0.8)*(0.6+r()*1.6)*(s.ch=='GROSIR'?2:1)});
  const bias={};D.spg.forEach((_,i)=>bias[i]=0.55+r()*0.7);
  S.forEach(s=>{for(let w=1;w<=52;w++){const tw=base[s.i]*4/D.weeks[mOf(w)];
    F.push({s:s.i,w,t:Math.round(tw),a:w<=cur?Math.round(tw*bias[s.spg]*(0.6+r()*0.7)):0})}});
  demo=true;
}
const real=F.filter(f=>f.a>0).length;
if(C.DEMO===true||(C.DEMO!==false&&real<30))makeDemo();
let cur=Math.max(0,...F.filter(f=>f.a>0).map(f=>f.w))||1;
const st={bulan:mOf(cur),area:'',spg:'',toko:'',br:'',sku:'',ch:'',unit:'krt'};
const uniq=(a,k)=>[...new Set(a.map(x=>x[k]))].filter(Boolean).sort();
function rowsBy(skip){return S.filter(s=>(skip=='area'||!st.area||s.area==st.area)&&(skip=='spg'||!st.spg||D.spg[s.spg].n==st.spg)&&(skip=='toko'||!st.toko||s.toko==st.toko)&&(skip=='br'||!st.br||s.br==st.br)&&(skip=='sku'||!st.sku||s.sku==st.sku)&&(skip=='ch'||!st.ch||s.ch==st.ch))}
function buildFilters(){
  const el=$('flt');
  const opt=(k,lab,vals,fmtv)=>`<label>${lab}<select data-k="${k}"><option value="">Semua</option>${vals.map(v=>`<option value="${v[0]}" ${String(st[k])==String(v[0])?'selected':''}>${v[1]}</option>`).join('')}</select></label>`;
  const L=(k,sk)=>rowsBy(sk).map(s=>s[k]);
  const u=a=>[...new Set(a)].filter(Boolean).sort().map(v=>[v,v]);
  el.innerHTML=`<label>Periode<select data-k="bulan">${MFULL.map((m,i)=>`<option value="${i}" ${st.bulan==i?'selected':''}>${m} 2026</option>`).join('')}</select></label>`+
   opt('area','Area',u(L('area','area')))+opt('spg','SPG',u(rowsBy('spg').map(s=>D.spg[s.spg].n)))+opt('toko','Outlet',u(L('toko','toko')))+
   opt('br','Brand',u(L('br','br')))+opt('sku','SKU',u(L('sku','sku')))+opt('ch','Channel',u(L('ch','ch')))+
   `<div class="seg"><button data-u="krt" class="${st.unit=='krt'?'on':''}">IN KARTON</button><button data-u="rp" class="${st.unit=='rp'?'on':''}">IN VALUE</button></div>`;
  el.querySelectorAll('select').forEach(s=>s.onchange=()=>{const k=s.dataset.k;st[k]=k=='bulan'?+s.value:s.value;
    if(k=='area'){st.spg=st.toko=''}if(k=='spg')st.toko='';render()});
  el.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{st.unit=b.dataset.u;render()});
}
// agregasi: rows = struct terfilter, w1..w2 = rentang week
function agg(rows,w1,w2,cap){
  const ok=new Set(rows.map(r=>r.i)),m={};rows.forEach(r=>m[r.i]=r);
  let tr=0,ar=0,tk=0,ak=0;
  F.forEach(f=>{if(f.w<w1||f.w>w2||!ok.has(f.s))return;const p=m[f.s].pr;tr+=f.t;tk+=f.t/p;
    if(!cap||f.w<=cap){ar+=f.a;ak+=f.a/p}});
  return{tr,ar,tk,ak};
}
const val=(o,k)=>st.unit=='krt'?o[k=='t'?'tk':'ak']:o[k=='t'?'tr':'ar'];
const U=n=>st.unit=='krt'?fmt(n)+' krt':'Rp '+fmt(n);
const cls=a=>a>=1?'g':a>=.9?'y':'rd',col=a=>a>=1?'var(--ok)':a>=.9?'var(--warn)':'var(--bad)';
const pct=a=>(a*100).toFixed(1).replace('.',',')+'%';
const SIL='<svg viewBox="0 0 100 100"><circle cx="50" cy="38" r="17" fill="#94a3b8" opacity=".55"/><path d="M16 100c2-27 17-40 34-40s32 13 34 40z" fill="#94a3b8" opacity=".55"/></svg>';
function driveUrl(u){u=String(u||'').trim();if(!u)return '';const m=u.match(/\/d\/([\w-]{10,})/)||u.match(/[?&]id=([\w-]{10,})/);return m?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w1000':u}
function av(sp,size){const o=D.spg.find(x=>x.n==sp);if(!o)return`<span class="av" style="width:${size}px;height:${size}px">${SIL}</span>`;
  const u=o.foto?driveUrl(o.foto):'assets/foto/'+sp+'.jpg';return`<span class="av" style="width:${size}px;height:${size}px">${SIL}<img src="${u}" alt="${sp}" referrerpolicy="no-referrer" onload="var s=this.parentNode.querySelector('svg');if(s)s.remove()" onerror="if(!this.dataset.t&&this.src.indexOf('assets/foto/')>-1){this.dataset.t=1;this.src=this.src.replace('.jpg','.png')}else this.remove()"></span>`}
const RG='ACH ≥100% = insentif penuh · 90–99% = prorate · <90% = hangus',RG85='ACH ≥100% = penuh · 85–99% = proporsional · <85% = hangus',KNALL=['KILAU NIPIS 1,5L','KILAU NIPIS 210ML','KILAU NIPIS 370ML','KILAU NIPIS 630ML','KILAU NIPIS 85ML','KILAU NIPIS 900ML'];
const SK={
'GMM_NKA|GG':{t:'Selling In - Gentle Gen (GG Botol & Pouch 1,5L)',d:'Kontribusi last quartal × Target by Channel',r:RG,sku:['BOTOL','POUCH 1,5L']},
'GMM_NKA|KN':{t:'Selling In - Kilau Nipis (KN 630ml & KN 1,5L)',d:'Kontribusi last quartal × Target by Channel',r:RG,sku:['KILAU NIPIS 630ML','KILAU NIPIS 1,5L']},
'GMM_NKA|SELLOUT':{t:'Data Sell Out Toko',d:'Minimal 50% dari jumlah toko yang di-cover',r:'Sell out Mayora HC Rp100rb · HC + Kompetitor Rp250rb per bulan'},
'GROSIR|GG':{t:'Selling In - Gentle Gen (GGTP Only = RCG)',d:'Kontribusi last quartal × Target by Channel',r:RG,sku:['RCG']},
'GROSIR|KN85':{t:'Selling In - Kilau Nipis 85ML',d:'Kontribusi last quartal × Target by Channel',r:RG,sku:['KILAU NIPIS 85ML']},
'GROSIR|KN630':{t:'Selling In - Kilau Nipis 630ML',d:'Kontribusi last quartal × Target by Channel',r:RG,sku:['KILAU NIPIS 630ML']},
'STOCKIS|KUNJUNGAN':{t:'Jumlah Kunjungan Toko',d:'Menggunakan mix mobile',r:RG85},
'STOCKIS|RAINBOW':{t:'Jumlah Toko Rainbow Wall',d:'Min. 3 hanger GG + 1 clipstrip KN / 1 COC KN, wajib terdokumentasi, target min. 30 outlet',r:RG85},
'STOCKIS|STM':{t:'STM Grosir Stockist (Kilau Nipis)',d:'Target growth minimal 100% vs Q1 2025 (dalam Rupiah)',r:RG,sku:KNALL,rp:1},
'STOCKIS|OA':{t:'OA Toko CB Retail (exc Grosir Stockist)',d:'Berdasarkan data SAP BW/LBP',r:RG85}};
let chart;
function render(){
  buildFilters();
  const m=st.bulan,w1=wStart[m],w2=w1+D.weeks[m]-1,rows=rowsBy(),done=Math.min(cur,w2);
  const wLeft=Math.max(1,w2-Math.max(cur,w1-1));
  $('sub').textContent=`PERIODE ${MFULL[m]} 2026 · UPDATE WEEK ${cur}`;
  $('mode').textContent=demo?'MODE DEMO (data contoh)':(window.__st||'');
  $('unit').textContent='('+(st.unit=='krt'?'KARTON':'VALUE')+')';
  const a=agg(rows,w1,w2,cur),ach=a.tk?a.ak/a.tk:0;
  const sp=st.spg||(new Set(rows.map(r=>r.spg)).size==1?D.spg[rows[0].spg].n:'');
  $('foto').innerHTML=av(sp,112).replace('class="av"','class="av foto"');
  $('nspg').textContent=sp||'SEMUA SPG';
  const tk=[...new Set(rows.map(r=>r.toko))];$('ntoko').textContent=st.toko||(tk.length==1?tk[0]:tk.length+' OUTLET');
  const T=val(a,'t'),A=val(a,'a');
  $('vt').textContent=U(T);$('va').textContent=U(A);$('ba').style.width=Math.min(100,T?A/T*100:0)+'%';
  $('acv').textContent=pct(ach);$('acv').style.fill=col(ach);const CF=2*Math.PI*56;$('acvbar').style.strokeDasharray=(CF*Math.min(1,ach))+' '+CF;$('acvbar').style.stroke=col(ach);$('acvst').textContent=ach>=1?'Target tercapai':ach>=.9?'Hampir tercapai':'Di bawah target';$('acvst').style.color=col(ach);
  [['GG','agg','ggap','gwk'],['KN','akn','kgap','kwk']].forEach(([b,ea,eg,ew])=>{
    const r=rows.filter(x=>x.br==b),x=agg(r,w1,w2,cur),T2=val(x,'t'),A2=val(x,'a'),gap=Math.max(0,T2-A2);
    $(ea).innerHTML=`${U(A2)} <span class="chip ${cls(x.tk?x.ak/x.tk:0)}">${pct(x.tk?x.ak/x.tk:0)}</span>`;
    $(eg).textContent=U(gap);$(ew).textContent=U(gap/wLeft);});
  // chart bulanan
  const T3=[],A3=[],P3=[],V3=[];
  for(let i=0;i<12;i++){const s=wStart[i],e=s+D.weeks[i]-1,x=agg(rows,s,e,cur),wd=Math.max(0,Math.min(cur,e)-s+1);
    T3.push(+val(x,'t').toFixed(1));A3.push(+val(x,'a').toFixed(1));P3.push(x.tk&&wd?x.ak/x.tk:null);V3.push(wd&&val(x,'a')?+(val(x,'a')/wd).toFixed(1):null)}
  const dk=document.documentElement.dataset.theme=='dark',tc=dk?'#cbd5e1':'#334155';
  const lab={id:'lab',afterDatasetsDraw(c){const x=c.ctx,m=c.getDatasetMeta(1);x.save();x.font='800 12px Sora,system-ui';x.textAlign='center';
    m.data.forEach((b,i)=>{if(P3[i]==null)return;x.fillStyle=P3[i]>=1?'#16a34a':P3[i]>=.9?'#ca8a04':'#dc2626';x.fillText(pct(P3[i]).replace(',0%','%'),b.x,b.y-6)});x.restore();const l=c.getDatasetMeta(2);x.save();x.font='700 11px "Plus Jakarta Sans",system-ui';x.textAlign='center';
    l.data.forEach((p,i)=>{if(V3[i]==null)return;const t=fmt(V3[i]),w=x.measureText(t).width+10;x.fillStyle=dk?'#0f172a':'#fff';x.globalAlpha=.92;x.beginPath();x.roundRect?x.roundRect(p.x-w/2,p.y-26,w,16,8):x.rect(p.x-w/2,p.y-26,w,16);x.fill();x.globalAlpha=1;x.fillStyle='#0ea5e9';x.fillText(t,p.x,p.y-14)});x.restore()}};
  if(window.Chart)Chart.defaults.font.family='"Plus Jakarta Sans",system-ui,sans-serif';const cfg={type:'bar',plugins:[lab],data:{labels:MON,datasets:[
    {label:'TARGET',data:T3,backgroundColor:'#1e3a8a',borderRadius:5,order:2},
    {label:'AKTUAL (angka = ACV %)',data:A3,backgroundColor:'#f97316',borderRadius:5,order:2},
    {type:'line',label:'AVG AKTUAL / WEEK',data:V3,order:0,z:10,borderColor:'#0ea5e9',backgroundColor:'#fff',pointBorderColor:'#0ea5e9',pointBorderWidth:3,tension:.3,pointRadius:5,pointHoverRadius:7,borderWidth:3.5,spanGaps:false}]},
   options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:20}},interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{color:tc}}},
    scales:{x:{ticks:{color:tc},grid:{display:false}},y:{beginAtZero:true,ticks:{color:tc},grid:{color:dk?'#243049':'#e2e8f0'},title:{display:true,color:tc,text:st.unit=='krt'?'Karton':'Rp'}}}}};
  if(window.Chart){if(chart)chart.destroy();chart=new Chart($('ch'),cfg)}
  page2(rows,m,w1,w2,wLeft);page3(m,w1,w2);
}
const KM={GMM_NKA:{'BOTOL':'GG','POUCH 1,5L':'GG','KILAU NIPIS 1,5L':'KN','KILAU NIPIS 630ML':'KN'},GROSIR:{'RCG':'GG','KILAU NIPIS 85ML':'KN85','KILAU NIPIS 630ML':'KN630'},STOCKIS:{'KILAU NIPIS 85ML':'KN85','KILAU NIPIS 630ML':'KN630'}};
const KOD={GG:'Gentle Gen',KN:'Kilau Nipis',KN85:'Kilau Nipis 85ML',KN630:'Kilau Nipis 630ML'};
const kode=r=>(KM[D.spg[r.spg].grp]||{})[r.sku]||'';
const N1=n=>n.toLocaleString('id-ID',{maximumFractionDigits:1}),U1=n=>st.unit=='krt'?N1(n)+' krt':'Rp '+fmt(n);
function stat(ac,tg,t){return!t?['–','']:ac>=.9999?['TERCAPAI','g']:ac>=tg?['ON TRACK','y']:['TERTINGGAL','rd']}
function page2(rows,m,w1,w2,wLeft){
  const sch=rows.filter(kode),tg=Math.min(1,Math.max(0,Math.min(cur,w2)-w1+1)/D.weeks[m]),wks=[];for(let w=w1;w<=w2;w++)wks.push(w);
  $('d1sub').textContent=`${MFULL[m]} · pace week ${(tg*100).toFixed(0)}% · sisa ${wLeft} week`;
  $('d1sub2').textContent=`${MFULL[m]} · SKU skema insentif`;
  const wcell=(rs)=>wks.map(w=>w>cur?'<td class="r" style="color:var(--mu)">–</td>':`<td class="r" style="color:var(--mu)">${U1(val(agg(rs,w,w,cur),'a')).replace(' krt','')}</td>`).join('');
  const cells=(rs)=>{const x=agg(rs,w1,w2,cur),ac=x.tk?x.ak/x.tk:0,gp=Math.max(0,val(x,'t')-val(x,'a'));return`<td class="r">${U1(val(x,'t'))}</td><td class="r">${U1(val(x,'a'))}</td><td class="r"><span class="chip ${cls(ac)}">${x.tk?pct(ac):'–'}</span></td><td class="r">${U1(gp/wLeft)}</td>`+wcell(rs)};
  const gk=['GG','KN','KN85','KN630'].filter(k=>sch.some(r=>kode(r)==k));
  let h=`<tr><th>Parameter SKU</th><th class="r">Target</th><th class="r">Aktual</th><th class="r">ACV</th><th class="r">Gap / week</th>${wks.map(w=>`<th class="r">W${w}</th>`).join('')}</tr>`;
  gk.forEach(k=>{const g=sch.filter(r=>kode(r)==k),skus=[...new Set(g.map(r=>r.sku))];
    h+=`<tr class="sub" data-k="${k}" style="cursor:pointer"><td>▸ ${KOD[k]}<div style="font-weight:400;font-size:10px;color:var(--mu)">${skus.join(', ')}</div></td>${cells(g)}</tr>`;
    skus.forEach(sk=>{const g2=g.filter(r=>r.sku==sk);h+=`<tr class="sk hid" data-p="${k}"><td>↳ ${sk}</td>${cells(g2)}</tr>`})});
  if(!gk.length)h+=`<tr><td colspan="${5+wks.length}" style="color:var(--mu)">Belum ada SKU parameter untuk filter ini.</td></tr>`;
  $('tpar').innerHTML=h;$('tpar').querySelectorAll('tr.sub').forEach(t=>t.onclick=()=>$('tpar').querySelectorAll('tr.sk').forEach(x=>{if(x.dataset.p==t.dataset.k)x.classList.toggle('hid')}));
  // rincian per outlet & SKU (hanya SKU skema insentif)
  const g={};sch.forEach(r=>{const k=D.spg[r.spg].n+'|'+r.toko;(g[k]=g[k]||[]).push(r)});
  const stc=(x)=>{const ac=x.tk?x.ak/x.tk:0,[s,c]=stat(ac,tg,x.tk);return`<span class="chip ${c}">${s}</span>`};
  let h2='<tr><th>SPG</th><th>Outlet / SKU</th><th class="r">Target</th><th class="r">Aktual</th><th class="r">ACV</th><th class="r">Gap / week</th><th class="r">Status</th></tr>';
  Object.keys(g).sort().forEach(k=>{const [sp,tk]=k.split('|'),x=agg(g[k],w1,w2,cur),ac=x.tk?x.ak/x.tk:0,gp=Math.max(0,val(x,'t')-val(x,'a'));
    h2+=`<tr class="sub" data-k="${k}" style="cursor:pointer"><td>${sp}</td><td>▸ ${tk}</td><td class="r">${U1(val(x,'t'))}</td><td class="r">${U1(val(x,'a'))}</td><td class="r"><span class="chip ${cls(ac)}">${x.tk?pct(ac):'–'}</span></td><td class="r">${U1(gp/wLeft)}</td><td class="r">${stc(x)}</td></tr>`;
    g[k].forEach(r=>{const y=agg([r],w1,w2,cur);if(!y.tk&&!y.ak)return;const a2=y.tk?y.ak/y.tk:0,g2=Math.max(0,val(y,'t')-val(y,'a'));
      h2+=`<tr class="sk hid" data-p="${k}"><td></td><td>↳ ${r.sku} <small style="color:var(--mu)">· ${KOD[kode(r)]}</small></td><td class="r">${U1(val(y,'t'))}</td><td class="r">${U1(val(y,'a'))}</td><td class="r"><span class="chip ${cls(a2)}">${pct(a2)}</span></td><td class="r">${U1(g2/wLeft)}</td><td class="r">${stc(y)}</td></tr>`})});
  $('tsku').innerHTML=h2;$('tsku').querySelectorAll('tr.sub').forEach(t=>t.onclick=()=>$('tsku').querySelectorAll('tr.sk').forEach(x=>{if(x.dataset.p==t.dataset.k)x.classList.toggle('hid')}));
  // insentif
  const spl=st.spg?D.spg.findIndex(x=>x.n==st.spg):-1,ids=new Set(rows.map(r=>r.spg));
  const r2=rnd(m+99);let list=[];
  D.ins.filter(x=>x[0]==m+1&&(spl<0?ids.has(x[1]):x[1]==spl)).forEach(x=>{
    let [,si,kr,kode,sat,t0,a0,mn,mx]=x,sr=S.filter(s=>s.spg==si);let t=t0,a=a0;
    const sc=SK[D.spg[si].grp+'|'+kode]||{},sell=sc.sku&&(q=>sc.sku.includes(q.sku));if(sc.t)kr=sc.t;
    let det='';
    if(sell){const rr=sr.filter(sell),y=agg(rr,w1,w2,cur);t=sc.rp?y.tr:y.tk;a=sc.rp?y.ar:y.ak;
      const F2=sc.rp?n=>'Rp '+fmt(n):n=>fmt(n)+' krt';
      const sk={};rr.forEach(r=>(sk[r.sku]=sk[r.sku]||[]).push(r));
      det='<table><tr><th>SKU</th><th class="r">Target</th><th class="r">Aktual</th><th class="r">ACV</th><th class="r">Gap 100%</th><th class="r">Gap/week</th></tr>'+Object.keys(sk).map(k=>{const z=agg(sk[k],w1,w2,cur),tt=sc.rp?z.tr:z.tk,aa=sc.rp?z.ar:z.ak;const ac=tt?aa/tt:0,gp=Math.max(0,tt-aa);
        return`<tr><td>${k}</td><td class="r">${F2(tt)}</td><td class="r">${F2(aa)}</td><td class="r"><span class="chip ${cls(ac)}">${pct(ac)}</span></td><td class="r">${F2(gp)}</td><td class="r">${F2(gp/wLeft)}</td></tr>`}).join('')+'</table>'}
    else if(demo&&!t0){t=sat=='TOKO'?Math.ceil(sr.length/11/2)||3:sat=='OUTLET'?30:230;a=Math.round(t*(.6+r2()*.6))}
    if(!t)return;const ac=a/t,earn=ac>=1?mx:ac>=mn?ac*mx:0;list.push({sc,sp:D.spg[si].n,kr,sat,t,a,ac,mx,earn,mn,det})});
  const tot=list.reduce((s,x)=>s+x.mx,0),got=list.reduce((s,x)=>s+x.earn,0);
  $('d2sub').textContent=MFULL[m]+' · nilai insentif yang didapat';
  $('inskpi').innerHTML=`<div><small>Didapat</small><b style="color:var(--ok)">Rp ${fmt(got)}</b></div><div><small>Belum didapat</small><b style="color:var(--bad)">Rp ${fmt(tot-got)}</b></div><div><small>Maks. insentif</small><b>Rp ${fmt(tot)}</b></div>`;
  $('insl').innerHTML=list.map(x=>{const gp=Math.max(0,x.t-x.a),rp=x.ac>=1?0:Math.max(0,x.mx-x.earn),u=x.sat.toLowerCase()=='rupiah'?'Rp ':'',us=u?'':' '+x.sat.toLowerCase();
    return`<div class="insw"><div class="ir"><div><b>${x.kr.replace(/\(.*/,'')}</b><br><small style="color:var(--mu)">${x.sp}${x.det?' · klik untuk detail SKU':''}</small></div><div class="pg"><i style="width:${Math.min(100,x.ac*100)}%;background:${col(x.ac)}"></i></div><span class="chip ${cls(x.ac)}">${pct(x.ac)}</span><b>Rp ${fmt(x.earn)}</b></div>
    <div class="meta"><span>Target <b>${u}${fmt(x.t)}${us}</b></span><span>Aktual <b>${u}${fmt(x.a)}${us}</b></span><span>Gap to 100% <b>${u}${fmt(gp)}${us}</b></span><span>Gap/week <b>${u}${fmt(gp/wLeft)}${us}</b> (sisa ${wLeft} week)</span><span>Insentif belum didapat <b>Rp ${fmt(rp)}</b></span></div>
    <div class="meta" style="margin-top:-4px"><span>📋 ${x.sc.d||''}</span><span>${x.sc.r||''}</span>${x.sc.sku?`<span>SKU: <b>${x.sc.sku.length==6&&x.sc.rp?'semua Kilau Nipis':x.sc.sku.join(', ')}</b></span>`:''}</div>
    ${x.det?`<div class="det hid">${x.det}</div>`:''}</div>`}).join('')||'<p style="color:var(--mu)">Belum ada data insentif untuk filter ini.</p>';
  $('insl').querySelectorAll('.insw').forEach(w=>{const d=w.querySelector('.det');if(d)w.querySelector('.ir').onclick=()=>d.classList.toggle('hid')});
}
function page3(m,w1,w2){
  $('d3sub').textContent=`${MFULL[m]} · ACV karton terendah di atas`;
  const rows=rowsBy(),ids=[...new Set(rows.map(r=>r.spg))];
  const L=ids.map(i=>{const x=agg(rows.filter(r=>r.spg==i),w1,w2,cur);return{n:D.spg[i].n,g:D.spg[i].grp,ac:x.tk?x.ak/x.tk:0,gap:Math.max(0,val(x,'t')-val(x,'a'))}}).filter(x=>x.ac||demo).sort((a,b)=>a.ac-b.ac);
  $('rank').innerHTML=L.map((x,i)=>`<div class="rk"><span class="no">${i+1}</span><div style="display:flex;gap:10px;align-items:center">${av(x.n,38)}<div><b>${x.n}</b><br><small style="color:var(--mu)">${x.g} · gap ${U(x.gap)}</small></div></div><div class="pg"><i style="width:${Math.min(100,x.ac*100)}%;background:${col(x.ac)}"></i></div><span class="chip ${cls(x.ac)}">${pct(x.ac)}</span></div>`).join('')||'<p style="color:var(--mu)">Belum ada aktual.</p>';
}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button,.page').forEach(e=>e.classList.remove('on'));b.classList.add('on');$(b.dataset.p).classList.add('on')});
// live feed (opsional): isi CONFIG.FEED_URL di config.js
if(C.FEED_URL){fetch(C.FEED_URL+'?sheet=FEED_DASH&t='+Date.now()).then(r=>r.json()).then(j=>{
  const rows=j.rows||j,key={};S.forEach(s=>key[D.spg[s.spg].n+'|'+s.toko+'|'+s.sku]=s.i);
  const nf=[];const wk=r=>+r.WEEK_NO||parseInt(String(r.WEEK_KALENDER||'').replace(/\D/g,''))||0,setFoto=(n,u)=>{const o=D.spg.find(x=>x.n==String(n).trim().toUpperCase());if(o&&u)o.foto=String(u).trim()};
  rows.forEach(r=>{if(r.FOTO_SPG)setFoto(r.SPG,r.FOTO_SPG);const i=key[r.SPG+'|'+r.TOKO+'|'+r.SKU];if(i!=null)nf.push({s:i,w:wk(r),t:+r.TARGET_WEEK_RP||0,a:+r.AKTUAL_RP||0})});
  if(j.error){window.__st='❌ Spreadsheet: '+j.error;render();return}if(nf.length){F=nf;demo=false;cur=Math.max(1,...F.filter(f=>f.a>0).map(f=>f.w));st.bulan=mOf(cur);window.__st='✅ Data live · '+nf.length+'/'+rows.length+' baris cocok · isi: '+F.filter(f=>f.a>0).length;render()}else{window.__st='⚠️ Terbaca '+rows.length+' baris tapi nama SPG/TOKO/SKU tidak cocok';render()}}).catch(()=>{window.__st='❌ Gagal ambil data (cek URL /exec & akses Anyone)';render()})}
if(C.FEED_URL){fetch(C.FEED_URL+'?sheet=FOTO_SPG').then(r=>r.json()).then(j=>{(j.rows||j).forEach(r=>{const o=D.spg.find(x=>x.n==String(r.SPG||'').trim().toUpperCase());if(o&&(r.FOTO||r.FOTO_SPG))o.foto=String(r.FOTO||r.FOTO_SPG).trim()});render()}).catch(()=>{})}
const tg=$('tg'),setT=t=>{document.documentElement.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}tg.textContent=t=='dark'?'☀️ Terang':'🌙 Gelap'};
setT(document.documentElement.dataset.theme);tg.onclick=()=>{setT(document.documentElement.dataset.theme=='dark'?'light':'dark');render()};
render();
})();
