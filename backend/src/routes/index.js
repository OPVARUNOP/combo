const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const musicRoute = require('./music.route');
const firestoreRoute = require('./firestore.routes');
const testUploadRoute = require('./test-upload.route');
// const docsRoute = require('./docs.route');
const config = require('../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/test-upload',
    route: testUploadRoute,
  },
  {
    path: '/firestore',
    route: firestoreRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/music',
    route: musicRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  // {
  //   path: '/docs',
  //   route: docsRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
