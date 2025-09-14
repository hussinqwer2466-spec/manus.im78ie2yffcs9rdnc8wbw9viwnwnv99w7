const fs = require('fs');
const https = require('https');

const url = 'https://manus.im';
const filename = 'manus.html';

console.log(`Downloading ${url}...`);

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download ${url}: HTTP ${response.statusCode}`);
    process.exit(1);
  }

  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    fs.writeFileSync(filename, data);
    console.log(`Successfully downloaded ${url} to ${filename} (${data.length} characters)`);
  });
}).on('error', (err) => {
  console.error(`Error downloading ${url}: ${err.message}`);
  process.exit(1);
});