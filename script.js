// script.js – Nepal + World News
const newsContainer = document.getElementById("news-container");

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

// Load Nepal news from OnlineKhabar
async function loadNepalNews() {
    try {
        const response = await fetch('/.netlify/functions/getOnlineKhabar');
        const data = await response.json();
        return data.articles || [];
    } catch (err) {
        console.error('Nepal news error:', err);
        return [];
    }
}

// Load World news from NewsAPI
async function loadWorldNews() {
    try {
        const response = await fetch('/.netlify/functions/getNews?category=general');
        const data = await response.json();
        return data.articles || [];
    } catch (err) {
        console.error('World news error:', err);
        return [];
    }
}

// Main function to load all news
async function loadAllNews() {
    newsContainer.innerHTML = "Loading news...";
    
    const [nepalArticles, worldArticles] = await Promise.all([
        loadNepalNews(),
        loadWorldNews()
    ]);
    
    displayNews(nepalArticles, worldArticles);
}

// Display both sections
function displayNews(nepalArticles, worldArticles) {
    newsContainer.innerHTML = "";
    
    // Nepal Section
    if (nepalArticles.length > 0) {
        const nepalSection = document.createElement('h2');
        nepalSection.textContent = '🇳🇵 नेपाल समाचार (Nepal News)';
        nepalSection.style.gridColumn = '1 / -1';
        nepalSection.style.margin = '20px 0 10px';
        newsContainer.appendChild(nepalSection);
        
        nepalArticles.forEach(article => {
            const card = createNewsCard(article);
            newsContainer.appendChild(card);
        });
    }
    
    // World Section
    if (worldArticles.length > 0) {
        const worldSection = document.createElement('h2');
        worldSection.textContent = '🌍 World News';
        worldSection.style.gridColumn = '1 / -1';
        worldSection.style.margin = '30px 0 10px';
        newsContainer.appendChild(worldSection);
        
        worldArticles.slice(0, 6).forEach(article => {
            const card = createNewsCard(article);
            newsContainer.appendChild(card);
        });
    }
    
    if (nepalArticles.length === 0 && worldArticles.length === 0) {
        newsContainer.innerHTML = "No news found. Please try again later.";
    }
}

// Helper to create a news card
function createNewsCard(article) {
    const card = document.createElement("div");
    card.className = "news-card";
    
    let imageHtml = '';
    if (article.image || article.urlToImage) {
        imageHtml = `<img src="${article.image || article.urlToImage}" style="width:100%; height:150px; object-fit:cover; border-radius:4px; margin-bottom:10px;">`;
    }
    
    card.innerHTML = `
        ${imageHtml}
        <h3>${article.title} <span class="hot-badge">🔥</span></h3>
        <p>${article.excerpt || article.description || ""}</p>
        <p><strong>Source:</strong> ${article.source || article.source?.name || 'OnlineKhabar'}</p>
        <a href="${article.url}" target="_blank">Read Full Article →</a>
    `;
    return card;
}

// Auto-refresh every 10 minutes
setInterval(() => loadAllNews(), 600000);

// Initial load
loadAllNews();
