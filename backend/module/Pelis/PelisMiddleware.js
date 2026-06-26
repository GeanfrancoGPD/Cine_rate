export function authMiddleware(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "No autorizado",
    });
  }

  next();
}
