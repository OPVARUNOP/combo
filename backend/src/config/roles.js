const allRoles = {
  user: [],
  premium: ['manageSongs', 'downloadMusic'],
  admin: ['getUsers', 'manageUsers', 'manageSongs', 'manageArtists', 'downloadMusic'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
