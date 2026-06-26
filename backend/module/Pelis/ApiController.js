const API_KEY = "41f9cd63b7519f53eb918b610a37bad5";
const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MWY5Y2Q2M2I3NTE5ZjUzZWI5MThiNjEwYTM3YmFkNSIsIm5iZiI6MTc4MTMwNDAwMy43ODEsInN1YiI6IjZhMmM4YWMzMzFlYTc5NmQxYjlkM2IwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Qrn9eGJ48cUs5ufvrGKclDA6dW4S71Hjrd8ds_Y71Uw";

let mapaGeneros = {};

async function cargarMapaGeneros() {
  const url = "https://api.themoviedb.org/3/genre/movie/list?language=es-ES";
  try {
    const respuesta = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });
    const datos = await respuesta.json();

    datos.genres.forEach((g) => {
      mapaGeneros[g.id] = g.name;
    });
  } catch (error) {
    console.error("No se pudieron cargar los géneros:", error);
  }
}

async function buscarPelicula(nombre) {
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(nombre)}&language=es-ES&page=1`;

  if (Object.keys(mapaGeneros).length === 0) {
    await cargarMapaGeneros();
  }

  const opciones = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
  };

  try {
    const respuesta = await fetch(url, opciones);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    // Limpia la consola para que solo veas el resultado actual
    console.clear();
    console.log(`==================================================`);
    console.log(`🔍 RESULTADOS DE BÚSQUEDA PARA: "${nombre.toUpperCase()}"`);
    console.log(`==================================================\n`);

    if (datos.results.length === 0) {
      console.log("No se encontraron películas con ese nombre.");
      return;
    }

    datos.results.forEach((pelicula) => {
      // Extrae el año de forma segura si la fecha existe
      const anio = pelicula.release_date
        ? pelicula.release_date.split("-")[0]
        : "N/A";
      // Recorta la sinopsis si es demasiado larga para que no sature la terminal
      const sinopsis = pelicula.overview || "Sin sinopsis disponible.";
      const id = pelicula.id;
      const nombresGeneros =
        pelicula.genre_ids && pelicula.genre_ids.length > 0
          ? pelicula.genre_ids
              .map((id) => mapaGeneros[id] || "Desconocido")
              .join(", ")
          : "N/A";
      console.log(`🆔 ID:        ${id}`);
      console.log(`🏷️ Géneros:   ${nombresGeneros}`);
      console.log(`🎬 Título:    ${pelicula.title} (${anio})`);
      console.log(`⭐️ Rating:    ${pelicula.vote_average.toFixed(1)} / 10`);
      console.log(`📝 Sinopsis:  ${sinopsis}`);
      console.log(`--------------------------------------------------\n`);
    });
  } catch (error) {
    console.error("❌ Error al realizar la petición:", error.message);
  }
}

// Ejemplo de uso
buscarPelicula("Pokemon");
