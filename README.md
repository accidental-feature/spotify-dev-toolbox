# spotify-dev-toolbox

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/rocktimsaikia/spotify-mini/main.yml)
![npm](https://img.shields.io/npm/v/spotify-mini?style=flat-square&color=success&logo=npm)
[![npm version](https://badge.fury.io/js/spotify-dev-toolbox.svg)](https://www.npmjs.com/package/spotify-dev-toolbox)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Spotify client for nodejs exposing useful methods to make developing spotify applications easier.

## Features

- 🎵 Get currently playing track
- 📊 Fetch user's top tracks and artists
- 📑 Access playlist information
- 👥 Get followed artists
- 💿 Browse saved albums
- 🎯 Get personalized recommendations
- 🔄 Automatic token refresh handling
- 📝 Full TypeScript support

## Prerequisites

Make sure to create a `refresh_token` with the following permissions (scopes) enabled:

1. `user-read-currently-playing` - For getCurrentTrack
2. `user-read-recently-played` - For getRecentTracks
3. `user-top-read` - For getTopTracks and getTopArtists
4. `playlist-read-private` - For getPlaylists and getPlaylistDetails
5. `playlist-read-collaborative` - For accessing collaborative playlists
6. `user-follow-read` - For getFollowedArtists
7. `user-library-read` - For getSavedAlbums

You can generate a refresh token with these permissions using tools like:

- [spotify-rtoken-cli](https://github.com/rocktimsaikia/spotify-rtoken-cli)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Installation

```sh
# Install with npm
npm install spotify-dev-toolbox

# Install with yarn
yarn add spotify-dev-toolbox

# Install with pnpm
pnpm add spotify-dev-toolbox
```

## Usage

```javascript
import { SpotifyClient } from '@accidental-feature/spotify-dev-toolbox'

const spotify = new SpotifyClient({
  clientId: '<YOUR-SPOTIFY-CLIENT-ID>',
  clientSecret: '<YOUR-SPOTIFY-CLIENT_SECRET>',
  refreshToken: '<YOUR-SPOTIFY-REFRESH-TOKEN>'
})

// Get the currently playing track.
const currentlyPlayingTrack = await spotify.getCurrentTrack()

console.log(currentlyPlayingTrack)
```

Example output:

```javascript
 {
    isPlaying: true,
    title: '<track title>',
    artist: '<artist name>',
    album: '<album name>',
 }
```

## API Methods

### getCurrentTrack

Get the currently playing track.

| Options                | Type    | Description                                                                       |
| ---------------------- | ------- | --------------------------------------------------------------------------------- |
| `fallbackToLastPlayed` | boolean | Returns the last played track, if there is no ongoing track atm. (default:`true`) |

### getRecentTracks

Get the recently played tracks.

| Options | Type                  | Description                                                          |
| ------- | --------------------- | -------------------------------------------------------------------- |
| `limit` | number (1 <= n <= 50) | Limit the number of recently played tracks to return. (default: `1`) |

### getTopTracks

Get the top tracks of the user.

| Options     | Type                | Description                                                                  |
| ----------- | ------------------- | ---------------------------------------------------------------------------- |
| `limit`     | number              | Limit the number of recently played tracks to return. (Default: `10`)        |
| `timeRange` | short, medium, long | Over what time range the top tracks should be calculated. (Default: `short`) |

### getPlaylists

Get the user's playlists.

| Options | Type                  | Description                                                    |
| ------- | --------------------- | -------------------------------------------------------------- |
| `limit` | number (1 <= n <= 50) | Limit the number of playlists to return. (Default: `20`)      |

### getPlaylistDetails

Get detailed information about a specific playlist.

| Parameter    | Type   | Description         |
| ------------ | ------ | ------------------- |
| `playlistId` | string | ID of the playlist  |

### getTopArtists

Get the user's top artists.

| Options     | Type                | Description                                                                  |
| ----------- | ------------------- | ---------------------------------------------------------------------------- |
| `limit`     | number              | Limit the number of artists to return. (Default: `10`)                       |
| `timeRange` | short, medium, long | Over what time range the top artists should be calculated. (Default: `short`)|

### getFollowedArtists

Get the user's followed artists.

| Options | Type                  | Description                                                    |
| ------- | --------------------- | -------------------------------------------------------------- |
| `limit` | number (1 <= n <= 50) | Limit the number of artists to return. (Default: `20`)        |

### getSavedAlbums

Get the user's saved albums.

| Options | Type                  | Description                                                    |
| ------- | --------------------- | -------------------------------------------------------------- |
| `limit` | number (1 <= n <= 50) | Limit the number of albums to return. (Default: `20`)         |

### getRecommendations

Get track recommendations based on seeds and parameters.

| Options              | Type   | Description                                           |
| ------------------- | ------ | ----------------------------------------------------- |
| `seed_tracks`       | string | Comma-separated list of track IDs                     |
| `seed_artists`      | string | Comma-separated list of artist IDs                    |
| `seed_genres`       | string | Comma-separated list of genres                        |
| `limit`             | number | Number of tracks to return (1 <= n <= 50)             |
| `target_popularity` | number | Target popularity (0-100)                             |
| `min_energy`        | number | Minimum energy (0.0-1.0)                             |
| `max_energy`        | number | Maximum energy (0.0-1.0)                             |
| `min_danceability`  | number | Minimum danceability (0.0-1.0)                       |
| `max_danceability`  | number | Maximum danceability (0.0-1.0)                       |

## Response Types

Each method returns a Promise with typed responses. See the TypeScript definitions for detailed response types.

## Error Handling

All methods throw errors for:

- Invalid parameters
- API errors
- Authentication failures

## Rate Limiting

The Spotify API has rate limits. Ensure you handle potential 429 (Too Many Requests) responses appropriately.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/search-feature`)
3. Commit your changes (`git commit -m 'Add some search feature'`)
4. Push to the branch (`git push origin feature/search-feature`)
5. Open a Pull Request

## License

[MIT](./LICENSE) License &copy; [Kijana Richmond](https://github.com/accidental-feature) 2025
