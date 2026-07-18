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

router.put("/user", authMiddleware, async (req, res) => {
  await pelisBO.updateUser(req, res);
});

router.put("/user/password", authMiddleware, async (req, res) => {
  await pelisBO.updatePassword(req, res);
});
router.delete("/user", authMiddleware, async (req, res) => {
  await pelisBO.deleteUser(req, res);
});

router.get("/users", authMiddleware, async (req, res) => {
  await pelisBO.getAllUsers(req, res);
});

router.put("/users/:id/role", authMiddleware, async (req, res) => {
  await pelisBO.updateUserRole(req, res);
});

router.get("/auth-check", authMiddleware, async (req, res) => {
  await pelisBO.authCheck(req, res);
});

// ================== Contenido ===================

router.get("/generos", async (req, res) => {
  await pelisBO.getGenres(req, res);
});

router.get("/popular-movies", async (req, res) => {
  await pelisBO.getPopularMovies(req, res);
});

router.get("/search-movie", async (req, res) => {
  await pelisBO.searchMovie(req, res);
});

// ================== Favoritos ===================
router.post("/favorites", authMiddleware, async (req, res) => {
  await pelisBO.addFavorito(req, res);
});

router.get("/favorites", authMiddleware, async (req, res) => {
  await pelisBO.getFavoritos(req, res);
});

router.delete("/favorites/:contenidoId", authMiddleware, async (req, res) => {
  await pelisBO.removeFavorito(req, res);
});

router.get("/movies/:id", async (req, res) => {
  await pelisBO.getMovieDetails(req, res);
});

// ================== Comentarios ===================
router.post("/comments", authMiddleware, async (req, res) => {
  await pelisBO.addComentario(req, res);
});

router.get("/comments/:contenidoId", async (req, res) => {
  // Los comentarios se pueden ver sin autenticación
  await pelisBO.getComentarios(req, res);
});

router.delete("/comments/:id", authMiddleware, async (req, res) => {
  // Solo el autor o un admin debería poder borrar un comentario, aquí solo protegemos con auth
  await pelisBO.deleteComentario(req, res);
});

// ================== Ratings de Usuario ===================
router.post("/ratings", authMiddleware, async (req, res) => {
  await pelisBO.addRatingUsuario(req, res);
});

router.get("/ratings/:contenidoId", async (req, res) => {
  // El promedio de ratings puede ser público
  await pelisBO.getRatingUsuariosPromedio(req, res);
});

// ================== Ratings de Críticos ===================
router.post("/critics-ratings", authMiddleware, async (req, res) => {
  await pelisBO.addRatingCritico(req, res);
});

router.get("/critics-ratings/:contenidoId", async (req, res) => {
  // El promedio de ratings de crítico puede ser público
  await pelisBO.getRatingCriticosPromedio(req, res);
});

// ================== Filtros y ordenamientos ===================
router.get("/movies/filter", async (req, res) => {
  await pelisBO.filterMovies(req, res);
});

export default router;
