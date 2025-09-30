# COMBO Music Streaming App

A modern music streaming application with React Native/Expo frontend and Node.js backend.

## 🚀 Quick Start

### Option 1: Run Everything (Recommended)
```bash
./start-combo.sh
# or
./run.sh
```

### Option 2: Frontend Only
```bash
./frontend-only.sh
```

### Option 3: Backend Only
```bash
./backend-only.sh
```

### Option 4: Manual Setup
```bash
# Terminal 1 - Backend
node backend/server.js

# Terminal 2 - Frontend
cd mobile
npx expo start --web --clear
```

## 📋 Available Services

After running `./start-combo.sh`, you'll have:

- **🌐 Web App**: http://localhost:8081
- **🎵 Backend API**: http://localhost:3001
- **📚 Health Check**: http://localhost:3001/health

## 🔧 Development Scripts

### Mobile App Scripts
```bash
cd mobile

# Start development server
npx expo start --web

# Clear cache and restart
npx expo start --web --clear

# Build for production
npx expo build:web

# Run on specific port
npx expo start --web --port 3000
```

### Backend Scripts
```bash
# Start backend server
node backend/server.js

# Development with auto-restart
nodemon backend/server.js

# Run tests
npm test
```

## 🔍 Testing the API

Once the backend is running, test these endpoints:

- **Search Music**: http://localhost:3001/api/music/search?q=rock
- **Get Track**: http://localhost:3001/api/music/track/123
- **Health Check**: http://localhost:3001/health

## 📱 Mobile App Features

- **🎨 Beautiful UI**: Modern dark theme with blue accents
- **🔐 Authentication**: Login/Register screens
- **🔍 Search**: Search for music across all sources
- **📚 Library**: Your playlists, liked songs, downloads
- **👥 Social**: Social features and sharing
- **⚙️ Settings**: App preferences and configuration

## 🛠️ Troubleshooting

### Blank Page Issues
1. Clear Expo cache: `npx expo start --clear`
2. Restart the development server
3. Check browser console for JavaScript errors
4. Try incognito/private browsing mode

### Port Conflicts
If you get port conflicts:
```bash
# Kill processes on specific ports
kill -9 $(lsof -ti:8081)
kill -9 $(lsof -ti:3001)

# Or use different ports
npx expo start --web --port 3000
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

cd mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 🛑 Stopping Services

- **Press Ctrl+C** in the terminal running the startup script
- **Close the terminal** - this will stop all background processes
- **Use Activity Monitor/Process Manager** to manually kill Node processes

## 📁 Project Structure

```
combo/
├── backend/           # Backend API server
│   ├── server.js     # Main server file
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── services/     # Business logic
├── mobile/           # React Native/Expo app
│   ├── src/         # Source code
│   ├── App.js       # Main app component
│   └── package.json # Dependencies
├── start-combo.sh   # Main startup script
├── run.sh          # Quick start alias
├── frontend-only.sh # Frontend only
└── backend-only.sh  # Backend only
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3001
JAMENDO_CLIENT_ID=your_client_id
JAMENDO_CLIENT_SECRET=your_client_secret
```

## 📚 API Documentation

The backend provides RESTful APIs for:
- Music search and streaming
- User authentication
- Playlist management
- Social features

See the backend routes for detailed API documentation.

---

**Happy coding! 🎵**
