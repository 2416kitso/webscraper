const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

// Get the target URL from the command line arguments
const targetUrl = process.argv[2];

// Function to fetch HTML content of a URL
async function fetchHTML(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return null;
  }
}

// Function to convert relative URLs to absolute URLs
function getAbsoluteURL(baseUrl, relativeUrl) {
  const url = new URL(relativeUrl, baseUrl);
  return url.href;
}

// Function to scrape links from HTML content
function scrapeLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  
  const links = new Map(); // Using a Map to store links and their counts

  // Scrape links
  $('a').each((index, element) => {
    const href = $(element).attr('href');
    if (href && !href.startsWith('#')) { // Exclude anchor links
      const absoluteUrl = getAbsoluteURL(baseUrl, href);
      if (links.has(absoluteUrl)) {
        links.set(absoluteUrl, links.get(absoluteUrl) + 1);
      } else {
        links.set(absoluteUrl, 1);
      }
    }
  });

  return links;
}

// Main function
(async () => {
  if (!targetUrl) {
    console.error('Please provide a target URL.');
    return;
  }

  const html = await fetchHTML(targetUrl);
  if (!html) {
    return;
  }

  const baseUrl = new URL(targetUrl).origin;
  const links = scrapeLinks(html, baseUrl);

  console.log('Unique links and their counts:');
  links.forEach((count, link) => {
    console.log(`${link} (Counts: ${count})`);
  });
})();
