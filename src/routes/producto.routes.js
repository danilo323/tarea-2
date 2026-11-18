const express = require('express');
const {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/producto.controller');
const { verificarToken, verificarAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas públicas de consulta del catálogo
router.get('/', listarProductos);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas (requieren JWT válido y rol 'admin')
router.post('/', verificarToken, verificarAdmin, crearProducto);
router.put('/:id', verificarToken, verificarAdmin, actualizarProducto);
router.delete('/:id', verificarToken, verificarAdmin, eliminarProducto);

module.exports = router;
