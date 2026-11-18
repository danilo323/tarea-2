const jwt = require('jsonwebtoken');

/**
 * Verifica que la petición incluya un JWT válido en el encabezado Authorization.
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Token de autenticación no proporcionado o formato inválido',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Token de autenticación no proporcionado o formato inválido',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id: decoded.id,
      correo: decoded.correo,
      rol: decoded.rol,
    };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        mensaje: 'La sesión ha expirado, por favor inicie sesión nuevamente',
      });
    }

    return res.status(401).json({
      error: 'Token inválido',
      mensaje: 'El token proporcionado no es válido',
    });
  }
}

/**
 * Verifica que el usuario autenticado posea rol de administrador.
 */
function verificarAdmin(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Token de autenticación no proporcionado o formato inválido',
    });
  }

  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Se requiere rol de administrador para realizar esta operación',
    });
  }

  return next();
}

module.exports = {
  verificarToken,
  verificarAdmin,
};
