import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  customer: {
    nom:       { type: String, required: true },
    prenom:    { type: String, required: true },
    email:     { type: String, required: true },
    telephone: { type: String, required: true },
    adresse:   { type: String, required: true },
    ville:     { type: String, required: true }
  },
  items: [{
    id:    mongoose.Schema.Types.Mixed,
    name:  String,
    price: Number,
    qty:   Number
  }],
  total:  { type: Number, required: true },
  status: {
    type: String,
    enum: ['Nouvelle', 'Confirmée', 'Livrée', 'Annulée'],
    default: 'Nouvelle'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);