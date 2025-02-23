export const SPOTIFY_API = {
  BASE_URL: 'https://api.spotify.com/v1',
  ENDPOINTS: {
    ACCESS_TOKEN: 'https://accounts.spotify.com/api/token',
    CURRENTLY_PLAYING: '/me/player/currently-playing',
    RECENTLY_PLAYED: '/me/player/recently-played',
    TOP_ITEMS: '/me/top',
    PLAYLISTS: '/me/playlists',
    PLAYLIST: (id: string) => `/playlists/${id}`,
    FOLLOWED_ARTISTS: '/me/following',
    SAVED_ALBUMS: '/me/albums',
    RECOMMENDATIONS: '/recommendations'
  }
} as const;