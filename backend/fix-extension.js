import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connecté');

for (let i = 1; i <= 6; i++) {
  const result = await Product.updateOne(
    { image: `images/products/produit${i}.jpg` },
    { image: `images/products/produit${i}.jpeg` }
  );
  if (result.modifiedCount > 0) {
    console.log(`✅ produit${i} : .jpg → .jpeg`);
  } else {
    console.log(`⚠️ produit${i} : non modifié`);
  }
}

await mongoose.disconnect();
console.log('🎉 Terminé !');
process.exit(0);