const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const playlistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    tracks: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Music',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add plugin that converts mongoose to JSON
playlistSchema.plugin(toJSON);
playlistSchema.plugin(paginate);

// Compound index for user and name (unique together)
playlistSchema.index({ user: 1, name: 1 }, { unique: true });

/**
 * Check if playlist name is taken for a user
 * @param {string} name - The playlist name
 * @param {ObjectId} userId - The user ID
 * @param {ObjectId} [excludePlaylistId] - The ID of the playlist to be excluded
 * @returns {Promise<boolean>}
 */
playlistSchema.statics.isNameTaken = async function (name, userId, excludePlaylistId) {
  const playlist = await this.findOne({ 
    name, 
    user: userId, 
    _id: { $ne: excludePlaylistId } 
  });
  
  return !!playlist;
};

/**
 * @typedef Playlist
 */
const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
