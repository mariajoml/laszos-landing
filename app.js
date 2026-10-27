(() => {
  // Número de WhatsApp para recibir pedidos (formato internacional, solo dígitos). Vacío = el cliente elige el contacto.
  const WHATSAPP = '';
  const MONOGRAM_PRICE = 180;

  const PRODUCTS = window.LASZOS_PRODUCTS || [];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const CATS = [
    { id: 'manteles', label: 'Manteles', cover: 'assets/img/productos/mantel-toile-azul.jpg' },
    { id: 'servilletas', label: 'Servilletas', cover: 'assets/img/productos/serv-porcelana.jpg' },
    { id: 'caminos', label: 'Caminos e individuales', short: 'Caminos', cover: 'assets/img/productos/individual-limones.jpg' },
    { id: 'panos', label: 'Paños de cocina', short: 'Paños', cover: 'assets/img/productos/pano-limonero-azul.jpg' },
    { id: 'personalizados', label: 'Personalizados', cover: 'assets/img/productos/toalla-laurel.jpg' },
    { id: 'toallas', label: 'Toallas', cover: 'assets/img/toallas/tulipanes.jpg' },
  ];
  const DESCRIPTIONS = {
    manteles: 'Estampado de autor sobre tela de caída suave, con dobladillo terminado a mano. Disponible en otras medidas sobre pedido.',
    servilletas: 'Juego de servilletas con dobladillo fino, pensadas para lucir dobladas en triángulo o sobre el plato.',
    caminos: 'Para vestir la mesa sin cubrirla del todo. Combínalos con servilletas de la misma colección.',
    panos: 'Paño de cocina estampado, tan bonito para secar como para servir el pan.',
    personalizados: 'Lo bordamos o estampamos con tus iniciales. Te enviamos una prueba antes de producir.',
    toallas: 'Toalla estampada con diseño exclusivo y el lazo de Laszos en la esquina. Ideal para playa, alberca o regalo.',
  };
  const THREADS = [['Azul francés', '#2c4a6e'], ['Verde salvia', '#5e6b57'], ['Bordeaux', '#8c2f39'], ['Oro viejo', '#a7834c'], ['Rosa antiguo', '#c27d8a'], ['Negro', '#1d1b19']];
  const CLOTHS = [['Marfil', '#f7f3ec'], ['Lino', '#e6dccb'], ['Rosa', '#f1dde0'], ['Celeste', '#dfe8ee'], ['Salvia', '#dfe4da']];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => '$' + n.toLocaleString('es-MX') + ' MXN';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('laszos:' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('laszos:' + k, JSON.stringify(v)); } catch {} },
  };

  const state = {
    cat: 'todo', q: '', sort: 'destacados', limit: 12, favsOnly: false,
    favs: new Set(store.get('favs', [])),
    cart: store.get('cart', []),
    variant: {},
  };

  /* ---------- Categories ---------- */
  $('[data-cats]').innerHTML = CATS.map(c => {
    const n = PRODUCTS.filter(p => p.cat === c.id).length;
    const href = c.id === 'toallas' ? '#toallas' : '#tienda';
    return `<a class="cat" href="${href}" data-filter-link="${c.id}">
      <div class="cat__img"><img src="${c.cover}" alt="" loading="lazy"></div>
      <h3>${c.short || c.label}</h3><span>${n} piezas</span></a>`;
  }).join('');

  /* ---------- Chips ---------- */
  const chips = $('[data-chips]');
  function renderChips() {
    const all = [{ id: 'todo', label: 'Todo' }, ...CATS];
    chips.innerHTML = all.map(c => {
      const n = c.id === 'todo' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c.id).length;
      const on = !state.favsOnly && state.cat === c.id;
      return `<button class="chip ${on ? 'is-on' : ''}" role="tab" aria-selected="${on}" data-chip="${c.id}">${c.label}<sup>${n}</sup></button>`;
    }).join('') + `<button class="chip ${state.favsOnly ? 'is-on' : ''}" data-chip="favs">♡ Favoritos<sup>${state.favs.size}</sup></button>`;
  }
  chips.addEventListener('click', e => {
    const b = e.target.closest('[data-chip]'); if (!b) return;
    if (b.dataset.chip === 'favs') { state.favsOnly = !state.favsOnly; } else { state.favsOnly = false; state.cat = b.dataset.chip; }
    state.limit = 12; render();
  });

  /* ---------- Grid ---------- */
  function filtered() {
    const q = norm(state.q.trim());
    let list = PRODUCTS.filter(p =>
      (state.favsOnly ? state.favs.has(p.id) : (state.cat === 'todo' || p.cat === state.cat)) &&
      (!q || q.split(/\s+/).some(w => norm(p.name + ' ' + p.line + ' ' + p.cat + ' ' + (p.tag || '')).includes(w))));
    if (state.sort === 'precio-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'precio-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'nombre') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return list;
  }
  function imgsOf(p) {
    if (p.variants) { const v = p.variants[state.variant[p.id] || 0]; return [v.img]; }
    return p.imgs;
  }
  function card(p, i) {
    const imgs = imgsOf(p);
    const tag = p.tag ? `<span class="card__tag ${p.tag === 'Más vendido' ? 'card__tag--accent' : ''}">${esc(p.tag)}</span>` : '';
    const dots = p.variants ? `<div class="dots">${p.variants.slice(0, 5).map((v, k) =>
      `<button class="dot ${k === (state.variant[p.id] || 0) ? 'is-on' : ''}" style="background:${v.hex}" title="${esc(v.name)}" aria-label="${esc(v.name)}" data-dot="${p.id}:${k}"></button>`).join('')}${p.variants.length > 5 ? `<small>+${p.variants.length - 5}</small>` : ''}</div>` : '';
    return `<article class="card" style="animation-delay:${(i % 12) * 40}ms">
      <div class="card__media" data-quick="${p.id}">
        ${tag}
        ${imgs.slice(0, 2).map((src, k) => `<img src="${src}" alt="${k ? '' : esc(p.name)}" loading="lazy">`).join('')}
        <button class="icon-btn card__fav ${state.favs.has(p.id) ? 'is-on' : ''}" aria-label="Guardar en favoritos" data-fav="${p.id}">
          <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>
        </button>
        <button class="card__add" data-add="${p.id}">Agregar a la bolsa</button>
      </div>
      <div class="card__body">
        <p class="card__line">${esc(p.line)}</p>
        <h3 class="card__name" data-quick="${p.id}">${esc(p.name)}</h3>
        <div class="card__row"><span class="card__price">${money(p.price)}</span>${dots}</div>
      </div>
    </article>`;
  }
  const grid = $('[data-grid]');
  function render() {
    const list = filtered();
    grid.innerHTML = list.slice(0, state.limit).map(card).join('');
    $('[data-empty]').hidden = list.length > 0;
    $('[data-more]').hidden = list.length <= state.limit;
    $('[data-count]').textContent = `${list.length} ${list.length === 1 ? 'pieza' : 'piezas'}`;
    renderChips();
  }
  grid.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { e.stopPropagation(); toggleFav(fav.dataset.fav); return; }
    const add = e.target.closest('[data-add]');
    if (add) { e.stopPropagation(); addToCart(add.dataset.add, state.variant[add.dataset.add] || 0, 1); return; }
    const dot = e.target.closest('[data-dot]');
    if (dot) { const [id, k] = dot.dataset.dot.split(':'); state.variant[id] = +k; render(); return; }
  });
  $('[data-more]').addEventListener('click', () => { state.limit += 12; render(); });
  $('[data-search]').addEventListener('input', e => { state.q = e.target.value; state.limit = 12; render(); });
  $('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; render(); });

  function goShop(cat, q) {
    state.favsOnly = false;
    if (cat) state.cat = cat;
    if (q !== undefined) { state.q = q; $('[data-search]').value = q; }
    state.limit = 12; render();
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-filter-link]');
    if (f && f.dataset.filterLink !== 'toallas') { goShop(f.dataset.filterLink, ''); closeMenu(); }
    else if (f) closeMenu();
    const s = e.target.closest('[data-search-link]');
    if (s) goShop('todo', s.dataset.searchLink.split(' ')[0]);
    const q = e.target.closest('[data-quick]');
    if (q && !e.target.closest('[data-fav],[data-add],[data-dot]')) openQuick(q.dataset.quick);
  });
  $('[data-focus-search]').addEventListener('click', () => {
    $('#tienda').scrollIntoView(); setTimeout(() => $('[data-search]').focus({ preventScroll: true }), 400);
  });
  $('[data-show-favs]').addEventListener('click', () => {
    state.favsOnly = true; state.limit = 99; render(); $('#tienda').scrollIntoView();
  });

  /* ---------- Favs ---------- */
  function toggleFav(id) {
    state.favs.has(id) ? state.favs.delete(id) : (state.favs.add(id), toast('Guardado en favoritos'));
    store.set('favs', [...state.favs]); render(); syncBadges();
  }

  /* ---------- Towels rail ---------- */
  const rail = $('[data-towels]');
  rail.innerHTML = PRODUCTS.filter(p => p.cat === 'toallas').map(p =>
    `<button class="towel" data-quick="${p.id}"><div class="towel__img"><img src="${p.imgs[0]}" alt="${esc(p.name)}" loading="lazy"></div>
     <div class="towel__meta"><b>${esc(p.name.replace('Toalla ', ''))}</b><span>${money(p.price)}</span></div></button>`).join('');
  const step = () => rail.firstElementChild.getBoundingClientRect().width + 18;
  $('[data-towel-prev]').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('[data-towel-next]').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));

  /* ---------- Quick view ---------- */
  const modal = $('[data-modal]');
  function openQuick(id) {
    const p = byId[id]; if (!p) return;
    let vi = state.variant[id] || 0, qty = 1, imgIndex = 0;
    const catLabel = CATS.find(c => c.id === p.cat)?.label || '';
    function draw() {
      const imgs = p.variants ? [p.variants[vi].img] : p.imgs;
      $('[data-qv]').innerHTML = `
        <div class="qv__media">
          <img class="qv__main" src="${imgs[imgIndex] || imgs[0]}" alt="${esc(p.name)}">
          ${imgs.length > 1 ? `<div class="qv__thumbs">${imgs.map((s, k) => `<button class="${k === imgIndex ? 'is-on' : ''}" data-thumb="${k}"><img src="${s}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div class="qv__info">
          <p class="eyebrow" style="margin:0">${esc(catLabel)}</p>
          <h2 id="qv-title">${esc(p.name)}</h2>
          <p class="qv__price">${money(p.price)}</p>
          <p class="qv__desc">${esc(p.line)}. ${DESCRIPTIONS[p.cat] || ''}</p>
          ${p.variants ? `<p class="qv__label">Color: <b>${esc(p.variants[vi].name)}</b></p>
            <div class="qv__swatches">${p.variants.map((v, k) => `<button class="swatch ${k === vi ? 'is-on' : ''}" style="background:${v.hex}" aria-label="${esc(v.name)}" title="${esc(v.name)}" data-sw="${k}"></button>`).join('')}</div>` : ''}
          <p class="qv__label">Cantidad</p>
          <div class="qv__buy">
            <div class="qty"><button data-q="-1" aria-label="Menos">−</button><span>${qty}</span><button data-q="1" aria-label="Más">+</button></div>
            <button class="btn btn--ink" data-qv-add>Agregar · ${money(p.price * qty)}</button>
          </div>
          <button class="btn btn--ghost" data-qv-fav>${state.favs.has(id) ? '♥ En favoritos' : '♡ Guardar en favoritos'}</button>
          <ul class="qv__perks">
            <li>Personalízalo con tu monograma (+${money(MONOGRAM_PRICE)})</li>
            <li>Envuelto con el lazo de la casa</li>
            <li>Confirmamos tu pedido por WhatsApp</li>
          </ul>
        </div>`;
    }
    draw();
    $('[data-qv]').onclick = e => {
      const t = e.target;
      if (t.closest('[data-thumb]')) { imgIndex = +t.closest('[data-thumb]').dataset.thumb; draw(); }
      if (t.closest('[data-sw]')) { vi = +t.closest('[data-sw]').dataset.sw; state.variant[id] = vi; imgIndex = 0; draw(); render(); }
      if (t.closest('[data-q]')) { qty = Math.max(1, qty + +t.closest('[data-q]').dataset.q); draw(); }
      if (t.closest('[data-qv-fav]')) { toggleFav(id); draw(); }
      if (t.closest('[data-qv-add]')) { addToCart(id, vi, qty); closeModal(); }
    };
    modal.hidden = false; document.body.style.overflow = 'hidden';
    $('.modal__close', modal).focus();
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; }
  $$('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));

  /* ---------- Cart ---------- */
  const drawer = $('[data-cart]');
  function saveCart() { store.set('cart', state.cart); syncBadges(); drawCart(); }
  function addToCart(id, vi = 0, qty = 1) {
    const p = byId[id]; if (!p) return;
    const key = id + (p.variants ? ':' + vi : '');
    const line = state.cart.find(l => l.key === key);
    line ? line.qty += qty : state.cart.push({ key, id, vi, qty });
    saveCart();
    toast(`${p.name}${p.variants ? ' · ' + p.variants[vi].name : ''} en tu bolsa`);
  }
  function lineInfo(l) {
    if (l.mono) return { name: `Monograma “${l.mono.text}”`, sub: `${l.mono.styleLabel} · hilo ${l.mono.thread} · tela ${l.mono.cloth}`, price: MONOGRAM_PRICE };
    const p = byId[l.id]; if (!p) return null;
    return { name: p.name, sub: p.variants ? p.variants[l.vi].name : p.line, price: p.price, img: p.variants ? p.variants[l.vi].img : p.imgs[0] };
  }
  function drawCart() {
    state.cart = state.cart.filter(l => lineInfo(l));
    const body = $('[data-cart-items]');
    if (!state.cart.length) {
      body.innerHTML = `<div class="drawer__empty"><p>Tu bolsa está vacía.</p><a href="#tienda" class="link-arrow" data-close-cart>Ir a la tienda</a></div>`;
    } else {
      body.innerHTML = state.cart.map((l, i) => {
        const info = lineInfo(l);
        const thumb = l.mono ? `<div class="line__mono" style="color:${l.mono.hex}">${esc(l.mono.text)}</div>` : `<img src="${info.img}" alt="">`;
        return `<div class="line">${thumb}
          <div><h4>${esc(info.name)}</h4><p>${esc(info.sub)}</p>
            <div class="qty"><button data-lq="${i}:-1" aria-label="Menos">−</button><span>${l.qty}</span><button data-lq="${i}:1" aria-label="Más">+</button></div></div>
          <div class="line__right"><span>${money(info.price * l.qty)}</span><button class="line__remove" data-rm="${i}">Quitar</button></div></div>`;
      }).join('');
    }
    $('[data-cart-total]').textContent = money(state.cart.reduce((s, l) => s + lineInfo(l).price * l.qty, 0));
    $('[data-checkout]').disabled = !state.cart.length;
  }
  $('[data-cart-items]').addEventListener('click', e => {
    const q = e.target.closest('[data-lq]');
    if (q) { const [i, d] = q.dataset.lq.split(':').map(Number); state.cart[i].qty = Math.max(1, state.cart[i].qty + d); saveCart(); }
    const rm = e.target.closest('[data-rm]');
    if (rm) { state.cart.splice(+rm.dataset.rm, 1); saveCart(); }
  });
  function openCart() { drawCart(); drawer.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeCart() { drawer.hidden = true; document.body.style.overflow = ''; }
  $('[data-open-cart]').addEventListener('click', openCart);
  document.addEventListener('click', e => { if (e.target.closest('[data-close-cart]')) closeCart(); });
  $('[data-checkout]').addEventListener('click', () => {
    const lines = state.cart.map(l => { const i = lineInfo(l); return `• ${l.qty} × ${i.name} (${i.sub}) — ${money(i.price * l.qty)}`; });
    const total = state.cart.reduce((s, l) => s + lineInfo(l).price * l.qty, 0);
    const text = `Hola Laszos, me gustaría hacer este pedido:\n\n${lines.join('\n')}\n\nSubtotal: ${money(total)}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
  $('[data-contact]').addEventListener('click', e => {
    e.preventDefault(); window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola Laszos, quisiera información.')}`, '_blank', 'noopener');
  });

  function syncBadges() {
    const n = state.cart.reduce((s, l) => s + l.qty, 0);
    const cb = $('[data-cart-count]'); cb.textContent = n; cb.hidden = !n;
    const fb = $('[data-fav-count]'); fb.textContent = state.favs.size; fb.hidden = !state.favs.size;
  }

  /* ---------- Monogram studio ---------- */
  const napkin = $('[data-napkin]'), mark = $('[data-mark]'), monoInput = $('[data-mono-input]');
  const mono = { style: 'script', thread: 0, cloth: 0 };
  const STYLE_LABEL = { script: 'Caligrafía', serif: 'Clásico', block: 'Romano' };
  const swatchHTML = (list, sel) => list.map(([n, h], k) => `<button type="button" class="swatch ${k === sel ? 'is-on' : ''}" style="background:${h}" title="${n}" aria-label="${n}" data-k="${k}"></button>`).join('');
  function drawMono() {
    mark.textContent = (monoInput.value || 'ML').toUpperCase();
    napkin.dataset.style = mono.style;
    napkin.style.setProperty('--thread', THREADS[mono.thread][1]);
    napkin.style.setProperty('--cloth', CLOTHS[mono.cloth][1]);
    $('[data-mono-thread]').innerHTML = swatchHTML(THREADS, mono.thread);
    $('[data-mono-cloth]').innerHTML = swatchHTML(CLOTHS, mono.cloth);
    $$('[data-mono-style] button').forEach(b => b.classList.toggle('is-on', b.dataset.v === mono.style));
  }
  monoInput.addEventListener('input', () => { monoInput.value = monoInput.value.replace(/[^a-záéíóúñü&]/gi, ''); drawMono(); });
  $('[data-mono-style]').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { mono.style = b.dataset.v; drawMono(); } });
  $('[data-mono-thread]').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { mono.thread = +b.dataset.k; drawMono(); } });
  $('[data-mono-cloth]').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) { mono.cloth = +b.dataset.k; drawMono(); } });
  $('[data-mono-add]').addEventListener('click', () => {
    const text = (monoInput.value || 'ML').toUpperCase();
    state.cart.push({ key: 'mono:' + Date.now(), mono: { text, styleLabel: STYLE_LABEL[mono.style], thread: THREADS[mono.thread][0], hex: THREADS[mono.thread][1], cloth: CLOTHS[mono.cloth][0] }, qty: 1 });
    saveCart(); toast(`Monograma ${text} agregado`); openCart();
  });

  /* ---------- Menu, misc ---------- */
  const menu = $('[data-menu]');
  function closeMenu() { menu.hidden = true; }
  $('[data-open-menu]').addEventListener('click', () => { menu.hidden = false; });
  $('[data-close-menu]').addEventListener('click', closeMenu);
  menu.addEventListener('click', e => { if (e.target === menu) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeCart(); closeMenu(); } });

  $('[data-news]').addEventListener('submit', e => { e.preventDefault(); e.target.hidden = true; $('[data-news-ok]').hidden = false; });
  $$('[data-price-of]').forEach(el => { const p = byId[el.dataset.priceOf]; if (p) el.textContent = money(p.price); });
  $('[data-year]').textContent = new Date().getFullYear();

  let toastTimer;
  function toast(msg) {
    const t = $('[data-toast]'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  render(); drawMono(); syncBadges();
})();
