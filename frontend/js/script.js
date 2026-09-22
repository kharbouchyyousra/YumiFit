/* ============================================================
   PRODUITS — chargés depuis l'API
   ============================================================ */
const FALLBACK_PRODUCTS = [
  { _id: '1', id: 1, name: "Energy Cookies", price: 45, image: "images/products/produit1.jpeg", desc: "Cookies énergétiques sans sucre raffiné." },
  { _id: '2', id: 2, name: "Dark Chocolate Sea Salt Nut Bars", price: 60, image: "images/products/produit2.jpeg", desc: "Barres chocolat noir & sel de mer, riches en noix." },
  { _id: '3', id: 3, name: "Cookies avoine & miel", price: 30, image: "images/products/produit3.jpeg", desc: "Cookies croustillants à l'avoine et au miel bio." },
  { _id: '4', id: 4, name: "Chocolate Coconut Energy Balls", price: 35, image: "images/products/produit4.jpeg", desc: "Boules énergétiques chocolat & coco, sans gluten." },
  { _id: '5', id: 5, name: "Barres énergétiques", price: 25, image: "images/products/produit5.jpeg", desc: "Barres maison aux dattes, amandes et graines." },
  { _id: '6', id: 6, name: "Nutty Energy Balls", price: 50, image: "images/products/produit6.jpeg", desc: "Boules croquantes aux noix et fruits secs." }
];

let PRODUCTS = [];

/* ============================================================
   PANIER
   ============================================================ */
const CART_KEY = 'ecommerce_cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const product = PRODUCTS.find(p => String(p.id) === String(productId) || String(p._id) === String(productId));
  if (!product) return;

  const id = product.id || product._id;
  const existing = cart.find(item => String(item.id) === String(id));
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: id, name: product.name, price: product.price, image: product.image, qty });
  }
  saveCart(cart);
  showToast(`${qty} article(s) ajouté(s) au panier`, 'success');
}
function removeFromCart(productId) {
  const cart = getCart().filter(item => String(item.id) !== String(productId));
  saveCart(cart);
  renderCart();
}
function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) item.qty = Math.max(1, qty);
  saveCart(cart);
  renderCart();
}
function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}
function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}
function updateCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = getCartCount();
  });
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ============================================================
   AFFICHAGE PRODUITS
   ============================================================ */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  if (PRODUCTS.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#999">Chargement...</p>';
    return;
  }
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <a href="produit.html?id=${p.id || p._id}">
        <img src="${p.image}" alt="${p.name}">
      </a>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-price">${p.price} DH</div>
        <button class="btn" onclick="addToCart('${p.id || p._id}')">Ajouter au panier</button>
      </div>
    </div>
  `).join('');
}

function renderProductDetail() {
  const container = document.getElementById('product-detail');
  if (!container) return;
  if (PRODUCTS.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999">Chargement...</p>';
    return;
  }
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const product = PRODUCTS.find(p => String(p.id) === id || String(p._id) === id) || PRODUCTS[0];

  container.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div>
      <h1>${product.name}</h1>
      <div class="price">${product.price} DH</div>
      <p class="desc">${product.desc || product.description || ''}</p>
      <div class="qty-selector">
        <button onclick="changeQty(-1)">−</button>
        <input type="number" id="qty" value="1" min="1">
        <button onclick="changeQty(1)">+</button>
      </div>
      <button class="btn btn-block" onclick="addDetailToCart('${product.id || product._id}')">
        Ajouter au panier
      </button>
    </div>
  `;
}
function changeQty(delta) {
  const input = document.getElementById('qty');
  input.value = Math.max(1, parseInt(input.value) + delta);
}
function addDetailToCart(id) {
  const qty = parseInt(document.getElementById('qty').value) || 1;
  addToCart(id, qty);
}

/* ============================================================
   PANIER — affichage
   ============================================================ */
function renderCart() {
  const container = document.getElementById('cart-content');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
   container.innerHTML = `
  <div style="text-align:center;padding:60px 20px">
    <h2>Votre panier est vide 🍰</h2>
    <p style="margin:20px 0;color:#6c757d">Découvrez nos délicieux sweets healthy.</p>
    <a href="produits.html" class="btn">Voir nos sweets healthy</a>
  </div>
`;
    return;
  }

  const total = getCartTotal();
  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr><th>Produit</th><th>Nom</th><th>Prix</th><th>Qté</th><th>Total</th><th></th></tr>
      </thead>
      <tbody>
        ${cart.map(item => `
          <tr>
            <td><img src="${item.image}" alt="${item.name}"></td>
            <td>${item.name}</td>
            <td>${item.price} DH</td>
            <td>
              <input type="number" min="1" value="${item.qty}"
                style="width:60px;padding:6px;border:1px solid #ddd;border-radius:6px"
                onchange="updateQty('${item.id}', parseInt(this.value))">
            </td>
            <td><strong>${item.price * item.qty} DH</strong></td>
            <td><button class="remove-btn" onclick="removeFromCart('${item.id}')">✕</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="cart-actions">
      <a href="produits.html" class="btn btn-outline">← Continuer les achats</a>
      <div>
        <div class="cart-total">Total : <span>${total} DH</span></div>
        <a href="commande.html" class="btn" style="margin-top:12px">Passer la commande →</a>
      </div>
    </div>
  `;
}

/* ============================================================
   COMMANDE — résumé
   ============================================================ */
function renderOrderSummary() {
  const summary = document.getElementById('order-summary');
  if (!summary) return;
  const cart = getCart();
  const total = getCartTotal();

  if (cart.length === 0) {
    summary.innerHTML = '<p style="text-align:center;color:#999">Panier vide.</p>';
    return;
  }

  summary.innerHTML = `
    <h3>Résumé de la commande</h3>
    ${cart.map(i => `
      <div class="summary-item">
        <span>${i.name} × ${i.qty}</span>
        <span>${i.price * i.qty} DH</span>
      </div>
    `).join('')}
    <div class="summary-total">
      <span>Total</span>
      <span>${total} DH</span>
    </div>
  `;
}

/* ============================================================
   COMMANDE — envoi à l'API
   ============================================================ */
async function submitOrder(e) {
  e.preventDefault();
  const errorBox = document.getElementById('form-error');
  if (errorBox) errorBox.style.display = 'none';

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Votre panier est vide', '');
    return;
  }

  const nom = document.getElementById('nom').value.trim();
  const prenom = document.getElementById('prenom').value.trim();
  const email = document.getElementById('email').value.trim();
  const telephone = document.getElementById('telephone').value.trim();
  const adresse = document.getElementById('adresse').value.trim();
  const ville = document.getElementById('ville').value.trim();

  if (!nom || !prenom || !email || !telephone || !adresse || !ville) {
    if (errorBox) {
      errorBox.textContent = '⚠️ Veuillez remplir tous les champs.';
      errorBox.style.display = 'block';
    }
    return;
  }

  const orderPayload = {
    customer: { nom, prenom, email, telephone, adresse, ville },
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total: getCartTotal()
  };

  console.log('📤 Envoi de la commande :', orderPayload);

  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    console.log('📥 Réponse serveur :', res.status);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur serveur');
    }

    const created = await res.json();
    console.log('✅ Commande créée :', created);

    localStorage.setItem('last_order', JSON.stringify(created));
    localStorage.removeItem(CART_KEY);
    window.location.href = 'confirmation.html';
  } catch (err) {
    console.error('❌ Erreur commande :', err);
    if (errorBox) {
      errorBox.textContent = '❌ ' + err.message;
      errorBox.style.display = 'block';
    } else {
      showToast('❌ ' + err.message, '');
    }
  }
}

function renderConfirmation() {
  const el = document.getElementById('order-number');
  if (!el) return;
  const order = JSON.parse(localStorage.getItem('last_order') || 'null');
  if (order && order.number) {
    el.textContent = 'Votre commande N° #' + order.number;
  }
}

/* ============================================================
   CONTACT
   ============================================================ */
function submitContact(e) {
  e.preventDefault();
  showToast('Message envoyé ! Nous vous répondrons bientôt.', 'success');
  e.target.reset();
}

/* ============================================================
   LAYOUT
   ============================================================ */
function injectLayout() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = `
      <header>
        <nav class="navbar">
         <a href="index.html" class="logo">Yumi<span>Fit</span></a>
          <ul class="nav-links">
            <li><a href="index.html">Accueil</a></li>
            <li><a href="produits.html">Nos Sweets Healthy</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="apropos.html">À propos</a></li>
          </ul>
          <a href="panier.html" class="cart-icon">🛒<span class="cart-count">0</span></a>
        </nav>
      </header>
    `;
  }

  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
      <footer>
        <div class="footer-content">
          <div>
            <h4>YumiFit</h4>
            <p style="color:#aaa">Pâtisseries healthy faites avec amour 🍰</p>
          </div>
          <div>
            <h4>Liens</h4>
            <a href="index.html">Accueil</a>
            <a href="produits.html">Nos Sweets Healthy</a>
            <a href="apropos.html">À propos</a>
            <a href="contact.html">Contact</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="#">📞 06 XX XX XX XX</a>
            <a href="#">📧 kharbouchyyousra@gmail.com</a>
            <a href="#">📍 Mohammedia, Maroc</a>
          </div>
        </div>
        <div class="footer-bottom">© 2026 YumiFit — Tous droits réservés</div>
      </footer>
    `;
  }

  updateCartCount();
}

/* ============================================================
   CHARGEMENT DES PRODUITS
   ============================================================ */
async function loadProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    if (!res.ok) throw new Error('API erreur');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      PRODUCTS = data.map((p, i) => ({
        id: p.id || i + 1,
        _id: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        desc: p.description || p.desc || ''
      }));
      console.log('✅ Produits chargés depuis l\'API :', PRODUCTS.length);
    } else {
      throw new Error('Aucun produit');
    }
  } catch (err) {
    console.warn('⚠️ API indisponible, produits de démo utilisés');
    PRODUCTS = FALLBACK_PRODUCTS;
  }
}

/* ============================================================
   INITIALISATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  injectLayout();
  updateCartCount();
  await loadProducts();
  renderProducts();
  renderProductDetail();
  renderCart();
  renderOrderSummary();
  renderConfirmation();

  const orderForm = document.getElementById('order-form');
  if (orderForm) orderForm.addEventListener('submit', submitOrder);

  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', submitContact);
});
