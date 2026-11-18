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

### 4. Inicializar el usuario administrador
Ejecuta el script idempotente para crear o actualizar la cuenta con rol `admin` configurada en `.env` (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`):
```bash
npm run seed:admin
```

### 5. Iniciar el servidor
* **Modo desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```
* **Modo producción:**
  ```bash
  npm start
  ```

### 6. Verificar estado del servidor y conexión a PostgreSQL
Realiza una petición `GET` a:
```text
http://localhost:3000/api/health
```
Si la conexión es exitosa, responderá con código `200` y la cantidad de productos registrados en la base de datos.

---

## Autenticación y Control de Acceso (`/api/auth`)

Las rutas protegidas requieren el encabezado HTTP:
```text
Authorization: Bearer <TOKEN_JWT>
```

| Método | Ruta | Acceso | Descripción | Código de éxito |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registro` | Público | Registra un usuario (siempre con rol `usuario`) | `201 Created` |
| `POST` | `/api/auth/login` | Público | Autentica credenciales y devuelve un JWT firmado | `200 OK` |

### Regla de Contraseña Segura
En `POST /api/auth/registro`, la contraseña debe cumplir:
* Mínimo **8 caracteres**
* Al menos **1 letra mayúscula**
* Al menos **1 número**
* Al menos **1 carácter especial** (no alfanumérico)

> El registro público ignora cualquier campo `rol` enviado en el cuerpo de la petición y asigna siempre `'usuario'`.

### Cuerpos de Petición y Respuestas (`/api/auth`)

#### `POST /api/auth/registro`
**Body JSON:**
```json
{
  "nombre": "Ana García",
  "correo": "ana@ejemplo.com",
  "password": "Password123!"
}
```
**Respuesta (`201 Created`):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 2,
    "nombre": "Ana García",
    "correo": "ana@ejemplo.com",
    "rol": "usuario",
    "creado_en": "2026-11-18T00:35:00.000Z"
  }
}
```

#### `POST /api/auth/login`
**Body JSON:**
```json
{
  "correo": "ana@ejemplo.com",
  "password": "Password123!"
}
```
**Respuesta (`200 OK`):**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 2,
    "nombre": "Ana García",
    "correo": "ana@ejemplo.com",
    "rol": "usuario"
  }
}
```

### Códigos de Error de Autenticación y Autorización (`401`, `403`, `409`)

* **`401 Unauthorized`** — Falta el token, el formato `Bearer` es incorrecto, el token expiró, la firma es inválida o las credenciales de login son incorrectas:
  ```json
  {
    "error": "No autorizado",
    "mensaje": "Token de autenticación no proporcionado o formato inválido"
  }
  ```
  ```json
  {
    "error": "Credenciales inválidas",
    "mensaje": "Correo o contraseña incorrectos"
  }
  ```
* **`403 Forbidden`** — El usuario está autenticado con un JWT válido, pero su rol no es `'admin'`:
  ```json
  {
    "error": "Acceso denegado",
    "mensaje": "Se requiere rol de administrador para realizar esta operación"
  }
  ```
* **`409 Conflict`** — Intento de registrar un correo electrónico que ya existe en `usuarios`:
  ```json
  {
    "error": "Correo duplicado",
    "mensaje": "Ya existe una cuenta registrada con este correo electrónico"
  }
  ```

---

## Endpoints del Catálogo de Productos (`/api/productos`)

> **Control de acceso (Fase 3):** `GET /api/productos` y `GET /api/productos/:id` son públicos. Las operaciones de escritura (`POST`, `PUT` y `DELETE`) requieren un JWT válido (`verificarToken`) y rol `'admin'` (`verificarAdmin`).

| Método | Ruta | Descripción | Código de éxito |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Lista todos los productos ordenados por `id` | `200 OK` |
| `GET` | `/api/productos?categoria=Perifericos` | Filtra productos por categoría (insensible a mayúsculas/minúsculas) | `200 OK` |
| `GET` | `/api/productos/:id` | Obtiene el detalle de un producto específico por `id` | `200 OK` |
| `POST` | `/api/productos` | Crea un nuevo producto en el catálogo | `201 Created` |
| `PUT` | `/api/productos/:id` | Actualiza todos los campos de un producto existente | `200 OK` |
| `DELETE` | `/api/productos/:id` | Elimina un producto del catálogo por `id` | `200 OK` |

### Cuerpos de Petición (`body` JSON)

#### `POST /api/productos` y `PUT /api/productos/:id`
```json
{
  "nombre": "Webcam Logitech Brio 4K",
  "descripcion": "Cámara web Ultra HD 4K con HDR y micrófonos duales con cancelación de ruido.",
  "categoria": "Perifericos",
  "precio": 169.99
}
```

### Ejemplos de Respuestas Exitosas

#### `GET /api/productos` (`200 OK`)
```json
[
  {
    "id": 1,
    "nombre": "Teclado Mecánico Keychron K2",
    "descripcion": "Teclado mecánico inalámbrico compacto al 75% con switches táctiles Gateron Brown y retroiluminación RGB.",
    "categoria": "Perifericos",
    "precio": 89.99,
    "creado_en": "2026-11-17T04:15:00.000Z"
  }
]
```

#### `POST /api/productos` (`201 Created`) / `GET /api/productos/:id` (`200 OK`) / `PUT /api/productos/:id` (`200 OK`)
```json
{
  "id": 7,
  "nombre": "Webcam Logitech Brio 4K",
  "descripcion": "Cámara web Ultra HD 4K con HDR y micrófonos duales con cancelación de ruido.",
  "categoria": "Perifericos",
  "precio": 169.99,
  "creado_en": "2026-11-18T00:25:00.000Z"
}
```

#### `DELETE /api/productos/:id` (`200 OK`)
```json
{
  "mensaje": "Producto eliminado correctamente",
  "producto": {
    "id": 7,
    "nombre": "Webcam Logitech Brio 4K",
    "descripcion": "Cámara web Ultra HD 4K con HDR y micrófonos duales con cancelación de ruido.",
    "categoria": "Perifericos",
    "precio": 169.99
  }
}
```

### Criterio de Validación y Respuestas de Error (`400`, `422` y `404`)

La API diferencia de forma estricta entre errores sintácticos/estructurales (`400 Bad Request`) y errores semánticos o de reglas de negocio (`422 Unprocessable Entity`):

* **`400 Bad Request`** — Se devuelve cuando la estructura de la petición es inválida o faltan datos obligatorios:
  * El parámetro `:id` no cumple el formato de entero positivo estricto (`/^[1-9]\d*$/`, por ejemplo `0`, `-1` o `abc`):
    ```json
    {
      "error": "ID inválido",
      "mensaje": "El identificador del producto debe ser un número entero positivo"
    }
    ```
  * Faltan campos obligatorios (`nombre`, `descripcion`, `categoria`, `precio`), algún campo de texto no es un string válido o queda vacío tras `.trim()`, o `precio` es `undefined`, `null` o `""`:
    ```json
    {
      "error": "Campos obligatorios incompletos",
      "mensaje": "Los campos nombre, descripcion, categoria y precio son obligatorios y no pueden estar vacíos"
    }
    ```
  * El cuerpo JSON enviado está malformado (interceptado por el manejador global de errores).

* **`422 Unprocessable Entity`** — Se devuelve cuando todos los campos obligatorios están presentes y bien estructurados, pero incumplen reglas semánticas de negocio o restricciones del esquema:
  * `precio` es booleano, arreglo, objeto, `NaN`, no finito o menor o igual a cero (`<= 0`):
    ```json
    {
      "error": "Precio inválido",
      "mensaje": "El precio debe ser un valor numérico estrictamente mayor que cero"
    }
    ```
  * `nombre` supera los 150 caracteres o `categoria` supera los 80 caracteres:
    ```json
    {
      "error": "Longitud de campo excedida",
      "mensaje": "El nombre no puede exceder 150 caracteres y la categoría no puede exceder 80 caracteres"
    }
    ```

* **`404 Not Found`** — Se devuelve cuando el `:id` es válido, pero no existe en la base de datos:
  ```json
  {
    "error": "Producto no encontrado",
    "mensaje": "No existe un producto con el ID especificado"
  }
  ```
