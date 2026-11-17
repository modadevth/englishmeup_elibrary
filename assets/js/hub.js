(function(){
var D=window.HUB_D,K={mail:['PDF','รับฟรีทางอีเมล'],read:['อ่านบนเว็บ','อ่านฟรี'],paid:['E-Book','ทดลองอ่านฟรี']};
function render(card,id){var d=D[id],k=d.pack?['ชุดข้อสอบ','ดูตัวอย่างข้อสอบ']:K[d.k];
 var meta='<span>'+d.s+'</span><span class="'+(d.p?'eb2':'fr')+'">'+(d.pack?'ข้อสอบ':d.p?'E-Book':'ฟรี')+'</span><span>'+k[0]+'</span>'+(d.new?'<span>ใหม่</span>':'');
 var U=d.pack?'https://www.englishmeup.com/cutepexams/':d.sl+'/';
 var act=d.p?'<div class="pr"><b>฿'+d.p+'</b>'+(d.o?'<s>฿'+d.o+'</s>':'')+'</div><a class="btn" href="'+U+'?src=elib">ดูรายละเอียด · สั่งซื้อ →</a><a class="btn2" href="'+U+'?src=elib#sample">'+k[1]+'</a>'
  :'<a class="btn" href="'+U+'?src=elib">'+k[1]+' →</a>';
 card.innerHTML='<div class="dc"><a href="'+U+'?src=elib"><img src="'+d.c+'" srcset="'+d.cs+'" sizes="(max-width:900px) 110px, 150px" width="'+d.cw+'" height="'+d.ch+'" alt="ปก '+d.t+'" decoding="async"></a></div><div><div class="dm">'+meta+'</div><h3>'+d.t+'</h3><p>'+d.d+'</p><ul>'+d.bl.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div><div class="dact">'+act+'</div>'}
document.querySelectorAll('.sec').forEach(function(sec){var card=sec.querySelector('.detail');var set=function(id,scroll){sec.querySelectorAll('.bk').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});render(card,id);if(scroll&&card.getBoundingClientRect().top>innerHeight-120)card.scrollIntoView({behavior:'smooth',block:'nearest'})};
 set(card.dataset.first);sec.querySelectorAll('.bk[data-id]').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.id,true)})})});
var chips=[].slice.call(document.querySelectorAll('.chips button')),fs='all',ft='';
function apply(){document.querySelectorAll('.sec').forEach(function(s){s.hidden=!(fs==='all'||s.dataset.sub===fs)});
 document.querySelectorAll('.bk').forEach(function(b){b.classList.toggle('dim',!!ft&&!b.classList.contains(ft))});
 chips.forEach(function(c){c.classList.toggle('on',!!((c.dataset.f&&c.dataset.f===fs)||(c.dataset.t&&c.dataset.t===ft)))})}
chips.forEach(function(c){c.addEventListener('click',function(){if(c.dataset.f){fs=c.dataset.f}else{ft=ft===c.dataset.t?'':c.dataset.t}apply()})});
var h=location.hash.slice(1);if(/^(cutep|toeic|ielts|grammar)$/.test(h)){fs=h;apply()}
})();