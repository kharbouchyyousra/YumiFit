import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_123456';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Tentative login :', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

    if (!admin) {
      console.log('❌ Admin introuvable');
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    console.log('👤 Admin trouvé :', admin.email);

    const ok = await bcrypt.compare(password, admin.password);
    console.log('🔑 Mot de passe valide :', ok);

    if (!ok) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login réussi');
    res.json({ token, email: admin.email });
  } catch (err) {
    console.error('❌ Erreur login :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;