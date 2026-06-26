import PelisRepository from "./PelisRepository.js";
import Session from "../../components/session.js";
import UtilBycript from "../../util/bycript.js";
import Validator from "../../util/validator.js";

export default class PelisBO {
  constructor() {
    this.repository = new PelisRepository();
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
}
