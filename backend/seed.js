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
  { name: "Energy Cookies",  price: 45, image: "images/products/produit1.jpeg", description: "Cookies énergétiques sans sucre raffiné.." },
  { name: "Dark Chocolate Sea Salt Nut Bars",   price: 60, image: "images/products/produit2.jpeg", description: "Barres chocolat noir & sel de mer, riches en noix." },
  { name: "Cookies avoine & miel",  price: 30,  image: "images/products/produit3.jpeg", description: "Cookies croustillants à l'avoine et au miel bio." },
  { name: "Chocolate Coconut Energy Balls",   price: 35, image: "images/products/produit4.jpeg", description: "Boules énergétiques chocolat & coco, sans gluten." },
  { name: "Barres énergétiques", price: 25, image: "images/products/produit5.jpeg", description: "Barres maison aux dattes, amandes et graines." },
  { name: "Nutty Energy Balls",   price: 50, image: "images/products/produit6.jpeg", description: "Boules croquantes aux noix et fruits secs." }
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