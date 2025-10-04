const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SONG_ID = 'test-song.mp3'; // Replace with an actual song ID from your storage
const OUTPUT_PATH = path.join(__dirname, '..', 'test-output.mp3');

async function testAudioStream() {
  try {
    console.log('Starting audio stream test...');

    // 1. Get audio info
    console.log('Fetching audio info...');
    const infoResponse = await axios.get(`${BASE_URL}/api/audio/info/${SONG_ID}`);
    console.log('Audio info:', infoResponse.data);

    // 2. Start a session
    console.log('Starting playback session...');
    const sessionResponse = await axios.post(`${BASE_URL}/api/audio/session/start`, {
      songId: SONG_ID,
    });
    const { sessionId } = sessionResponse.data;
    console.log('Session started with ID:', sessionId);

    // 3. Stream the audio
    console.log('Streaming audio...');
    const streamResponse = await axios({
      method: 'get',
      url: `${BASE_URL}/api/audio/stream/${SONG_ID}`,
      responseType: 'stream',
      headers: {
        Range: 'bytes=0-',
        'Session-Id': sessionId,
      },
    });

    // Save the stream to a file for testing
    const writer = fs.createWriteStream(OUTPUT_PATH);
    streamResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', async () => {
        console.log(`Audio stream saved to ${OUTPUT_PATH}`);

        // 4. End the session
        try {
          await axios.post(`${BASE_URL}/api/audio/session/end`, { sessionId });
          console.log('Session ended successfully');
          resolve();
        } catch (error) {
          console.error('Error ending session:', error.message);
          reject(error);
        }
      });

      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
}

// Run the test
testAudioStream()
  .then(() => console.log('Audio streaming test completed successfully!'))
  .catch(() => console.log('Audio streaming test failed!'));
