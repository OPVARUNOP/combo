const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

// @route   GET /api/playlists
// @desc    Get all public playlists or user's playlists
// @access  Private
exports.getPlaylists = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const query = {};

    if (userId) {
      query.owner = userId;
    } else {
      query.$or = [{ isPublic: true }, { owner: req.user.id }];
    }

    const playlists = await Playlist.find(query)
      .populate('owner', 'username')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Playlist.countDocuments(query);

    res.json({
      playlists,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/playlists/:id
// @desc    Get playlist by ID
// @access  Private
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'username')
      .populate('tracks');

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    // Check if playlist is private and user is not the owner
    if (!playlist.isPublic && playlist.owner._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to view this playlist' });
    }

    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/playlists
// @desc    Create a playlist
// @access  Private
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic = true } = req.body;

    const newPlaylist = new Playlist({
      name,
      description,
      isPublic,
      owner: req.user.id,
    });

    const playlist = await newPlaylist.save();
    res.status(201).json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/playlists/:id
// @desc    Update a playlist
// @access  Private
exports.updatePlaylist = async (req, res) => {
  try {
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    // Check user is playlist owner
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    playlist = await Playlist.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/playlists/:id
// @desc    Delete a playlist
// @access  Private
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    // Check user is playlist owner or admin
    if (playlist.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await playlist.remove();
    res.json({ msg: 'Playlist removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/playlists/:id/tracks
// @desc    Add track to playlist
// @access  Private
exports.addTrackToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    const { trackId } = req.body;

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    // Check user is playlist owner
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    // Check if track is already in playlist
    if (playlist.tracks.includes(trackId)) {
      return res.status(400).json({ msg: 'Track already in playlist' });
    }

    playlist.tracks.unshift(trackId);
    await playlist.save();

    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/playlists/:id/tracks/:trackId
// @desc    Remove track from playlist
// @access  Private
exports.removeTrackFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    const { trackId } = req.params;

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist not found' });
    }

    // Check user is playlist owner
    if (playlist.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Check if track is in playlist
    if (!playlist.tracks.includes(trackId)) {
      return res.status(400).json({ msg: 'Track not in playlist' });
    }

    // Remove track
    playlist.tracks = playlist.tracks.filter((track) => track.toString() !== trackId);

    await playlist.save();
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
