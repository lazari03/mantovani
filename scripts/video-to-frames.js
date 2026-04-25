/**
 * Convert video to image sequence using FFmpeg
 * 
 * Prerequisites:
 * 1. Install FFmpeg: https://ffmpeg.org/download.html
 * 2. Get a stock video of concrete mixer from:
 *    - Pexels: https://www.pexels.com/search/concrete%20mixer/
 *    - Pixabay: https://pixabay.com/videos/search/concrete%20mixer/
 *    - Videvo: https://www.videvo.net/search/concrete%20mixer/
 * 3. Place video as /public/video/mixer.mp4
 * 4. Run: node scripts/video-to-frames.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VIDEO_PATH = path.join(__dirname, '../public/video/mixer_optimized.mp4');
const OUTPUT_DIR = path.join(__dirname, '../public/frames');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Extract 120 frames from video at 30fps
const command = `ffmpeg -i "${VIDEO_PATH}" -vf "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -vframes 120 -q:v 80 "${OUTPUT_DIR}/mixer_%04d.webp"`;

try {
  console.log('Extracting frames from video...');
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Done! 120 frames saved to /public/frames/');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n📥 Install FFmpeg:');
  console.log('   Mac: brew install ffmpeg');
  console.log('   Windows: choco install ffmpeg');
  console.log('   Linux: sudo apt install ffmpeg');
}
