import 'dotenv/config'
import test from 'ava'
import sinon from 'sinon'
import { SpotifyClient } from '../dist/index.js'

const clientId = 'xxx-xxx-xxx-xxx'
const clientSecret = 'xxx-xxx-xxx-xxx'
const refreshToken = 'xxx-xxx-xxx-xxx'

const spotify = new SpotifyClient({ clientId, clientSecret, refreshToken })

sinon.stub(spotify, 'getCurrentTrack').resolves({
  title: 'fake-title',
  artist: 'fake-artist',
  link: 'https://open.spotify.com/track/123456789',
  isPlaying: true
})

test('get currently playing track', async (t) => {
  const currentTrack = await spotify.getCurrentTrack()
  t.not(typeof currentTrack, 'undefined')

  // not null means there is a track playing
  t.is(currentTrack?.title, 'fake-title')
  t.is(currentTrack?.artist, 'fake-artist')
  t.is(currentTrack?.link, 'https://open.spotify.com/track/123456789')
  t.is(currentTrack?.isPlaying, true)
})

const mockTracks = new Array(50).fill(null).map((_, i) => ({
  title: `fake-title-${i}`,
  artist: `fake-artist-${i}`,
  link: `https://open.spotify.com/track/${i}`
}))

sinon.stub(spotify, 'getRecentTracks').callsFake(async (limit = 1) => {
  if (limit > 50 || limit < 1) {
    throw new Error('Limit must be between 1 and 50')
  }
  return mockTracks.slice(0, limit)
})

test('get last played song', async (t) => {
  const lastPlayed = await spotify.getRecentTracks()
  t.not(typeof lastPlayed, 'undefined')
  t.is(lastPlayed.length, 1)
  t.is(lastPlayed[0]?.title, 'fake-title-0')
  t.is(lastPlayed[0]?.artist, 'fake-artist-0')
  t.is(lastPlayed[0]?.link, 'https://open.spotify.com/track/0')
})

test('get 10 recently played songs', async (t) => {
  const lastPlayed = await spotify.getRecentTracks(10)
  t.not(typeof lastPlayed, 'undefined')
  t.is(lastPlayed.length, 10)
  const randomTrackIdx = Math.floor(Math.random() * 10)
  t.is(lastPlayed[randomTrackIdx]?.title, `fake-title-${randomTrackIdx}`)
  t.is(lastPlayed[randomTrackIdx]?.artist, `fake-artist-${randomTrackIdx}`)
  t.is(
    lastPlayed[randomTrackIdx]?.link,
    `https://open.spotify.com/track/${randomTrackIdx}`
  )
})

sinon.stub(spotify, 'getTopTracks').callsFake(async (options = {}) => {
  const limit = options.limit || 10
  if (limit > 50 || limit < 1) {
    throw new Error('Limit must be between 1 and 50')
  }
  return mockTracks.slice(0, limit)
})

test('Get top tracks with default options', async (t) => {
  const topTracks = await spotify.getTopTracks()
  t.not(typeof topTracks, 'undefined')
  t.is(topTracks.length, 10)
  const randomTrackIdx = Math.floor(Math.random() * 10)
  t.is(topTracks[randomTrackIdx]?.title, `fake-title-${randomTrackIdx}`)
  t.is(topTracks[randomTrackIdx]?.artist, `fake-artist-${randomTrackIdx}`)
  t.is(
    topTracks[randomTrackIdx]?.link,
    `https://open.spotify.com/track/${randomTrackIdx}`
  )
})

test('Get top tracks with limit `10` and timeRange `long`', async (t) => {
  const topTracks = await spotify.getTopTracks({ limit: 20, timeRange: 'long' })
  t.not(typeof topTracks, 'undefined')
  t.is(topTracks.length, 20)
  const randomTrackIdx = Math.floor(Math.random() * 20)
  t.is(topTracks[randomTrackIdx]?.title, `fake-title-${randomTrackIdx}`)
  t.is(topTracks[randomTrackIdx]?.artist, `fake-artist-${randomTrackIdx}`)
  t.is(
    topTracks[randomTrackIdx]?.link,
    `https://open.spotify.com/track/${randomTrackIdx}`
  )
})

test('Get top tracks with default limit and timeRange `medium`', async (t) => {
  const topTracks = await spotify.getTopTracks({ timeRange: 'medium' })
  t.not(typeof topTracks, 'undefined')
  t.is(topTracks.length, 10)
  const randomTrackIdx = Math.floor(Math.random() * 10)
  t.is(topTracks[randomTrackIdx]?.title, `fake-title-${randomTrackIdx}`)
  t.is(topTracks[randomTrackIdx]?.artist, `fake-artist-${randomTrackIdx}`)
  t.is(
    topTracks[randomTrackIdx]?.link,
    `https://open.spotify.com/track/${randomTrackIdx}`
  )
})

test('getRecentTracks: passing limit over 50 should throw error', async (t) => {
  const error = await t.throwsAsync(() => spotify.getRecentTracks(60))
  t.is(error?.message, 'Limit must be between 1 and 50')
})

test('getTopTracks: passing limit over 50 should throw error', async (t) => {
  const error = await t.throwsAsync(() => spotify.getTopTracks({ limit: 60 }))
  t.is(error?.message, 'Limit must be between 1 and 50')
})

// Mock data for playlists
const mockPlaylists = new Array(50).fill(null).map((_, i) => ({
  name: `Playlist ${i}`,
  id: `id-${i}`,
  tracks: i + 10,
  link: `https://open.spotify.com/playlist/${i}`
}));

// Mock data for artists
const mockArtists = new Array(50).fill(null).map((_, i) => ({
  name: `Artist ${i}`,
  genres: [`genre-${i}`, `genre-${i + 1}`],
  popularity: 50 + i,
  link: `https://open.spotify.com/artist/${i}`
}));

// Mock data for albums
const mockAlbums = new Array(50).fill(null).map((_, i) => ({
  name: `Album ${i}`,
  artist: `Artist ${i}`,
  releaseDate: '2024-01-01',
  totalTracks: 12,
  link: `https://open.spotify.com/album/${i}`
}));

// Stub getPlaylists
sinon.stub(spotify, 'getPlaylists').callsFake(async (limit = 20) => {
  if (limit > 50 || limit < 1) {
    throw new Error('Limit must be between 1 and 50');
  }
  return mockPlaylists.slice(0, limit);
});

test('Get playlists with default limit', async (t) => {
  const playlists = await spotify.getPlaylists();
  t.not(typeof playlists, 'undefined');
  t.is(playlists.length, 20);
  const randomIdx = Math.floor(Math.random() * 20);
  t.is(playlists[randomIdx]?.name, `Playlist ${randomIdx}`);
  t.is(playlists[randomIdx]?.id, `id-${randomIdx}`);
  t.is(playlists[randomIdx]?.tracks, randomIdx + 10);
});

test('getPlaylists: passing limit over 50 should throw error', async (t) => {
  const error = await t.throwsAsync(() => spotify.getPlaylists(60));
  t.is(error?.message, 'Limit must be between 1 and 50');
});

// Stub getFollowedArtists
sinon.stub(spotify, 'getFollowedArtists').callsFake(async (limit = 20) => {
  if (limit > 50 || limit < 1) {
    throw new Error('Limit must be between 1 and 50');
  }
  return mockArtists.slice(0, limit);
});

test('Get followed artists with default limit', async (t) => {
  const artists = await spotify.getFollowedArtists();
  t.not(typeof artists, 'undefined');
  t.is(artists.length, 20);
  const randomIdx = Math.floor(Math.random() * 20);
  t.is(artists[randomIdx]?.name, `Artist ${randomIdx}`);
  t.deepEqual(artists[randomIdx]?.genres, [`genre-${randomIdx}`, `genre-${randomIdx + 1}`]);
  t.is(artists[randomIdx]?.popularity, 50 + randomIdx);
});

test('getFollowedArtists: passing limit over 50 should throw error', async (t) => {
  const error = await t.throwsAsync(() => spotify.getFollowedArtists(60));
  t.is(error?.message, 'Limit must be between 1 and 50');
});

// Stub getSavedAlbums
sinon.stub(spotify, 'getSavedAlbums').callsFake(async (limit = 20) => {
  if (limit > 50 || limit < 1) {
    throw new Error('Limit must be between 1 and 50');
  }
  return mockAlbums.slice(0, limit);
});

test('Get saved albums with default limit', async (t) => {
  const albums = await spotify.getSavedAlbums();
  t.not(typeof albums, 'undefined');
  t.is(albums.length, 20);
  const randomIdx = Math.floor(Math.random() * 20);
  t.is(albums[randomIdx]?.name, `Album ${randomIdx}`);
  t.is(albums[randomIdx]?.artist, `Artist ${randomIdx}`);
  t.is(albums[randomIdx]?.releaseDate, '2024-01-01');
  t.is(albums[randomIdx]?.totalTracks, 12);
});

test('getSavedAlbums: passing limit over 50 should throw error', async (t) => {
  const error = await t.throwsAsync(() => spotify.getSavedAlbums(60));
  t.is(error?.message, 'Limit must be between 1 and 50');
});

// Stub getPlaylistDetails
sinon.stub(spotify, 'getPlaylistDetails').callsFake(async (playlistId) => {
  return {
    name: `Playlist ${playlistId}`,
    description: 'A test playlist',
    followers: 1000,
    tracks: 25,
    owner: 'Test User',
    link: `https://open.spotify.com/playlist/${playlistId}`
  };
});

test('Get playlist details', async (t) => {
  const playlistId = '123';
  const details = await spotify.getPlaylistDetails(playlistId);
  t.not(typeof details, 'undefined');
  t.is(details.name, `Playlist ${playlistId}`);
  t.is(details.description, 'A test playlist');
  t.is(details.followers, 1000);
  t.is(details.tracks, 25);
  t.is(details.owner, 'Test User');
  t.is(details.link, `https://open.spotify.com/playlist/${playlistId}`);
});

// Stub getRecommendations
sinon.stub(spotify, 'getRecommendations').callsFake(async (params) => {
  const limit = params.limit || 20;
  if (limit > 50 || limit < 1) {
    throw new Error('Limit must be between 1 and 50');
  }
  return mockTracks.slice(0, limit);
});

test('Get recommendations with default parameters', async (t) => {
  const recommendations = await spotify.getRecommendations({
    seed_tracks: '1234,5678',
    limit: 10
  });
  t.not(typeof recommendations, 'undefined');
  t.is(recommendations.length, 10);
  const randomIdx = Math.floor(Math.random() * 10);
  t.is(recommendations[randomIdx]?.title, `fake-title-${randomIdx}`);
  t.is(recommendations[randomIdx]?.artist, `fake-artist-${randomIdx}`);
});

test('getRecommendations: passing limit over 50 should throw error', async (t) => {
  const error = await t.throwsAsync(() => spotify.getRecommendations({ limit: 60 }));
  t.is(error?.message, 'Limit must be between 1 and 50');
});