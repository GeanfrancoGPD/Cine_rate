import session from "express-session";
import express from "express";
import cors from "cors";

const app = express();

// --- CORS global ---

app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://192.168.1.165:8081",
      "http://192.168.100.5:8081",
      "http://10.159.59.181:8081",
      "exp://192.168.100.5:8081",
      "exp://10.147.17.181:8081",
      "exp://192.168.92.181:8081",
      "exp://172.27.64.181:8081",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// JSON
app.use(express.json());

app.use(
  session({
    secret: "mi-clave-secreta",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: false, // Cambia a true en producción con HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    },
  }),
);

export default app;
