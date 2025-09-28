const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config/config');

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Streamify API',
      version: '1.0.0',
      description: 'Streamify Music Streaming API Documentation',
      contact: {
        name: 'Streamify Team',
        email: 'support@streamify.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'The auto-generated id of the user',
            },
            name: {
              type: 'string',
              description: 'User\'s full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              default: 'user',
              description: 'User role',
            },
            isEmailVerified: {
              type: 'boolean',
              default: false,
              description: 'Whether the user has verified their email',
            },
            profilePicture: {
              type: 'string',
              format: 'uri',
              description: 'URL to user\'s profile picture',
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark', 'system'],
                  default: 'system',
                },
                language: {
                  type: 'string',
                  default: 'en',
                },
                explicitContent: {
                  type: 'boolean',
                  default: false,
                },
              },
            },
          },
        },
        Music: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'The auto-generated id of the music track',
            },
            source: {
              type: 'string',
              enum: ['youtube', 'soundcloud', 'audius'],
              description: 'Source of the music',
            },
            sourceId: {
              type: 'string',
              description: 'ID of the music in the source platform',
            },
            title: {
              type: 'string',
              description: 'Title of the music track',
            },
            description: {
              type: 'string',
              description: 'Description of the music track',
            },
            thumbnail: {
              type: 'string',
              format: 'uri',
              description: 'URL to the thumbnail image',
            },
            duration: {
              type: 'integer',
              description: 'Duration of the track in seconds',
            },
            channelTitle: {
              type: 'string',
              description: 'Name of the channel/artist',
            },
            channelId: {
              type: 'string',
              description: 'ID of the channel/artist',
            },
            viewCount: {
              type: 'integer',
              description: 'Number of views',
            },
            likeCount: {
              type: 'integer',
              description: 'Number of likes',
            },
            category: {
              type: 'string',
              description: 'Category of the music',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Tags associated with the music',
            },
          },
        },
        Playlist: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'The auto-generated id of the playlist',
            },
            name: {
              type: 'string',
              description: 'Name of the playlist',
            },
            description: {
              type: 'string',
              description: 'Description of the playlist',
            },
            user: {
              $ref: '#/components/schemas/User',
              description: 'User who owns the playlist',
            },
            tracks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Music',
              },
              description: 'List of tracks in the playlist',
            },
            isPublic: {
              type: 'boolean',
              default: false,
              description: 'Whether the playlist is public',
            },
            coverImage: {
              type: 'string',
              format: 'uri',
              description: 'URL to the cover image of the playlist',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time when the playlist was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date and time when the playlist was last updated',
            },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            access: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT access token',
                },
                expires: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Expiration date of the access token',
                },
              },
            },
            refresh: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT refresh token',
                },
                expires: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Expiration date of the refresh token',
                },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                code: 401,
                message: 'Please authenticate',
              },
            },
          },
        },
        Forbidden: {
          description: 'User does not have permission to perform this action',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                code: 403,
                message: 'Forbidden',
              },
            },
          },
        },
        NotFound: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                code: 404,
                message: 'Not found',
              },
            },
          },
        },
        DuplicateEmail: {
          description: 'Email already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                code: 400,
                message: 'Email already taken',
              },
            },
          },
        },
        DuplicateName: {
          description: 'Playlist name already exists for this user',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                code: 400,
                message: 'Playlist name already taken',
              },
            },
          },
        },
        InvalidTrack: {
          description: 'Invalid track ID or track not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                code: 400,
                message: 'Invalid track ID',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger UI
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;
