const express = require('express');
const {
  listarFavoritos,
  agregarFavorito,
  eliminarFavorito,
} = require('../controllers/favorito.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas las rutas de favoritos requieren un JWT válido y se aíslan por req.usuario.id
router.get('/', verificarToken, listarFavoritos);
router.post('/', verificarToken, agregarFavorito);
router.delete('/:productoId', verificarToken, eliminarFavorito);

module.exports = router;
