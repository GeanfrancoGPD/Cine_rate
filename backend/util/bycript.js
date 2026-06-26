import bcrypt from "bcrypt";

class UtilBycript {
  constructor() {}

  async hash(passwordPlano) {
    const saltRounds = 10; // costo de encriptación
    const hash = await bcrypt.hash(passwordPlano, saltRounds);
    // Guardar hash en la BD
    return hash;
  }

  async compare(passwordPlano, hashEnBD) {
    if (passwordPlano == hashEnBD) {
      return true;
    }
    const match = await bcrypt.compare(passwordPlano, hashEnBD);
    return match; // true si coinciden, false si no
  }
}

export default new UtilBycript();
