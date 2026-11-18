const pool = require('../config/db');

/**
 * Obtiene todos los productos o los filtra por categoría (insensible a mayúsculas).
 * @param {string} [categoria]
 * @returns {Promise<Array>}
 */
async function obtenerTodos(categoria) {
  if (typeof categoria === 'string' && categoria.trim() !== '') {
    const query = `
      SELECT id, nombre, descripcion, categoria, precio, creado_en
      FROM productos
      WHERE LOWER(categoria) = LOWER($1)
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [categoria.trim()]);
    return result.rows;
  }

  const query = `
    SELECT id, nombre, descripcion, categoria, precio, creado_en
    FROM productos
    ORDER BY id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
}

/**
 * Obtiene un producto por su identificador único.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function obtenerPorId(id) {
  const query = `
    SELECT id, nombre, descripcion, categoria, precio, creado_en
    FROM productos
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Crea un nuevo producto en el catálogo.
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
async function crear({ nombre, descripcion, categoria, precio }) {
  const query = `
    INSERT INTO productos (nombre, descripcion, categoria, precio)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, descripcion, categoria, precio, creado_en
  `;
  const result = await pool.query(query, [nombre, descripcion, categoria, precio]);
  return result.rows[0];
}

/**
 * Actualiza completamente un producto existente por su ID.
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise<Object|null>}
 */
async function actualizar(id, { nombre, descripcion, categoria, precio }) {
  const query = `
    UPDATE productos
    SET nombre = $1, descripcion = $2, categoria = $3, precio = $4
    WHERE id = $5
    RETURNING id, nombre, descripcion, categoria, precio, creado_en
  `;
  const result = await pool.query(query, [nombre, descripcion, categoria, precio, id]);
  return result.rows[0] || null;
}

/**
 * Elimina un producto del catálogo por su ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function eliminar(id) {
  const query = `
    DELETE FROM productos
    WHERE id = $1
    RETURNING id, nombre, descripcion, categoria, precio
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
