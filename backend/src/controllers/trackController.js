const Track = require('../models/Track');

// @route   GET /api/tracks
// @desc    Get all tracks
// @access  Public
exports.getTracks = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, genre, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (genre) {
      query.genre = genre;
    }

    const tracks = await Track.find(query)
      .populate('artist', 'username')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Track.countDocuments(query);

    res.json({
      tracks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/tracks/:id
// @desc    Get track by ID
// @access  Public
exports.getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate('artist', 'username')
      .populate('album', 'title coverImage');

    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    res.json(track);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Track not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/tracks
// @desc    Create a track
// @access  Private/Artist
exports.createTrack = async (req, res) => {
  try {
    // Check if user is an artist
    if (req.user.role !== 'artist') {
      return res.status(403).json({ msg: 'Not authorized to create tracks' });
    }

    const newTrack = new Track({
      ...req.body,
      artist: req.user.id,
    });

    const track = await newTrack.save();
    res.status(201).json(track);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/tracks/:id
// @desc    Update a track
// @access  Private/Artist
exports.updateTrack = async (req, res) => {
  try {
    let track = await Track.findById(req.params.id);

    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    // Check user is track owner or admin
    if (track.artist.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    track = await Track.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

    res.json(track);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/tracks/:id
// @desc    Delete a track
// @access  Private/Artist,Admin
exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    // Check user is track owner or admin
    if (track.artist.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await track.remove();
    res.json({ msg: 'Track removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Track not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/tracks/like/:id
// @desc    Like a track
// @access  Private
exports.likeTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

    // Check if track has already been liked
    if (track.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Track already liked' });
    }

    track.likes.unshift({ user: req.user.id });
    await track.save();

    res.json(track.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/tracks/unlike/:id
// @desc    Unlike a track
// @access  Private
exports.unlikeTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

    // Check if track has been liked
    if (!track.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Track has not yet been liked' });
    }

    // Remove the like
    track.likes = track.likes.filter(({ user }) => user.toString() !== req.user.id);

    await track.save();

    res.json(track.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
