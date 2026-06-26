import app from "./util/middleware.js";
import PelisRouter from "./module/Pelis/PelisRouter.js";

app.use("/api/pelis", PelisRouter);

const port = process.env.PORT || 5000;

// --- START ---
app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor ejecutandose en el puerto ${port}`);
});
