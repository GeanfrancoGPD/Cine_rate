import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;
const BEARER_TOKEN = process.env.BEARER_TOKEN;

export default class PelisApiRepository {
  constructor() {
    this.mapaGeneros = {};
  }

  async cargarMapaGeneros() {
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
      console.log("Géneros cargados:", datos.genres);

      return datos;
    } catch (error) {
      console.error("No se pudieron cargar los géneros:", error);
    }
  }

  async getAllGenres() {
    if (Object.keys(this.mapaGeneros).length === 0) {
      const datos = await this.cargarMapaGeneros();
      if (datos && datos.genres) {
        datos.genres.forEach((genero) => {
          this.mapaGeneros[genero.id] = genero.name;
        });
      }
    }
    return this.mapaGeneros;
  }

  async buscarPelicula(nombre) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(nombre)}&language=es-ES&page=1`;

    if (Object.keys(this.mapaGeneros).length === 0) {
      await this.cargarMapaGeneros();
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

      const peliculas = datos.data?.results || datos.results;

      if (!peliculas || peliculas.length === 0) {
        console.log("No se encontraron las películas.");
        return [];
      }

      return peliculas;
    } catch (error) {
      console.error("❌ Error al realizar la petición:", error.message);
    }
  }

  async getPopularMovies() {
    const url =
      "https://api.themoviedb.org/3/movie/popular?language=es-ES&page=1";

    if (Object.keys(this.mapaGeneros).length === 0) {
      await this.getAllGenres();
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
      const peliculas = datos.data?.results || datos.results;

      if (!peliculas || peliculas.length === 0) {
        console.log("No se encontraron películas populares.");
        return [];
      }

      return peliculas;
    } catch (error) {
      console.error("❌ Error al realizar la petición:", error.message);
      throw error;
    }
  }
}

// Ejemplo de uso
// const repository = new PelisApiRepository();
// repository.getAllGenres();
// repository.getPopularMovies();
