const pool = require('../config/db');

/**
 * Lista todos los productos favoritos pertenecientes a un usuario específico.
 * @param {number} usuarioId
 * @returns {Promise<Array>}
 */
async function listarPorUsuario(usuarioId) {
  const query = `
    SELECT
      f.id AS favorito_id,
      f.producto_id,
      f.agregado_en,
      p.nombre,
      p.descripcion,
      p.categoria,
      p.precio
    FROM favoritos f
    INNER JOIN productos p ON p.id = f.producto_id
    WHERE f.usuario_id = $1
    ORDER BY f.agregado_en DESC, f.id DESC
  `;
  const result = await pool.query(query, [usuarioId]);
  return result.rows;
}

/**
 * Agrega un producto a la lista de favoritos de un usuario.
 * @param {number} usuarioId
 * @param {number} productoId
 * @returns {Promise<Object>}
 */
async function agregar(usuarioId, productoId) {
  const query = `
    INSERT INTO favoritos (usuario_id, producto_id)
    VALUES ($1, $2)
    RETURNING id, usuario_id, producto_id, agregado_en
  `;
  const result = await pool.query(query, [usuarioId, productoId]);
  return result.rows[0];
}

/**
 * Elimina un producto de la lista de favoritos del usuario autenticado.
 * @param {number} usuarioId
 * @param {number} productoId
 * @returns {Promise<Object|null>}
 */
async function eliminar(usuarioId, productoId) {
  const query = `
    DELETE FROM favoritos
    WHERE usuario_id = $1 AND producto_id = $2
    RETURNING id, usuario_id, producto_id
  `;
  const result = await pool.query(query, [usuarioId, productoId]);
  return result.rows[0] || null;
}

module.exports = {
  listarPorUsuario,
  agregar,
  eliminar,
};
