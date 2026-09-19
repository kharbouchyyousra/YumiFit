/* ============================================================
   ADMIN — API + JWT
   ============================================================ */
const API_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'admin_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  clearToken();
  window.location.href = 'login.html';
}

async function apiFetch(url, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {})
  };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = 'login.html';
    throw new Error('Session expirée');
  }
  if (!res.ok) throw new Error('Erreur API');
  return res.json();
}

/* ============================================================
   DASHBOARD
   ============================================================ */
async function renderDashboard() {
  const el = id => document.getElementById(id);

  try {
    const [orders, stats, products] = await Promise.all([
      apiFetch(`${API_URL}/orders`),
      apiFetch(`${API_URL}/orders/stats`),
      apiFetch(`${API_URL}/products`)
    ]);

    if (el('stat-commandes')) el('stat-commandes').textContent = stats.total;
    if (el('stat-produits')) el('stat-produits').textContent = products.length;
    if (el('stat-clients')) el('stat-clients').textContent = stats.clients;
    if (el('stat-pending')) el('stat-pending').textContent = stats.pending;

    const recent = orders.slice(0, 5);
    const tbody = el('recent-orders');
    if (!tbody) return;

    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;padding:30px">Aucune commande.</td></tr>`;
      return;
    }

    tbody.innerHTML = recent.map(o => `
      <tr>
        <td>#${o.number}</td>
        <td>${o.customer.prenom} ${o.customer.nom}</td>
        <td>${o.customer.telephone}</td>
        <td><strong>${o.total} DH</strong></td>
        <td><span class="badge ${statusClass(o.status)}">${o.status}</span></td>
        <td>
          <button class="btn-sm btn-view" onclick="viewOrder('${o._id}')">Voir</button>
          ${o.status === 'Nouvelle'
            ? `<button class="btn-sm btn-confirm" onclick="confirmOrder('${o._id}')">Confirmer</button>`
            : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

/* ============================================================
   COMMANDES
   ============================================================ */
async function renderOrders() {
  const tbody = document.getElementById('orders-list');
  if (!tbody) return;

  try {
    const orders = await apiFetch(`${API_URL}/orders`);

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;padding:30px">Aucune commande.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>#${o.number}</td>
        <td>${o.customer.prenom} ${o.customer.nom}</td>
        <td>${o.customer.telephone}</td>
        <td><strong>${o.total} DH</strong></td>
        <td><span class="badge ${statusClass(o.status)}">${o.status}</span></td>
        <td>
          <button class="btn-sm btn-view" onclick="viewOrder('${o._id}')">Voir</button>
          ${o.status === 'Nouvelle'
            ? `<button class="btn-sm btn-confirm" onclick="confirmOrder('${o._id}')">Confirmer</button>`
            : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

async function viewOrder(id) {
  const orders = await apiFetch(`${API_URL}/orders`);
  const order = orders.find(o => o._id === id);
  if (!order) return;

  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <h2>Commande #${order.number}</h2>
    <div class="modal-section">
      <h4>Client</h4>
      <p><strong>Nom :</strong> ${order.customer.nom}</p>
      <p><strong>Prénom :</strong> ${order.customer.prenom}</p>
      <p><strong>Email :</strong> ${order.customer.email}</p>
      <p><strong>Téléphone :</strong> ${order.customer.telephone}</p>
      <p><strong>Adresse :</strong> ${order.customer.adresse}, ${order.customer.ville}</p>
    </div>
    <div class="modal-section">
      <h4>Produits</h4>
      ${order.items.map(i => `<p>${i.name} × ${i.qty} — ${i.price * i.qty} DH</p>`).join('')}
      <p style="margin-top:10px"><strong>Total : ${order.total} DH</strong></p>
    </div>
    <div class="modal-section">
      <h4>Statut</h4>
      <select id="status-select" style="padding:8px 12px;border:1px solid #ddd;border-radius:6px">
        ${['Nouvelle','Confirmée','Livrée','Annulée'].map(s =>
          `<option ${order.status===s?'selected':''}>${s}</option>`
        ).join('')}
      </select>
    </div>
    <button class="btn-sm btn-confirm" onclick="updateStatus('${order._id}')">Enregistrer</button>
    <button class="modal-close" onclick="closeModal()">Fermer</button>
  `;

  modal.classList.add('show');
}

function closeModal() {
  const m = document.getElementById('modal');
  if (m) m.classList.remove('show');
}

async function updateStatus(id) {
  const status = document.getElementById('status-select').value;
  await apiFetch(`${API_URL}/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  closeModal();
  refresh();
}

async function confirmOrder(id) {
  await apiFetch(`${API_URL}/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Confirmée' })
  });
  refresh();
}

/* ============================================================
   CLIENTS
   ============================================================ */
async function renderClients() {
  const tbody = document.getElementById('clients-list');
  if (!tbody) return;
  const orders = await apiFetch(`${API_URL}/orders`);

  const map = new Map();
  orders.forEach(o => {
    const key = o.customer.email;
    if (!map.has(key)) map.set(key, { ...o.customer, count: 1 });
    else map.get(key).count++;
  });

  const clients = [...map.values()];
  if (clients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#999;padding:30px">Aucun client.</td></tr>`;
    return;
  }

  tbody.innerHTML = clients.map(c => `
    <tr>
      <td>${c.prenom} ${c.nom}</td>
      <td>${c.email}</td>
      <td>${c.telephone}</td>
      <td>${c.ville}</td>
      <td>${c.count}</td>
    </tr>
  `).join('');
}

/* ============================================================
   PRODUITS
   ============================================================ */
async function renderAdminProducts() {
  const tbody = document.getElementById('products-list');
  if (!tbody) return;
  const products = await apiFetch(`${API_URL}/products`);

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="/${p.image}" style="width:50px;height:50px;border-radius:8px;object-fit:cover"></td>
      <td>${p.name}</td>
      <td><strong>${p.price} DH</strong></td>
      <td style="color:#777;font-size:.9rem">${p.description || ''}</td>
    </tr>
  `).join('');
}

/* ============================================================
   HELPERS
   ============================================================ */
function statusClass(s) {
  return { 'Nouvelle': 'nouvelle', 'Confirmée': 'confirmee',
           'Livrée': 'livree', 'Annulée': 'annulee' }[s] || 'nouvelle';
}

function refresh() {
  if (document.getElementById('recent-orders')) renderDashboard();
  if (document.getElementById('orders-list')) renderOrders();
  if (document.getElementById('clients-list')) renderClients();
}

/* ============================================================
   EXPORT CSV
   ============================================================ */
function exportCsv() {
  const token = getToken();
  fetch(`${API_URL}/orders/export`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ============================================================
   SOCKET.IO
   ============================================================ */
function initSocket() {
  if (typeof io === 'undefined') return;
  const socket = io('http://localhost:5000');
  socket.on('connect', () => console.log('🔌 Temps réel connecté'));
  socket.on('new-order', (order) => {
    console.log('🔔 Nouvelle commande :', order);
    refresh();
  });
  socket.on('order-updated', () => refresh());
}