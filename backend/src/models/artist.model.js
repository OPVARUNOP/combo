const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const artistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    genres: {
      type: [String],
      default: [],
    },
    tracks: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Music',
      },
    ],
    albums: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Album',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add plugin that converts mongoose to JSON
artistSchema.plugin(toJSON);
artistSchema.plugin(paginate);

/**
 * @typedef Artist
 */
const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
