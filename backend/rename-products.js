import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';

dotenv.config();

const renaming = [
  { old: "Brownie Healthy",        new: "Energy Cookies" },
  { old: "Cheesecake sans sucre",  new: "Dark Chocolate Sea Salt Nut Bars" },
  { old: "Cookies avoine & miel",  new: "Cookies avoine & miel" },  // inchangé
  { old: "Muffins myrtille",       new: "Chocolate Coconut Energy Balls" },
  { old: "Barres énergétiques",    new: "Barres énergétiques" },    // inchangé
  { old: "Fondant chocolat noir",  new: "Nutty Energy Balls" }
];

await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connecté à MongoDB\n');

for (const r of renaming) {
  if (r.old === r.new) {
    console.log(`⏭️  "${r.old}" → inchangé`);
    continue;
  }
  const result = await Product.updateOne(
    { name: r.old },
    { name: r.new }
  );
  if (result.modifiedCount > 0) {
    console.log(`✅ "${r.old}" → "${r.new}"`);
  } else {
    console.log(`⚠️  "${r.old}" → non trouvé`);
  }
}

await mongoose.disconnect();
console.log('\n🎉 Terminé !');
process.exit(0);