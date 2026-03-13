// ⚠️ WARNING: API keys are exposed in frontend code (visible to everyone).
// For production, move them to a backend (Netlify Functions) to keep them secret.
const NEWS_API_KEY = "9bd5c113fbd44cd582862e16c5d9f05c";
const GEMINI_API_KEY = "AIzaSyD2Exnc88xLKhx80L-AaAAFnpMshOYkVqg";

const newsContainer = document.getElementById("news-container");

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

// Load news based on category
async function loadNews(category = "general") {
    newsContainer.innerHTML = "Loading news...";
    let url = `https://newsapi.org/v2/top-headlines?country=np&category=${category}&apiKey=${NEWS_API_KEY}`;

    // Special handling for "last5min" category
    if (category === "last5min") {
        const now = new Date();
        const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString();
        url = `https://newsapi.org/v2/everything?q=Nepal&from=${fiveMinAgo}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = "No news found.";
        }
    } catch (err) {
        newsContainer.innerHTML = "Error loading news. Please try again later.";
        console.error(err);
    }
}

// Display news articles with Gemini summaries
async function displayNews(articles) {
    newsContainer.innerHTML = "";

    // Limit to first 5 articles to avoid too many API calls
    const articlesToShow = articles.slice(0, 5);

    for (let article of articlesToShow) {
        // Get summary from Gemini (or fallback)
        const textToSummarize = article.content || article.description || article.title;
        const summary = await getGeminiSummary(textToSummarize);

        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <h3>${article.title} <span class="hot-badge">🔥</span></h3>
            <p>${article.description || ""}</p>
            <p><em>${summary}</em></p>
            <p><strong>Source:</strong> ${article.source.name}</p>
            <a href="${article.url}" target="_blank">Read Full Article →</a>
        `;
        newsContainer.appendChild(card);
    }
}

// Call Gemini API to summarize text
async function getGeminiSummary(text) {
    if (!text) return "No summary available.";

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Summarize this news article in 2-3 lines: ${text}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        // Extract the summary from Gemini's response
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Summary not available.";
        }
    } catch (err) {
        console.error("Gemini API error:", err);
        return "Summary error.";
    }
}

// Auto-refresh every 5 minutes (300000 ms)
setInterval(() => loadNews(), 300000);

// Initial load
loadNews();
