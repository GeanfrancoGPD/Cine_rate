# 🎬 API Películas y Series

## Descripción

API REST para gestión de usuarios, películas, series, comentarios y valoraciones.

La aplicación utiliza:

- Express.js
- PostgreSQL
- express-session
- TMDB (The Movie Database API)
- Sistema de ratings diferenciados entre usuarios y críticos

Nota: La ruta base de la API es:

```text
http://localhost:5000/api/pelis
```

---

# 🔐 Autenticación

La autenticación se maneja mediante sesiones (`express-session`).

Las rutas protegidas utilizan:

```js
authMiddleware;
```

---

## Login

### Endpoint

```http
POST /login
```

### Body

```json
{
  "email": "usuario@email.com",
  "password": "123456"
}
```

### Respuesta

```json
{
  "success": true,
  "user": {
    "id": 1,
    "nombre": "Juan"
  }
}
```

---

## Registro

### Endpoint

```http
POST /register
```

### Body

```json
{
  "nombre": "Juan",
  "email": "juan@email.com",
  "password": "123456"
}
```

---

## Logout

### Endpoint

```http
POST /logout
```

Destruye la sesión actual.

---

## Verificar sesión

### Endpoint

```http
GET /auth-check
```

### Middleware

```js
authMiddleware;
```

Retorna información del usuario autenticado.

---

# 👤 Usuarios

---

## Obtener todos los usuarios

### Endpoint

```http
GET /users
```

### Middleware

```js
authMiddleware;
```

### Query utilizada

```sql
SELECT id, nombre, email, tipo, fecha_creacion
FROM usuarios
ORDER BY id
```

---

## Obtener usuario por ID

### Endpoint

```http
GET /users/:id
```

### Parámetros

| Parámetro | Tipo   |
| --------- | ------ |
| id        | number |

### Query

```sql
SELECT id, nombre, email, tipo, fecha_creacion
FROM usuarios
WHERE id = $1
```

---

## Actualizar usuario

### Endpoint

```http
PUT /users/:id
```

### Body

```json
{
  "nombre": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "tipo": "USUARIO"
}
```

---

## Actualizar contraseña

### Endpoint

```http
PUT /users/:id/password
```

### Body

```json
{
  "password": "nuevaPassword"
}
```

---

## Eliminar usuario

### Endpoint

```http
DELETE /users/:id
```

---

# 🎥 Contenidos

La tabla contenidos almacena:

- Películas
- Series

mediante el campo:

```sql
tipo
```

Valores posibles:

```text
PELICULA
SERIE
```

---

## Obtener películas populares

### Endpoint

```http
GET /popular-movies
```

### Query

```sql
SELECT *
FROM contenidos
WHERE tipo = 'PELICULA'
ORDER BY fecha_importacion DESC
LIMIT 50
```

### Descripción

Retorna las últimas 50 películas almacenadas localmente.

Si no existen registros:

1. Consulta TMDB.
2. Guarda los resultados.
3. Devuelve los datos.

---

## Obtener todos los contenidos

### Endpoint

```http
GET /contents
```

### Query

```sql
SELECT *
FROM contenidos
ORDER BY titulo
```

---

## Buscar contenido por nombre

### Endpoint

```http
GET /contents/search?titulo=pokemon
```

### Query

```sql
SELECT *
FROM contenidos
WHERE LOWER(titulo)
LIKE LOWER($1)
```

### Ejemplo

```text
%pokemon%
```

---

## Obtener contenido por ID

### Endpoint

```http
GET /contents/:id
```

### Query

```sql
SELECT c.*,
COALESCE(
(
SELECT ROUND(AVG(puntaje)::numeric,2)
FROM ratings_usuario ru
WHERE ru.contenido_id = c.id
),0) AS rating_usuarios,

COALESCE(
(
SELECT ROUND(AVG(puntaje)::numeric,2)
FROM ratings_critico rc
WHERE rc.contenido_id = c.id
),0) AS rating_criticos,

COALESCE(
(
SELECT COUNT(*)
FROM comentarios cm
WHERE cm.contenido_id = c.id
),0) AS total_comentarios

FROM contenidos c
WHERE c.id = $1
```

### Información retornada

- Título
- Sinopsis
- Fecha lanzamiento
- Poster
- Backdrop
- Rating TMDB
- Rating Usuarios
- Rating Críticos
- Total Comentarios

---

## Crear contenido

### Endpoint

```http
POST /contents
```

### Middleware

```js
authMiddleware;
```

### Body

```json
{
  "tmdb_id": 550,
  "tipo": "PELICULA",
  "titulo": "Fight Club",
  "sinopsis": "Descripción",
  "fecha_lanzamiento": "1999-10-15",
  "poster_url": "https://...",
  "backdrop_url": "https://...",
  "puntuacion_tmdb": 8.8,
  "popularidad": 95.5
}
```

---

## Actualizar contenido

### Endpoint

```http
PUT /contents/:id
```

---

## Eliminar contenido

### Endpoint

```http
DELETE /contents/:id
```

---

# 🎭 Filtros y Ordenamiento

---

## Filtrar por género

### Endpoint

```http
GET /contents/genero/:nombre
```

### Ejemplo

```http
GET /contents/genero/Acción
```

### Query

```sql
SELECT c.*
FROM contenidos c
INNER JOIN contenido_genero cg
ON cg.contenido_id = c.id
INNER JOIN generos g
ON g.id = cg.genero_id
WHERE g.nombre = $1
```

---

## Ordenar por fecha

### Endpoint

```http
GET /contents/sort/date
```

### Query

```sql
SELECT *
FROM contenidos
ORDER BY fecha_lanzamiento DESC
```

---

## Ordenar por rating usuarios

### Endpoint

```http
GET /contents/sort/rating
```

### Query

```sql
SELECT c.*,
AVG(ru.puntaje) promedio
FROM contenidos c
INNER JOIN ratings_usuario ru
ON ru.contenido_id = c.id
GROUP BY c.id
ORDER BY promedio DESC
```

---

# 💬 Comentarios

---

## Obtener comentarios de un contenido

### Endpoint

```http
GET /contents/:id
```

### Query

```sql
SELECT
c.id,
c.comentario,
c.fecha_creacion,
u.id AS usuario_id,
u.nombre

FROM comentarios c

INNER JOIN usuarios u
ON c.usuario_id = u.id

WHERE c.contenido_id = $1

ORDER BY c.fecha_creacion DESC
```

---

## Obtener comentario

### Endpoint

```http
GET /comments/:id
```

---

## Crear comentario

### Endpoint

```http
POST /comments
```

### Middleware

```js
authMiddleware;
```

### Body

```json
{
  "contenido_id": 20,
  "comentario": "Excelente película"
}
```

---

## Actualizar comentario

### Endpoint

```http
PUT /comments/:id
```

---

## Eliminar comentario

### Endpoint

```http
DELETE /comments/:id
```

---

# ⭐ Ratings de Usuarios

Los usuarios normales pueden valorar películas y series.

## **Nota: El id del usuario se obtiene de la sesión activa.**

## Crear o actualizar rating

### Endpoint

```http
POST /ratings
```

### Body

```json
{
  "contenido_id": 20,
  "puntaje": 8.5
}
```

### Rango permitido

```text
0.0 - 10.0
```

---

## Obtener promedio de usuarios

### Endpoint

```http
GET /ratings/:contenidoId
```

### Query

```sql
SELECT
contenido_id,
ROUND(AVG(puntaje)::numeric,2)
AS promedio

FROM ratings_usuario

WHERE contenido_id = $1

GROUP BY contenido_id
```

---

# 🎖️ Ratings de Críticos

Los críticos tienen una valoración independiente de los usuarios normales.

---

## Crear o actualizar rating

### Endpoint

```http
POST /critics-ratings
```

### Body

```json
{
  "contenido_id": 20,
  "puntaje": 9.4
}
```

---

## Obtener promedio de críticos

### Endpoint

```http
GET /critics-ratings/:contenidoId
```

### Query

```sql
SELECT
contenido_id,
ROUND(AVG(puntaje)::numeric,2)
AS promedio

FROM ratings_critico

WHERE contenido_id = $1

GROUP BY contenido_id
```

---

# 🔄 Integración con TMDB

Cuando una película no existe en la base de datos:

1. Se consulta TMDB.
2. Se obtiene la información.
3. Se transforma al modelo interno.
4. Se guarda en PostgreSQL.
5. Se devuelve al cliente.

---

## Información almacenada desde TMDB

```json
{
  "tmdb_id": 550,
  "tipo": "PELICULA",
  "titulo": "Fight Club",
  "sinopsis": "...",
  "fecha_lanzamiento": "1999-10-15",
  "poster_url": "...",
  "backdrop_url": "...",
  "puntuacion_tmdb": 8.8,
  "popularidad": 95.5
}
```

---

# Roles

| Rol     | Descripción                         |
| ------- | ----------------------------------- |
| USUARIO | Puede comentar y valorar            |
| CRITICO | Puede emitir críticas profesionales |
| ADMIN   | Administración completa             |

---

# Tecnologías

- Node.js
- Express.js
- PostgreSQL
- express-session
- TMDB API
- bcrypt
