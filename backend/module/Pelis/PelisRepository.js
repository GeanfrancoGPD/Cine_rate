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

  async getPopularMovies() {
    return await this.db.excecuteNameQuery("getPopularMovies", {});
  }

  async createContenido(contenidos) {
    if (!Array.isArray(contenidos)) contenidos = [contenidos];
    console.log("Creando contenido en la base de datos:", contenidos);
    const promesas = contenidos.map((pelicula) => {
      return this.db.excecuteNameQuery("createContenido", pelicula);
    });

    return await Promise.all(promesas);
  }
}
