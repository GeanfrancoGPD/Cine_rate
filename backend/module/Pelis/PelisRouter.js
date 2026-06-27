import express from "express";
import PelisBO from "./PelisBO.js";
import { authMiddleware } from "./PelisMiddleware.js";

const router = express.Router();
const pelisBO = new PelisBO();

// ==================== AUTENTICACIÓN ====================
router.post("/login", async (req, res) => {
  await pelisBO.login(req, res);
});

router.post("/register", async (req, res) => {
  await pelisBO.register(req, res);
});

router.post("/logout", async (req, res) => {
  await pelisBO.logout(req, res);
});

router.delete("/user", authMiddleware, async (req, res) => {
  await pelisBO.deleteUser(req, res);
});

router.get("/users", async (req, res) => {
  await pelisBO.getAllUsers(req, res);
});

router.get("/auth-check", authMiddleware, async (req, res) => {
  await pelisBO.authCheck(req, res);
});

// ================== Contenido ===================

router.get("/popular-movies", async (req, res) => {
  await pelisBO.getPopularMovies(req, res);
});

// router.get("/search-movie", async (req, res) => {
//   await pelisBO.searchMovie(req, res);
// });

// router.get("/movies/:id", async (req, res) => {
//   await pelisBO.getMovieDetails(req, res);
// });

export default router;
