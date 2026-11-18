const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');

const SALT_ROUNDS = 10;
const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const REGEX_PASSWORD_SEGURA = /(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/;

/**
 * Valida que un valor sea un string no vacío tras aplicar trim().
 */
function esStringNoVacio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * POST /api/auth/registro
 * Registra públicamente un usuario forzando siempre el rol 'usuario'.
 */
async function registro(req, res, next) {
  try {
    const { nombre, correo, password } = req.body || {};

    if (!esStringNoVacio(nombre) || !esStringNoVacio(correo) || !esStringNoVacio(password)) {
      return res.status(400).json({
        error: 'Campos obligatorios incompletos',
        mensaje: 'Los campos nombre, correo y password son obligatorios',
      });
    }

    if (!REGEX_EMAIL.test(correo.trim())) {
      return res.status(422).json({
        error: 'Correo inválido',
        mensaje: 'El formato del correo electrónico no es válido',
      });
    }

    if (!REGEX_PASSWORD_SEGURA.test(password)) {
      return res.status(422).json({
        error: 'Contraseña insegura',
        mensaje: 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un carácter especial',
      });
    }

    const existente = await usuarioModel.buscarPorCorreo(correo);
    if (existente) {
      return res.status(409).json({
        error: 'Correo duplicado',
        mensaje: 'Ya existe una cuenta registrada con este correo electrónico',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const nuevoUsuario = await usuarioModel.crear({
      nombre,
      correo,
      passwordHash,
      rol: 'usuario',
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Correo duplicado',
        mensaje: 'Ya existe una cuenta registrada con este correo electrónico',
      });
    }
    return next(error);
  }
}

/**
 * POST /api/auth/login
 * Autentica un usuario existente y emite un JWT firmado.
 */
async function login(req, res, next) {
  try {
    const { correo, password } = req.body || {};

    if (!esStringNoVacio(correo) || !esStringNoVacio(password)) {
      return res.status(400).json({
        error: 'Credenciales incompletas',
        mensaje: 'Debe proporcionar correo y password',
      });
    }

    const usuario = await usuarioModel.buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Correo o contraseña incorrectos',
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Correo o contraseña incorrectos',
      });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registro,
  login,
};
