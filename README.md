# Manus.im Content Extractor

## Security Analysis: Manus.im External Resource Vulnerability

## Overview
This repository contains a local copy of external resources from the Manus.im website that were publicly accessible without authentication. These resources include CSS files, JavaScript chunks, and media assets that are essential for the website's functionality.

## Security Vulnerability

### Issue Description
The Manus.im website was hosting static assets (CSS, JavaScript, and media files) on a public CDN (files.manuscdn.com) without proper access controls. This allowed anyone to:

1. Download all frontend assets without authentication
2. Analyze the website's frontend code structure
3. Potentially reverse-engineer business logic from JavaScript chunks
4. Access branding assets and other media files

### Risk Assessment
While these assets are typically considered "public" in web applications, the issue lies in the lack of:
- Access controls or rate limiting
- Asset obfuscation for sensitive business logic
- Proper content security policies

## Content Extraction Process

### Files Downloaded
- **14 CSS files** - Styling assets for the website interface
- **40 JavaScript chunk files** - Core application logic split into chunks by Next.js
- **1 media file** - The ogBanner.png image used for social sharing
- **1 HTML file** - The main page HTML that references all external resources

### Extraction Method
We used a Node.js script (`download_resources.js`) to:
1. Parse the main HTML file for external resource URLs
2. Identify resources hosted on files.manuscdn.com
3. Download all identified resources and organize them by type
4. Maintain the original file structure and naming conventions

## Solution and Recommendations

### For Website Owners
1. **Implement access controls** - Use signed URLs or authentication for sensitive assets
2. **Add rate limiting** - Prevent bulk downloading of assets
3. **Obfuscate sensitive code** - Minify and obfuscate JavaScript chunks containing business logic
4. **Use Content Security Policy (CSP)** - Restrict where resources can be loaded from
5. **Regular security audits** - Periodically review publicly accessible assets

### For This Repository
All external dependencies have been localized, making the website functional without requiring external connections. This approach:
- Improves loading times by reducing external requests
- Increases privacy by preventing tracking to external services
- Provides offline access to the core website functionality

## File Structure
```
├── css/              # 14 CSS files
├── media/            # 1 media file (ogBanner.png)
├── js/               # 40 JavaScript chunk files
├── manus.html        # Main HTML file
└── download_resources.js  # Script used for extraction
```

## Ethical Considerations
This extraction was performed for educational and security research purposes. The files are hosted publicly and can be accessed by anyone with basic web development knowledge. The intention is to highlight potential security improvements rather than exploit vulnerabilities.

## Responsible Disclosure
If you are a representative of Manus.im and would like this repository modified or removed, please contact the creator through appropriate channels.


