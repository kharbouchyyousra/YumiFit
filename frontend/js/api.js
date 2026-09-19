const API_URL = 'http://localhost:5000/api';

async function fetchProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Erreur produits');
  return res.json();
}

async function postOrder(orderData) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Erreur création commande');
  return res.json();
}