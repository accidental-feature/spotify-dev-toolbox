import fetch from 'node-fetch'
import { stringify } from 'node:querystring'
import { AccessToken, CurrentlyPlaying, RecentlyPlayed, Track } from 'spotify-types'
import {
    CurrentlyPlayingOptions,
    CurrentlyPlayingResponse,
    FollowedArtistsResponse,
    PlaylistDetailsResponse,
    PlaylistsResponse,
    RecommendationParams,
    RecommendationsResponse,
    RequestOptions,
    ResponseAlbum,
    ResponseArtist,
    ResponsePlaylist,
    ResponsePlaylistDetails,
    ResponseTrack,
    SavedAlbumsResponse,
    SpotifyClientOptions,
    TopArtistsResponse,
    TopItemsOptions
} from './types/base'
import { BaseError, TopTracks } from './types/spotify'
import { encodeToBase64, filterTrack } from './utils'
import { SPOTIFY_API } from './constants'

const ENDPOINTS = {
  accessToken: 'https://accounts.spotify.com/api/token',
  currentlyPlaying: 'https://api.spotify.com/v1/me/player/currently-playing',
  lastPlayed: 'https://api.spotify.com/v1/me/player/recently-played',
  topItems: 'https://api.spotify.com/v1/me/top'
}

export class SpotifyClient {
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly refreshToken: string
  private accessToken: string | null = null

  constructor({ clientId, clientSecret, refreshToken }: SpotifyClientOptions) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.refreshToken = refreshToken
  }

  private _genAccesToken = async () => {
    const basicToken = encodeToBase64(`${this.clientId}:${this.clientSecret}`)

    const response = await fetch(ENDPOINTS.accessToken, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: stringify({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      })
    })

    if (!response.ok) {
      const errorData = (await response.json()) as BaseError
      let errorMsg = `API Error: "${errorData?.error} - ${errorData?.error_description}"`

      if (errorData?.error_description == 'Refresh token revoked') {
        errorMsg +=
          '\n💡Tip: Generate a new refresh token with https://github.com/rocktimsaikia/spotify-rtoken-cli\n\n'
      }
      throw errorMsg
    }

    const responseData = (await response.json()) as AccessToken
    return responseData?.access_token
  }

  private async makeApiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    try {
      if (this.accessToken === null) {
        this.accessToken = await this._genAccesToken();
      }
  
      const headers = { Authorization: `Bearer ${this.accessToken}`, ...options.headers };
      
      // Filter out undefined values and converts them to Record<string, string | number>
      const filteredParams = options.params ? 
        Object.fromEntries(
          Object.entries(options.params)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, value!])
        ) as Record<string, string | number> : 
        {};
        
      const params = Object.keys(filteredParams).length ? `?${stringify(filteredParams)}` : '';
      
      const response = await fetch(`${endpoint}${params}`, { ...options, headers });
  
      if (response.status === 401) {
        this.accessToken = await this._genAccesToken();
        return this.makeApiRequest(endpoint, options);
      }
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      return response.json() as T;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  private validateLimit(limit: number): void {
    if (limit > 50 || limit < 1) {
      throw new Error('Limit must be between 1 and 50');
    }
  }

  async getCurrentTrack(options: CurrentlyPlayingOptions = {}): Promise<CurrentlyPlayingResponse | null> {
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.CURRENTLY_PLAYING}`;
    const response = await this.makeApiRequest<CurrentlyPlaying>(endpoint);
    
    if (!response) {
      return options.fallbackToLastPlayed ? 
        { isPlaying: false, ...(await this.getRecentTracks())[0] } : 
        null;
    }
    
    return { isPlaying: true, ...filterTrack(response.item as Track) };
  }

  async getRecentTracks(limit: number = 1): Promise<ResponseTrack[]> {
    this.validateLimit(limit);
    
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.RECENTLY_PLAYED}`;
    const response = await this.makeApiRequest<RecentlyPlayed>(endpoint, {
      params: { limit }
    });
    
    return response.items.map(({ track }) => filterTrack(track));
  }

  async getTopTracks({ limit = 10, timeRange = 'short' }: TopItemsOptions = {}): Promise<ResponseTrack[]> {
    this.validateLimit(limit);
    
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.TOP_ITEMS}/tracks`;
    const response = await this.makeApiRequest<TopTracks>(endpoint, {
      params: { limit, time_range: `${timeRange}_term` }
    });
    
    return response.items.map(item => ({
      title: item.name,
      artist: item.artists[0].name,
      link: item.external_urls.spotify
    }));
  }
  
  async getPlaylists(limit: number = 20): Promise<ResponsePlaylist[]> {
    this.validateLimit(limit);
    
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.PLAYLISTS}`;
    const response = await this.makeApiRequest<PlaylistsResponse>(endpoint, {
      params: { limit }
    });
    
    return response.items.map(item => ({
      name: item.name,
      id: item.id,
      tracks: item.tracks.total,
      link: item.external_urls.spotify
    }));
  }
  
  async getPlaylistDetails(playlistId: string): Promise<ResponsePlaylistDetails> {
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.PLAYLIST(playlistId)}`;
    const response = await this.makeApiRequest<PlaylistDetailsResponse>(endpoint);
    
    return {
      name: response.name,
      description: response.description,
      followers: response.followers.total,
      tracks: response.tracks.total,
      owner: response.owner.display_name,
      link: response.external_urls.spotify
    };
  }
  
  async getTopArtists({ limit = 10, timeRange = 'short' }: TopItemsOptions = {}): Promise<ResponseArtist[]> {
    this.validateLimit(limit);
    
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.TOP_ITEMS}/artists`;
    const response = await this.makeApiRequest<TopArtistsResponse>(endpoint, {
      params: { limit, time_range: `${timeRange}_term` }
    });
    
    return response.items.map(item => ({
      name: item.name,
      genres: item.genres,
      popularity: item.popularity,
      link: item.external_urls.spotify
    }));
  }
  
  async getFollowedArtists(limit: number = 20): Promise<ResponseArtist[]> {
    this.validateLimit(limit);
    
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.FOLLOWED_ARTISTS}`;
    const response = await this.makeApiRequest<FollowedArtistsResponse>(endpoint, {
      params: { type: 'artist', limit }
    });
    
    return response.artists.items.map(artist => ({
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      link: artist.external_urls.spotify
    }));
  }
  
  async getSavedAlbums(limit: number = 20): Promise<ResponseAlbum[]> {
    this.validateLimit(limit);
    
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.SAVED_ALBUMS}`;
    const response = await this.makeApiRequest<SavedAlbumsResponse>(endpoint, {
      params: { limit }
    });
    
    return response.items.map(item => ({
      name: item.album.name,
      artist: item.album.artists[0].name,
      releaseDate: item.album.release_date,
      totalTracks: item.album.total_tracks,
      link: item.album.external_urls.spotify
    }));
  }
  
  async getRecommendations(params: RecommendationParams): Promise<ResponseTrack[]> {
    if (params.limit) {
      this.validateLimit(params.limit);
    }
    
    const endpoint = `${SPOTIFY_API.BASE_URL}${SPOTIFY_API.ENDPOINTS.RECOMMENDATIONS}`;
    // Convert params to correct type before passing to makeApiRequest
    const filteredParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
    ) as Record<string, string | number>;
  
    const response = await this.makeApiRequest<RecommendationsResponse>(endpoint, {
      params: filteredParams
    });
    
    return response.tracks.map(track => ({
      title: track.name,
      artist: track.artists[0].name,
      link: track.external_urls.spotify
    }));
  }
}