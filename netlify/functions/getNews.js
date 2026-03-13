// netlify/functions/getNews.js
const NEWS_API_KEY = "9bd5c113fbd44cd582862e16c5d9f05c"; // your key

exports.handler = async function(event, context) {
  const category = event.queryStringParameters.category || 'general';
  
  let url = `https://newsapi.org/v2/top-headlines?country=np&category=${category}&apiKey=${NEWS_API_KEY}`;
  
  if (category === 'last5min') {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString();
    url = `https://newsapi.org/v2/everything?q=Nepal&from=${fiveMinAgo}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch news" })
    };
  }
};
