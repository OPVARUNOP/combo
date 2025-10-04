const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { playlistService } = require('../services');
const pick = require('../utils/pick');

const createPlaylist = catchAsync(async (req, res) => {
  const playlist = await playlistService.createPlaylist(req.body);
  res.status(httpStatus.CREATED).send(playlist);
});

const getPlaylists = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await playlistService.queryPlaylists(filter, options);
  res.send(result);
});

const getPlaylist = catchAsync(async (req, res) => {
  const playlist = await playlistService.getPlaylistById(req.params.id);
  if (!playlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Playlist not found');
  }
  res.send(playlist);
});

const updatePlaylist = catchAsync(async (req, res) => {
  const playlist = await playlistService.updatePlaylistById(req.params.id, req.body);
  res.send(playlist);
});

const deletePlaylist = catchAsync(async (req, res) => {
  await playlistService.deletePlaylistById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const addTrackToPlaylist = catchAsync(async (req, res) => {
  const playlist = await playlistService.addTrackToPlaylist(req.params.id, req.body.trackId);
  res.send(playlist);
});

const removeTrackFromPlaylist = catchAsync(async (req, res) => {
  const playlist = await playlistService.removeTrackFromPlaylist(req.params.id, req.params.trackId);
  res.send(playlist);
});

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
};
