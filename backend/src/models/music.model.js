const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const musicSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in seconds
      required: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: String,
    },
    artist: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Artist',
      required: true,
    },
    album: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Album',
    },
    source: {
      type: String,
      required: true,
      enum: ['youtube', 'soundcloud', 'audius'],
    },
    sourceId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add plugin that converts mongoose to JSON
musicSchema.plugin(toJSON);
musicSchema.plugin(paginate);

// Compound index for source and sourceId (unique together)
musicSchema.index({ source: 1, sourceId: 1 }, { unique: true });

/**
 * @typedef Music
 */
const Music = mongoose.model('Music', musicSchema);

module.exports = Music;
