import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

// ⚠️ Vos produits avec extension .jpeg
const newProducts = [
  {
    oldName: "T-shirt Classic",
    name: "Energy Cookies",
    price: 45,
    image: "images/products/produit1.jpeg",
    description: "Brownie moelleux au cacao cru, sans sucre raffiné."
  },
  {
    oldName: "Hoodie Premium",
    name: "Dark Chocolate Sea Salt Nut Bars",
    price: 60,
    image: "images/products/produit2.jpeg",
    description: "Cheesecake crémeux, édulcoré naturellement."
  },
  {
    oldName: "Casquette Urban",
    name: "Cookies avoine & miel",
    price: 30,
    image: "images/products/produit3.jpeg",
    description: "Cookies croustillants à l'avoine et au miel bio."
  },
  {
    oldName: "Sneakers Sport",
    name: "Chocolate Coconut Energy Balls",
    price: 35,
    image: "images/products/produit4.jpeg",
    description: "Muffins moelleux aux myrtilles fraîches."
  },
  {
    oldName: "Sac à dos",
    name: "Barres énergétiques",
    price: 25,
    image: "images/products/produit5.jpeg",
    description: "Barres maison aux dattes et amandes."
  },
  {
    oldName: "Montre Minimal",
    name: "Nutty Energy Balls",
    price: 50,
    image: "images/products/produit6.jpeg",
    description: "Fondant intense au chocolat noir 70%."
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connecté à MongoDB');

  for (const p of newProducts) {
    const result = await Product.updateOne(
      { name: p.oldName },
      {
        name: p.name,
        price: p.price,
        image: p.image,
        description: p.description
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ ${p.oldName} → ${p.name}`);
    } else {
      console.log(`⚠️ ${p.oldName} → non trouvé`);
    }
  }

  await mongoose.disconnect();
  console.log('🎉 Terminé !');
}

run().catch(console.error);