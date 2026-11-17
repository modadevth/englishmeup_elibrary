(function(){
var B=window.BOOK||{};var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var pop=$('#pop'),ex=$('#ex');
function openPop(e){if(e)e.preventDefault();pop.hidden=false;var i=$('input',pop);if(i)setTimeout(function(){i.focus()},50)}
$$('[data-pop]').forEach(function(a){a.addEventListener('click',openPop)});
$$('[data-close]').forEach(function(b){b.addEventListener('click',function(){b.closest('.pop,.exv').hidden=true})});
pop.addEventListener('click',function(e){if(e.target===pop)pop.hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){pop.hidden=true;if(ex)ex.hidden=true}});
// email forms: Brevo form is not wired yet (README §5). window.ELIB_SUBMIT(email, slug) can be defined later to hook it up.
document.addEventListener('submit',function(e){var f=e.target;if(!f.matches('form[data-mail]'))return;e.preventDefault();
 var inp=$('input[type=email]',f),m=f.parentNode.querySelector('.msg')||(function(){var d=document.createElement('p');d.className='msg';f.after(d);return d})();
 var v=(inp.value||'').trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){m.className='msg err';m.textContent='กรุณากรอกอีเมลให้ถูกต้อง';inp.focus();return}
 if(typeof window.ELIB_SUBMIT==='function'){window.ELIB_SUBMIT(v,B.slug,f);m.className='msg';m.textContent='ส่งแล้ว · กรุณาเช็กอีเมลและกดยืนยัน';return}
 m.className='msg';m.innerHTML='ระบบส่งอีเมลกำลังเปิดใช้งานเร็วๆ นี้ · ระหว่างนี้ทัก <a href="https://line.me/ti/p/%40englishmeup" target="_blank" rel="noopener">LINE @englishmeup</a> เพื่อรับเอกสารได้เลยครับ'});
// example viewer
var pg=(B.pages||[]).map(function(p,n){return '<img src="'+p.src+'" srcset="'+p.set+'" sizes="(max-width:767px) calc(100vw - 20px), 520px" width="'+p.w+'" height="'+p.h+'" alt="หน้าตัวอย่าง '+(n+1)+' · '+esc(B.title||'')+'" decoding="async">'});if(B.gate)pg.push(B.gate);
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var at=0;function step(){return innerWidth<768?1:2}
function draw(){var st=step();$('#bk').innerHTML=pg.slice(at,at+st).map(function(h){return '<div class="pgw">'+h+'</div>'}).join('');$('#cn').textContent=(at+1)+(st>1&&at+1<pg.length?'–'+(at+2):'')+' / '+pg.length}
function openEx(e){if(e)e.preventDefault();if(!pg.length||!ex)return;ex.hidden=false;at=0;draw();ex.scrollTo(0,0)}
if(ex){$('#pv').onclick=function(){at=Math.max(0,at-step());draw()};$('#nx').onclick=function(){at=Math.min(pg.length-1,at+step());draw()};
 $$('[data-ex]').forEach(function(a){a.addEventListener('click',openEx)});addEventListener('resize',function(){if(!ex.hidden)draw()});
 if(/^#(sample|example)$/.test(location.hash))openEx()}
// banner carousel
var sw=$('.bn .sw');if(sw){var ds=$$('.bn .dots i'),i=0,T;var go=function(n){i=(n+ds.length)%ds.length;sw.scrollTo({left:sw.clientWidth*i,behavior:'smooth'});ds.forEach(function(d,k){d.classList.toggle('on',k===i)})};
 var start=function(){clearInterval(T);T=setInterval(function(){go(i+1)},4000)};ds.forEach(function(d,k){d.onclick=function(){go(k);start()}});go(0);start()}
})();