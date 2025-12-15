import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let pool = null;
let dbConnected = false;

// Inicializar DB
async function initializeDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    });

    const connection = await pool.getConnection();
    console.log('✅ Conectado a MySQL (Railway)');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    connection.release();
    dbConnected = true;
  } catch (err) {
    console.error('❌ MySQL no disponible:', err.message);
    console.warn('⚠️ El servidor seguirá activo sin DB');
    dbConnected = false;
  }
}

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'Backend Todo App funcionando 🚀',
    database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: dbConnected ? 'CONNECTED' : 'DISCONNECTED' });
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log('🚀 BACKEND OPERATIVO');
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🗄️ DB STATUS: ${dbConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
  });
}

startServer();
ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
