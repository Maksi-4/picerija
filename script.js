const $ = id => document.getElementById(id);
const pizzas = [
  { name: 'Margherita', desc: 'Paradižnik, mozzarella, bazilika', price: 8.5 },
  { name: 'Klasika', desc: 'Paradižnik, sir, šunka, gobice', price: 10 },
  { name: 'Diavola', desc: 'Mozzarella, pikantna salama, čili', price: 11 },
  { name: 'Pet zvezd', desc: 'Pršut, rukola, mozzarella, parmezan', price: 13 },
  { name: 'Vegetariana', desc: 'Paprika, bučke, gobice, mozzarella', price: 10.5 },
  { name: 'Quattro formaggi', desc: 'Mozzarella, gorgonzola, edamec, parmezan', price: 11.5 }
];
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const money = n => n.toLocaleString('sl-SI', { style: 'currency', currency: 'EUR' });
let cart = read('pet-cart', {}), user = read('pet-user', null), register = false;
if ($('products')) $('products').innerHTML = pizzas.map((p, i) => `<article class="product"><img src="pizza.jpg" alt="Ilustrativna fotografija pice"><div class="info"><h3>${p.name}</h3><p>${p.desc}</p><div class="line"><span class="price">${money(p.price)}</span><button data-add="${i}">+ Dodaj</button></div></div></article>`).join('');
function render() {
  save('pet-cart', cart);
  $('count').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  if ($('items')) $('items').innerHTML = Object.entries(cart).map(([i, q]) => `<div class="cart-row"><div><strong>${pizzas[i].name}</strong><br>${money(pizzas[i].price * q)}</div><div class="qty"><button data-minus="${i}">−</button>${q}<button data-add="${i}">+</button></div></div>`).join('') || '<p>Košarica je prazna.</p>';
  if ($('total')) $('total').textContent = money(Object.entries(cart).reduce((s, [i, q]) => s + pizzas[i].price * q, 0));
  if ($('checkout')) $('checkout').disabled = !Object.keys(cart).length;
  $('account').textContent = user ? 'Odjava' : 'Prijava';
}
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.add !== undefined) { const i = b.dataset.add; cart[i] = (cart[i] || 0) + 1; if ($('orderStatus')) $('orderStatus').textContent = ''; render(); }
  if (b.dataset.minus !== undefined) { const i = b.dataset.minus; if (--cart[i] <= 0) delete cart[i]; render(); }
  if (b.dataset.close) $(b.dataset.close).close();
});
$('account').onclick = e => { if (user) { e.preventDefault(); user = null; save('pet-user', null); render(); location.href = 'prijava.html'; } };
if ($('toggleAuth')) $('toggleAuth').onclick = () => { register = !register; $('authTitle').textContent = register ? 'Registracija' : 'Prijava'; $('authSubmit').textContent = register ? 'Registriraj se' : 'Prijavi se'; $('toggleAuth').textContent = register ? 'Že imam račun' : 'Ustvari račun'; $('authStatus').textContent = ''; };
if ($('authForm')) $('authForm').onsubmit = async e => {
  e.preventDefault(); const email = $('email').value.trim().toLowerCase(); const password = $('password').value; // Only a local demonstration, not secure authentication.
  const accounts = read('pet-accounts', []); if (!crypto.subtle) { $('authStatus').textContent = 'Za prijavo odpri stran prek localhosta.'; return; } const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(email + ':' + password)).then(b => Array.from(new Uint8Array(b), v => v.toString(16).padStart(2, '0')).join('')).catch(() => null); if (!hash) { $('authStatus').textContent = 'Za prijavo odpri stran prek localhosta.'; return; }
  if (register) { if (accounts.some(a => a.email === email)) { $('authStatus').textContent = 'Račun že obstaja.'; return; } accounts.push({ email, hash }); save('pet-accounts', accounts); } else if (!accounts.some(a => a.email === email && a.hash === hash)) { $('authStatus').textContent = 'Napačna e-pošta ali geslo.'; return; } user = email; save('pet-user', user); $('authForm').reset(); render(); location.href = 'meni.html';
};
if ($('delivery')) $('delivery').onchange = () => { const delivery = $('delivery').value === 'delivery'; $('address').hidden = !delivery; $('address').required = delivery; };
if ($('orderForm')) $('orderForm').onsubmit = e => { e.preventDefault(); if (!Object.keys(cart).length) return; if (!user) { $('orderStatus').textContent = 'Pred naročilom se prijavi.'; location.href = 'prijava.html'; return; } const orders = read('pet-orders', []); orders.push({ id: Date.now(), email: user, customer: $('customer').value, delivery: $('delivery').value, address: $('delivery').value === 'delivery' ? $('address').value : '', items: { ...cart } }); save('pet-orders', orders); cart = {}; render(); $('orderStatus').textContent = 'Demo naročilo je shranjeno v brskalniku. Ni bilo poslano piceriji.'; $('orderForm').reset(); $('delivery').onchange(); };
const captions = ['Sveže pečena Margherita', 'Hrustljav rob', 'Sveže sestavine']; let slide = 0; function gallery() { $('galleryCaption').textContent = captions[slide]; $('galleryImage').src = ['pizza.jpg', 'rob.jpg', 'sestavine.jpg'][slide]; $('galleryImage').style.objectPosition = ['center', 'left', 'right'][slide]; $('galleryImage').style.objectFit = slide ? 'cover' : 'contain'; $('galleryImage').style.transform = 'none'; } if ($('prev')) $('prev').onclick = () => { slide = (slide + 2) % 3; gallery(); }; if ($('next')) $('next').onclick = () => { slide = (slide + 1) % 3; gallery(); };
if ($('contactForm')) $('contactForm').onsubmit = e => { e.preventDefault(); $('contactStatus').textContent = 'Sporočilo je pripravljeno, vendar ni poslano (demo brez strežnika).'; }; render();
