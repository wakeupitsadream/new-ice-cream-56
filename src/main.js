import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* =====================================================================
   КОНТЕНТ — цены, вкусы, тексты и фото. Всё, что меняется, лежит здесь.
   ===================================================================== */
const BRAND = {
  name: 'New Ice Cream 56',
  phone: '+79991056383',
  phoneLabel: '8-999-105-63-83',
  tg: 'https://t.me/+79991056383', // ника нет: Telegram открывает чат по номеру телефона
  ig: 'https://www.instagram.com/new_ice_cream56',
};
// Корпусное мороженое. color — фон экрана, fruit — 3D-форма.
const FLAVORS = [
  { name: 'Манго',    fruit: 'mango',      color: '#cfdc82' },
  { name: 'Клубника', fruit: 'strawberry', color: '#f3a3ad' },
  { name: 'Банан',    fruit: 'banana',     color: '#e9c264' },
  { name: 'Малина',   fruit: 'raspberry',  color: '#e7abc6' },
  { name: 'Лимон',    fruit: 'lemon',      color: '#ece48e' },
  { name: 'Кофе',     fruit: 'coffee',     color: '#c9a78d' },
];
const START = 1;                                // стартовый вкус — клубника
const COFFEE = 5;                               // кофе продаётся поштучно и в мини-набор не входит
const MINI = { size: 4, flavors: [0, 1, 2, 3, 4] };
const PRICE = { big: 1000, mini: 600, coffee: 280, stick: 250, trifle: 300 };
const STICKS = [
  { name: 'Малина',   color: '#e36c97' },
  { name: 'Клубника', color: '#ee5a6c' },
  { name: 'Ваниль',   color: '#f1e4c6' },
  { name: 'Банан',    color: '#f0d26c' },
  { name: 'Лимон',    color: '#f5df3c' },
];
const TRIFLES = [
  { name: 'Клубника', img: '__IMG_t2__' },
  { name: 'Манго',    img: '__IMG_t3__' },
];
const TRIFLE_PHOTOS = [
  { name: 'Сверху — шоколад',    img: '__IMG_t4__' },
  { name: 'Ложка уже на крышке', img: '__IMG_t1__' },
];
const CHOCO = [
  { name: 'Маленький', n: 15, price: 1100 },
  { name: 'Средний',   n: 29, price: 1500 },
  { name: 'Большой',   n: 40, price: 1800 },
];
const GET = [
  { label: 'Доставка',       text: 'доставка (Яндекс Доставка)' },
  { label: 'Пр-т Победы',    text: 'самовывоз, Оренбург, пр-т Победы' },
  { label: 'п. Пригородный', text: 'самовывоз, п. Пригородный' },
];
const STEPS = [
  { head: ['Яркий', 'вкус'],       cap: 'Натуральные ингредиенты.\nЯркий вкус в каждом кусочке.', ang: 0 },
  { head: ['Ручная', 'работа'],    cap: 'Каждую порцию делаем\nсвоими руками.',                  ang: 180 },
  { head: ['Приедет', 'холодным'], cap: 'Термосумка со льдом.\nЗапечатана до самой двери.',       ang: 360 },
  { head: null,                    cap: 'Ваш вкус найден.\nОсталось заказать.',                  ang: 720 },
];
// Фото. size: 'big' | 'tall' | 'wide' | ''
const LIVE = [
  { name: 'Все вкусы сразу',     img: '__IMG_l1__', size: 'big' },
  { name: 'Стаканчик с собой',   img: '__IMG_l2__', size: 'tall' },
  { name: 'Манго',               img: '__IMG_l3__' },
  { name: 'Миксы в стаканчиках', img: '__IMG_l4__' },
  { name: 'Лимон',               img: '__IMG_l6__', size: 'wide' },
  { name: 'Банан',               img: '__IMG_l5__' },
  { name: 'Малина и манго',      img: '__IMG_l7__' },
];
const GIFTS = [
  { name: 'Ассорти в крафт-коробке',    img: '__IMG_g1__', size: 'big' },
  { name: 'Ко Дню матери',              img: '__IMG_g2__', size: 'tall' },
  { name: 'С лентой — сразу в подарок', img: '__IMG_g3__', size: 'tall' },
  { name: 'Плитки с начинками',         img: '__IMG_g4__' },
  { name: 'Пончики и батончики',        img: '__IMG_g5__' },
  { name: 'Новогодние фигурки',         img: '__IMG_g6__' },
  { name: 'К Новому году',              img: '__IMG_g7__' },
];
const N = FLAVORS.length;

/* ===================================================================== helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (a, n) => ((a % n) + n) % n;
const eio = t => -(Math.cos(Math.PI * t) - 1) / 2;
const RAD = Math.PI / 180;
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
function bez(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = t => ((ax * t + bx) * t + cx) * t, fy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-5) break; const d = dx(t); if (Math.abs(d) < 1e-6) break; t -= e / d; } return fy(clamp(t)); };
}
const GLIDE = bez(.25, .75, .2, 1), ENTER = bez(.16, 1, .3, 1);
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgba = (h, a) => `rgba(${hex(h).join(',')},${a})`;
const seed = s => () => (s = (s * 16807 + 11) % 2147483647) / 2147483647;
const fmt = n => n.toLocaleString('ru-RU') + ' ₽';
const PLUS = '<svg class="plus" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 1.5v11M1.5 7h11"/></svg>';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;
const phone = () => innerWidth < 820;

/* ===================================================================== fruit stickers (SVG) */
const LEAVES = '<path d="M100 60 64 34 91 41 100 14 109 41 136 34Z"/>';
const RASP = [[74, 68], [100, 66], [126, 68], [60, 94], [87, 92], [113, 92], [140, 94], [70, 120], [100, 118], [130, 120], [84, 146], [116, 146], [100, 170]];
const FRUIT = {
  strawberry: {
    sil: '<path d="M100 184C58 164 26 114 40 78 50 52 80 46 100 58 120 46 150 52 160 78 174 114 142 164 100 184Z"/>' + LEAVES,
    art: '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7386"/><stop offset="1" stop-color="#d81b3d"/></linearGradient></defs>' +
      '<path fill="url(#a)" d="M100 184C58 164 26 114 40 78 50 52 80 46 100 58 120 46 150 52 160 78 174 114 142 164 100 184Z"/>' +
      '<ellipse cx="66" cy="88" rx="11" ry="20" fill="#fff" opacity=".26" transform="rotate(24 66 88)"/>' +
      [[76, 96], [102, 88], [128, 96], [62, 120], [88, 116], [114, 116], [140, 120], [76, 142], [101, 138], [126, 142], [89, 162], [113, 162]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="4.6" fill="#ffe49c"/>`).join('') +
      '<g fill="#3fae4a">' + LEAVES + '</g><path d="M100 52v-22" stroke="#2c8a3a" stroke-width="4" stroke-linecap="round"/>',
  },
  mango: {
    sil: '<path d="M46 120C36 78 68 40 114 42 160 44 180 86 162 126 146 162 100 178 70 160 56 152 49 136 46 120Z"/><path d="M116 46C124 18 156 10 176 18 170 42 142 56 116 46Z"/>',
    art: '<defs><linearGradient id="a" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="#f4e04d"/><stop offset=".5" stop-color="#b6d43a"/><stop offset="1" stop-color="#6fae2c"/></linearGradient></defs>' +
      '<path fill="url(#a)" d="M46 120C36 78 68 40 114 42 160 44 180 86 162 126 146 162 100 178 70 160 56 152 49 136 46 120Z"/>' +
      '<ellipse cx="80" cy="86" rx="14" ry="26" fill="#fff" opacity=".3" transform="rotate(38 80 86)"/>' +
      '<path fill="#3fae4a" d="M116 46C124 18 156 10 176 18 170 42 142 56 116 46Z"/><path d="M120 44C138 34 156 26 172 20" stroke="#2c8a3a" stroke-width="3" fill="none" stroke-linecap="round"/>',
  },
  banana: {
    sil: '<path d="M32 60C38 134 108 176 174 148 185 143 186 128 175 122 132 133 84 108 64 56 58 40 30 42 32 60Z"/>',
    art: '<defs><linearGradient id="a" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fff27e"/><stop offset="1" stop-color="#f5bf22"/></linearGradient></defs>' +
      '<path fill="url(#a)" d="M32 60C38 134 108 176 174 148 185 143 186 128 175 122 132 133 84 108 64 56 58 40 30 42 32 60Z"/>' +
      '<path d="M48 64C60 122 112 154 172 136" fill="none" stroke="#dfa414" stroke-width="4" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M40 80C50 118 82 146 120 152" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".4"/>' +
      '<path fill="#7a4a21" d="M32 60C31 49 38 43 49 44L47 58Z"/><circle cx="177" cy="135" r="6" fill="#7a4a21"/>',
  },
  lemon: {
    sil: '<path d="M22 104C30 62 66 44 104 46 140 48 166 68 178 96 186 100 188 108 180 112 168 146 136 160 100 158 66 156 40 140 30 116 22 114 18 108 22 104Z"/><path d="M112 50C116 26 140 16 160 22 156 42 136 54 112 50Z"/>',
    art: '<defs><linearGradient id="a" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff07a"/><stop offset="1" stop-color="#f2c40f"/></linearGradient></defs>' +
      '<path fill="url(#a)" d="M22 104C30 62 66 44 104 46 140 48 166 68 178 96 186 100 188 108 180 112 168 146 136 160 100 158 66 156 40 140 30 116 22 114 18 108 22 104Z"/>' +
      '<ellipse cx="78" cy="82" rx="26" ry="11" fill="#fff" opacity=".34" transform="rotate(-24 78 82)"/>' +
      '<path fill="#3fae4a" d="M112 50C116 26 140 16 160 22 156 42 136 54 112 50Z"/>',
  },
  raspberry: {
    sil: RASP.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="18"/>`).join('') + '<path d="M100 56 68 30 93 38 100 16 107 38 132 30Z"/>',
    art: '<defs><radialGradient id="a" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff93b6"/><stop offset="1" stop-color="#d22a66"/></radialGradient></defs>' +
      RASP.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="url(#a)" stroke="#b81f55" stroke-width="1.5"/><circle cx="${x - 5}" cy="${y - 6}" r="3.6" fill="#fff" opacity=".5"/>`).join('') +
      '<path fill="#3fae4a" d="M100 56 68 30 93 38 100 16 107 38 132 30Z"/>',
  },
  coffee: {
    sil: '<ellipse cx="84" cy="100" rx="47" ry="65" transform="rotate(-28 84 100)"/><ellipse cx="146" cy="136" rx="30" ry="42" transform="rotate(34 146 136)"/>',
    art: '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b47649"/><stop offset="1" stop-color="#57311c"/></linearGradient></defs>' +
      '<g transform="rotate(34 146 136)"><ellipse cx="146" cy="136" rx="30" ry="42" fill="url(#a)"/><path d="M146 98C132 120 160 150 146 174" fill="none" stroke="#35190d" stroke-width="5" stroke-linecap="round"/></g>' +
      '<g transform="rotate(-28 84 100)"><ellipse cx="84" cy="100" rx="47" ry="65" fill="url(#a)"/><path d="M84 40C62 78 108 122 84 160" fill="none" stroke="#35190d" stroke-width="7" stroke-linecap="round"/><ellipse cx="62" cy="76" rx="8" ry="20" fill="#fff" opacity=".2" transform="rotate(12 62 76)"/></g>',
  },
};
const fruitSVG = k => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="#fff" stroke="#fff" stroke-width="15" stroke-linejoin="round">${FRUIT[k].sil}</g>${FRUIT[k].art}</svg>`;
const fruitURL = FLAVORS.map(f => 'data:image/svg+xml;utf8,' + encodeURIComponent(fruitSVG(f.fruit)));
const dyn = document.head.appendChild(el('style'));
dyn.textContent = fruitURL.map((u, i) => `.fr.f${i}{background:url("${u}") center/contain no-repeat}`).join('');

/* ===================================================================== DOM */
const hero = $('#flavors'), arc = $('#arc'), titleEl = $('#title'), countEl = $('#count'), revealEl = $('.reveal');
const inside = $('#inside'), inBar = $('#inBar'), inFront = $('#inFront'), frontFrame = $('#frontFrame'), inNum = $('#inNum'), inHead = $('#inHead'), inCap = $('#inCap'), inDark = $('.in-dark'), stormEl = $('#storm');
const shop = $('#shop'), cardsEl = $('#cards'), range = $('#range'), glow = $('#glow'), thumbsEl = $('#thumbs'), buy = $('#buy'), coffeeBox = $('#coffeeAdd');
const gifts = $('#gifts'), delivery = $('#delivery');
const nav = $('#nav'), pill = $('#pill'), cartBtn = $('#cart'), badge = $('#badge'), drawer = $('#drawer');
const canvas = $('#gl');

$$('[data-ig]').forEach(a => { a.href = BRAND.ig; });
$$('[data-tg]').forEach(a => { a.href = BRAND.tg; });
$$('[data-tel]').forEach(a => { a.href = 'tel:' + BRAND.phone; if (!a.textContent.trim()) a.textContent = BRAND.phoneLabel; });
$('#dcall').textContent = 'Позвонить ' + BRAND.phoneLabel;

// hero bits
const BITS = [[.12, .20, 120, -18, 0], [.86, .18, 96, 22, 2], [.065, .86, 84, 12, 3], [.655, .15, 78, -10, 4], [.215, .9, 70, 30, 1]];
const bits = BITS.map(([x, y, , r, f]) => {
  const b = el('i', `bit fr f${f}`); b.style.cssText = `left:${x * 100}%;top:${y * 100}%;rotate:${r}deg`;
  $('#bits').append(b); return b;
});
function sizeBits() { bits.forEach((b, i) => { const p = phone(); b.style.display = p && [1, 3, 4].includes(BITS[i][4]) ? 'none' : ''; const s = BITS[i][2] * (p ? 1.3 : 1); b.style.width = b.style.height = `calc(${s}*var(--u))`; if (i === 1) b.style.top = (p ? 36 : 18) + '%'; }); }

// shop: flavour cards
const cards = FLAVORS.map((F, i) => {
  const one = i === COFFEE;
  const c = el('article', 'card', `<h3 class="disp">${F.name}</h3><p class="note">${one ? 'поштучно' : 'в наборах'}</p><div class="pk cup spr f${i}"></div>` +
    `<button class="act"${one ? ' data-id="coffee"' : ''} aria-label="${one ? `Кофе, ${fmt(PRICE.coffee)} — добавить в корзину` : `${F.name} — добавить в мини-набор`}">${PLUS}<span>${one ? fmt(PRICE.coffee) : 'В мини-набор'}</span>${one ? '<b class="qb"></b>' : ''}</button>`);
  c.style.setProperty('--c', F.color); c.style.transitionDelay = `${i * 70}ms, ${i * 70}ms, 0s, 0s`; c._tx = 0; c._ty = 0;
  cardsEl.append(c); return c;
});
// shop: set offers
$('#bigRow').innerHTML = FLAVORS.map((_, i) => `<i class="cup spr f${i}"></i>`).join('');
$('#miniDash').innerHTML = '<i></i>'.repeat(MINI.size);
$('#bigPrice').textContent = fmt(PRICE.big);
$('#miniPrice').textContent = fmt(PRICE.mini);
$('#miniCoffee').textContent = fmt(PRICE.coffee);
// builder
const SLOT_POS = [[50, 25], [26, 52], [74, 52], [50, 79]];
const slots = SLOT_POS.map(([x, y], i) => {
  const s = el('div', 'slot', `<div class="cup spr"></div><button class="x" aria-label="Слот ${i + 1}"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2.5 2.5l9 9M11.5 2.5l-9 9"/></svg></button>`);
  s.style.left = x + '%'; s.style.top = y + '%'; glow.append(s); return s;
});
const thumbs = MINI.flavors.map(f => {
  const F = FLAVORS[f], t = el('button', 'thumb', `<span class="sq"><i class="cup spr f${f}"></i></span><span class="nm">${F.name}</span><span class="ct"></span>`);
  t.style.setProperty('--c', F.color); t.setAttribute('aria-label', `Добавить в мини-набор: ${F.name}`); thumbsEl.append(t); return t;
});
$('#coffeePrice').textContent = '+' + fmt(PRICE.coffee);
// photo galleries
function gallery(box, list, alt) {
  list.forEach((G, i) => {
    const t = el('figure', 'g ' + (G.size || ''), `<img src="${G.img}" alt="${alt}: ${G.name.toLowerCase()}" loading="lazy" decoding="async"><figcaption>${G.name}</figcaption>`);
    t.style.transitionDelay = `${i * 60}ms`; box.append(t);
  });
}
gallery($('#lgrid'), LIVE, 'Корпусное мороженое');
gallery($('#ggrid'), GIFTS, 'Шоколадный набор');
// sticks
$('#stPrice').innerHTML = `${fmt(PRICE.stick)} <small>за штуку</small>`;
STICKS.forEach((S, i) => {
  const b = el('button', 'chip-s', `<i style="background:${S.color}"></i>${S.name}${PLUS}<b class="qb"></b>`);
  b.dataset.id = 'stick:' + i; b.setAttribute('aria-label', `Добавить стик «${S.name}», ${fmt(PRICE.stick)}`);
  b.addEventListener('click', () => fly([$('#stImg')], () => addItem(ITEM.stick(i))));
  $('#stChips').append(b);
});
// trifles
TRIFLES.forEach((T, i) => {
  const t = el('figure', 'g prod', `<img src="${T.img}" alt="Трайфл: ${T.name.toLowerCase()}" loading="lazy" decoding="async"><figcaption>${T.name} · ${fmt(PRICE.trifle)}</figcaption>` +
    `<button class="add" data-id="trifle:${i}" aria-label="Добавить трайфл «${T.name}», ${fmt(PRICE.trifle)}">${PLUS}<b class="qb"></b></button>`);
  $('.add', t).addEventListener('click', () => fly([$('img', t)], () => addItem(ITEM.trifle(i))));
  t.style.transitionDelay = `${i * 60}ms`; $('#tgrid').append(t);
});
gallery($('#tgrid'), TRIFLE_PHOTOS, 'Трайфл');
// chocolate
CHOCO.forEach((C, i) => {
  const s = el('article', 'size', `<p class="disp n">${C.n}<small>шт</small></p><div class="st"><h3>${C.name} набор</h3><p>${fmt(C.price)}</p></div>` +
    `<button class="add" data-id="choco:${i}" aria-label="${C.name} шоколадный набор, ${C.n} шт, ${fmt(C.price)} — добавить в корзину">${PLUS}<b class="qb"></b></button>`);
  const b = $('.add', s); b.addEventListener('click', () => fly([{ el: b, img: GIFTS[0].img, size: 96 }], () => addItem(ITEM.choco(i))));
  s.style.transitionDelay = `${i * 80}ms`; $('#sizes').append(s);
});
$('#giftTg').href = BRAND.tg + '?text=' + encodeURIComponent('Здравствуйте! Хочу заказать шоколадный набор.');
// drawer: how to receive the order
$('#dget').insertAdjacentHTML('beforeend', GET.map((g, i) => `<label><input type="radio" name="get" value="${i}"><span>${g.label}</span></label>`).join(''));
// storm pieces
const srnd = seed(77);
const storm = Array.from({ length: 20 }, (_, i) => {
  const e = el('i', 'fr'); stormEl.append(e);
  return { e, a: srnd() * Math.PI * 2, ph: i / 20 + srnd() * .03, spin: (srnd() < .5 ? -1 : 1) * 360, size: .7 + srnd() * .7, own: srnd() < .7, alt: Math.floor(srnd() * N) };
});
function stormFruits(f) { storm.forEach(p => { p.e.className = `fr f${p.own ? f : p.alt}`; }); }

/* ===================================================================== state */
let vw = 0, vh = 0, U = 1, K = 1, heroH = 0, spread = 1, cyOff = 0;
let pos = -2.6, target = START, tw = null, curF = START, chT = 0;
let lastAct = performance.now(), autoOn = !RM, entered = false, dragging = false;
let rv = null, flip = 0, fl = null, curStep = -1, poke = null, stripDone = false;
let GLOK = false, renderer, scene, camera, pool = [], trav = null, geos = [], hit = [];
const SPR_F = .84, CH = 1, TILT = 6;

/* ===================================================================== layout */
function resize() {
  vw = root.clientWidth; vh = innerHeight; heroH = hero.offsetHeight;
  const p = phone();
  U = p ? Math.min(vw / 560, heroH / 980) : Math.min(vw / 1440, vh / 900);
  spread = p ? .9 : 1; cyOff = p ? heroH * .40 : heroH / 2 - 78 * U;
  K = p ? Math.min(vw / 390, vh / 780) : Math.min(vw / 1440, vh / 900);
  root.style.setProperty('--u', U + 'px'); root.style.setProperty('--k', K);
  sizeBits(); fitTitle(); fitHead(); moveHl();
  if (GLOK) {
    const D = clamp(2400 * Math.min(vw / 1440, vh / 900), 1500, 3400);
    camera.position.set(0, 0, D); camera.fov = 2 * Math.atan(vh / 2 / D) / RAD; camera.aspect = vw / vh; camera.near = 10; camera.far = 4 * D; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, p ? 1.75 : 2)); renderer.setSize(vw, vh, false);
    canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px';
  }
}

/* ===================================================================== 3D fruits */
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function fixSeam(g, W, H) { // SphereGeometry-style grids: weld normals along the seam
  const n = g.attributes.normal, a = new THREE.Vector3(), b = new THREE.Vector3();
  for (let iy = 0; iy <= H; iy++) { const i0 = iy * (W + 1), i1 = i0 + W; a.fromBufferAttribute(n, i0); b.fromBufferAttribute(n, i1); a.add(b).normalize(); n.setXYZ(i0, a.x, a.y, a.z); n.setXYZ(i1, a.x, a.y, a.z); }
}
function sphereGeo(W, H, fn) {
  const g = new THREE.SphereGeometry(.5, W, H), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v, i); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); fixSeam(g, W, H);
  const n = g.attributes.normal; for (let ix = 0; ix <= W; ix++) { n.setXYZ(ix, 0, 1, 0); n.setXYZ(H * (W + 1) + ix, 0, -1, 0); }
  return g;
}
function latheGeo(pts, seg = 80, n = 64) {
  const sp = new THREE.SplineCurve(pts.map(p => new THREE.Vector2(p[0], p[1]))).getPoints(n); sp.forEach(p => { p.x = Math.max(0, p.x); }); sp[0].x = 0; sp[sp.length - 1].x = 0;
  return new THREE.LatheGeometry(sp, seg);
}
function finish(g, size, paint) { // centre, scale to `size` units tall, bake vertex colours
  g.computeBoundingBox(); const b = g.boundingBox, c = b.getCenter(new THREE.Vector3()); g.translate(-c.x, -c.y, -c.z);
  const k = size / (b.max.y - b.min.y); g.scale(k, k, k);
  const p = g.attributes.position, col = new Float32Array(p.count * 3), C = new THREE.Color();
  for (let i = 0; i < p.count; i++) { paint(C, p.getX(i), p.getY(i), p.getZ(i), i); col[i * 3] = C.r; col[i * 3 + 1] = C.g; col[i * 3 + 2] = C.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
}
const Col = h => new THREE.Color(h);
const FRUIT_GEO = {
  strawberry() {
    const g = latheGeo([[0, -.5], [.07, -.485], [.17, -.4], [.27, -.25], [.355, -.05], [.4, .14], [.385, .28], [.32, .39], [.21, .455], [.09, .478], [0, .47]], 220, 150); g.scale(1, 1, .9);
    const a = Col('#ee5a6c'), b = Col('#d93650'), pit = Col('#a81f3c');
    return finish(g, .98, (C, x, y, z) => {
      C.lerpColors(b, a, sstep(-.5, .45, y + .12 * Math.sin(x * 9 + z * 7)));
      if (Math.abs(y) > .4) return;
      const rowH = .092, row = Math.round(y / rowH), rad = Math.hypot(x, z / .9), n = Math.max(3, Math.round(2 * Math.PI * rad / .13)), cell = 2 * Math.PI / n, off = (row & 1) * .5;
      const th = Math.atan2(z, x), thc = (Math.round(th / cell - off) + off) * cell, d = Math.hypot((th - thc) * rad, (y - row * rowH) * .6);
      C.lerp(pit, (1 - sstep(.008, .017, d)) * .7);
    });
  },
  lemon() {
    const g = latheGeo([[0, -.5], [.045, -.488], [.075, -.455], [.13, -.41], [.25, -.31], [.34, -.15], [.37, 0], [.34, .15], [.25, .31], [.13, .41], [.075, .455], [.045, .488], [0, .5]]);
    const a = Col('#fbdc22'), b = Col('#eebb07');
    return finish(g, .9, (C, x, y, z) => C.lerpColors(b, a, sstep(-.4, .4, y * .6 + x * .5 + .1 * Math.sin(z * 11))));
  },
  mango() {
    const g = sphereGeo(72, 48, v => { const ny = v.y / .5, k = 1 + .14 * ny - .1 * ny * ny; v.x = v.x * .76 * k + .07 * (1 - ny * ny) + .03 * ny; v.z *= .62 * k; if (ny < -.6) v.x += .05 * (-.6 - ny); });
    const gr = Col('#86c23c'), ye = Col('#e6d43c'), dk = Col('#5ea52f');
    return finish(g, .98, (C, x, y, z) => {
      const m = .5 + .5 * Math.sin(x * 8 + Math.sin(y * 6 + z * 5) * 2.2), t = sstep(.2, .9, .55 - y * .7 + x * .9 + (m - .5) * .5);
      C.lerpColors(gr, ye, t); const st = Math.pow(.5 + .5 * Math.sin((x * .8 + z) * 26 + y * 3), 10) * (1 - t) * .45; C.lerp(dk, st);
    });
  },
  banana() {
    const S = 72, R = 24, rad = .64, A = 1.72, pos = [], idx = [];
    for (let i = 0; i <= S; i++) {
      const t = i / S, a = (t - .5) * A, cx = rad * Math.cos(a) - rad, cy = rad * Math.sin(a), r = .128 * Math.pow(Math.sin(Math.PI * t), .36) * (1 - .1 * t);
      for (let j = 0; j <= R; j++) { const ph = j / R * Math.PI * 2, rr2 = r * (1 + .045 * Math.cos(5 * ph)); pos.push(cx + Math.cos(a) * Math.cos(ph) * rr2, cy + Math.sin(a) * Math.cos(ph) * rr2, Math.sin(ph) * rr2); }
    }
    for (let i = 0; i < S; i++) for (let j = 0; j < R; j++) { const a = i * (R + 1) + j, b = a + R + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const n = g.attributes.normal, u = new THREE.Vector3(), w = new THREE.Vector3();
    for (let i = 0; i <= S; i++) { const i0 = i * (R + 1), i1 = i0 + R; u.fromBufferAttribute(n, i0).add(w.fromBufferAttribute(n, i1)).normalize(); n.setXYZ(i0, u.x, u.y, u.z); n.setXYZ(i1, u.x, u.y, u.z); }
    const a = Col('#f7ecb4'), b = Col('#e6d078'), tip = Col('#b79a4c');
    return finish(g, 1.04, (C, x, y, z) => { C.lerpColors(b, a, sstep(-.3, .3, x * 1.6 + z * .8)); C.lerp(tip, sstep(.44, .52, Math.abs(y)) * .8); });
  },
  raspberry() {
    const NB = 74, L = [], bump = [];
    for (let i = 0; i < NB; i++) { const y = 1 - (i + .5) / NB * 2, r = Math.sqrt(1 - y * y), a = i * 2.399963; L.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
    const g = sphereGeo(120, 80, (v, i) => {
      const l = v.length() || 1, x = v.x / l, y = v.y / l, z = v.z / l; let best = -1;
      for (let k = 0; k < NB; k++) { const d = x * L[k][0] + y * L[k][1] + z * L[k][2]; if (d > best) best = d; }
      const ang = Math.acos(Math.min(1, best)), h = Math.sqrt(Math.max(0, 1 - Math.pow(ang / .27, 2))); bump[i] = h;
      const base = .4 * (.86 + .14 * y) + .062 * h; v.set(x * base, y * base * 1.08, z * base);
    });
    const a = Col('#ec8fa8'), b = Col('#cf5378');
    return finish(g, .88, (C, x, y, z, i) => C.lerpColors(b, a, .15 + .85 * Math.pow(bump[i], 1.5)));
  },
  coffee() {
    const dep = [];
    const g = sphereGeo(160, 64, (v, i) => {
      v.x *= .7; v.z *= .44; dep[i] = 0;
      if (v.z > 0) { const gx = v.x - .05 * Math.sin(v.y * Math.PI * 1.9), d = Math.exp(-gx * gx / (2 * .03 * .03)) * Math.max(0, 1 - Math.pow(Math.abs(v.y) / .47, 6)); dep[i] = d; v.z -= .095 * d * Math.sqrt(v.z / .22); }
    });
    const a = Col('#8a5636'), b = Col('#5f381f'), gr = Col('#2e170b');
    return finish(g, .96, (C, x, y, z, i) => { C.lerpColors(b, a, sstep(-.35, .4, y * .6 - x * .5 + z)); C.lerp(gr, dep[i] * .8); });
  },
};
function initGL() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(-.7, 1, 1.3); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, .7); rim.position.set(1, .2, -.6); scene.add(rim);
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sx = sc.getContext('2d');
  const sg = sx.createRadialGradient(64, 64, 0, 64, 64, 64); sg.addColorStop(0, 'rgba(60,18,40,.55)'); sg.addColorStop(1, 'rgba(60,18,40,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(sc), shadowGeo = new THREE.PlaneGeometry(1.5, 1.35);
  geos = FLAVORS.map(F => FRUIT_GEO[F.fruit]());
  const makeFruit = () => {
    const g = new THREE.Group(); g.rotation.order = 'ZXY';
    const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .62, metalness: 0, sheen: .55, sheenRoughness: .5, sheenColor: new THREE.Color(0xffffff), clearcoat: .12, clearcoatRoughness: .55, envMapIntensity: .55 });
    const body = new THREE.Mesh(geos[0], mat); g.add(body);
    const sh = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); sh.renderOrder = -1;
    scene.add(g, sh);
    return { g, sh, body, mats: [mat], f: 0 };
  };
  pool = Array.from({ length: 11 }, makeFruit); trav = makeFruit(); hit = [...pool, trav].map(c => c.body);
  GLOK = true; root.classList.add('gl');
}
function setF(c, f) { if (c.f !== f) { c.f = f; c.body.geometry = geos[f]; } }
function place(c, s) {
  if (s.op <= .01) { c.g.visible = c.sh.visible = false; return; }
  c.g.visible = true;
  c.g.position.set(s.x - vw / 2, vh / 2 - s.y, s.z);
  const k = s.h / CH; c.g.scale.set(k * s.sx, k * s.sy, k * s.sx);
  c.g.rotation.set((TILT - s.rx) * RAD, s.ry * RAD, -s.rz * RAD);
  const tr = s.op < .999; c.mats.forEach(m => { m.transparent = tr; m.opacity = s.op; });
  const so = .62 * s.op * s.shadow; c.sh.visible = so > .01;
  c.sh.position.set(s.x - vw / 2, vh / 2 - s.y - .08 * s.h, s.z - .36 * s.h); c.sh.scale.setScalar(k); c.sh.rotation.z = -s.rz * RAD; c.sh.material.opacity = so;
}
async function renderSprites() { // flat images of every fruit for cards, builder and cart
  const SW = 480, SH = 552, cam = new THREE.PerspectiveCamera(2 * Math.atan(SH / 2 / 2400) / RAD, SW / SH, 10, 9000); cam.position.set(0, 0, 2400);
  renderer.setPixelRatio(1); renderer.setSize(SW, SH, false);
  pool.forEach(c => { c.g.visible = c.sh.visible = false; });
  const g = trav.g; trav.sh.visible = false; g.visible = true; g.position.set(0, 0, 0); g.scale.setScalar(SH * SPR_F / CH); g.rotation.set(TILT * RAD, 0, 0); trav.mats.forEach(m => { m.transparent = false; m.opacity = 1; });
  const urls = [];
  for (let f = 0; f < N; f++) {
    setF(trav, f); renderer.render(scene, cam);
    const c = document.createElement('canvas'); c.width = SW; c.height = SH; c.getContext('2d').drawImage(canvas, 0, 0);
    urls.push(await new Promise(r => c.toBlob(b => r(URL.createObjectURL(b)), 'image/webp', .92)));
  }
  return urls;
}

/* ===================================================================== hero arc */
const SLOT_DX = 372;
const SLOTS = [[0, 0, 380, 0, 0], [SLOT_DX, 34, 272, 5, 22], [652, 84, 240, 10, 36], [900, 140, 216, 14, 48], [1120, 196, 200, 18, 58]];
function arcState(j, now, top) {
  const k = j - pos, a = Math.min(4, Math.abs(k)), i = Math.min(3, Math.floor(a)), t = a - i, s = Math.sign(k), A = SLOTS[i], B = SLOTS[i + 1], L = n => lerp(A[n], B[n], t);
  let y = top + cyOff + L(1) * U, rz = s * L(3), spin = 0;
  if (!RM) { const b = Math.sin(now / 4600 * 2 * Math.PI + 1.37 * j); y -= (.5 * b + .5) * 9 * U; rz += 1.2 * b; spin = 16 * Math.sin(now / 5200 * 2 * Math.PI + 2.1 * j); }
  return { x: vw / 2 + s * L(0) * U * spread, y, h: L(2) * U, rz, ry: s * L(4) * .6 + spin, rx: 0, z: -Math.abs(k) * 34 * U, op: Math.abs(k) <= 3.3 ? 1 : clamp(1 - (Math.abs(k) - 3.3) / .6), sx: 1, sy: 1, shadow: 1 };
}
const KEYS = ['x', 'y', 'h', 'rz', 'ry', 'rx', 'z', 'op', 'sx', 'sy', 'shadow'];
const blend = (a, b, t) => { const o = {}; KEYS.forEach(k => { o[k] = lerp(a[k], b[k], t); }); return o; };

function goTo(n, dur) {
  const d = Math.abs(n - pos); if (d < .001 && n === target) return;
  const dir = Math.sign(n - target) || 1; target = n; lastAct = performance.now();
  if (RM) { pos = n; tw = null; applyFlavor(dir); return; }
  dur = dur || 650 + 160 * Math.max(0, d - 1);
  tw = { from: pos, to: n, t0: performance.now(), dur, ease: GLIDE };
  clearTimeout(chT); chT = setTimeout(() => applyFlavor(dir), dur * .12);
}
function applyFlavor(dir) {
  const f = mod(target, N); if (f === curF) return; curF = f;
  const F = FLAVORS[f];
  finishReveal();
  if (RM) root.style.setProperty('--flav', F.color);
  else { revealEl.style.setProperty('--rv', F.color); rv = { t0: performance.now(), color: F.color }; }
  setTitle(F.name, dir); setCount(f);
  cards.forEach((c, i) => c.classList.toggle('live', i === f));
  stormFruits(f); stripDone = false;
  if (curStep === 3) swapStepText(3);
}
function finishReveal() {
  if (!rv) return; root.style.setProperty('--flav', rv.color); revealEl.style.setProperty('--rv', 'transparent');
  revealEl.style.maskImage = revealEl.style.webkitMaskImage = ''; rv = null;
  $('meta[name=theme-color]').content = FLAVORS[curF].color;
}

/* ----- title / counter ----- */
const mctx = document.createElement('canvas').getContext('2d');
const measure = t => { mctx.font = '900 100px Unbounded'; return mctx.measureText(t.toUpperCase()).width * .98; };
function titleSize(name) {
  if (phone()) { const w = Math.max(...name.split(' ').map(measure)); return Math.min(clamp(innerWidth * .11, 34, 60), (vw - 36) * 100 / w); }
  return Math.min(90 * U, 650 * U * 100 / measure(name));
}
function fitTitle() { const tl = $('.tl:last-child', titleEl); if (tl) tl.style.fontSize = titleSize(FLAVORS[curF].name) + 'px'; }
function setTitle(name, dir = 1, instant) {
  const old = $$('.tl', titleEl), tl = el('div', 'tl'); tl.style.fontSize = titleSize(name) + 'px';
  name.toUpperCase().split(' ').forEach((w, i) => { const wd = el('span', 'wd'); [...w].forEach(ch => wd.append(el('span', 'ch', ch))); if (i) tl.append(' '); tl.append(wd); });
  titleEl.append(tl);
  if (instant || RM) { old.forEach(o => o.remove()); return; }
  old.forEach(o => {
    const ch = $$('.ch', o); ch.forEach((c, i) => c.animate([{ translate: '0 0', opacity: 1 }, { translate: `0 ${-110 * dir}%`, opacity: 0 }], { duration: 300, delay: i * 11, easing: 'cubic-bezier(.45,0,.75,.3)', fill: 'forwards' }));
    setTimeout(() => o.remove(), 320 + ch.length * 11);
  });
  $$('.ch', tl).forEach((c, i) => c.animate([{ translate: `0 ${110 * dir}%`, opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 620, delay: 120 + i * 22, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
}
function softSwap(node, apply, tOut = 220, gap = 60, tIn = 380) {
  if (RM) { apply(); return; }
  node.animate([{ translate: '0 0', opacity: 1 }, { translate: '0 -10px', opacity: 0 }], { duration: tOut, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
  setTimeout(() => { apply(); node.animate([{ translate: '0 14px', opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: tIn, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' }); }, tOut + gap);
}
const setCount = f => softSwap(countEl, () => { countEl.textContent = String(f + 1).padStart(2, '0'); });

/* ----- drag / click / keys ----- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(e) {
  if (!GLOK) return null; ndc.set(e.clientX / vw * 2 - 1, -(e.clientY / vh) * 2 + 1); ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(hit.filter(m => m.parent.visible), false)[0]; return h ? h.object.userData.j : null;
}
let dr = null;
arc.addEventListener('pointerdown', e => { if (e.button) return; dr = { x: e.clientX, pos0: pos, id: e.pointerId, on: false, v: 0, lx: e.clientX, lt: performance.now() }; });
arc.addEventListener('pointermove', e => {
  if (!dr || e.pointerId !== dr.id) { if (FINE && entered) arc.style.cursor = pick(e) != null ? 'pointer' : 'grab'; return; }
  const dx = e.clientX - dr.x, slot = SLOT_DX * U * spread;
  if (!dr.on) { if (Math.abs(dx) <= 6) return; dr.on = dragging = true; tw = null; clearTimeout(chT); try { arc.setPointerCapture(e.pointerId); } catch (_) { /* pointer already released */ } document.body.classList.add('dragging'); }
  const now = performance.now(), dt = Math.max(1, now - dr.lt); dr.v = lerp(dr.v, -(e.clientX - dr.lx) / slot / dt, .4); dr.lx = e.clientX; dr.lt = now;
  pos = dr.pos0 - dx / slot; lastAct = now;
});
function endDrag(e, cancel) {
  if (!dr || e.pointerId !== dr.id) return; const d = dr; dr = null;
  if (!d.on) { if (!cancel) { const j = pick(e); if (j != null && j !== Math.round(target)) goTo(j); lastAct = performance.now(); } return; }
  dragging = false; document.body.classList.remove('dragging');
  if (cancel && Math.abs(pos - Math.round(pos)) < .02) { pos = Math.round(pos); return; }
  const to = Math.round(pos + clamp(d.v * 220, -2, 2)); goTo(to, Math.max(380, 650 * Math.min(1, Math.abs(to - pos) + .35)));
}
arc.addEventListener('pointerup', e => endDrag(e)); arc.addEventListener('pointercancel', e => endDrag(e, true));
$('#play').addEventListener('click', () => goTo(Math.round(target) + 1));
const autoBtn = $('#auto'); autoBtn.setAttribute('aria-pressed', autoOn);
autoBtn.addEventListener('click', () => { autoOn = !autoOn; autoBtn.setAttribute('aria-pressed', autoOn); lastAct = performance.now(); });
addEventListener('keydown', e => {
  sm.on = false; if (e.key === 'Escape') { closeCart(); return; }
  if (document.body.classList.contains('cart') || !entered) return;
  const r = hero.getBoundingClientRect(); if (r.bottom < vh / 2) return;
  if (e.key === 'ArrowRight') goTo(Math.round(target) + 1); else if (e.key === 'ArrowLeft') goTo(Math.round(target) - 1);
});

/* ===================================================================== inside (steps) */
function headLines(step) { return STEPS[step].head || FLAVORS[curF].name.split(' '); }
function fitHead() { const p = phone(), base = p ? 40 : 88, max = p ? 358 : 560; const w = Math.max(...headLines(Math.max(0, curStep)).map(measure)); inHead.style.fontSize = Math.min(base, max * 100 / w) + 'px'; }
function applyStepText(step) {
  inHead.innerHTML = headLines(step).map(l => `<div>${l}</div>`).join(''); fitHead();
  inNum.textContent = '0' + (step + 1); inCap.textContent = STEPS[step].cap;
  $$('button', $('#inIcons')).forEach((b, i) => b.classList.toggle('on', i === step));
}
function swapStepText(step) { [inHead, inNum, inCap].forEach((n, i) => softSwap(n, i ? () => {} : () => applyStepText(step), 240, 40, 460)); }
function setStep(step, now) {
  const first = curStep < 0; curStep = step; const to = STEPS[step].ang;
  if (first || RM) { flip = to; fl = null; applyStepText(step); return; }
  const d = Math.abs(to - flip), dur = 720 * clamp(d / 180, .4, 2);
  fl = { from: flip, to, t0: now, dur };
  setTimeout(() => { if (curStep === step) swapStepText(step); }, .38 * Math.min(dur, 720) - 240);
}
$$('button', $('#inIcons')).forEach((b, i) => b.addEventListener('click', () => {
  scrollToY(inside.offsetTop + (i + .5) * .19 * (inside.offsetHeight - vh));
}));

/* ===================================================================== smooth scroll */
const sm = { on: false, cur: 0, target: 0 }, SMOOTH = FINE && !RM;
function scrollToY(y) { y = clamp(y, 0, root.scrollHeight - vh); if (SMOOTH) { if (!sm.on) sm.cur = scrollY; sm.target = y; sm.on = true; } else scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); }
if (SMOOTH) addEventListener('wheel', e => {
  if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || document.body.classList.contains('locked') || document.body.classList.contains('cart')) return;
  e.preventDefault(); if (!sm.on) { sm.cur = sm.target = scrollY; sm.on = true; }
  const d = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * vh : e.deltaY;
  sm.target = clamp(sm.target + d, 0, root.scrollHeight - vh);
}, { passive: false });
addEventListener('pointerdown', () => { sm.on = false; });
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (a) { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); closeCart(); scrollToY(t.offsetTop); } return; }
  if (e.target.closest('[data-cart]')) openCart();
});

/* ===================================================================== nav */
const links = $$('a', pill), secs = [hero, inside, shop, range, gifts, delivery];
let navI = -1;
function moveHl() {
  let k = Math.max(0, navI); while (k > 0 && !links[k].offsetWidth) k--; // the phone bar hides some links
  const a = links[k], h = $('.hl', pill); h.style.left = a.offsetLeft + 'px'; h.style.width = a.offsetWidth + 'px';
}
function updateNav() {
  let i = 0; secs.forEach((s, k) => { if (s.getBoundingClientRect().top <= vh * .35) i = k; });
  if (i === navI) return; navI = i; links.forEach((a, k) => a.classList.toggle('on', k === i)); moveHl();
  const light = i === 2 || i === 4; pill.classList.toggle('light', light); nav.classList.toggle('lite', light); nav.classList.toggle('dark', i === 3);
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
[shop, range, delivery, ...$$('.blk, .cards, .offers, .lv, .ggrid, .sizes, .dv')].forEach(x => io.observe(x));

/* ===================================================================== toast */
const toastEl = $('#toast'); let toastT = 0;
function toast(msg, action) {
  toastEl.replaceChildren(el('span', '', msg));
  if (action) { const b = el('button', '', action.label); b.addEventListener('click', () => { hideToast(); action.fn(); }); toastEl.append(b); }
  toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(hideToast, action ? 4500 : 3200);
}
function hideToast() { toastEl.classList.remove('on'); }

/* ===================================================================== shop */
const toBuilder = { label: 'К набору', fn: () => scrollToY(range.offsetTop) };
cards.forEach((c, i) => {
  if (FINE) {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c._tx = (e.clientX - r.left) / r.width - .5; c._ty = (e.clientY - r.top) / r.height - .5; c.classList.add('tilt'); c.style.transform = `translateY(-8px) rotateX(${-c._ty * 12}deg) rotateY(${c._tx * 12}deg)`; });
    c.addEventListener('pointerleave', () => { c._tx = c._ty = 0; c.classList.remove('tilt'); c.style.transform = ''; });
  }
  c.addEventListener('pointerdown', () => { c.style.scale = '.97'; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => c.addEventListener(t, () => { c.style.scale = ''; }));
  c.addEventListener('click', e => {
    if (e.target.closest('.act')) {
      if (i === COFFEE) { fly([$('.pk', c)], () => addItem(ITEM.coffee())); return; }
      touched = true;
      if (addToPack(i)) { const n = pack.filter(f => f != null).length; toast(`${FLAVORS[i].name} — в мини-наборе: ${n} из ${MINI.size}`, toBuilder); }
      else toast('В мини-наборе уже 4 вкуса — поменяйте их в конструкторе', toBuilder);
      return;
    }
    if (RM) return;
    if (GLOK && c.classList.contains('live')) poke = performance.now();
    else $('.pk', c).animate([{ scale: '1 1' }, { scale: '1.06 .93', offset: .3 }, { scale: '.97 1.04', offset: .6 }, { scale: '1 1' }], { duration: 500, easing: 'ease-out' });
  });
});
$('#bigAdd').addEventListener('click', () => fly($$('#bigRow i'), () => addItem(ITEM.big())));

/* ===================================================================== builder: mini set */
const pack = Array(MINI.size).fill(null); let touched = false, filled = false, buyT = 0;
function renderPack() {
  slots.forEach((s, i) => { const f = pack[i], cup = $('.cup', s); s.classList.toggle('full', f != null); if (f != null) cup.className = `cup spr f${f}`; $('.x', s).setAttribute('aria-label', f != null ? `Убрать: ${FLAVORS[f].name}` : `Пустое место ${i + 1}`); });
  thumbs.forEach((t, k) => { const n = pack.filter(f => f === MINI.flavors[k]).length, ct = $('.ct', t); ct.classList.toggle('on', n > 0); ct.textContent = n || ''; });
  const left = pack.filter(f => f == null).length;
  if (!buy.classList.contains('done')) { buy.disabled = left > 0; buy.textContent = left ? `Выберите ещё ${left}` : `В корзину · ${fmt(PRICE.mini + (coffeeBox.checked ? PRICE.coffee : 0))}`; }
}
function addToPack(f) {
  const i = pack.indexOf(null); if (i < 0) return false;
  pack[i] = f; glow.style.setProperty('--g', rgba(FLAVORS[f].color, .72)); glow.classList.remove('pulse'); void glow.offsetWidth; glow.classList.add('pulse'); renderPack(); return true;
}
thumbs.forEach((t, k) => t.addEventListener('click', () => { touched = true; if (!addToPack(MINI.flavors[k])) toast('Все 4 места заняты — уберите вкус крестиком'); }));
slots.forEach((s, i) => $('.x', s).addEventListener('click', () => { touched = true; if (pack[i] != null) { pack[i] = null; renderPack(); } }));
coffeeBox.addEventListener('change', renderPack);
buy.addEventListener('click', () => {
  if (pack.includes(null)) return;
  const fs = [...pack], withCoffee = coffeeBox.checked, srcs = slots.map(s => $('.cup', s));
  if (withCoffee) srcs.push($('.addon .cup'));
  fly(srcs, () => { addItem(ITEM.mini(fs)); if (withCoffee) addItem(ITEM.coffee()); });
  setTimeout(() => {
    pack.fill(null); coffeeBox.checked = false; buy.classList.add('done'); buy.disabled = true; buy.textContent = 'Добавлено в корзину'; renderPack();
    clearTimeout(buyT); buyT = setTimeout(() => { buy.classList.remove('done'); renderPack(); }, 1600);
  }, 60);
});
new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting || filled) return; filled = true; o.disconnect(); if (touched) return;
  const s0 = Math.max(0, MINI.flavors.indexOf(curF)); // start from the flavour picked in the hero
  for (let k = 0; k < MINI.size; k++) setTimeout(() => { if (!touched) addToPack(MINI.flavors[(s0 + k) % MINI.flavors.length]); }, 250 + k * 160);
}), { threshold: .3 }).observe(range);
renderPack();

/* ===================================================================== cart */
const cart = [];
const names = fs => { const m = new Map(); fs.forEach(f => m.set(f, (m.get(f) || 0) + 1)); return [...m].map(([f, n]) => FLAVORS[f].name.toLowerCase() + (n > 1 ? ` ×${n}` : '')).join(', '); };
const ITEM = {
  big: () => ({ id: 'big', title: 'Большой набор', sub: '6 шт: все вкусы', price: PRICE.big, sprites: [1, 0, 3] }),
  mini: fs => ({ id: 'mini:' + [...fs].sort().join(''), title: 'Мини-набор', sub: names(fs), price: PRICE.mini, sprites: fs.slice(0, 3) }),
  coffee: () => ({ id: 'coffee', title: 'Кофе', sub: 'корпусное мороженое, 1 шт', price: PRICE.coffee, sprites: [COFFEE] }),
  stick: i => ({ id: 'stick:' + i, title: 'Стик', sub: STICKS[i].name, price: PRICE.stick, img: '__IMG_s1__' }),
  trifle: i => ({ id: 'trifle:' + i, title: 'Трайфл', sub: TRIFLES[i].name, price: PRICE.trifle, img: TRIFLES[i].img }),
  choco: i => ({ id: 'choco:' + i, title: 'Шоколадный набор', sub: `${CHOCO[i].name.toLowerCase()}, ${CHOCO[i].n} шт`, price: CHOCO[i].price, img: GIFTS[0].img }),
};
function addItem(it) { const ex = cart.find(c => c.id === it.id); if (ex) ex.qty++; else cart.push({ ...it, qty: 1 }); renderCart(true); }
const total = () => cart.reduce((s, it) => s + it.price * it.qty, 0);
function orderText() {
  let t = cart.length
    ? 'Здравствуйте! Хочу заказать:\n' + cart.map(it => `— ${it.title} (${it.sub}) × ${it.qty} — ${fmt(it.price * it.qty)}`).join('\n') + `\nИтого: ${fmt(total())}`
    : 'Здравствуйте! Хочу сделать заказ.';
  const g = $('input[name=get]:checked', drawer); if (g) t += `\nПолучение: ${GET[+g.value].text}`;
  return t;
}
const tgLink = () => BRAND.tg + '?text=' + encodeURIComponent(orderText());
function syncBadges() {
  $$('[data-id]').forEach(b => { const it = cart.find(c => c.id === b.dataset.id), q = $('.qb', b); if (q) { q.textContent = it ? it.qty : ''; q.classList.toggle('on', !!it); } });
}
function renderCart(bump) {
  const n = cart.reduce((s, it) => s + it.qty, 0); badge.textContent = n; badge.classList.toggle('on', n > 0);
  cartBtn.setAttribute('aria-label', n ? `Корзина: ${n} шт на ${fmt(total())}` : 'Корзина');
  if (bump && !RM) badge.animate([{ scale: 1.5 }, { scale: 1 }], { duration: 350, easing: 'ease-out' });
  const list = $('#dlist'); list.replaceChildren();
  if (!cart.length) list.append(el('p', 'dempty', 'Пока пусто. Добавьте набор на витрине или соберите мини-набор — заказ сложится сам.'));
  cart.forEach(it => {
    const d = el('div', 'di', `<div class="ic">${it.img ? '' : it.sprites.map(f => `<i class="cup spr f${f}"></i>`).join('')}</div>` +
      `<div class="tx">${it.title}<small>${it.sub}</small><em>${it.qty > 1 ? `${it.qty} × ${fmt(it.price)} = ` : ''}${fmt(it.price * it.qty)}</em></div>` +
      `<div class="q"><button aria-label="Убрать одну штуку">−</button><span>${it.qty}</span><button aria-label="Добавить ещё одну">+</button></div>`);
    const ic = $('.ic', d);
    if (it.img) { ic.classList.add('ph'); ic.style.backgroundImage = `url("${it.img}")`; } else ic.style.setProperty('--c', FLAVORS[it.sprites[0]].color);
    const [minus, plus] = $$('.q button', d);
    minus.onclick = () => { if (--it.qty <= 0) cart.splice(cart.indexOf(it), 1); renderCart(); };
    plus.onclick = () => { it.qty++; renderCart(); };
    list.append(d);
  });
  $('#dtotal').textContent = fmt(total()); $('#dsum').hidden = !cart.length;
  $('#dtg').href = tgLink();
  syncBadges();
}
drawer.addEventListener('change', e => { if (e.target.name === 'get') $('#dtg').href = tgLink(); });
$('#dtg').addEventListener('click', () => {
  const text = orderText(); $('#dtg').href = tgLink();
  // a backup in case the chat opens without the draft (e.g. her number is hidden from search)
  navigator.clipboard?.writeText(text).then(() => toast('Текст заказа скопирован. Если чат открылся пустым — просто вставьте его'), () => {});
});
function openCart() { document.body.classList.add('cart'); drawer.inert = false; drawer.setAttribute('aria-hidden', 'false'); sm.on = false; hideToast(); setTimeout(() => $('#dclose').focus({ preventScroll: true }), 50); }
function closeCart() { if (!document.body.classList.contains('cart')) return; document.body.classList.remove('cart'); drawer.inert = true; drawer.setAttribute('aria-hidden', 'true'); cartBtn.focus({ preventScroll: true }); }
drawer.inert = true;
cartBtn.addEventListener('click', openCart);
$('#scrim').addEventListener('click', closeCart); $('#dclose').addEventListener('click', closeCart);
renderCart();

function fly(srcs, done) { // copies of the product images fly into the basket
  if (RM) { done(); return; }
  const br = cartBtn.getBoundingClientRect(), bx = br.left + br.width / 2, by = br.top + br.height / 2; let left = srcs.length;
  srcs.forEach((src, i) => {
    const s = src.el || src; let r = s.getBoundingClientRect();
    if (src.size) { const cx = r.left + r.width / 2, cy = r.top + r.height / 2; r = { left: cx - src.size / 2, top: cy - src.size / 2, width: src.size, height: src.size }; }
    const ph = !!src.img || s.tagName === 'IMG';
    const bg = src.img ? `url("${src.img}")` : s.tagName === 'IMG' ? `url("${s.currentSrc || s.src}")` : getComputedStyle(s).backgroundImage;
    const c = el('i');
    c.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:70;pointer-events:none;background:${bg} center/${ph ? 'cover' : 'contain'} no-repeat;border-radius:${src.size ? '50%' : ph ? '18px' : '0'};filter:drop-shadow(0 10px 14px rgba(0,0,0,.25))`;
    document.body.append(c);
    const dx = bx - (r.left + r.width / 2), dy = by - (r.top + r.height / 2), k = Math.min(.2, 30 / r.height), lift = Math.min(160, .35 * Math.abs(dy) + 60);
    c.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }, { transform: `translate(${dx * .4}px,${dy * .4 - lift}px) scale(${.45 + k}) rotate(-10deg)`, opacity: 1, offset: .45 }, { transform: `translate(${dx}px,${dy}px) scale(${k}) rotate(-18deg)`, opacity: .15 }],
      { duration: 900, delay: i * 120, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'both' }).onfinish = () => {
      c.remove(); cartBtn.animate([{ scale: 1 }, { scale: 1.18 }, { scale: 1 }], { duration: 320 }); if (--left === 0) done();
    };
  });
}

/* ===================================================================== frame loop */
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(64, now - last); last = now;
  if (sm.on) { sm.cur += (sm.target - sm.cur) * (1 - Math.exp(-dt / 120)); if (Math.abs(sm.target - sm.cur) < .5) { sm.cur = sm.target; sm.on = false; } scrollTo(0, sm.cur); }
  if (tw) { const t = clamp((now - tw.t0) / tw.dur); pos = lerp(tw.from, tw.to, tw.ease(t)); if (t >= 1) { pos = tw.to; tw = null; } }
  const hr = hero.getBoundingClientRect();
  if (entered && autoOn && !tw && !dragging && !document.hidden && now - lastAct > 3200 && hr.bottom / hr.height >= .6 && !document.body.classList.contains('cart')) goTo(Math.round(target) + 1);
  if (rv) {
    const t = clamp((now - rv.t0) / 420), r = 1.45 * Math.hypot(vw / 2, Math.max(cyOff, heroH - cyOff)) * GLIDE(t), f = Math.max(60, .35 * r);
    const m = `radial-gradient(circle at ${vw / 2}px ${cyOff}px, #000 ${Math.max(0, r - f)}px, transparent ${r}px)`;
    revealEl.style.maskImage = revealEl.style.webkitMaskImage = m; if (t >= 1) finishReveal();
  }
  updateNav();

  // ----- section 2: the pinned «inside» story
  const r2 = inside.getBoundingClientRect(), p1 = clamp(1 - r2.top / vh), p = clamp(-r2.top / (r2.height - vh));
  const step = Math.floor(Math.min(p, .759) / .19), q = clamp((p - .76) / .24);
  if (step !== curStep) setStep(step, now);
  if (fl) { const t = clamp((now - fl.t0) / fl.dur); flip = lerp(fl.from, fl.to, eio(t)); if (t >= 1) fl = null; }
  const vis = r2.bottom > 0 && r2.top < vh; inFront.style.visibility = vis ? 'visible' : 'hidden';
  if (vis) {
    inFront.style.transform = `translateY(${r2.top > 0 ? r2.top : r2.bottom < vh ? r2.bottom - vh : 0}px)`;
    frontFrame.style.opacity = inNum.style.opacity = 1 - clamp(4 * q); inDark.style.opacity = clamp(3.5 * q) * .42;
    const on = q > 0 && q < 1 && !RM, R = .55 * Math.hypot(vw, vh), base = .085 * Math.min(vw, vh), env = clamp(5 * q) * clamp(6 * (1 - q));
    storm.forEach(pc => {
      const s = clamp((q - .45 * pc.ph) / .55);
      if (!on || s <= 0 || s >= 1) { if (pc.vis) { pc.e.style.display = 'none'; pc.vis = false; } return; }
      if (!pc.vis) { pc.e.style.display = 'block'; pc.vis = true; }
      const rad = (.06 + Math.pow(s, 1.5) * .95) * R, sz = base * (.2 + 1.7 * s) * pc.size;
      pc.e.style.width = pc.e.style.height = sz + 'px';
      pc.e.style.transform = `translate(${vw / 2 + Math.cos(pc.a) * rad - sz / 2}px,${vh / 2 + Math.sin(pc.a) * rad * .8 - sz / 2}px) rotate(${pc.spin * s}deg)`;
      pc.e.style.opacity = Math.sin(Math.PI * s) * env;
    });
  }
  if (!GLOK) return;

  // ----- 3D fruits: the arc, plus the selected one that travels down the page
  const jT = Math.round(target), fade = 1 - clamp(1.6 * p1), heroVis = hr.bottom > 0, base = Math.floor(pos);
  for (let j = base - 5; j <= base + 5; j++) {
    const c = pool[mod(j, 11)];
    if (j === jT || !heroVis || fade <= .01) { c.g.visible = c.sh.visible = false; continue; }
    const s = arcState(j, now, hr.top); s.op *= fade; setF(c, mod(j, N)); c.body.userData.j = j; place(c, s);
  }
  let S = arcState(jT, now, hr.top);
  if (p1 > 0) {
    const rb = inBar.getBoundingClientRect();
    const B = { x: rb.left + rb.width / 2, y: rb.top + rb.height / 2 + (RM ? 0 : Math.sin(now / 2600 * 2 * Math.PI) * 6), h: rb.height, rz: 8, ry: flip + (RM ? 0 : 720 * q), rx: 0, z: 0, op: 1, sx: 1, sy: 1, shadow: 1 };
    S = blend(S, B, eio(p1));
    const rs = shop.getBoundingClientRect(), p3 = clamp((vh - rs.top) / (.7 * vh));
    if (p3 > 0) {
      const card = cards[curF];
      if (phone() && !stripDone) { stripDone = true; cardsEl.scrollTo({ left: card.offsetLeft - (cardsEl.clientWidth - card.offsetWidth) / 2, behavior: RM ? 'auto' : 'smooth' }); }
      const rc = $('.pk', card).getBoundingClientRect();
      const C = { x: rc.left + rc.width / 2, y: rc.top + rc.height / 2, h: Math.min(rc.height, rc.width * 1.15) * SPR_F, rz: 0, ry: Math.round(B.ry / 360) * 360 + card._tx * 14, rx: -card._ty * 14, z: 0, op: 1, sx: 1, sy: 1, shadow: .7 };
      S = blend(B, C, eio(p3));
      if (poke != null) {
        const t = (now - poke) / 500; if (t >= 1) poke = null; else { const P = [[0, 1, 1], [.3, 1.06, .93], [.6, .97, 1.04], [1, 1, 1]]; let i = 0; while (t > P[i + 1][0]) i++; const u = (t - P[i][0]) / (P[i + 1][0] - P[i][0]); S.sx = lerp(P[i][1], P[i + 1][1], u); S.sy = lerp(P[i][2], P[i + 1][2], u); }
      }
    } else stripDone = false;
  }
  setF(trav, mod(jT, N)); trav.body.userData.j = jT; place(trav, S);
  renderer.render(scene, camera);
}

/* ===================================================================== intro + boot */
function enterHero() {
  if (entered) return; entered = true;
  $('#intro').classList.add('out'); document.body.classList.remove('locked'); document.body.classList.add('entered'); nav.classList.add('in');
  lastAct = performance.now(); moveHl();
  if (RM) { pos = START; bits.forEach(b => { b.style.opacity = .7; }); return; }
  tw = { from: -2.6, to: START, t0: performance.now(), dur: 1700, ease: ENTER };
  bits.forEach((b, i) => {
    b.animate([{ opacity: 0 }, { opacity: .8 }], { duration: 900, delay: 300 + 90 * i, fill: 'forwards' });
    const dx = (i % 2 ? -1 : 1) * (12 + i % 3), r = (i % 2 ? 1 : -1) * (10 + i % 3);
    b.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${dx}px,${-(22 + 3 * i)}px) rotate(${r}deg)` }, { transform: 'translate(0,0) rotate(0)' }], { duration: 7000 + 900 * i, iterations: Infinity, easing: 'ease-in-out' });
  });
}
function introBurst() {
  const it = $('#intro'), r = seed(5);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + r() * .4, d = 36 + r() * 20, f = el('i', `fr f${i % N}`);
    f.style.cssText = `--x:${Math.cos(a) * d}vmax;--y:${Math.sin(a) * d * .8}vmax;--s:${.8 + r() * .9};--r:${(r() - .5) * 240}deg;animation-delay:${.2 + r() * .25}s`;
    it.prepend(f);
  }
}
async function boot() {
  const t0 = performance.now();
  root.style.setProperty('--flav', FLAVORS[START].color); $('meta[name=theme-color]').content = FLAVORS[START].color;
  cards[START].classList.add('live'); stormFruits(START);
  countEl.textContent = String(START + 1).padStart(2, '0');
  if (!RM) introBurst();
  setTimeout(enterHero, 7000); // failsafe
  try { await Promise.all([document.fonts.load('900 40px Unbounded', 'АБВ abc 12'), document.fonts.load('500 20px "JetBrains Mono"', 'АБВ abc 12'), document.fonts.load('600 20px Onest', 'АБВ abc 12')]); } catch (e) { console.warn('fonts', e); }
  let urls = null;
  try { initGL(); urls = await renderSprites(); } catch (e) { console.warn('WebGL off', e); GLOK = false; root.classList.remove('gl'); canvas.style.display = 'none'; }
  if (!urls) urls = fruitURL;
  dyn.textContent += urls.map((u, i) => `.cup.f${i}{background-image:url("${u}")}`).join('');
  setTitle(FLAVORS[START].name, 1, true); resize();
  addEventListener('resize', resize); addEventListener('orientationchange', resize);
  requestAnimationFrame(frame);
  setTimeout(enterHero, RM ? 0 : Math.max(200, 1900 - (performance.now() - t0)));
}
boot();
