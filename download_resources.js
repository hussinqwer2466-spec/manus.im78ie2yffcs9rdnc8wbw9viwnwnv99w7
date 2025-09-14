const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Create directories for different types of resources
const directories = ['css', 'js', 'media', 'chunks'];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Read the HTML file
const htmlFile = 'manus.html';
console.log(`Reading HTML file: ${htmlFile}`);

let content;
try {
  content = fs.readFileSync(htmlFile, 'utf8');
  console.log(`Successfully read ${htmlFile} (${content.length} characters)`);
} catch (err) {
  console.error(`Error reading ${htmlFile}: ${err.message}`);
  process.exit(1);
}

// Regular expressions to find external resources
// More specific patterns first to avoid conflicts
const cssPattern = /https:\/\/files\.manuscdn\.com\/webapp\/_next\/static\/css\/[^\s"]+/g;
const chunksPattern = /https:\/\/files\.manuscdn\.com\/webapp\/_next\/static\/chunks\/[^\s"]+/g;
const mediaPattern = /https:\/\/files\.manuscdn\.com\/webapp\/media\/[^\s"]+/g;
const otherJsPattern = /https:\/\/files\.manuscdn\.com\/webapp\/_next\/static\/[^\s"/]+\.js/g;

// Find all matches
const allUrls = new Set();

// Find CSS files
const cssMatches = content.match(cssPattern);
if (cssMatches) {
  cssMatches.forEach(url => allUrls.add(url));
  console.log(`Found ${cssMatches.length} CSS files`);
}

// Find chunk files
const chunksMatches = content.match(chunksPattern);
if (chunksMatches) {
  chunksMatches.forEach(url => allUrls.add(url));
  console.log(`Found ${chunksMatches.length} chunk files`);
}

// Find media files
const mediaMatches = content.match(mediaPattern);
if (mediaMatches) {
  mediaMatches.forEach(url => allUrls.add(url));
  console.log(`Found ${mediaMatches.length} media files`);
}

// Find other JS files
const otherJsMatches = content.match(otherJsPattern);
if (otherJsMatches) {
  otherJsMatches.forEach(url => allUrls.add(url));
  console.log(`Found ${otherJsMatches.length} other JS files`);
}

const urlArray = Array.from(allUrls);
console.log(`Found ${urlArray.length} unique external resources to download`);

if (urlArray.length === 0) {
  console.log("No external resources found in the HTML file");
  process.exit(0);
}

// Show sample URLs
console.log("Sample URLs found:");
urlArray.slice(0, 10).forEach((url, index) => {
  console.log(`  ${index + 1}. ${url}`);
});

// Download function
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    // Clean the URL to remove any potential escape characters
    const cleanUrl = url.replace(/\\/g, '');
    console.log(`Downloading ${cleanUrl}...`);
    
    const parsedUrl = new URL(cleanUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(parsedUrl, (response) => {
      if (response.statusCode === 404) {
        console.log(`⚠ Skipping (404 Not Found): ${cleanUrl}`);
        resolve();
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      // Determine filename and directory
      const filename = path.basename(parsedUrl.pathname);
      let directory = 'downloads';
      
      if (cleanUrl.includes('/css/')) {
        directory = 'css';
      } else if (cleanUrl.includes('/chunks/')) {
        directory = 'chunks';
      } else if (cleanUrl.includes('/media/')) {
        directory = 'media';
      } else if (cleanUrl.endsWith('.js')) {
        directory = 'js';
      }
      
      const filepath = path.join(directory, filename);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      const fileStream = fs.createWriteStream(filepath);
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Downloaded: ${cleanUrl} -> ${filepath}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fileStream.close();
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.abort();
      reject(new Error('Request timeout'));
    });
  });
}

// Download all resources
async function downloadAllResources() {
  console.log("\nStarting downloads...");
  let successfulDownloads = 0;
  let failedDownloads = 0;
  let skippedDownloads = 0;
  
  for (let i = 0; i < urlArray.length; i++) {
    const url = urlArray[i];
    console.log(`Progress: ${i + 1}/${urlArray.length}`);
    
    try {
      await downloadFile(url);
      successfulDownloads++;
    } catch (err) {
      if (err.message.includes('404')) {
        skippedDownloads++;
      } else {
        console.error(`✗ Failed to download ${url}: ${err.message}`);
        failedDownloads++;
      }
    }
  }
  
  console.log(`\nDownload Summary:`);
  console.log(`Successful: ${successfulDownloads}`);
  console.log(`Failed: ${failedDownloads}`);
  console.log(`Skipped (404): ${skippedDownloads}`);
  console.log(`Total: ${urlArray.length}`);
}

// Run the download process
downloadAllResources().catch(err => {
  console.error(`Error during download process: ${err.message}`);
  process.exit(1);
});