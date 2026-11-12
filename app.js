(() => {
  // WhatsApp de Sandra para recibir pedidos (formato internacional, solo dígitos: 57 = Colombia).
  const WHATSAPP = '573102913750';
  const MONOGRAM_PRICE = 25000;

  const PRODUCTS = window.LASZOS_PRODUCTS || [];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const isXmas = p => !!p.col || p.tag === 'Navidad';
  const inCat = (p, c) => c === 'todo' || p.cat === c || (c === 'navidad' && isXmas(p));
  const COLLECTIONS = [
    { id: 'cascanueces', name: 'Cascanueces', kicker: 'Toile en rojo vino',
      text: 'Un cuento de invierno dibujado a plumilla: cascanueces, bailarina sobre el hielo, caballitos de madera y lazos con campanas.',
      pattern: 'assets/img/navidad/cascanueces-chiro.jpg', tone: '#8c2f39' },
    { id: 'velitas', name: 'Noche de Velitas', kicker: 'Acuarela colombiana',
      text: 'La Navidad de casa: orquídeas, buganvilias, faroles de papel, natilla con canela y buñuelos recién hechos.',
      pattern: 'assets/img/navidad/velitas-chiro.jpg', tone: '#b0306a' },
    { id: 'porcelana', name: 'Porcelana', kicker: 'Azul cobalto y lazo rojo',
      text: 'Bolas, campanas y estrellas de loza pintada a mano, con rayas de mantel clásico y ramas de pino.',
      pattern: 'assets/img/navidad/porcelana-chiro.jpg', tone: '#1f3f8f' },
  ];
  const CATS = [
    { id: 'navidad', label: 'Navidad ✦', short: 'Navidad', cover: 'assets/img/navidad/cascanueces-panoleta.jpg', art: true },
    { id: 'manteles', label: 'Manteles', cover: 'assets/img/productos/mantel-flor-de-loto.jpg' },
    { id: 'servilletas', label: 'Servilletas', cover: 'assets/img/productos/serv-porcelana.jpg' },
    { id: 'caminos', label: 'Caminos e individuales', short: 'Caminos', cover: 'assets/img/productos/individual-limones.jpg' },
    { id: 'panos', label: 'Limpiones y chiros', short: 'Limpiones', cover: 'assets/img/limpiones/limpion-huerto-uso.jpg' },
    { id: 'personalizados', label: 'Personalizados', cover: 'assets/img/productos/toalla-laurel.jpg' },
    { id: 'panoletas', label: 'Pañoletas', cover: 'assets/img/panoletas/tulipanes.jpg' },
    { id: 'toallas', label: 'Toallas', cover: 'assets/img/toallas/tigre.jpg' },
  ];
  const DESCRIPTIONS = {
    manteles: 'Estampado de autor sobre tela de caída suave, con dobladillo terminado a mano. Disponible en otras medidas sobre pedido.',
    servilletas: 'Juego de servilletas con dobladillo fino, pensadas para lucir dobladas en triángulo o sobre el plato.',
    caminos: 'Para vestir la mesa sin cubrirla del todo. Combínalos con servilletas de la misma colección.',
    panos: 'Estampado de autor, tan bonito para secar como para servir el pan.',
    personalizados: 'Lo bordamos o estampamos con tus iniciales. Te enviamos una prueba antes de producir.',
    panoletas: 'Pañoleta cuadrada con estampado exclusivo y la firma de Laszos. Úsala al cuello, como servilleta grande o para cubrir la panera.',
    toallas: 'Toalla estampada con diseño exclusivo y el lazo de Laszos en la esquina. Ideal para playa, alberca o regalo.',
    packs: 'Piezas que combinan entre sí, a mejor precio que compradas por separado. Listo para regalar.',
  };
  const THREADS = [['Azul francés', '#2c4a6e'], ['Verde salvia', '#5e6b57'], ['Bordeaux', '#8c2f39'], ['Oro viejo', '#a7834c'], ['Rosa antiguo', '#c27d8a'], ['Negro', '#1d1b19']];
  const CLOTHS = [['Marfil', '#f7f3ec'], ['Lino', '#e6dccb'], ['Rosa', '#f1dde0'], ['Celeste', '#dfe8ee'], ['Salvia', '#dfe4da']];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => '$' + n.toLocaleString('es-CO') + ' COP';
  // Precios: juegos de 4/6 (sizes), limpiones de a 3 (trio), "a consultar" (price null) y packs (list).
  const TRIO_PRICE = PRODUCTS.find(p => p.trio)?.price || 86000;
  const unitPrice = (p, si = 0) => p.sizes ? p.sizes[si].price : p.price;
  const askOnly = p => p.price == null;
  const priceLabel = p => askOnly(p) ? 'Precio a consultar'
    : p.sizes ? 'Desde ' + money(p.sizes[0].price)
    : p.trio ? money(p.price) + ' · set de 3'
    : money(p.price);
  const priceHTML = p => (p.list ? `<s class="was">${money(p.list)}</s> ` : '') + esc(priceLabel(p));
  function askPrice(p) {
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola Sandra, quisiera saber el precio de: ${p.name} (${p.line}).`)}`, '_blank', 'noopener');
  }
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
    variant: {}, size: {},
  };

  /* ---------- Hero board ---------- */
  const L = 'clamp(150px, 14vw, 220px)', M = 'clamp(130px, 11.5vw, 185px)', S = 'clamp(105px, 9vw, 145px)';
  const PINS = [
    ['nav-cascanueces-panoleta', 11, 30, L, -7], ['nav-porcelana-servilleta', 25, 15, S, 4], ['nav-velitas-panoleta', 23, 64, M, 5], ['nav-porcelana-limpion', 8, 80, S, -3],
    ['nav-porcelana-panoleta', 89, 30, L, 6], ['nav-cascanueces-servilleta', 75, 16, S, -4], ['nav-velitas-servilleta', 77, 65, M, -5], ['nav-cascanueces-limpion', 92, 80, S, 3],
  ];
  const artCls = p => (p && p.art ? ' is-art' : '');
  const board = $('[data-board]');
  board.innerHTML = PINS.map(([id, x, y, w, r], i) => {
    const p = byId[id];
    return `<button class="pin" data-quick="${p.id}" data-depth="${(i % 3) + 1}" style="--x:${x}%;--y:${y}%;--w:${w};--r:${r}deg;--d:${120 + i * 90}ms">
      <span class="pin__img${artCls(p)}"><img src="${p.imgs[0]}" alt="${esc(p.name)}"></span><span class="pin__cap">${esc(p.name)}</span></button>`;
  }).join('');
  const hero = $('.hero');
  if (matchMedia('(hover: hover) and (min-width: 961px)').matches) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect(), dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      $$('.pin', board).forEach(pin => { const k = pin.dataset.depth * 7; pin.style.setProperty('--px', `${-dx * k}px`); pin.style.setProperty('--py', `${-dy * k}px`); });
    });
  }

  /* ---------- Categories ---------- */
  $('[data-cats]').innerHTML = CATS.map(c => {
    const n = PRODUCTS.filter(p => inCat(p, c.id)).length;
    return `<a class="cat${c.id === 'navidad' ? ' cat--xmas' : ''}" href="#tienda" data-filter-link="${c.id}">
      <div class="cat__img${c.art ? ' is-art' : ''}"><img src="${c.cover}" alt="" loading="lazy"></div>
      <h3>${c.short || c.label}</h3><span>${n} piezas</span></a>`;
  }).join('');

  /* ---------- Chips ---------- */
  const chips = $('[data-chips]');
  function renderChips() {
    const all = [{ id: 'todo', label: 'Todo' }, ...CATS];
    chips.innerHTML = all.map(c => {
      const n = PRODUCTS.filter(p => inCat(p, c.id)).length;
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
      (state.favsOnly ? state.favs.has(p.id) : inCat(p, state.cat)) &&
      (!q || q.split(/\s+/).some(w => norm(p.name + ' ' + p.line + ' ' + p.cat + ' ' + (p.tag || '')).includes(w))));
    const pr = (p, none) => askOnly(p) ? none : p.price;
    if (state.sort === 'precio-asc') list = [...list].sort((a, b) => pr(a, Infinity) - pr(b, Infinity));
    if (state.sort === 'precio-desc') list = [...list].sort((a, b) => pr(b, -1) - pr(a, -1));
    if (state.sort === 'nombre') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return list;
  }
  function imgsOf(p) {
    if (p.variants) { const v = p.variants[state.variant[p.id] || 0]; return [v.img]; }
    return photoFirst(p);
  }
  // Orden de imágenes: primero el diseño y después el mockup (cómo se ve).
  function photoFirst(p) { return p.imgs; }
  const isPhoto = (p, src) => !!p.art && src !== p.imgs[0];
  function card(p, i) {
    const imgs = imgsOf(p);
    const tag = p.tag ? `<span class="card__tag ${p.tag === 'Más vendido' ? 'card__tag--accent' : ''}${p.tag === 'Navidad' ? 'card__tag--xmas' : ''}">${esc(p.tag)}</span>` : '';
    const dots = p.variants ? `<div class="dots">${p.variants.slice(0, 5).map((v, k) =>
      `<button class="dot ${k === (state.variant[p.id] || 0) ? 'is-on' : ''}" style="background:${v.hex}" title="${esc(v.name)}" aria-label="${esc(v.name)}" data-dot="${p.id}:${k}"></button>`).join('')}${p.variants.length > 5 ? `<small>+${p.variants.length - 5}</small>` : ''}</div>` : '';
    return `<article class="card" style="animation-delay:${(i % 12) * 40}ms">
      <div class="card__media${artCls(p)}" data-quick="${p.id}">
        ${tag}
        ${imgs.slice(0, 2).map((src, k) => `<img src="${src}" alt="${k ? '' : esc(p.name)}" loading="lazy"${isPhoto(p, src) ? ' class="is-photo"' : ''}>`).join('')}
        <button class="icon-btn card__fav ${state.favs.has(p.id) ? 'is-on' : ''}" aria-label="Guardar en favoritos" data-fav="${p.id}">
          <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>
        </button>
        ${askOnly(p) ? `<button class="card__add" data-ask="${p.id}">Consultar precio</button>`
          : `<button class="card__add" data-add="${p.id}">Agregar a la bolsa</button>`}
      </div>
      <div class="card__body">
        <p class="card__line">${esc(p.line)}</p>
        <h3 class="card__name" data-quick="${p.id}">${esc(p.name)}</h3>
        <div class="card__row"><span class="card__price">${priceHTML(p)}</span>${dots}</div>
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
    if (add) { e.stopPropagation(); addToCart(add.dataset.add, state.variant[add.dataset.add] || 0, 1, state.size[add.dataset.add] || 0); return; }
    const ask = e.target.closest('[data-ask]');
    if (ask) { e.stopPropagation(); askPrice(byId[ask.dataset.ask]); return; }
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
    if (f) { goShop(f.dataset.filterLink, ''); closeMenu(); }
    const s = e.target.closest('[data-search-link]');
    if (s) goShop('todo', s.dataset.searchLink.split(' ')[0]);
    const q = e.target.closest('[data-quick]');
    if (q && !e.target.closest('[data-fav],[data-add],[data-dot],[data-ask]')) openQuick(q.dataset.quick);
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
  rail.innerHTML = PRODUCTS.filter(p => p.cat === 'panoletas' || p.cat === 'toallas').map(p =>
    `<button class="towel" data-quick="${p.id}"><div class="towel__img${artCls(p)}"><img src="${photoFirst(p)[0]}" alt="${esc(p.name)}" loading="lazy"${isPhoto(p, photoFirst(p)[0]) ? ' class="is-photo"' : ''}></div>
     <div class="towel__meta"><b>${esc(p.name)}</b><span>${esc(priceLabel(p))}</span></div></button>`).join('');
  const step = () => rail.firstElementChild.getBoundingClientRect().width + 18;
  $('[data-towel-prev]').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('[data-towel-next]').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));

  /* ---------- Colección de Navidad ---------- */
  const KIND_ORDER = ['panoleta', 'servilleta', 'mantel', 'limpion', 'chiro'];
  $('[data-xmas]').innerHTML = COLLECTIONS.map(c => {
    const pieces = KIND_ORDER.map(k => byId[`nav-${c.id}-${k}`]).filter(Boolean);
    const packHTML = ['completa', 'mesa', 'regalo'].map(k => byId[`nav-${c.id}-pack-${k}`]).filter(Boolean).map(pack => `<div class="xpack">
        <div><p class="eyebrow">${esc(pack.name.replace(' ' + c.name, ''))} · ahorras ${money(pack.list - pack.price)}</p>
          <b>${esc(pack.line)}</b></div>
        <div class="xpack__buy"><span>${priceHTML(pack)}</span>
          <button class="btn btn--ink" data-xadd="${pack.id}">Agregar pack</button>
          <button class="link-arrow" data-quick="${pack.id}">Ver</button></div>
      </div>`).join('');
    return `<article class="xcol" style="--pattern:url('${c.pattern}');--tone:${c.tone}">
      <div class="xcol__intro">
        <div class="xcol__card">
          <p class="eyebrow">${esc(c.kicker)}</p>
          <h3>${esc(c.name)}</h3>
          <p>${esc(c.text)}</p>
          <button class="link-arrow" data-xcol="${c.id}">Ver las ${pieces.length} piezas</button>
        </div>
      </div>
      <div class="xcol__pieces">${pieces.map(p => `<button class="xpiece" data-quick="${p.id}">
        <span class="xpiece__img"><img src="${p.imgs[0]}" alt="${esc(p.name)}" loading="lazy">${p.imgs[1] ? `<img class="is-photo" src="${p.imgs[1]}" alt="" loading="lazy">` : ''}</span>
        <b>${esc(p.name.replace(' ' + c.name, ''))}</b><span>${esc(priceLabel(p))}</span></button>`).join('')}</div>
      ${packHTML}
    </article>`;
  }).join('') + (() => {
    // Packs que mezclan las tres colecciones
    const cross = ['nav-trio-panoletas', 'nav-trio-servilletas', 'nav-trio-limpiones', 'nav-trio-chiros'].map(id => byId[id]).filter(Boolean);
    if (!cross.length) return '';
    return `<div class="xcross">
      <div class="xcross__head"><p class="eyebrow">Packs para regalar</p><h3>Una pieza de <em>cada colección</em></h3></div>
      <div class="xcross__grid">${cross.map(t => `<article class="xtrio">
        <button class="xtrio__imgs" data-quick="${t.id}" aria-label="Ver ${esc(t.name)}">${t.imgs.slice(1, 4).map(s => `<img src="${s}" alt="" loading="lazy">`).join('')}</button>
        <div><h4>${esc(t.name)}</h4><p>${esc(t.line)}${t.list ? ` · ahorras ${money(t.list - t.price)}` : ''}</p>
          <div class="xpack__buy"><span>${priceHTML(t)}</span><button class="btn btn--ink" data-xadd="${t.id}">Agregar</button></div></div>
      </article>`).join('')}</div>
    </div>`;
  })();
  $('[data-xmas]').addEventListener('click', e => {
    const xa = e.target.closest('[data-xadd]');
    if (xa) { addToCart(xa.dataset.xadd, 0, 1); return; }
    const b = e.target.closest('[data-xcol]'); if (!b) return;
    const c = COLLECTIONS.find(x => x.id === b.dataset.xcol);
    goShop('navidad', c.name.split(' ').pop()); $('#tienda').scrollIntoView();
  });

  /* ---------- Quick view ---------- */
  const modal = $('[data-modal]');
  function openQuick(id) {
    const p = byId[id]; if (!p) return;
    let vi = state.variant[id] || 0, si = state.size[id] || 0, qty = 1, imgIndex = 0;
    const col = COLLECTIONS.find(c => c.id === p.col);
    const catLabel = (CATS.find(c => c.id === p.cat)?.label || '') + (col ? ` · Navidad ${col.name}` : '');
    function draw() {
      const imgs = p.variants ? [p.variants[vi].img] : photoFirst(p);
      $('[data-qv]').innerHTML = `
        <div class="qv__media${artCls(p)}">
          <img class="qv__main${isPhoto(p, imgs[imgIndex] || imgs[0]) ? ' is-photo' : ''}" src="${imgs[imgIndex] || imgs[0]}" alt="${esc(p.name)}">
          ${imgs.length > 1 ? `<button class="qv__arrow qv__arrow--prev" data-step="-1" aria-label="Imagen anterior">‹</button><button class="qv__arrow qv__arrow--next" data-step="1" aria-label="Imagen siguiente">›</button>` : ''}
          ${imgs.length > 1 ? `<div class="qv__thumbs">${imgs.map((s, k) => `<button class="${k === imgIndex ? 'is-on' : ''}" data-thumb="${k}"><img src="${s}" alt=""${isPhoto(p, s) ? ' class="is-photo"' : ''}><small>${p.art ? (isPhoto(p, s) ? 'Así se ve' : 'Diseño') : `Foto ${k + 1}`}</small></button>`).join('')}</div>` : ''}
        </div>
        <div class="qv__info">
          <p class="eyebrow" style="margin:0">${esc(catLabel)}</p>
          <h2 id="qv-title">${esc(p.name)}</h2>
          <p class="qv__price">${p.sizes ? money(unitPrice(p, si)) : priceHTML(p)}${p.list ? ` <small class="save">Ahorras ${money(p.list - p.price)}</small>` : ''}</p>
          <p class="qv__desc">${esc(p.line)}. ${DESCRIPTIONS[p.cat] || ''}</p>
          ${p.includes ? `<ul class="qv__incl">${p.includes.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          ${p.trio ? `<p class="qv__note">Limpiones y chiros se venden de a 3 y puedes combinarlos: elige 3 y pagas ${money(TRIO_PRICE)} por el set.</p>` : ''}
          ${p.sizes ? `<p class="qv__label">Presentación</p>
            <div class="seg">${p.sizes.map((s, k) => `<button type="button" class="${k === si ? 'is-on' : ''}" data-size="${k}">${esc(s.name)} · ${money(s.price)}</button>`).join('')}</div>` : ''}
          ${p.variants ? `<p class="qv__label">Color: <b>${esc(p.variants[vi].name)}</b></p>
            <div class="qv__swatches">${p.variants.map((v, k) => `<button class="swatch ${k === vi ? 'is-on' : ''}" style="background:${v.hex}" aria-label="${esc(v.name)}" title="${esc(v.name)}" data-sw="${k}"></button>`).join('')}</div>` : ''}
          ${askOnly(p) ? `<button class="btn btn--ink" data-qv-ask>Consultar precio por WhatsApp</button>` : `
          <p class="qv__label">Cantidad${p.trio ? ' (unidades)' : p.sizes ? ' (juegos)' : ''}</p>
          <div class="qv__buy">
            <div class="qty"><button data-q="-1" aria-label="Menos">−</button><span>${qty}</span><button data-q="1" aria-label="Más">+</button></div>
            <button class="btn btn--ink" data-qv-add>${p.trio ? 'Agregar a la bolsa' : `Agregar · ${money(unitPrice(p, si) * qty)}`}</button>
          </div>`}
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
      if (t.closest('[data-step]')) { const n = p.variants ? 1 : p.imgs.length; imgIndex = (imgIndex + +t.closest('[data-step]').dataset.step + n) % n; draw(); }
      if (t.closest('[data-sw]')) { vi = +t.closest('[data-sw]').dataset.sw; state.variant[id] = vi; imgIndex = 0; draw(); render(); }
      if (t.closest('[data-q]')) { qty = Math.max(1, qty + +t.closest('[data-q]').dataset.q); draw(); }
      if (t.closest('[data-qv-fav]')) { toggleFav(id); draw(); }
      if (t.closest('[data-size]')) { si = +t.closest('[data-size]').dataset.size; state.size[id] = si; draw(); }
      if (t.closest('[data-qv-ask]')) askPrice(p);
      if (t.closest('[data-qv-add]')) { addToCart(id, vi, qty, si); closeModal(); }
    };
    modal.hidden = false; document.body.style.overflow = 'hidden';
    $('.modal__close', modal).focus();
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; }
  $$('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));

  /* ---------- Cart ---------- */
  const drawer = $('[data-cart]');
  function saveCart() { store.set('cart', state.cart); syncBadges(); drawCart(); }
  function addToCart(id, vi = 0, qty = 1, si = 0) {
    const p = byId[id]; if (!p) return;
    if (askOnly(p)) { askPrice(p); return; }
    const key = id + (p.variants ? ':' + vi : '') + (p.sizes ? ':s' + si : '');
    const line = state.cart.find(l => l.key === key);
    line ? line.qty += qty : state.cart.push({ key, id, vi, si, qty });
    saveCart();
    const n = trioCount();
    toast(p.trio && n % 3 ? `${p.name} en tu bolsa · elige ${3 - n % 3} más (limpión o chiro) para completar el set de 3`
      : `${p.name}${p.variants ? ' · ' + p.variants[vi].name : ''}${p.sizes ? ' · ' + p.sizes[si].name : ''} en tu bolsa`);
  }
  function lineInfo(l) {
    if (l.mono) return { name: `Monograma “${l.mono.text}”`, sub: `${l.mono.styleLabel} · hilo ${l.mono.thread} · tela ${l.mono.cloth}`, price: MONOGRAM_PRICE };
    const p = byId[l.id]; if (!p || askOnly(p)) return null;
    const sub = p.variants ? p.variants[l.vi].name : p.sizes ? p.sizes[l.si || 0].name : p.trio ? 'Set de 3 combinable' : p.line;
    return { name: p.name, sub, trio: !!p.trio, price: p.trio ? 0 : unitPrice(p, l.si || 0), img: p.variants ? p.variants[l.vi].img : p.imgs[0] };
  }
  // Limpiones: se cobran por sets de 3 (aunque sean de diseños distintos).
  const trioCount = () => state.cart.reduce((s, l) => s + (byId[l.id]?.trio ? l.qty : 0), 0);
  const trioSets = () => Math.ceil(trioCount() / 3);
  const cartTotal = () => state.cart.reduce((s, l) => s + lineInfo(l).price * l.qty, 0) + trioSets() * TRIO_PRICE;
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
          <div class="line__right"><span>${info.trio ? 'En set' : money(info.price * l.qty)}</span><button class="line__remove" data-rm="${i}">Quitar</button></div></div>`;
      }).join('');
      const n = trioCount();
      if (n) body.innerHTML += `<div class="trio-sum"><div><b>Limpiones y chiros: ${n} → ${trioSets()} set${trioSets() > 1 ? 's' : ''} de 3</b>
        ${n % 3 ? `<p>${3 - n % 3 > 1 ? `Te faltan ${3 - n % 3} para completar el set: agrégalos` : 'Te falta 1 para completar el set: agrégalo'}, el precio es el mismo.</p>` : ''}</div>
        <span>${money(trioSets() * TRIO_PRICE)}</span></div>`;
    }
    $('[data-cart-total]').textContent = money(cartTotal());
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
    const lines = state.cart.map(l => { const i = lineInfo(l); return `• ${l.qty} × ${i.name} (${i.sub})${i.trio ? '' : ` — ${money(i.price * l.qty)}`}`; });
    if (trioCount()) lines.push(`• Limpiones y chiros: ${trioCount()} unidades = ${trioSets()} set(s) de 3 — ${money(trioSets() * TRIO_PRICE)}`);
    const total = cartTotal();
    const text = `Hola Sandra, quiero hacer este pedido en Laszos:\n\n${lines.join('\n')}\n\nTotal: ${money(total)}\n\n¿Me envías el método de pago, por favor?`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
  $('[data-contact]').addEventListener('click', e => {
    e.preventDefault(); window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola Sandra, quisiera información sobre los productos de Laszos.')}`, '_blank', 'noopener');
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
