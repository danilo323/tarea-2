# API REST: Catálogo de Productos y Favoritos con Control de Roles y JWT

API RESTful desarrollada con **Node.js**, **Express** y **PostgreSQL (`pg`)** para la gestión de un catálogo de productos tecnológicos y listas personalizadas de favoritos, implementando autenticación mediante **JSON Web Tokens (JWT)** y control de acceso basado en roles (**RBAC**).

---

## Autor
* **Estudiante:** Oswaldo Danilo Angulo Tamayo
* **Institución:** Universidad Estatal de Milagro (UNEMI) — Ingeniería en Software

---

## Propósito del Proyecto
Proveer un servicio backend seguro, consistente y escalable que permita:
1. **Acceso Público:** Consultar el catálogo de productos, filtrarlos por categoría y visualizar el detalle individual sin requerir sesión activa.
2. **Gestión Administrativa (`admin`):** Crear, actualizar y eliminar productos del catálogo de forma exclusiva mediante una cuenta administrativa inicializada localmente.
3. **Favoritos Personales (`usuario` / `admin`):** Permitir que cada usuario autenticado agregue, consulte y elimine productos de su lista personal de favoritos con aislamiento estricto basado en la identidad verificada dentro del token JWT.

---

## Justificación de la Base de Datos: PostgreSQL (`pg`)
Se seleccionó **PostgreSQL** junto con el conector oficial `pg` por las siguientes razones técnicas:
* **Integridad Referencial y Consistencia (`ON DELETE CASCADE`):** La relación muchos-a-muchos en la tabla `favoritos` está vinculada mediante llaves foráneas a `usuarios(id)` y `productos(id)`. Si un administrador elimina un producto del catálogo, el motor elimina en cascada sus referencias en `favoritos`, evitando registros huérfanos.
* **Validaciones Nativas en Motor (`CHECK` y `UNIQUE`):** Se garantizan precios estrictamente mayores a cero (`CHECK (precio > 0)`), roles válidos (`CHECK (rol IN ('usuario', 'admin'))`), correos únicos y prevención de favoritos duplicados mediante la restricción compuesta `UNIQUE (usuario_id, producto_id)`.
* **Seguridad contra Inyección SQL:** Todas las operaciones utilizan consultas parametrizadas (`$1, $2...`).

---

## Requisitos Previos
* **Node.js** v18.0.0 o superior
* **NPM** v9.0.0 o superior
* **PostgreSQL** v14 o superior activo localmente
* **Postman** (para ejecutar la colección de pruebas automatizadas)

---

## Instalación y Configuración Paso a Paso

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/danilo323/tarea-2.git
cd tarea-2
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y completa tus credenciales locales (como `DB_PASSWORD` y `JWT_SECRET`):
```bash
cp .env.example .env
```

### 3. Crear la base de datos y cargar el esquema inicial
Crea la base de datos en PostgreSQL (por defecto `catalogo_db`) y ejecuta el script `database/init.sql` para crear las tablas (`usuarios`, `productos`, `favoritos`), índices y productos iniciales:
```bash
psql -U postgres -c "CREATE DATABASE catalogo_db;"
psql -U postgres -d catalogo_db -f database/init.sql
```

### 4. Iniciar el servidor
* **Modo desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```
* **Modo producción:**
  ```bash
  npm start
  ```

### 5. Verificar estado del servidor y conexión a PostgreSQL
Realiza una petición `GET` a:
```text
http://localhost:3000/api/health
```
Si la conexión es exitosa, responderá con código `200` y la cantidad de productos registrados en la base de datos.
