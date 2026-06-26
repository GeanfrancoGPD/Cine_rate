-- 1. CREACIÓN DE TIPOS ENUM (Se deben crear antes que las tablas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_usuario') THEN
        CREATE TYPE tipo_usuario AS ENUM ('USUARIO', 'CRITICO', 'ADMIN');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_contenido') THEN
        CREATE TYPE tipo_contenido AS ENUM ('PELICULA', 'SERIE');
    END IF;
END $$;

-- 2. TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY, -- BIGSERIAL automatiza el ID (no necesitas ingresarlo manualmente)
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo tipo_usuario DEFAULT 'USUARIO', -- Usa el tipo ENUM creado arriba
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: CONTENIDOS
CREATE TABLE IF NOT EXISTS contenidos (
    id BIGSERIAL PRIMARY KEY,
    tmdb_id BIGINT UNIQUE NOT NULL,
    tipo tipo_contenido NOT NULL, -- Usa el tipo ENUM creado arriba
    titulo VARCHAR(255) NOT NULL,
    sinopsis TEXT,
    fecha_lanzamiento DATE,
    poster_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    puntuacion_tmdb DECIMAL(3,1),
    popularidad DECIMAL(10,2),
    fecha_importacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: GENEROS
CREATE TABLE IF NOT EXISTS generos (
    id BIGSERIAL PRIMARY KEY,
    tmdb_genero_id INT UNIQUE,
    nombre VARCHAR(100) NOT NULL
);

-- 5. TABLA: CONTENIDO_GENERO
CREATE TABLE IF NOT EXISTS contenido_genero (
    contenido_id BIGINT,
    genero_id BIGINT,
    PRIMARY KEY (contenido_id, genero_id),
    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

-- 6. TABLA: ACTORES
CREATE TABLE IF NOT EXISTS actores (
    id BIGSERIAL PRIMARY KEY,
    tmdb_actor_id BIGINT UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    foto_url VARCHAR(500)
);

-- 7. TABLA: CONTENIDO_ACTOR
CREATE TABLE IF NOT EXISTS contenido_actor (
    contenido_id BIGINT,
    actor_id BIGINT,
    PRIMARY KEY(contenido_id, actor_id),
    FOREIGN KEY(contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY(actor_id) REFERENCES actores(id) ON DELETE CASCADE
);

-- 8. TABLA: COMENTARIOS
CREATE TABLE IF NOT EXISTS comentarios (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    contenido_id BIGINT NOT NULL,
    comentario TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY(contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE
);

-- 9. TABLA: RATINGS_USUARIO
CREATE TABLE IF NOT EXISTS ratings_usuario (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    contenido_id BIGINT NOT NULL,
    puntaje DECIMAL(3,1) NOT NULL CHECK(puntaje >= 0 AND puntaje <= 10), -- Corregido a DECIMAL(3,1) para permitir "10.0"
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, contenido_id),
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY(contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE
);

-- 10. TABLA: RATINGS_CRITICO
CREATE TABLE IF NOT EXISTS ratings_critico (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    contenido_id BIGINT NOT NULL,
    puntaje DECIMAL(3,1) NOT NULL CHECK(puntaje >= 0 AND puntaje <= 10), -- Corregido a DECIMAL(3,1) para permitir "10.0"
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, contenido_id),
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY(contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE
);
