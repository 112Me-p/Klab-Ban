(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const MENU=[
    {id:'rice-boiled',cat:'rice',no:'01',name:'ข้าวมันไก่ต้ม',desc:'ไก่ต้มเนื้อนุ่ม ข้าวมันหอม เสิร์ฟพร้อมน้ำราดสิงคโปร์',kicker:'SIGNATURE',image:'assets/menu-boiled.jpg',options:[{id:'normal',label:'ธรรมดา',price:50},{id:'special',label:'พิเศษ',price:60}]},
    {id:'rice-fried',cat:'rice',no:'02',name:'ข้าวไก่ทอด',desc:'ไก่ทอดกรอบด้านนอก เนื้อยังฉ่ำ กินกับข้าวมันและน้ำราด',kicker:'CRISPY RICE',image:'assets/menu-fried.jpg',options:[{id:'normal',label:'ธรรมดา',price:50},{id:'special',label:'พิเศษ',price:60}]},
    {id:'rice-offal',cat:'rice',no:'03',name:'ข้าวมันเครื่องใน',desc:'ข้าวมันกับเครื่องในและไก่ สำหรับคนชอบรสและสัมผัสที่เข้มขึ้น',kicker:'HOUSE FAVORITE',image:'assets/menu-offal.jpg',options:[{id:'normal',label:'ธรรมดา',price:50},{id:'special',label:'พิเศษ',price:60}]},
    {id:'chicken-boiled',cat:'chicken',no:'04',name:'ไก่สิงคโปร์ตอน',desc:'ไก่ตอนสับเป็นจาน เหมาะแชร์ เพิ่มข้าวมันแยกได้',kicker:'SHARE PLATE',image:'assets/menu-chicken-boiled.jpg',options:[{id:'s',label:'S',price:80},{id:'m',label:'M',price:100},{id:'l',label:'L',price:120}]},
    {id:'chicken-fried',cat:'chicken',no:'05',name:'ไก่ทอดตอน',desc:'ไก่ทอดสับเป็นจาน กรอบหอม เหมาะกินร่วมกัน',kicker:'CRISPY SHARE',image:'assets/menu-chicken-fried.jpg',options:[{id:'s',label:'S',price:70},{id:'m',label:'M',price:90},{id:'l',label:'L',price:110}]},
    {id:'rice-cup',cat:'extra',no:'06',name:'ข้าวมัน',desc:'ข้าวมันหอม เสิร์ฟเป็นถ้วย เพิ่มกับเมนูไก่เป็นจานได้พอดี',kicker:'EXTRA RICE',image:'assets/menu-rice-cup.jpg',options:[{id:'cup',label:'1 ถ้วย',price:15}]}
  ];
  const selected=Object.fromEntries(MENU.map(m=>[m.id,m.options[0].id]));
  const storageKey='kubban-cart-clean-v1';
  const state={filter:'all',cart:JSON.parse(localStorage.getItem(storageKey)||'[]')};
  const money=n=>`${n.toLocaleString('th-TH')}.-`;

  function renderMenu(){
    const root=$('#menuGrid');
    const items=MENU.filter(m=>state.filter==='all'||m.cat===state.filter);
    root.innerHTML=items.map(m=>{
      const opt=m.options.find(o=>o.id===selected[m.id])||m.options[0];
      return `<article class="menu-card" data-card="${m.id}">
        <div class="menu-image"><img src="${m.image}" alt="${m.name}"><span class="menu-no">${m.no}</span></div>
        <div class="menu-body"><span class="menu-kicker">${m.kicker}</span><h3>${m.name}</h3><p class="menu-desc">${m.desc}</p>
          <div class="menu-options">${m.options.map(o=>`<button class="size-choice ${o.id===opt.id?'is-active':''}" data-select="${m.id}" data-option="${o.id}"><small>${o.label}</small><strong>${money(o.price)}</strong></button>`).join('')}</div>
          <div class="menu-action"><div class="selected-price"><small>ราคาที่เลือก</small><strong>${money(opt.price)}</strong></div><button class="add-menu" data-card-add="${m.id}">เพิ่มลงตะกร้า +</button></div>
        </div></article>`;
    }).join('');
    $$('[data-select]',root).forEach(b=>b.addEventListener('click',()=>{selected[b.dataset.select]=b.dataset.option;renderMenu()}));
    $$('[data-card-add]',root).forEach(b=>b.addEventListener('click',()=>{
      const id=b.dataset.cardAdd; addItem(id,selected[id]); b.textContent='เพิ่มแล้ว ✓'; b.classList.add('added');
      setTimeout(()=>{if(document.body.contains(b)){b.textContent='เพิ่มลงตะกร้า +';b.classList.remove('added')}},850);
    }));
  }
  function addItem(id,optId,qty=1){
    const m=MENU.find(x=>x.id===id),o=m?.options.find(x=>x.id===optId); if(!m||!o)return;
    const key=`${id}:${optId}`,item=state.cart.find(x=>x.key===key); if(item)item.qty+=qty; else state.cart.push({key,id,optId,qty});
    persist(); showToast(`เพิ่ม ${m.name} ${o.label} แล้ว`);
  }
  function persist(){localStorage.setItem(storageKey,JSON.stringify(state.cart));renderCart()}
  function lineData(item){const m=MENU.find(x=>x.id===item.id),o=m?.options.find(x=>x.id===item.optId);return m&&o?{m,o,total:o.price*item.qty}:null}
  function renderCart(){
    let qty=0,total=0; const root=$('#cartItems'); state.cart=state.cart.filter(lineData);
    root.innerHTML=state.cart.map(item=>{const d=lineData(item);qty+=item.qty;total+=d.total;return `<div class="cart-line"><div><strong>${d.m.name}</strong><small>${d.o.label} · ${money(d.o.price)}</small><button class="remove" data-remove="${item.key}">ลบรายการ</button></div><div class="qty"><button data-qty="${item.key}" data-delta="-1">−</button><b>${item.qty}</b><button data-qty="${item.key}" data-delta="1">+</button></div></div>`}).join('');
    $('#cartEmpty').style.display=state.cart.length?'none':'flex'; $('#summaryQty').textContent=`${qty} รายการ`; $('#summaryTotal').textContent=money(total); $('#cartCountTop').textContent=qty; $('#cartCountMobile').textContent=qty; $('#cartTotalMobile').textContent=money(total);
    $$('[data-qty]',root).forEach(b=>b.onclick=()=>changeQty(b.dataset.qty,Number(b.dataset.delta))); $$('[data-remove]',root).forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(x=>x.key!==b.dataset.remove);persist()});
  }
  function changeQty(key,d){const item=state.cart.find(x=>x.key===key);if(!item)return;item.qty+=d;if(item.qty<=0)state.cart=state.cart.filter(x=>x.key!==key);persist()}
  function preset(type){if(type==='solo')addItem('rice-boiled','normal');if(type==='hungry')addItem('rice-boiled','special');if(type==='fried')addItem('rice-fried','special');if(type==='two'){addItem('chicken-boiled','m');addItem('rice-cup','cup',2)}openCart()}
  function orderText(){if(!state.cart.length)return 'ยังไม่มีรายการสั่งซื้อ';let total=0;const lines=state.cart.map((item,i)=>{const d=lineData(item);total+=d.total;return `${i+1}. ${d.m.name} (${d.o.label}) x${item.qty} = ${money(d.total)}`});const note=$('#orderNote').value.trim();return `ออเดอร์ “กลับบ้านข้าวมันไก่”\n${lines.join('\n')}\nรวม ${money(total)}${note?`\nหมายเหตุ: ${note}`:''}`}
  function openCart(){$('#cartDrawer').classList.add('open');$('#drawerBackdrop').classList.add('show');$('#cartDrawer').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeCart(){$('#cartDrawer').classList.remove('open');$('#drawerBackdrop').classList.remove('show');$('#cartDrawer').setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>t.classList.remove('show'),1800)}
  function setupStory(){
    if(matchMedia('(max-width:720px)').matches)return;
    const steps=$$('.story-step'),img=$('#storyImage'),count=$('#storyCurrent');
    const ob=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.48){steps.forEach(x=>x.classList.remove('is-active'));e.target.classList.add('is-active');const src=e.target.dataset.story;if(img.getAttribute('src')!==src){img.style.opacity='.35';img.style.transform='scale(1.025)';setTimeout(()=>{img.src=src;img.style.opacity='1';img.style.transform='scale(1)'},160)}count.textContent=e.target.dataset.index}})},{threshold:[.48,.6],rootMargin:'-15% 0px -15% 0px'});
    steps.forEach(s=>ob.observe(s));
  }
  function bind(){
    $$('[data-scroll]').forEach(b=>b.onclick=()=>$(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}));
    $$('.menu-filter button').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;$$('.menu-filter button').forEach(x=>x.classList.toggle('is-active',x===b));renderMenu()});
    $$('.quick-card').forEach(b=>b.onclick=()=>preset(b.dataset.preset));
    ['#openCartTop','#openCartBottom','#mobileCart'].forEach(s=>$(s)?.addEventListener('click',openCart));
    $('#closeCart').onclick=closeCart; $('#drawerBackdrop').onclick=closeCart;
    $('#copyOrder').onclick=()=>{const txt=orderText();navigator.clipboard?.writeText(txt).then(()=>showToast('คัดลอกออเดอร์แล้ว')).catch(()=>prompt('คัดลอกข้อความนี้',txt))};
    $('#lineOrder').onclick=()=>{if(!state.cart.length){showToast('เลือกเมนูก่อน');return}window.open(`https://line.me/R/msg/text/?${encodeURIComponent(orderText())}`,'_blank')};
    $('#copyMenuLink').onclick=()=>navigator.clipboard?.writeText(location.href).then(()=>showToast('คัดลอกลิงก์แล้ว'));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart()});
  }
  function init(){renderMenu();renderCart();bind();setupStory();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{})}
  document.addEventListener('DOMContentLoaded',init);
})();
