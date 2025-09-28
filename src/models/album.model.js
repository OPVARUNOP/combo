const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const albumSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Artist',
      required: true,
    },
    tracks: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Music',
      },
    ],
    releaseDate: {
      type: Date,
    },
    coverImage: {
      type: String,
    },
    genres: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add plugin that converts mongoose to JSON
albumSchema.plugin(toJSON);
albumSchema.plugin(paginate);

albumSchema.index({ artist: 1, name: 1 }, { unique: true });

/**
 * @typedef Album
 */
const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
