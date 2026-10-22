/* Glow & Go shop. Plain JavaScript so it works even when index.html is opened by double-click.
   Checkout validation is done by Python (main.py via PyScript) when available, with a JS fallback. */
(() => {
const RAW = [
 ["pearl-bracelet","Pearl Bracelet","Jewelry",99,129,"best","Faux pearls on a stretch cord. Easy to stack with other bracelets."],
 ["gold-hoops","Golden Hoop Earrings","Jewelry",129,169,"best","Lightweight gold-tone hoops for everyday and night-out looks."],
 ["layered-necklace","Layered Necklace","Jewelry",149,199,"new","Three delicate chains in one piece. Adjustable length."],
 ["satin-scrunchie","Satin Scrunchie Set","Hair",79,99,"best","Soft satin scrunchies in blush, cream and rose. Gentle on hair."],
 ["minimal-ring","Minimal Ring Set","Jewelry",89,0,"","Three thin gold-tone rings you can wear together or apart."],
 ["bag-charm","Cute Bag Charm","Bags",69,89,"new","A heart charm that adds personality to any bag or keys."],
 ["floral-backpack","Floral Mini Backpack","Bags",399,499,"best","Compact floral backpack for school, cafe days and weekend trips."],
 ["statement-set","Statement Jewelry Set","Gift Sets",249,329,"new","Necklace, earrings and ring in matching gold tone."],
 ["pearl-clip","Pearl Hair Clip Set","Hair",59,0,"new","Two pearl-trimmed clips for quick, polished styling."],
 ["heart-keychain","Heart Keychain","Bags",49,0,"","Small, shiny and budget friendly. A great add-on gift."],
 ["crossbody","Mini Crossbody Bag","Bags",349,449,"new","Pocket-size bag with a gold-tone strap."],
 ["gift-box","Glow Gift Box","Gift Sets",199,247,"bundle","Bundle: Pearl Bracelet + Satin Scrunchie Set + Cute Bag Charm."],
 ["duo-bundle","Earrings and Necklace Duo","Gift Sets",249,278,"bundle","Bundle: Golden Hoop Earrings + Layered Necklace."],
];
const P = RAW.map(([id,name,cat,price,old,tag,desc]) => ({id,name,cat,price,old,tag,desc,img:`assets/products/${id}.svg`}));
const BY = Object.fromEntries(P.map(p => [p.id, p]));
const CODES = {GLOW10:["percent",10,0], PINKY50:["flat",50,300]};
const S = {cart:{}, wish:[], cat:"All", filt:"all", q:"", sort:"featured", code:""};
const $ = id => document.getElementById(id);
const money = n => "₱" + Math.round(n).toLocaleString("en-PH");
const pct = p => p.old ? Math.round((p.old - p.price) / p.old * 100) : 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

try { const d = JSON.parse(localStorage.getItem("gg") || "{}");
  S.cart = Object.fromEntries(Object.entries(d.cart || {}).filter(([k]) => BY[k]));
  S.wish = (d.wish || []).filter(w => BY[w]); S.code = d.code || ""; } catch (e) {}
const save = () => { try { localStorage.setItem("gg", JSON.stringify({cart:S.cart, wish:S.wish, code:S.code})); } catch (e) {} };

let toastT;
function toast(msg) { const t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1800); }

function totals() {
  const sub = Object.entries(S.cart).reduce((a, [i, q]) => a + BY[i].price * q, 0);
  const c = CODES[S.code]; let disc = 0;
  if (c && sub >= c[2]) disc = c[0] === "percent" ? Math.round(sub * c[1] / 100) : Math.min(c[1], sub);
  const ship = sub === 0 || sub - disc >= 500 ? 0 : 49;
  return {sub, disc, ship, total: sub - disc + ship};
}

/* ---------- views ---------- */
function card(p) {
  let b = p.old ? `<span class="badge">-${pct(p)}%</span>` : "";
  b += {new:'<span class="badge alt">New</span>', best:'<span class="badge alt">Bestseller</span>', bundle:'<span class="badge alt">Bundle</span>'}[p.tag] || "";
  const on = S.wish.includes(p.id);
  return `<article class="card">
    <div class="ph" data-action="open" data-id="${p.id}"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"><div class="badges">${b}</div></div>
    <button class="heart${on ? " on" : ""}" data-action="wish" data-id="${p.id}" aria-label="Favorite ${esc(p.name)}">${on ? "♥" : "♡"}</button>
    <div class="info" data-action="open" data-id="${p.id}"><h3>${esc(p.name)}</h3><p class="price"><b>${money(p.price)}</b> ${p.old ? `<s>${money(p.old)}</s>` : ""}</p></div>
    <div class="acts"><button class="btn small ghost" data-action="add" data-id="${p.id}">Add to cart</button><button class="btn small" data-action="buy" data-id="${p.id}">Buy now</button></div></article>`;
}
const matches = (p, q) => `${p.name} ${p.desc} ${p.cat} ${p.tag} ${p.old ? "sale" : ""}`.toLowerCase().includes(q);

function visible() {
  const q = S.q.trim().toLowerCase();
  let r = P.filter(p => (S.cat === "All" || p.cat === S.cat) && matches(p, q));
  if (S.filt === "sale") r = r.filter(p => p.old);
  else if (S.filt === "wish") r = r.filter(p => S.wish.includes(p.id));
  else if (["best","new","bundle"].includes(S.filt)) r = r.filter(p => p.tag === S.filt);
  const s = {low:(a,b)=>a.price-b.price, high:(a,b)=>b.price-a.price, disc:(a,b)=>pct(b)-pct(a), name:(a,b)=>a.name.localeCompare(b.name)}[S.sort];
  return s ? r.sort(s) : r;
}

function renderShop() {
  const r = visible(), q = S.q.trim();
  $("grid").innerHTML = r.map(card).join("") || `<p class="empty">No products found${q ? ` for “${esc(q)}”` : ""}. <button class="link" data-action="clear">Clear search and filters</button></p>`;
  $("count").textContent = q ? `${r.length} result${r.length !== 1 ? "s" : ""} for “${q}”` : `${r.length} item${r.length !== 1 ? "s" : ""}`;
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", (c.dataset.kind === "cat" && c.dataset.val === S.cat) || (c.dataset.kind === "filt" && c.dataset.val === S.filt)));
}

function renderSugg() {
  const box = $("sugg"), q = S.q.trim().toLowerCase();
  if (!q) { box.hidden = true; return; }
  const all = P.filter(p => matches(p, q));
  box.innerHTML = all.length
    ? all.slice(0, 5).map(p => `<button data-action="open" data-id="${p.id}"><img src="${p.img}" alt=""><span>${esc(p.name)}<small>${p.old ? `<s>${money(p.old)}</s> ` : ""}${money(p.price)}</small></span></button>`).join("") + `<button class="all" data-action="seeall">See all ${all.length} result${all.length > 1 ? "s" : ""}</button>`
    : `<p>No products found for “${esc(S.q)}”. Try “pearl”, “bag” or “gold”.</p>`;
  box.hidden = false;
}

function renderCart() {
  const ids = Object.keys(S.cart), t = totals();
  const lines = ids.map(i => `<li><img src="${BY[i].img}" alt=""><div><b>${esc(BY[i].name)}</b><span>${money(BY[i].price)} each</span>
    <div class="qty"><button data-action="dec" data-id="${i}" aria-label="Decrease">−</button><em>${S.cart[i]}</em><button data-action="inc" data-id="${i}" aria-label="Increase">+</button><button class="rm" data-action="rm" data-id="${i}">Remove</button></div></div><strong>${money(BY[i].price * S.cart[i])}</strong></li>`).join("");
  const c = CODES[S.code];
  const msg = !S.code ? "" : !c ? '<small class="bad">That code is not valid.</small>' : t.disc ? `<small class="ok">${S.code} applied: -${money(t.disc)}</small>` : `<small class="bad">${S.code} needs a subtotal of ${money(c[2])}.</small>`;
  const recs = P.filter(p => !S.cart[p.id] && ["new","best"].includes(p.tag)).slice(0, 3).map(p => `<button class="rec" data-action="add" data-id="${p.id}"><img src="${p.img}" alt=""><span>${esc(p.name)}<br>${money(p.price)}</span></button>`).join("");
  $("cart-body").innerHTML = ids.length ? `<ul class="lines">${lines}</ul>
    <div class="code"><input id="code" placeholder="Discount code" value="${esc(S.code)}"><button class="btn small ghost" data-action="apply">Apply</button></div>${msg}
    <dl class="sum"><dt>Subtotal</dt><dd>${money(t.sub)}</dd><dt>Discount</dt><dd>-${money(t.disc)}</dd><dt>Delivery</dt><dd>${t.ship ? money(t.ship) : "Free"}</dd><dt>Total</dt><dd><b>${money(t.total)}</b></dd></dl>
    <button class="btn" data-action="checkout">Go to checkout</button><h4>You may also like</h4><div class="recs">${recs}</div>` : '<p class="empty">Your cart is empty. Search or browse, then tap Add to cart or Buy now.</p>';
  $("cart-n").textContent = Object.values(S.cart).reduce((a, b) => a + b, 0);
  $("wish-n").textContent = S.wish.length;
}

function renderAll() {
  $("best").innerHTML = P.filter(p => p.tag === "best").map(card).join("");
  $("bundles-grid").innerHTML = P.filter(p => p.tag === "bundle").map(card).join("");
  renderShop(); renderCart();
}
const refresh = () => { save(); renderAll(); };

const modal = html => { $("modal-body").innerHTML = html; $("modal").classList.add("open"); };
const closeAll = () => { ["modal","cart","scrim"].forEach(i => $(i).classList.remove("open")); };

function detail(id) {
  const p = BY[id], k = encodeURIComponent(p.name), on = S.wish.includes(id);
  const rel = [...P.filter(x => x.id !== id && x.cat === p.cat), ...P.filter(x => x.id !== id && x.cat !== p.cat)].slice(0, 3)
    .map(x => `<button class="rec" data-action="open" data-id="${x.id}"><img src="${x.img}" alt=""><span>${esc(x.name)}<br>${money(x.price)}</span></button>`).join("");
  modal(`<div class="detail"><img src="${p.img}" alt="${esc(p.name)}"><div>
    <h2>${esc(p.name)}</h2><p class="price big"><b>${money(p.price)}</b> ${p.old ? `<s>${money(p.old)}</s> <span class="badge">-${pct(p)}% off</span>` : ""}</p><p>${esc(p.desc)}</p>
    <div class="row"><button class="btn" data-action="buy" data-id="${id}">Buy now</button><button class="btn ghost" data-action="add" data-id="${id}">Add to cart</button><button class="btn ghost" data-action="wish" data-id="${id}">${on ? "♥ Saved" : "♡ Save"}</button></div>
    <p class="ext"><b>Also on other stores:</b> these are store <em>searches</em>, not verified listings for this exact item.<br>
    <a href="https://shopee.ph/search?keyword=${k}" target="_blank" rel="noopener">Search on Shopee</a> · <a href="https://www.lazada.com.ph/catalog/?q=${k}" target="_blank" rel="noopener">Search on Lazada</a></p></div></div>
    <h4>Related products</h4><div class="recs">${rel}</div>`);
}

function checkout() {
  if (!Object.keys(S.cart).length) return;
  const t = totals();
  const lines = Object.entries(S.cart).map(([i, q]) => `<li><span>${q} × ${esc(BY[i].name)}</span><b>${money(BY[i].price * q)}</b></li>`).join("");
  modal(`<h2>Checkout</h2><p class="demo">Demo checkout only. No real order or payment is made, and nothing you type is saved or sent.</p>
    <div class="co-grid"><form id="co" novalidate>
      <label>Full name<input id="f-name" autocomplete="name"><span class="err" id="e-name"></span></label>
      <label>Mobile number<input id="f-phone" placeholder="09171234567" inputmode="tel"><span class="err" id="e-phone"></span></label>
      <label>Email<input id="f-email" type="email" placeholder="you@email.com"><span class="err" id="e-email"></span></label>
      <label>Delivery address<textarea id="f-addr" rows="2" placeholder="House no., street, barangay, city"></textarea><span class="err" id="e-addr"></span></label>
      <label>Payment<select><option>Cash on delivery (demo)</option></select></label>
      <button class="btn" type="submit">Place demo order</button>
      <p class="pychip">${window.pyReady ? "Validated with Python (PyScript)" : "Validated in the browser"}</p></form>
    <div class="summary"><h4>Order summary</h4><ul>${lines}</ul>
      <dl class="sum"><dt>Subtotal</dt><dd>${money(t.sub)}</dd><dt>Discount</dt><dd>-${money(t.disc)}</dd><dt>Delivery</dt><dd>${t.ship ? money(t.ship) : "Free"}</dd><dt>Total</dt><dd><b>${money(t.total)}</b></dd></dl></div></div>`);
}

function validate(v) {
  if (window.py_validate) { try { return JSON.parse(window.py_validate(v.name, v.phone, v.email, v.addr)); } catch (e) {} }
  return {
    name: v.name.length < 2 ? "Enter your full name." : "",
    phone: /^(09|\+639)\d{9}$/.test(v.phone.replace(/\s/g, "")) ? "" : "Use a PH mobile number like 09171234567.",
    email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) ? "" : "Enter a valid email address.",
    addr: v.addr.length < 10 ? "Enter a complete delivery address (at least 10 characters)." : "",
  };
}

/* ---------- events ---------- */
function addItem(id) { S.cart[id] = (S.cart[id] || 0) + 1; refresh(); }
document.addEventListener("click", e => {
  if (!e.target.closest(".search")) $("sugg").hidden = true;
  const t = e.target.closest("[data-action]"); if (!t) return;
  const a = t.dataset.action, id = t.dataset.id;
  if (a === "backdrop") { if (e.target === t) closeAll(); }
  else if (a === "open") { $("sugg").hidden = true; detail(id); }
  else if (a === "add") { addItem(id); toast(`Added ${BY[id].name}`); }
  else if (a === "buy") { addItem(id); closeAll(); checkout(); }
  else if (a === "wish") { S.wish = S.wish.includes(id) ? S.wish.filter(w => w !== id) : [...S.wish, id]; refresh(); if ($("modal").classList.contains("open") && $("modal-body").querySelector(".detail")) detail(id); }
  else if (a === "inc") { S.cart[id]++; refresh(); }
  else if (a === "dec") { if (--S.cart[id] <= 0) delete S.cart[id]; refresh(); }
  else if (a === "rm") { delete S.cart[id]; refresh(); }
  else if (a === "apply") { S.code = $("code").value.trim().toUpperCase(); refresh(); }
  else if (a === "cart") { $("cart").classList.add("open"); $("scrim").classList.add("open"); }
  else if (a === "close") closeAll();
  else if (a === "checkout") { closeAll(); checkout(); }
  else if (a === "chip") { if (t.dataset.kind === "cat") S.cat = t.dataset.val; else S.filt = t.dataset.val; renderShop(); if (t.dataset.jump) $("shop").scrollIntoView({behavior:"smooth"}); }
  else if (a === "seeall") { $("sugg").hidden = true; $("shop").scrollIntoView({behavior:"smooth"}); }
  else if (a === "clear") { S.q = ""; S.cat = "All"; S.filt = "all"; $("q").value = ""; renderShop(); renderSugg(); }
  else if (a === "usecode") { S.code = t.dataset.val; refresh(); toast(`${t.dataset.val} added to your cart`); }
});
$("q").addEventListener("input", e => { S.q = e.target.value; S.cat = "All"; S.filt = "all"; renderShop(); renderSugg(); });
$("q").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("sugg").hidden = true; $("shop").scrollIntoView({behavior:"smooth"}); } });
$("q").addEventListener("focus", renderSugg);
$("sort").addEventListener("change", e => { S.sort = e.target.value; renderShop(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeAll(); $("sugg").hidden = true; } });
document.addEventListener("submit", e => {
  if (e.target.id !== "co") return; e.preventDefault();
  const v = Object.fromEntries(["name","phone","email","addr"].map(k => [k, $("f-" + k).value.trim()]));
  const errs = validate(v);
  Object.entries(errs).forEach(([k, m]) => $("e-" + k).textContent = m);
  if (Object.values(errs).some(Boolean)) return;
  const total = totals().total, d = new Date();
  const num = `GG-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${1000 + Math.floor(Math.random() * 9000)}`;
  S.cart = {}; S.code = ""; refresh();
  modal(`<div class="done"><h2>Thank you, ${esc(v.name.split(" ")[0])}!</h2><p>Demo order <b>${num}</b> recorded for ${money(total)}.</p><p class="demo">This is a class project demo. No real order was placed and no payment was taken.</p><button class="btn" data-action="close">Keep browsing</button></div>`);
});
setInterval(() => { const n = new Date(), l = 86400 - (n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()); $("timer").textContent = [l / 3600 | 0, l % 3600 / 60 | 0, l % 60].map(x => String(x).padStart(2, "0")).join(":"); }, 1000);
renderAll();
})();
