const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Basic scraping function
async function scrapeWebsite(url) {
    try {
        // 1. Fetch the webpage
        const response = await axios.get('https://competitie.vttl.be/?menu=6&sel=91111&result=1&category=1');
        const html = response.data;
        
        // 2. Load HTML into cheerio
        const $ = cheerio.load(html);
        
        // 3. Find and extract data
        const data = [];
        
        // 4. Use selectors to find elements
        $('div[style*="font-size: 175%"]').each((index, element) => {
            data.push($(element).text());
        });

        $('div[style*="font-size: 210%"]').each((index, element) => {
            data.push($(element).text());
        });

        $('.DBTable_first .badge_left').each((index,element) => {
            data.push($(element).text());
        })
        
        return data;
    } catch (error) {
        console.error('Error scraping:', error);
        return [];
    }
}

const server = http.createServer(async (req, res) => {
    // First, check for API endpoint
    if (req.url === '/api/scrape') {
        const scrapedData = await scrapeWebsite();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(scrapedData));
        return;
    }

    // Then handle file requests
    let filePath = req.url;
    if (filePath === '/') {
        filePath = '/index.html';
    }

    // Add the current directory to the file path
    filePath = path.join(__dirname, filePath);

    // Read the requested file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            // If file not found
            res.writeHead(404);
            res.end('Page not found');
            return;
        }

        // If file found, serve it
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

console.log('Current directory:', __dirname); 