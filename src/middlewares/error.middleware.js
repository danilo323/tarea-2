/**
 * Middleware para rutas no encontradas (404).
 */
function rutaNoEncontrada(req, res, next) {
  return res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: 'No existe el endpoint solicitado',
  });
}

/**
 * Middleware global para el manejo centralizado de errores.
 */
function manejadorErrores(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      mensaje: 'El cuerpo de la petición no tiene un formato JSON válido',
    });
  }

  console.error('Error en el servidor:', err.message || err.code || err);

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    error: 'Error interno del servidor',
    mensaje: 'Ocurrió un error inesperado al procesar la solicitud',
  });
}

module.exports = {
  rutaNoEncontrada,
  manejadorErrores,
};
