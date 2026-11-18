const pool = require('../config/db');

/**
 * Busca un usuario por correo electrónico (insensible a mayúsculas).
 * Incluye password_hash únicamente para validación interna en login.
 * @param {string} correo
 * @returns {Promise<Object|null>}
 */
async function buscarPorCorreo(correo) {
  const query = `
    SELECT id, nombre, correo, password_hash, rol, creado_en
    FROM usuarios
    WHERE LOWER(correo) = LOWER($1)
  `;
  const result = await pool.query(query, [correo.trim()]);
  return result.rows[0] || null;
}

/**
 * Busca un usuario por su ID sin exponer password_hash.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function buscarPorId(id) {
  const query = `
    SELECT id, nombre, correo, rol, creado_en
    FROM usuarios
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Registra un nuevo usuario en la base de datos sin devolver password_hash.
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
async function crear({ nombre, correo, passwordHash, rol = 'usuario' }) {
  const query = `
    INSERT INTO usuarios (nombre, correo, password_hash, rol)
    VALUES ($1, LOWER($2), $3, $4)
    RETURNING id, nombre, correo, rol, creado_en
  `;
  const result = await pool.query(query, [nombre.trim(), correo.trim(), passwordHash, rol]);
  return result.rows[0];
}

module.exports = {
  buscarPorCorreo,
  buscarPorId,
  crear,
};
