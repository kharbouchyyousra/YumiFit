import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/admin.js';
import Product from './models/product.js';

dotenv.config();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔗 URI :', process.env.MONGO_URI);
console.log('📧 EMAIL :', process.env.ADMIN_EMAIL);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const products = [
  { name: "T-shirt Classic",  price: 150, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", description: "T-shirt 100% coton." },
  { name: "Hoodie Premium",   price: 250, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500", description: "Hoodie molletonné." },
  { name: "Casquette Urban",  price: 90,  image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500", description: "Casquette ajustable." },
  { name: "Sneakers Sport",   price: 450, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", description: "Sneakers légères." },
  { name: "Sac à dos",        price: 320, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", description: "Sac spacieux." },
  { name: "Montre Minimal",   price: 550, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500", description: "Montre élégante." }
];

async function run() {
  try {
    // 1. Connexion
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // 2. Supprimer anciens admins et produits
    await Admin.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Anciennes données supprimées');

    // 3. Créer l'admin
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const hash = await bcrypt.hash(password, 10);

    await Admin.create({ email, password: hash });
    console.log('👤 Admin créé :', email);

    // 4. Créer les produits
    await Product.insertMany(products);
    console.log('📦 Produits insérés :', products.length);

    // 5. Vérification
    const adminCount = await Admin.countDocuments();
    const productCount = await Product.countDocuments();
    console.log('📊 Total admins :', adminCount);
    console.log('📊 Total produits :', productCount);

    // 6. Déconnexion
    await mongoose.disconnect();
    console.log('🎉 Seed terminé avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('❌❌❌ ERREUR ❌❌❌');
    console.error('Message :', err.message);
    console.error('');
    console.error(err);
    process.exit(1);
  }
}

run();