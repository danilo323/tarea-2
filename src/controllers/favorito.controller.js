const favoritoModel = require('../models/favorito.model');
const productoModel = require('../models/producto.model');

const REGEX_ID_POSITIVO = /^[1-9]\d*$/;

/**
 * Valida si un valor (número o string) representa un entero positivo estricto.
 */
function esEnteroPositivoValido(valor) {
  if (typeof valor === 'number') {
    return Number.isSafeInteger(valor) && valor > 0 && REGEX_ID_POSITIVO.test(String(valor));
  }
  if (typeof valor === 'string') {
    return REGEX_ID_POSITIVO.test(valor.trim());
  }
  return false;
}

/**
 * GET /api/favoritos
 * Lista únicamente los favoritos del usuario autenticado (req.usuario.id).
 */
async function listarFavoritos(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const favoritos = await favoritoModel.listarPorUsuario(usuarioId);
    const respuesta = favoritos.map((item) => ({
      ...item,
      precio: Number(item.precio),
    }));
    return res.status(200).json(respuesta);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/favoritos
 * Agrega un producto existente del catálogo a los favoritos del usuario autenticado.
 */
async function agregarFavorito(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const rawId = req.body?.productoId ?? req.body?.producto_id;

    if (
      rawId === undefined ||
      rawId === null ||
      (typeof rawId === 'string' && rawId.trim() === '')
    ) {
      return res.status(400).json({
        error: 'Campo obligatorio faltante',
        mensaje: 'Debe proporcionar el campo productoId',
      });
    }

    if (!esEnteroPositivoValido(rawId)) {
      return res.status(400).json({
        error: 'ID de producto inválido',
        mensaje: 'El identificador del producto debe ser un número entero positivo',
      });
    }

    const productoId = Number(typeof rawId === 'string' ? rawId.trim() : rawId);
    const producto = await productoModel.obtenerPorId(productoId);

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: 'El producto que intenta agregar a favoritos no existe en el catálogo',
      });
    }

    const nuevoFavorito = await favoritoModel.agregar(usuarioId, productoId);
    return res.status(201).json({
      mensaje: 'Producto agregado a favoritos exitosamente',
      favorito: nuevoFavorito,
      producto: {
        ...producto,
        precio: Number(producto.precio),
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Favorito duplicado',
        mensaje: 'Este producto ya se encuentra en su lista de favoritos',
      });
    }
    return next(error);
  }
}

/**
 * DELETE /api/favoritos/:productoId
 * Elimina un producto de la lista de favoritos del usuario autenticado.
 */
async function eliminarFavorito(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { productoId } = req.params;

    if (typeof productoId !== 'string' || !REGEX_ID_POSITIVO.test(productoId)) {
      return res.status(400).json({
        error: 'ID de producto inválido',
        mensaje: 'El parámetro productoId debe ser un número entero positivo',
      });
    }

    const eliminado = await favoritoModel.eliminar(usuarioId, Number(productoId));
    if (!eliminado) {
      return res.status(404).json({
        error: 'Favorito no encontrado',
        mensaje: 'El producto especificado no se encuentra en su lista de favoritos',
      });
    }

    return res.status(200).json({
      mensaje: 'Producto eliminado de favoritos correctamente',
      favorito: eliminado,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarFavoritos,
  agregarFavorito,
  eliminarFavorito,
};
