/**
 * Picks specific properties from an object
 * @param {Object} object - The source object
 * @param {string[]} keys - The keys to pick
 * @returns {Object} - New object with picked properties
 */
const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

module.exports = pick;
