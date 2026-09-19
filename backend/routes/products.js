import express from 'express';
import Product from '../models/product.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

/* GET /api/products — public */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('❌ Erreur liste produits :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/* POST /api/products — (AUTH) */
router.post('/', authRequired, async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    const product = await Product.create({ name, price, image, description });
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Erreur création :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/* PUT /api/products/:id — (AUTH) */
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image, description },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(product);
  } catch (err) {
    console.error('❌ Erreur update :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/* DELETE /api/products/:id — (AUTH) */
router.delete('/:id', authRequired, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Erreur suppression :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;