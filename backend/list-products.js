import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connecté');

const products = await Product.find();
console.log(`📦 ${products.length} produits dans la base :\n`);

products.forEach((p, i) => {
  console.log(`${i + 1}. name: "${p.name}"`);
  console.log(`   price: ${p.price}`);
  console.log(`   image: "${p.image}"`);
  console.log('');
});

await mongoose.disconnect();
process.exit(0);