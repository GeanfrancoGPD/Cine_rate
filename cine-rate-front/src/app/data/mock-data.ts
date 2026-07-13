export interface Movie {
  id: number;
  title: string;
  rating: number;
  genre: string;
  releaseDate: string;
  poster?: string; // Vacío o null para placeholder
  synopsis?: string;
  actors?: string[];
  images?: string[];
  userRating?: number;
  reviews: Review[];
}

export interface Review {
  id: number;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  reviewerType: 'user' | 'critic';
}

export interface UserProfile {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  media: number;
  vistas: number;
  subdivisions: number;
  comments: UserComment[];
}

export interface UserComment {
  id: number;
  movieTitle: string;
  author: string;
  content: string;
  rating: number;
  date: string;
}

// ========== DATOS MOCK (sin imágenes) ==========

export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: 'Noon Hontons',
    rating: 8.5,
    genre: 'Comedy',
    releaseDate: '2024 - Sol-05',
    poster: '', // Sin imagen
    synopsis: 'Una comedia alocada sobre un grupo de amigos que intentan salvar su cine local.',
    actors: ['Maya Reed', 'Luca Hart', 'Jules Tanner'],
    images: ['', ''],
    reviews: [
      { id: 1, author: 'Alex Stevens', avatar: '', rating: 5, comment: 'Impresionante. Hace tiempo que no veía una comedia con tanto cuidado.', date: '2024-06-10', reviewerType: 'user' },
      { id: 2, author: 'Sofia Chen', avatar: '', rating: 4, comment: 'Me gustó el mundo que construyeron, pero me faltó un poco más de profundidad.', date: '2024-06-09', reviewerType: 'critic' }
    ]
  },
  {
    id: 2,
    title: 'Midnight City',
    rating: 7.5,
    genre: 'Mystery',
    releaseDate: '2023 - New York',
    poster: '',
    synopsis: 'Un detective busca respuestas en las calles de Nueva York durante la noche.',
    actors: ['Nina Cole', 'Jeremy Knox', 'Talia Brooks'],
    images: ['', ''],
    reviews: [
      { id: 3, author: 'Clara Vega', avatar: '', rating: 4, comment: 'Muy inmersiva y con un ritmo excelente.', date: '2024-06-08', reviewerType: 'user' },
      { id: 4, author: 'Marco Bianchi', avatar: '', rating: 5, comment: 'Atmósfera brillante, una obra madura del género.', date: '2024-06-07', reviewerType: 'critic' }
    ]
  },
  {
    id: 3,
    title: 'The Director',
    rating: 8.2,
    genre: 'Drama',
    releaseDate: '2024 - Director',
    poster: '',
    synopsis: 'La vida de un director de cine que lucha por su obra maestra.',
    reviews: []
  },
  {
    id: 4,
    title: 'Circuit Rush',
    rating: 8.1,
    genre: 'Action',
    releaseDate: '2024 - Audience',
    poster: '',
    synopsis: 'Carreras ilegales y adrenalina pura en las calles de Tokio.',
    reviews: []
  },
  {
    id: 5,
    title: 'Fragile Mind',
    rating: 7.8,
    genre: 'Thriller',
    releaseDate: '2023 - Mother',
    poster: '',
    synopsis: 'Un thriller psicológico sobre los límites de la mente.',
    reviews: []
  },
  {
    id: 6,
    title: 'Wild Spirit',
    rating: 8.4,
    genre: 'Family',
    releaseDate: '2024 - Family',
    poster: '',
    synopsis: 'Una familia descubre la aventura en la naturaleza salvaje.',
    reviews: []
  }
];

export const MOCK_USER_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  email: 'alex.themegicinema@mail.com',
  password: 'demo1234',
  avatar: '',
  media: 8.4,
  vistas: 3,
  subdivisions: 84,
  comments: [
    {
      id: 1,
      movieTitle: 'Opinião',
      author: '@AlexRivera',
      content: 'Última obra maestra visual y sonora. La dirección de Nelson es impecable.',
      rating: 5,
      date: '2024-06-11'
    },
    {
      id: 2,
      movieTitle: 'Dicas Para Tarei',
      author: '@AlexRivera',
      content: 'Simplemente épica. La escala de esta película es algo que solo el cine puede ofrecer.',
      rating: 4,
      date: '2024-06-10'
    },
    {
      id: 3,
      movieTitle: 'Para Trilogy',
      author: '@AlexRivera',
      content: 'Estremecedora, insoportable y visualmente asombrosa. Una trilogía inolvidable.',
      rating: 5,
      date: '2024-06-09'
    }
  ]
};