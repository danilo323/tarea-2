-- Reinicialización limpia en orden de dependencia
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  precio NUMERIC(10, 2) NOT NULL CHECK (precio > 0),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de favoritos
-- Nota: ON DELETE CASCADE en producto_id garantiza que al eliminar un producto
-- del catálogo se eliminen automáticamente sus referencias en favoritos manteniendo la consistencia.
CREATE TABLE favoritos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  agregado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuario_producto UNIQUE (usuario_id, producto_id)
);

-- Índices para optimizar búsquedas por categoría y favoritos por usuario
CREATE INDEX idx_productos_categoria ON productos(LOWER(categoria));
CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);

-- Datos semilla obligatorios (6 productos de hardware/periféricos)
INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES
  ('Teclado Mecánico Keychron K2', 'Teclado mecánico inalámbrico compacto al 75% con switches táctiles Gateron Brown y retroiluminación RGB.', 'Perifericos', 89.99),
  ('Mouse Logitech MX Master 3S', 'Mouse ergonómico inalámbrico con sensor óptico de 8000 DPI, clics silenciosos y rueda electromagnética MagSpeed.', 'Perifericos', 99.50),
  ('Monitor LG UltraGear 27GP850', 'Monitor gaming Nano IPS de 27 pulgadas, resolución QHD 2560x1440, 165Hz y 1ms de tiempo de respuesta.', 'Monitores', 349.00),
  ('Monitor Dell UltraSharp U2723QE', 'Monitor profesional 4K UHD de 27 pulgadas con panel IPS Black, hub USB-C de 90W y cobertura 98% DCI-P3.', 'Monitores', 579.99),
  ('SSD NVMe Samsung 990 PRO 1TB', 'Unidad de estado sólido M.2 PCIe 4.0 NVMe con velocidades de lectura secuencial de hasta 7450 MB/s.', 'Almacenamiento', 109.90),
  ('Audífonos Sony WH-1000XM5', 'Auriculares inalámbricos over-ear con cancelación activa de ruido líder en la industria y hasta 30 horas de batería.', 'Audio', 329.00);
