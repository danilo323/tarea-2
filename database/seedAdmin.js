require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const SALT_ROUNDS = 10;

async function seedAdmin() {
  const nombre = process.env.ADMIN_NAME || 'Administrador Principal';
  const correo = process.env.ADMIN_EMAIL || 'admin@catalogo.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const query = `
      INSERT INTO usuarios (nombre, correo, password_hash, rol)
      VALUES ($1, LOWER($2), $3, 'admin')
      ON CONFLICT (correo)
      DO UPDATE SET
        nombre = EXCLUDED.nombre,
        password_hash = EXCLUDED.password_hash,
        rol = 'admin'
      RETURNING id, nombre, correo, rol, creado_en;
    `;

    const result = await pool.query(query, [nombre.trim(), correo.trim(), passwordHash]);
    const admin = result.rows[0];
    console.log('Administrador inicializado/actualizado correctamente:', {
      id: admin.id,
      nombre: admin.nombre,
      correo: admin.correo,
      rol: admin.rol,
      creado_en: admin.creado_en,
    });
  } catch (error) {
    console.error('Error al inicializar el administrador:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();
