import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

/* Middlewares */
app.use(cors());
app.use(express.json());

/* Injecter io dans req */
app.use((req, _res, next) => {
  req.io = io;
  next();
});

/* Servir le frontend et l'admin */
app.use('/', express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

/* API */
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

/* Socket.io */
io.on('connection', (socket) => {
  console.log('🔌 Client connecté :', socket.id);
  socket.on('disconnect', () => console.log('❌ Déconnecté :', socket.id));
});

/* MongoDB + démarrage */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté');
    server.listen(PORT, () => {
      console.log(`🚀 Serveur : http://localhost:${PORT}`);
      console.log(`🛍️  Client : http://localhost:${PORT}/`);
      console.log(`🔐 Admin  : http://localhost:${PORT}/admin/login.html`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB erreur :', err.message);
    process.exit(1);
  });