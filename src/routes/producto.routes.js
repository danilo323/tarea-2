const express = require('express');
const {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/producto.controller');

const router = express.Router();

// Rutas públicas de consulta del catálogo
router.get('/', listarProductos);
router.get('/:id', obtenerProductoPorId);

// En la Fase 3 se agregarán los middlewares verificarToken y verificarAdmin a POST, PUT y DELETE
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
