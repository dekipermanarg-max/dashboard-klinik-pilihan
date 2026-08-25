const CONFIG={SHEET_ID:'1-ghFaPLJCAAgs9mcKXnBxXz9ycf8z5Ja-fVeGU4SNao',MASTER_SHEET:'MT SISWA MAPEL',DB_SHEET:'DB_KLINIK_PILIHAN',API_URL:'https://script.google.com/macros/s/AKfycbx23izdGlUWNU3217-Zxv7NaW79nkgky-h4lCO4KHgqftuSWrXc74qywm7v8_SDeDnDTw/exec'};
let master={mt:[],mapel:[],s11:[],s12:[]}, rows=[];
const $=id=>document.getElementById(id);
function gvizUrl(sheet){return `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheet)}`}
function gviz(sheet){return new Promise((resolve,reject)=>{const cb='gviz_'+Math.random().toString(36).slice(2);window[cb]=x=>{delete window[cb];script.remove();resolve(x.table.rows.map(r=>(r.c||[]).map(c=>c?.v??'')))};const script=document.createElement('script');script.src=gvizUrl(sheet)+`&tqx=responseHandler:${cb}`;script.onerror=()=>{delete window[cb];reject(new Error('Google Sheet tidak dapat dibaca.'))};document.body.appendChild(script)})}
function unique(a){return [...new Set(a.filter(v=>String(v).trim()).map(v=>String(v).trim()))].sort((a,b)=>a.localeCompare(b,'id'))}
function setOptions(el,items,placeholder='Pilih…'){el.innerHTML=`<option value="">${placeholder}</option>`+items.map(x=>`<option>${esc(x)}</option>`).join('')}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function load(){
  try{
    const m=await gviz(CONFIG.MASTER_SHEET); master.mt=unique(m.slice(1).map(r=>r[0])); master.mapel=unique(m.slice(1).map(r=>r[1])); master.s11=unique(m.slice(1).map(r=>r[2])); master.s12=unique(m.slice(1).map(r=>r[3]));
    setOptions($('mtSelect'),master.mt);setOptions($('subjectSelect'),master.mapel);setOptions($('filterMt'),master.mt);setOptions($('filterSubject'),master.mapel);
    try{const d=await gviz(CONFIG.DB_SHEET);rows=d.slice(1).filter(r=>r.some(Boolean)).map(r=>({id:r[0],date:r[1],kelas:r[2],siswa:r[3],mapel:r[4],mt:r[5],kuis:r[6],post:r[7]}));}catch(e){rows=[]}
    renderAll();
  }catch(e){toast(e.message);}
}
function renderAll(){
  const sessions=new Set(rows.map(r=>`${r.date}|${r.kelas}|${r.mapel}|${r.mt}`)).size;
  const students=new Set(rows.map(r=>r.siswa)).size;
  const q=nums(rows.map(r=>r.kuis)),p=nums(rows.map(r=>r.post));
  $('kpiSessions').textContent=sessions||0;$('kpiStudents').textContent=students||0;$('kpiQuiz').textContent=avg(q);$('kpiPost').textContent=avg(p);$('perfQuiz').textContent=avg(q);$('perfPost').textContent=avg(p);$('improvement').textContent=q.length&&p.length?`${delta(avgN(p)-avgN(q))} poin dari Kuis ke Post Test`:'Belum ada data nilai';
  const counts={};rows.forEach(r=>counts[r.mapel]=(counts[r.mapel]||0)+1);const list=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);const max=list[0]?.[1]||1;$('subjectList').innerHTML=list.length?list.map(([n,c])=>`<div class="barrow"><span>${esc(n)}</span><div class="track"><div class="fill" style="width:${c/max*100}%"></div></div><b>${c}</b></div>`).join(''):'<div class="empty">Belum ada data sesi.</div>';
  renderTable();
}
function nums(a){return a.map(Number).filter(Number.isFinite)} function avg(a){return a.length?avgN(a).toFixed(1):'—'} function avgN(a){return a.reduce((x,y)=>x+y,0)/a.length} function delta(n){return `${n>=0?'+':''}${n.toFixed(1)}`}
function renderStudents(){const k=$('classSelect').value;const list=k==='11'?master.s11:k==='12'?master.s12:[];$('studentHint').textContent=list.length?`${list.length} siswa tersedia.`:'Pilih kelas untuk menampilkan siswa.';if(!list.length){$('studentTable').innerHTML='<div class="empty">Belum ada siswa.</div>';return}$('studentTable').innerHTML='<div class="student-row head"><span></span><span>Nama Siswa</span><span>Nilai Kuis</span><span>Nilai Post Test</span></div>'+list.map((s,i)=>`<div class="student-row"><input class="pick" type="checkbox" data-i="${i}"><span>${esc(s)}</span><input class="quiz" type="number" min="0" max="100" step="1" placeholder="0–100"><input class="post" type="number" min="0" max="100" step="1" placeholder="0–100"></div>`).join('')}
function renderTable(){const fc=$('filterClass').value,fs=$('filterSubject').value,fm=$('filterMt').value;const data=rows.filter(r=>(!fc||String(r.kelas)===fc)&&(!fs||r.mapel===fs)&&(!fm||r.mt===fm)).slice().reverse();$('dataBody').innerHTML=data.length?data.map(r=>`<tr><td>${esc(r.date)}</td><td>${esc(r.kelas)}</td><td>${esc(r.siswa)}</td><td>${esc(r.mapel)}</td><td>${esc(r.mt)}</td><td>${esc(r.kuis)}</td><td>${esc(r.post)}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">Belum ada data.</td></tr>'}
function toast(t){const x=$('toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),3000)}
function setup(){
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(b.dataset.tab).classList.add('active')});
  document.querySelectorAll('[data-go="input"]').forEach(b=>b.onclick=()=>document.querySelector('[data-tab="input"]').click());
  $('classSelect').onchange=renderStudents;$('selectAll').onclick=()=>document.querySelectorAll('.pick').forEach(x=>x.checked=true);$('refreshBtn').onclick=()=>load();['filterClass','filterSubject','filterMt'].forEach(id=>$(id).onchange=renderTable);
  $('sessionForm').onsubmit=async e=>{e.preventDefault();const picked=[...document.querySelectorAll('.student-row:not(.head)')].filter(r=>r.querySelector('.pick')?.checked);if(!picked.length){toast('Pilih minimal satu siswa.');return}const payload={date:$('date').value,kelas:$('classSelect').value,mt:$('mtSelect').value,mapel:$('subjectSelect').value,students:picked.map(r=>({siswa:r.children[1].textContent.trim(),kuis:r.querySelector('.quiz').value,post:r.querySelector('.post').value}))};if(!CONFIG.API_URL){$('saveStatus').textContent='Form siap. API Google Sheets belum disambungkan.';toast('Data belum dikirim: API belum disetel.');return}try{$('saveStatus').textContent='Menyimpan…';const res=await fetch(CONFIG.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});if(!res.ok)throw new Error('Gagal menyimpan');$('saveStatus').textContent='Tersimpan ✓';toast('Data berhasil disimpan.');$('sessionForm').reset();renderStudents();setTimeout(load,500)}catch(err){$('saveStatus').textContent='Gagal menyimpan';toast(err.message)}};
  $('date').value=new Date().toISOString().slice(0,10);
}
setup();load();