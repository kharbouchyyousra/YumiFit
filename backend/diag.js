import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔗 URI :', process.env.MONGO_URI);
console.log('📧 EMAIL :', process.env.ADMIN_EMAIL);
console.log('🔑 PASSWORD :', process.env.ADMIN_PASSWORD);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const Admin = mongoose.model('Admin', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

try {
  console.log('⏳ Connexion à MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connecté à MongoDB');

  console.log('🧮 Hash du mot de passe...');
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  console.log('✅ Hash créé :', hash.substring(0, 20) + '...');

  console.log('👤 Création de l\'admin...');
  const created = await Admin.create({
    email: process.env.ADMIN_EMAIL,
    password: hash
  });
  console.log('✅ Admin créé avec _id :', created._id);

  const count = await Admin.countDocuments();
  console.log('📊 Total admins en base :', count);

  await mongoose.disconnect();
  console.log('🎉 SUCCÈS !');
} catch (err) {
  console.error('');
  console.error('❌❌❌ ERREUR ❌❌❌');
  console.error('Message :', err.message);
  console.error('Code :', err.code);
  console.error('Full :', err);
}

process.exit(0);