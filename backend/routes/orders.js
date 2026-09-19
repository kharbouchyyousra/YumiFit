import express from 'express';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

/* POST /api/orders — créer (PUBLIC) */
router.post('/', async (req, res) => {
  try {
    const { customer, items, total } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    let number;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 20) {
      number = Math.floor(1000 + Math.random() * 9000);
      exists = await Order.findOne({ number });
      attempts++;
    }

    const order = await Order.create({
      number, customer, items, total, status: 'Nouvelle'
    });

    console.log('📦 Nouvelle commande #' + number);
    if (req.io) req.io.emit('new-order', order);

    res.status(201).json(order);
  } catch (err) {
    console.error('❌ Erreur création commande :', err);
    res.status(500).json({ error: 'Erreur création commande' });
  }
});

/* GET /api/orders — liste (AUTH) */
router.get('/', authRequired, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Erreur liste commandes :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/* GET /api/orders/stats — stats (AUTH) */
router.get('/stats', authRequired, async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'Nouvelle' });
    const clients = await Order.distinct('customer.email');
    const products = await Product.countDocuments();

    res.json({ total, pending, clients: clients.length, products });
  } catch (err) {
    console.error('❌ Erreur stats :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/* PATCH /api/orders/:id/status (AUTH) */
router.patch('/:id/status', authRequired, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatus = ['Nouvelle', 'Confirmée', 'Livrée', 'Annulée'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );

    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    if (req.io) req.io.emit('order-updated', order);
    res.json(order);
  } catch (err) {
    console.error('❌ Erreur update statut :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/* GET /api/orders/export — CSV (AUTH) */
router.get('/export', authRequired, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = [
      'Numero', 'Date', 'Nom', 'Prenom', 'Email', 'Telephone',
      'Adresse', 'Ville', 'Produits', 'Total', 'Statut'
    ];

    const rows = orders.map(o => {
      const produits = o.items.map(i => `${i.name} x${i.qty}`).join(' | ');
      return [
        o.number,
        new Date(o.createdAt).toLocaleString('fr-FR'),
        o.customer.nom, o.customer.prenom, o.customer.email,
        o.customer.telephone, o.customer.adresse, o.customer.ville,
        produits, o.total + ' DH', o.status
      ].map(escape).join(',');
    });

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="commandes.csv"');
    res.send(csv);
  } catch (err) {
    console.error('❌ Erreur export :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;