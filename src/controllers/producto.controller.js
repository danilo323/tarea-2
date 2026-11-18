const productoModel = require('../models/producto.model');

const REGEX_ID_POSITIVO = /^[1-9]\d*$/;
const MAX_LONGITUD_NOMBRE = 150;
const MAX_LONGITUD_CATEGORIA = 80;

/**
 * Valida que el parámetro de ruta :id sea un entero positivo estricto.
 */
function esIdValido(id) {
  return typeof id === 'string' && REGEX_ID_POSITIVO.test(id);
}

/**
 * Valida si un campo de texto es un string no vacío tras aplicar trim().
 */
function esStringNoVacio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * Valida el cuerpo de petición para crear o actualizar un producto.
 * Retorna un objeto { status, body } si hay error, o { datos } si es válido.
 */
function validarPayloadProducto(payload) {
  const { nombre, descripcion, categoria, precio } = payload || {};

  const precioVacio =
    precio === undefined ||
    precio === null ||
    (typeof precio === 'string' && precio.trim() === '');

  if (
    !esStringNoVacio(nombre) ||
    !esStringNoVacio(descripcion) ||
    !esStringNoVacio(categoria) ||
    precioVacio
  ) {
    return {
      error: {
        status: 400,
        body: {
          error: 'Campos obligatorios incompletos',
          mensaje: 'Los campos nombre, descripcion, categoria y precio son obligatorios y no pueden estar vacíos',
        },
      },
    };
  }

  const esTipoPrecioInvalido =
    typeof precio === 'boolean' ||
    Array.isArray(precio) ||
    typeof precio === 'object';

  const precioNumerico = Number(precio);
  const precioNormalizado = Number(precioNumerico.toFixed(2));

  if (
    esTipoPrecioInvalido ||
    !Number.isFinite(precioNumerico) ||
    precioNumerico <= 0 ||
    precioNormalizado <= 0
  ) {
    return {
      error: {
        status: 422,
        body: {
          error: 'Precio inválido',
          mensaje: 'El precio debe ser un valor numérico estrictamente mayor que cero',
        },
      },
    };
  }

  const nombreLimpio = nombre.trim();
  const descripcionLimpia = descripcion.trim();
  const categoriaLimpia = categoria.trim();

  if (nombreLimpio.length > MAX_LONGITUD_NOMBRE || categoriaLimpia.length > MAX_LONGITUD_CATEGORIA) {
    return {
      error: {
        status: 422,
        body: {
          error: 'Longitud de campo excedida',
          mensaje: 'El nombre no puede exceder 150 caracteres y la categoría no puede exceder 80 caracteres',
        },
      },
    };
  }

  return {
    datos: {
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
      categoria: categoriaLimpia,
      precio: precioNormalizado,
    },
  };
}

/**
 * GET /api/productos
 */
async function listarProductos(req, res, next) {
  try {
    const categoria = typeof req.query.categoria === 'string' ? req.query.categoria : undefined;
    const productos = await productoModel.obtenerTodos(categoria);
    const respuesta = productos.map((producto) => ({
      ...producto,
      precio: Number(producto.precio),
    }));
    return res.status(200).json(respuesta);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/productos/:id
 */
async function obtenerProductoPorId(req, res, next) {
  try {
    if (!esIdValido(req.params.id)) {
      return res.status(400).json({
        error: 'ID inválido',
        mensaje: 'El identificador del producto debe ser un número entero positivo',
      });
    }

    const producto = await productoModel.obtenerPorId(Number(req.params.id));
    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: 'No existe un producto con el ID especificado',
      });
    }

    return res.status(200).json({
      ...producto,
      precio: Number(producto.precio),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/productos
 */
async function crearProducto(req, res, next) {
  try {
    const validacion = validarPayloadProducto(req.body);
    if (validacion.error) {
      return res.status(validacion.error.status).json(validacion.error.body);
    }

    const nuevoProducto = await productoModel.crear(validacion.datos);
    return res.status(201).json({
      ...nuevoProducto,
      precio: Number(nuevoProducto.precio),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/productos/:id
 */
async function actualizarProducto(req, res, next) {
  try {
    if (!esIdValido(req.params.id)) {
      return res.status(400).json({
        error: 'ID inválido',
        mensaje: 'El identificador del producto debe ser un número entero positivo',
      });
    }

    const validacion = validarPayloadProducto(req.body);
    if (validacion.error) {
      return res.status(validacion.error.status).json(validacion.error.body);
    }

    const productoActualizado = await productoModel.actualizar(
      Number(req.params.id),
      validacion.datos
    );
    if (!productoActualizado) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: 'No existe un producto con el ID especificado',
      });
    }

    return res.status(200).json({
      ...productoActualizado,
      precio: Number(productoActualizado.precio),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/productos/:id
 */
async function eliminarProducto(req, res, next) {
  try {
    if (!esIdValido(req.params.id)) {
      return res.status(400).json({
        error: 'ID inválido',
        mensaje: 'El identificador del producto debe ser un número entero positivo',
      });
    }

    const productoEliminado = await productoModel.eliminar(Number(req.params.id));
    if (!productoEliminado) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: 'No existe un producto con el ID especificado',
      });
    }

    return res.status(200).json({
      mensaje: 'Producto eliminado correctamente',
      producto: {
        ...productoEliminado,
        precio: Number(productoEliminado.precio),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
