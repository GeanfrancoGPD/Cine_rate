import DB from "../../components/DBComponent.js";

export default class PelisRepository {
  constructor() {
    this.db = new DB();
  }
  async getUserByEmail(email) {
    return await this.db.excecuteNameQuery("getUser", { email });
  }

  async createUser(nombre, email, password_hash, tipo = "USUARIO") {
    return await this.db.excecuteNameQuery("createUser", {
      nombre,
      email,
      password_hash,
      tipo,
    });
  }

  async getUserById(id) {
    return await this.db.excecuteNameQuery("getUserById", { id });
  }

  async deleteUserAccount(usuarioId) {
    return await this.db.excecuteNameQuery("deleteUserAccount", {
      id: usuarioId,
    });
  }

  async getAllUsers() {
    return await this.db.excecuteNameQuery("getAllUsers", {});
  }
}
