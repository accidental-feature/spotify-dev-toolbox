export interface ResponseTrack {
  title: string
  artist: string
  link: string
}

export interface SpotifyClientOptions {
  clientId: string
  clientSecret: string
  refreshToken: string
}

export interface CurrentlyPlayingOptions {
  fallbackToLastPlayed?: boolean
}

export interface TopItemsOptions {
  limit?: number
  timeRange?: 'long' | 'medium' | 'short'
}

export interface CurrentlyPlayingResponse extends ResponseTrack {
  isPlaying: boolean
}

export interface ResponsePlaylist {
  name: string;
  id: string;
  tracks: number;
  link: string;
}

export interface ResponseArtist {
  name: string;
  genres: string[];
  popularity: number;
  link: string;
}

export interface PlaylistsResponse {
  items: {
    name: string;
    id: string;
    tracks: {
      total: number;
    };
    external_urls: {
      spotify: string;
    };
  }[];
}

export interface TopArtistsResponse {
  items: {
    name: string;
    genres: string[];
    popularity: number;
    external_urls: {
      spotify: string;
    };
  }[];
}

export interface RecommendationParams {
  seed_tracks?: string;
  seed_artists?: string;
  seed_genres?: string;
  limit?: number;
  target_popularity?: number;
  min_energy?: number;
  max_energy?: number;
  min_danceability?: number;
  max_danceability?: number;
}

export interface ResponseAlbum {
  name: string;
  artist: string;
  releaseDate: string;
  totalTracks: number;
  link: string;
}

export interface ResponsePlaylistDetails {
  name: string;
  description: string;
  followers: number;
  tracks: number;
  owner: string;
  link: string;
}

export interface PlaylistDetailsResponse {
  name: string;
  description: string;
  followers: {
    total: number;
  };
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
  };
  external_urls: {
    spotify: string;
  };
}

export interface FollowedArtistsResponse {
  artists: {
    items: {
      name: string;
      genres: string[];
      popularity: number;
      external_urls: {
        spotify: string;
      };
    }[];
  };
}

export interface SavedAlbumsResponse {
  items: {
    album: {
      name: string;
      artists: {
        name: string;
      }[];
      release_date: string;
      total_tracks: number;
      external_urls: {
        spotify: string;
      };
    };
  }[];
}

export interface RecommendationsResponse {
  tracks: {
    name: string;
    artists: {
      name: string;
    }[];
    external_urls: {
      spotify: string;
    };
  }[];
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  params?: Record<string, string | number>;
}