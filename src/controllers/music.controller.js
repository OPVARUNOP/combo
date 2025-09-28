const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { musicService, artistService, albumService } = require('../services');
const pick = require('../utils/pick');

const searchMusic = catchAsync(async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await musicService.searchMusic(q, { page, limit });
  res.send(result);
});

const getMusicById = catchAsync(async (req, res) => {
  const music = await musicService.getMusicById(req.params.id);
  res.send(music);
});

const getStreamUrl = catchAsync(async (req, res) => {
  const url = await musicService.getStreamUrl(req.params.id);
  res.send({ url });
});

const getTrendingMusic = catchAsync(async (req, res) => {
  const { category, regionCode, maxResults } = req.query;
  const result = await musicService.getTrendingMusic({ category, regionCode, maxResults });
  res.send(result);
});

const getArtists = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await artistService.queryArtists(filter, options);
  res.send(result);
});

const getArtist = catchAsync(async (req, res) => {
  const artist = await artistService.getArtistById(req.params.id);
  if (!artist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
  }
  res.send(artist);
});

const getAlbums = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await albumService.queryAlbums(filter, options);
  res.send(result);
});

const getAlbum = catchAsync(async (req, res) => {
  const album = await albumService.getAlbumById(req.params.id);
  if (!album) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Album not found');
  }
  res.send(album);
});

module.exports = {
  searchMusic,
  getMusicById,
  getStreamUrl,
  getTrendingMusic,
  getArtists,
  getArtist,
  getAlbums,
  getAlbum,
};
