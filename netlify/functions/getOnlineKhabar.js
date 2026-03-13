// netlify/functions/getOnlineKhabar.js
const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
  try {
    // Fetch the OnlineKhabar homepage
    const response = await axios.get('https://onlinekhabar.com');
    const html = response.data;
    
    // Load HTML into cheerio for parsing
    const $ = cheerio.load(html);
    const articles = [];
    
    // OnlineKhabar's article structure - these selectors may need adjustment
    // Based on the structure, we'll look for common article patterns
    $('article').each((i, el) => {
      if (i < 10) { // Limit to 10 articles
        const title = $(el).find('h2 a, h3 a, .title a').first().text().trim();
        const url = $(el).find('a').first().attr('href');
        const image = $(el).find('img').first().attr('src');
        const excerpt = $(el).find('p').first().text().trim();
        
        if (title && url) {
          articles.push({
            title,
            url: url.startsWith('http') ? url : `https://onlinekhabar.com${url}`,
            image: image || '',
            excerpt: excerpt || '',
            source: 'OnlineKhabar'
          });
        }
      }
    });
    
    // If no articles found with the above selector, try alternative
    if (articles.length === 0) {
      $('.list-post, .post-item, .news-item').each((i, el) => {
        if (i < 10) {
          const title = $(el).find('a').first().text().trim();
          const url = $(el).find('a').first().attr('href');
          
          if (title && url) {
            articles.push({
              title,
              url: url.startsWith('http') ? url : `https://onlinekhabar.com${url}`,
              source: 'OnlineKhabar'
            });
          }
        }
      });
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ articles })
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from OnlineKhabar' })
    };
  }
};
