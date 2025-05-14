const https = require('https');
const fs = require('fs');
const path = require('path');

const WASM_FILES = [
  {
    url: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.1/dist/ort-wasm.wasm',
    filename: 'ort-wasm.wasm'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.1/dist/ort-wasm-simd.wasm',
    filename: 'ort-wasm-simd.wasm'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.1/dist/ort-wasm-threaded.wasm',
    filename: 'ort-wasm-threaded.wasm'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.1/dist/ort-wasm-simd-threaded.wasm',
    filename: 'ort-wasm-simd-threaded.wasm'
  }
];

const WASM_DIR = path.join(process.cwd(), 'public', 'wasm');

// Create wasm directory if it doesn't exist
if (!fs.existsSync(WASM_DIR)) {
  fs.mkdirSync(WASM_DIR, { recursive: true });
}

// Download function
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(WASM_DIR, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

// Download all files
async function downloadAllFiles() {
  console.log('Starting WASM files download...');
  
  try {
    await Promise.all(WASM_FILES.map(file => downloadFile(file.url, file.filename)));
    console.log('All WASM files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading WASM files:', error);
    process.exit(1);
  }
}

downloadAllFiles(); 