import { DB } from "./components/DBComponent.js";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
    console.log("🔌 Probando conexión a PostgreSQL...");
    console.log("📋 Configuración:", {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    });
    
    const db = new DB();
    await db.init();
    
    try {
        const result = await db.executeQuery("SELECT NOW() as hora_actual");
        console.log("✅ Conexión exitosa!");
        console.log("📅 Hora del servidor:", result[0].hora_actual);
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await db.close();
    }
}

testConnection();