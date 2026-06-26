import { Pool } from "pg";
import fs from "fs";
import { log } from "console";
import dotenv from "dotenv";

dotenv.config();

export default class DB {
  constructor() {
    this.pool = null;
    this.queries = {};
    this.init();
  }

  async init() {
    try {
      const isProduction = process.env.NODE_ENV === "production";

      this.pool = new Pool({
        // Si hay DATABASE_URL usa esa, si no, cae en los parámetros sueltos (local)
        connectionString: process.env.DATABASE_URL,
        user: !process.env.DATABASE_URL ? process.env.DB_USER : undefined,
        host: !process.env.DATABASE_URL ? process.env.DB_HOST : undefined,
        database: !process.env.DATABASE_URL
          ? process.env.DB_DATABASE
          : undefined,
        password: !process.env.DATABASE_URL
          ? process.env.DB_PASSWORD
          : undefined,
        port: !process.env.DATABASE_URL ? process.env.DB_PORT : undefined,

        max: process.env.DB_MAX || 20,
        idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
        connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT || 2000,

        // CRUCIAL PARA PRODUCCIÓN:
        ssl: isProduction
          ? { rejectUnauthorized: false } // Requerido por la mayoría de proveedores Cloud
          : false,
      });

      const client = await this.pool.connect();
      console.log("Base de datos inicializada correctamente");
      console.log(
        `Conexión exitosa a PostgreSQL (${isProduction ? "Producción" : "Local"})`,
      );
      client.release();
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error);
    }
    this.loadQueries();
  }

  async loadQueries() {
    try {
      const queryFile = new URL(
        "../module/Pelis/data/query.json",
        import.meta.url,
      );
      const data = fs.readFileSync(queryFile, "utf8");
      this.queries = JSON.parse(data);
    } catch (error) {
      console.error("Error al cargar query.json:", error);
    }
  }

  async executeQuery(query, params = []) {
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async excecuteNameQuery(nameQuery, params = {}) {
    try {
      await this.loadQueries();
      const queryConfig = this.queries[nameQuery];

      // DEBUG: Mira qué sale aquí. Si sale "undefined", ahí está el problema.
      console.log("Query encontrada:", queryConfig);

      const query = queryConfig.query;
      const values = queryConfig.orderArray.map((key) => params[key]);

      console.log("VALUES:", values);
      // DEBUG: Esto es lo que realmente ve la base de datos
      // console.log("Enviando a SQL:", query);

      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error detallado:", error);
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log("Conexión a BD cerrada");
    }
  }
}
