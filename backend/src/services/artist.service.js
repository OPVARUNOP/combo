const { Artist } = require('../models');

/**
 * Create an artist
 * @param {Object} artistBody
 * @returns {Promise<Artist>}
 */
const createArtist = async (artistBody) => {
  return Artist.create(artistBody);
};

/**
 * Query for artists
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryArtists = async (filter, options) => {
  const artists = await Artist.paginate(filter, options);
  return artists;
};

/**
 * Get artist by id
 * @param {ObjectId} id
 * @returns {Promise<Artist>}
 */
const getArtistById = async (id) => {
  return Artist.findById(id);
};

/**
 * Get artist by name
 * @param {string} name
 * @returns {Promise<Artist>}
 */
const getArtistByName = async (name) => {
  return Artist.findOne({ name });
};

/**
 * Update artist by id
 * @param {ObjectId} artistId
 * @param {Object} updateBody
 * @returns {Promise<Artist>}
 */
const updateArtistById = async (artistId, updateBody) => {
  const artist = await getArtistById(artistId);
  if (!artist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
  }
  Object.assign(artist, updateBody);
  await artist.save();
  return artist;
};

/**
 * Delete artist by id
 * @param {ObjectId} artistId
 * @returns {Promise<Artist>}
 */
const deleteArtistById = async (artistId) => {
  const artist = await getArtistById(artistId);
  if (!artist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Artist not found');
  }
  await artist.remove();
  return artist;
};

module.exports = {
  createArtist,
  queryArtists,
  getArtistById,
  getArtistByName,
  updateArtistById,
  deleteArtistById,
};
