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
    const { gmail, password } = req.body;

    if (!gmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Correo electrónico y contraseña son requeridos",
      });
    }

    const emailValidation = await this.validator.validateEmail(gmail);
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

    const user = await this.repository.getUserByEmail(gmail);

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
    const { nombre, gmail, password } = req.body;

    if (!nombre || !gmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los datos son requeridos",
      });
    }

    const nameValidation = await this.validator.validateUsername(nombre);
    if (!nameValidation.success) {
      return res.status(400).json({
        success: false,
        message: this.getValidationMessage(nameValidation),
      });
    }

    const emailValidation = await this.validator.validateEmail(gmail);
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

    const existingUser = await this.repository.getUserByEmail(gmail);
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El correo electrónico ya está registrado",
      });
    }

    const hashedPassword = await this.bcrypt.hash(password);
    await this.repository.createUser(nombre, gmail, hashedPassword);

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
      const data = await pelisRepository.deleteUserAccount(usuarioId);
      req.session.destroy(() => {});
      return res.json({ success: true, data });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "No se pudo eliminar la cuenta" });
    }
  }

  async getAllUsers(req, res) {
    try {
      const data = await pelisRepository.getAllUsers();
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

  async getPopularMovies() {
    try {
      // 1. Intentar obtener de la base de datos local
      let data = await this.repository.getPopularMovies();

      // 2. Si no hay datos locales, ir a la API externa de TMDB
      if (!data || data.length === 0) {
        const apiData = await this.repositoryApi.getPopularMovies();

        if (Array.isArray(apiData) && apiData.length > 0) {
          // Mapeamos todo el lote en memoria súper rápido
          const contenidosMapeados = apiData.map((item) => ({
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
          }));

          // 3. Guardamos TODO el lote en la base de datos de una sola vez
          await this.repository.createContenido(contenidosMapeados);

          // Asignamos el resultado para devolverlo de inmediato
          data = contenidosMapeados;
        }
      }

      return data ?? [];
    } catch (error) {
      // Propagamos el error para que el controlador lo capture en su catch
      throw error;
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
      const data = await this.repositoryApi.buscarPelicula(nombre);
      return res.json({ success: true, data: data ?? [] });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "No se pudo buscar la película",
      });
    }
  }
}
