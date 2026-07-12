import PelisRepository from "./PelisRepository.js";
import Session from "../../components/session.js";
import UtilBycript from "../../util/bycript.js";
import Validator from "../../util/validator.js";
import PelisApiRepository from "./PelisApiRepositoy.js";

export default class PelisBO {
  constructor() {
    this.repository = new PelisRepository();
    this.repositoryApi = new PelisApiRepository();
    this.session = Session;
    this.bcrypt = UtilBycript;
    this.validator = Validator;
  }

  getValidationMessage(validation) {
    return validation?.error?.issues?.[0]?.message || "Dato inválido";
  }

  async resolveUserId(req) {
    const candidate =
      req.session?.user?.id ??
      req.body?.usuario_id ??
      req.body?.usuarioId ??
      req.query?.usuarioId ??
      req.params?.usuarioId;

    const parsed = Number(candidate);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // ==================== AUTENTICACIÓN ====================
  async login(req, res) {
    const { gmail, email, password } = req.body;
    const normalizedEmail = gmail ?? email;

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Correo electrónico y contraseña son requeridos",
      });
    }

    const emailValidation = await this.validator.validateEmail(normalizedEmail);
    if (!emailValidation.success) {
      return res.status(400).json({
        success: false,
        message: this.getValidationMessage(emailValidation),
      });
    }

    const passwordValidation = await this.validator.validatePassword(password);
    if (!passwordValidation.success) {
      return res.status(400).json({
        success: false,
        message: this.getValidationMessage(passwordValidation),
      });
    }

    const user = await this.repository.getUserByEmail(normalizedEmail);

    if (!user.length) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const valid = await this.bcrypt.compare(password, user[0].password_hash);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta",
      });
    }
    console.log("Usuario autenticado:", user[0].email);
    await this.session.createSession({ request: req, response: res }, user);
  }

  async register(req, res) {
    const { nombre, name, gmail, email, password } = req.body;
    const normalizedName = (nombre ?? name ?? "").trim();
    const normalizedEmail = (gmail ?? email ?? "").trim();
    const normalizedPassword = password ?? "";

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({
        success: false,
        message: "Todos los datos son requeridos",
      });
    }

    const nameValidation = await this.validator.validateUsername(normalizedName);
    if (!nameValidation.success) {
      return res.status(400).json({
        success: false,
        message: this.getValidationMessage(nameValidation),
      });
    }

    const emailValidation = await this.validator.validateEmail(normalizedEmail);
    if (!emailValidation.success) {
      return res.status(400).json({
        success: false,
        message: this.getValidationMessage(emailValidation),
      });
    }

    const passwordValidation = await this.validator.validatePassword(normalizedPassword);
    if (!passwordValidation.success) {
      return res.status(400).json({
        success: false,
        message: this.getValidationMessage(passwordValidation),
      });
    }

    const existingUser = await this.repository.getUserByEmail(normalizedEmail);
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El correo electrónico ya está registrado",
      });
    }

    const hashedPassword = await this.bcrypt.hash(password);
    await this.repository.createUser(normalizedName, normalizedEmail, hashedPassword);

    return res.status(201).json({
      success: true,
      message: "Se ha creado el usuario correctamente",
    });
  }

  async logout(req, res) {
    return this.session.destroySession({ request: req, response: res });
  }

  async deleteUser(req, res) {
    try {
      const usuarioId = req.body.id ?? this.resolveUserId(req);

      if (!usuarioId) {
        return res
          .status(400)
          .json({ success: false, message: "Usuario inválido" });
      }
      const data = await this.repository.deleteUserAccount(usuarioId);
      req.session.destroy(() => {});
      return res.json({ success: true, data });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "No se pudo eliminar la cuenta" });
    }
  }

  async updateUser(req, res) {
    try {
      const usuarioId = req.body.id ?? this.resolveUserId(req);

      if (!usuarioId) {
        return res
          .status(400)
          .json({ success: false, message: "Usuario inválido" });
      }

      const { nombre, gmail, password, tipo } = req.body;

      if (!nombre && !gmail && !password && !tipo) {
        return res.status(400).json({
          success: false,
          message:
            "Al menos un campo (nombre, gmail, password o tipo) es requerido",
        });
      }

      const updateData = {};
      if (nombre) updateData.nombre = nombre;
      if (gmail) updateData.gmail = gmail;
      if (password) {
        const hashedPassword = await this.bcrypt.hash(password);
        updateData.password_hash = hashedPassword;
      }
      if (tipo) updateData.tipo = tipo;

      const data = await this.repository.updateUser(usuarioId, updateData);
      return res.json({ success: true, data });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "No se pudo actualizar la cuenta" });
    }
  }

  async updatePassword(req, res) {
    try {
      const usuarioId = req.body.id ?? this.resolveUserId(req);

      if (!usuarioId) {
        return res
          .status(400)
          .json({ success: false, message: "Usuario inválido" });
      }

      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "El campo de contraseña es requerido",
        });
      }

      const hashedPassword = await this.bcrypt.hash(password);
      const data = await this.repository.updatePassword(
        usuarioId,
        hashedPassword,
      );

      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "No se pudo actualizar la contraseña",
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const data = await this.repository.getAllUsers();
      return res.json({ success: true, data: data ?? [] });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "No se pudieron cargar los usuarios",
      });
    }
  }

  async authCheck(req, res) {
    const exists = this.session.sessionExist({ request: req, response: res });
    if (exists) {
      return res.json({
        success: true,
        message: "Usuario autenticado",
        user: req.session.user,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }
  }

  // ================== Contenido ===================

  async getGenres(req, res) {
    try {
      if (Object.keys(this.repositoryApi.mapaGeneros).length === 0) {
        const generosBD = await this.repository.getGeneros();
        if (generosBD && generosBD.length > 0) {
          generosBD.forEach((g) => {
            this.repositoryApi.mapaGeneros[g.tmdb_genero_id] = g.nombre;
          });
        } else {
          const apiGeneros = await this.repositoryApi.cargarMapaGeneros();

          if (apiGeneros && apiGeneros.genres) {
            for (const genero of apiGeneros.genres) {
              await this.repository.createGenero(genero.id, genero.name);
              this.repositoryApi.mapaGeneros[genero.id] = genero.name;
            }
          }
        }
      }
      return res.json({ success: true, data: this.repositoryApi.mapaGeneros });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error al cargar géneros" });
    }
  }

  async getPopularMovies(req, res) {
    try {
      let data = await this.repository.getPopularMovies();

      if (!data || data.length === 0) {
        const apiData = await this.repositoryApi.getPopularMovies();

        if (Array.isArray(apiData) && apiData.length > 0) {
          data = [];
          for (const item of apiData) {
            const nuevoContenido = await this.repository.createContenido([
              {
                tmdb_id: item.id,
                tipo: "PELICULA",
                titulo: item.original_title,
                sinopsis: item.overview,
                fecha_lanzamiento: item.release_date,
                poster_url: item.poster_path
                  ? "https://image.tmdb.org/t/p/w780" + item.poster_path
                  : null,
                backdrop_url: item.backdrop_path
                  ? "https://image.tmdb.org/t/p/w780" + item.backdrop_path
                  : null,
                puntuacion_tmdb: item.vote_average,
                popularidad: item.popularity,
              },
            ]);

            const contenidoId = nuevoContenido[0][0].id;
            if (item.genre_ids) {
              for (const genreId of item.genre_ids) {
                await this.repository.createContenidoGenero(
                  contenidoId,
                  genreId,
                );
              }
            }
            data.push({ ...nuevoContenido[0][0], genre_ids: item.genre_ids });
          }
        }
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener películas populares",
      });
    }
  }

  async searchMovie(req, res) {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la película es requerido",
      });
    }

    try {
      // 1. Mantenemos la búsqueda con comodines para SQL LIKE
      let data = await this.repository.searchByTitle(`%${nombre}%`);

      if (!data || data.length === 0) {
        const apiData = await this.repositoryApi.buscarPelicula(nombre);
        data = [];

        if (apiData && apiData.length > 0) {
          for (const item of apiData) {
            const generoIdsInternos = [];
            if (item.genre_ids && Array.isArray(item.genre_ids)) {
              for (const tmdbGenreId of item.genre_ids) {
                // Corregido: Usamos tu método original getGeneroByTmdbId
                let generoEnBD =
                  await this.repository.getGeneroByTmdbId(tmdbGenreId);

                // Ajustamos la lectura del índice según lo que devuelva tu DBComponent [0] o [0][0]
                const registroGenero = generoEnBD[0]?.[0] || generoEnBD[0];

                if (registroGenero && registroGenero.id) {
                  generoIdsInternos.push(registroGenero.id);
                } else {
                  const nombreGenero =
                    this.repositoryApi.mapaGeneros[tmdbGenreId];
                  if (nombreGenero) {
                    const nuevoGenero = await this.repository.createGenero(
                      tmdbGenreId,
                      nombreGenero,
                    );
                    const registroNuevo = nuevoGenero[0]?.[0] || nuevoGenero[0];
                    if (registroNuevo && registroNuevo.id) {
                      generoIdsInternos.push(registroNuevo.id);
                    }
                  } else {
                    console.warn(
                      `Nombre de género no encontrado para TMDB ID: ${tmdbGenreId}`,
                    );
                  }
                }
              }
            }

            const nuevoContenido = await this.repository.createContenido([
              {
                tmdb_id: item.id,
                tipo: "PELICULA",
                titulo: item.title,
                sinopsis: item.overview,
                fecha_lanzamiento: item.release_date,
                poster_url: item.poster_path
                  ? "https://image.tmdb.org/t/p/w780" + item.poster_path
                  : null,
                // Corregido: Se eliminó la barra invertida escapada \"
                backdrop_url: item.backdrop_path
                  ? "https://image.tmdb.org/t/p/w780" + item.backdrop_path
                  : null,
                puntuacion_tmdb: item.vote_average,
                popularidad: item.popularity,
              },
            ]);

            const contenidoId = nuevoContenido[0][0].id;
            for (const generoIdInterno of generoIdsInternos) {
              await this.repository.createContenidoGenero(
                contenidoId,
                generoIdInterno,
              );
            }
            data.push({ ...nuevoContenido[0][0], genre_ids: item.genre_ids });
          }
        }
      }
      return res.json({ success: true, data });
    } catch (error) {
      // IMPORTANTE: Esto hará que sí veas qué falla en tu consola local
      console.error("Error en searchMovie:", error);
      return res
        .status(500)
        .json({ success: false, message: "No se pudo buscar la película" });
    }
  }

  async addFavorito(req, res) {
    try {
      const usuarioId = req.session.user.id;
      const { contenidoId } = req.body;

      if (!contenidoId) {
        return res.status(400).json({
          success: false,
          message: "El ID del contenido es requerido",
        });
      }

      await this.repository.addFavorito(usuarioId, contenidoId);
      return res.json({ success: true, message: "Favorito agregado" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "No se pudo agregar el favorito",
      });
    }
  }

  async getFavoritos(req, res) {
    try {
      const usuarioId = req.session.user.id;
      const data = await this.repository.getFavoritos(usuarioId);
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "No se pudieron cargar los favoritos",
      });
    }
  }

  async removeFavorito(req, res) {
    try {
      const usuarioId = req.session.user.id;
      const { contenidoId } = req.params;

      if (!contenidoId) {
        return res.status(400).json({
          success: false,
          message: "El ID del contenido es requerido",
        });
      }

      await this.repository.removeFavorito(usuarioId, contenidoId);
      return res.json({ success: true, message: "Favorito eliminado" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "No se pudo eliminar el favorito",
      });
    }
  }
  // ================== Comentarios ===================
  async addComentario(req, res) {
    try {
      const usuarioId = req.session.user.id; // Aquí usarías resolveUserId
      const { contenidoId, comentario } = req.body;

      if (!contenidoId || !comentario) {
        return res.status(400).json({
          success: false,
          message: "Datos incompletos para el comentario",
        });
      }

      const nuevoComentario = await this.repository.createComentario(
        usuarioId,
        contenidoId,
        comentario,
      );
      return res.status(201).json({
        success: true,
        message: "Comentario agregado",
        data: nuevoComentario,
      });
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      return res
        .status(500)
        .json({ success: false, message: "No se pudo agregar el comentario" });
    }
  }

  async getComentarios(req, res) {
    try {
      const { contenidoId } = req.params;

      if (!contenidoId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de contenido requerido" });
      }

      const data = await this.repository.getComentariosByContenido(contenidoId);
      return res.json({ success: true, data });
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      return res.status(500).json({
        success: false,
        message: "No se pudieron cargar los comentarios",
      });
    }
  }

  async deleteComentario(req, res) {
    try {
      const { id } = req.params; // ID del comentario a eliminar

      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "ID de comentario requerido" });
      }

      await this.repository.deleteComentario(id);
      return res.json({ success: true, message: "Comentario eliminado" });
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      return res
        .status(500)
        .json({ success: false, message: "No se pudo eliminar el comentario" });
    }
  }

  // ================== Ratings de Usuario ===================
  async addRatingUsuario(req, res) {
    try {
      const usuarioId = await this.resolveUserId(req); // Usar resolveUserId
      const { contenidoId, puntaje } = req.body;

      if (!usuarioId || !contenidoId || puntaje === undefined) {
        return res.status(400).json({
          success: false,
          message: "Datos incompletos para el rating",
        });
      }

      const parsedPuntaje = parseFloat(puntaje);
      if (isNaN(parsedPuntaje) || parsedPuntaje < 0 || parsedPuntaje > 10) {
        return res.status(400).json({
          success: false,
          message: "El puntaje debe ser un número entre 0 y 10",
        });
      }

      await this.repository.createRatingUsuario(
        usuarioId,
        contenidoId,
        parsedPuntaje,
      );
      return res
        .status(201)
        .json({ success: true, message: "Rating agregado/actualizado" });
    } catch (error) {
      console.error("Error al agregar/actualizar rating de usuario:", error);
      return res.status(500).json({
        success: false,
        message: "No se pudo agregar/actualizar el rating",
      });
    }
  }

  async getRatingUsuariosPromedio(req, res) {
    try {
      const { contenidoId } = req.params;

      if (!contenidoId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de contenido requerido" });
      }

      const data = await this.repository.getRatingUsuariosPromedio(contenidoId);
      // Si no hay ratings, devuelve 0 o un valor por defecto
      const promedio =
        data && data.length > 0 ? parseFloat(data[0].promedio) : 0;
      return res.json({ success: true, promedio });
    } catch (error) {
      console.error("Error al obtener promedio de ratings de usuario:", error);
      return res.status(500).json({
        success: false,
        message: "No se pudo obtener el promedio de ratings",
      });
    }
  }

  // ================== Ratings de Críticos ===================
  async addRatingCritico(req, res) {
    try {
      const usuarioId = await this.resolveUserId(req);
      const { contenidoId, puntaje } = req.body;
      const user = req.session.user; // Obtener el usuario de la sesión para verificar el rol

      if (!user || user.tipo !== "CRITICO") {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado. Solo críticos pueden añadir ratings.",
        });
      }

      if (!usuarioId || !contenidoId || puntaje === undefined) {
        return res.status(400).json({
          success: false,
          message: "Datos incompletos para el rating del crítico",
        });
      }

      const parsedPuntaje = parseFloat(puntaje);
      if (isNaN(parsedPuntaje) || parsedPuntaje < 0 || parsedPuntaje > 10) {
        return res.status(400).json({
          success: false,
          message: "El puntaje debe ser un número entre 0 y 10",
        });
      }

      await this.repository.createRatingCritico(
        usuarioId,
        contenidoId,
        parsedPuntaje,
      );
      return res.status(201).json({
        success: true,
        message: "Rating de crítico agregado/actualizado",
      });
    } catch (error) {
      console.error("Error al agregar/actualizar rating de crítico:", error);
      return res.status(500).json({
        success: false,
        message: "No se pudo agregar/actualizar el rating del crítico",
      });
    }
  }

  async getRatingCriticosPromedio(req, res) {
    try {
      const { contenidoId } = req.params;

      if (!contenidoId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de contenido requerido" });
      }

      const data = await this.repository.getRatingCriticosPromedio(contenidoId);
      const promedio =
        data && data.length > 0 ? parseFloat(data[0].promedio) : 0;
      return res.json({ success: true, promedio });
    } catch (error) {
      console.error("Error al obtener promedio de ratings de crítico:", error);
      return res.status(500).json({
        success: false,
        message: "No se pudo obtener el promedio de ratings del crítico",
      });
    }
  }
}
