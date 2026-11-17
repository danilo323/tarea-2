require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { rutaNoEncontrada, manejadorErrores } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de verificación de salud y conexión a base de datos
app.get('/api/health', async (req, res, next) => {
  try {
    const resultado = await pool.query('SELECT COUNT(*)::int AS total_productos FROM productos');
    return res.status(200).json({
      estado: 'ok',
      base_de_datos: 'conectada',
      productos_registrados: resultado.rows[0].total_productos,
    });
  } catch (error) {
    return next(error);
  }
});

// Rutas de la API (se montarán en las siguientes fases):
// app.use('/api/auth', authRoutes);
// app.use('/api/productos', productosRoutes);
// app.use('/api/favoritos', favoritosRoutes);

// Manejo de rutas no encontradas y errores globales
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
