// script.js – Nepal + World News
const newsContainer = document.getElementById("news-container");
let cachedNepalNews = null;
let cachedWorldNews = null;
const CACHE_DURATION = 300000; // 5 minutes
const nepalCacheTime = { value: 0 };
const worldCacheTime = { value: 0 };

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Initialize dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Load Nepal news from OnlineKhabar with caching
async function loadNepalNews() {
    const now = Date.now();
    if (cachedNepalNews && (now - nepalCacheTime.value) < CACHE_DURATION) {
        return cachedNepalNews;
    }
    
    try {
        const response = await fetch('/.netlify/functions/getOnlineKhabar');
        const data = await response.json();
        cachedNepalNews = data.articles || [];
        nepalCacheTime.value = now;
        return cachedNepalNews;
    } catch (err) {
        console.error('Nepal news error:', err);
        return cachedNepalNews || [];
    }
}

// Load World news from NewsAPI with caching
async function loadWorldNews() {
    const now = Date.now();
    if (cachedWorldNews && (now - worldCacheTime.value) < CACHE_DURATION) {
        return cachedWorldNews;
    }
    
    try {
        const response = await fetch('/.netlify/functions/getNews?category=general');
        const data = await response.json();
        cachedWorldNews = data.articles || [];
        worldCacheTime.value = now;
        return cachedWorldNews;
    } catch (err) {
        console.error('World news error:', err);
        return cachedWorldNews || [];
    }
}

// Main function to load all news
async function loadAllNews() {
    if (newsContainer.innerHTML === "" || newsContainer.textContent === "Loading news...") {
        newsContainer.innerHTML = "<div class='loading'>Loading news...</div>";
    }
    
    const [nepalArticles, worldArticles] = await Promise.all([
        loadNepalNews(),
        loadWorldNews()
    ]);
    
    displayNews(nepalArticles, worldArticles);
}

// Display both sections with document fragment for better performance
function displayNews(nepalArticles, worldArticles) {
    const fragment = document.createDocumentFragment();
    newsContainer.innerHTML = "";
    
    // Nepal Section
    if (nepalArticles.length > 0) {
        const nepalSection = document.createElement('h2');
        nepalSection.textContent = '🇳🇵 नेपाल समाचार (Nepal News)';
        nepalSection.className = 'section-header';
        fragment.appendChild(nepalSection);
        
        nepalArticles.forEach(article => {
            const card = createNewsCard(article);
            fragment.appendChild(card);
        });
    }
    
    // World Section
    if (worldArticles.length > 0) {
        const worldSection = document.createElement('h2');
        worldSection.textContent = '🌍 World News';
        worldSection.className = 'section-header';
        fragment.appendChild(worldSection);
        
        worldArticles.slice(0, 6).forEach(article => {
            const card = createNewsCard(article);
            fragment.appendChild(card);
        });
    }
    
    if (nepalArticles.length === 0 && worldArticles.length === 0) {
        newsContainer.innerHTML = "<p class='no-news'>No news found. Please try again later.</p>";
    } else {
        newsContainer.appendChild(fragment);
    }
}

// Helper to create a news card with optimized DOM creation
function createNewsCard(article) {
    const card = document.createElement("div");
    card.className = "news-card";
    
    const imageHtml = article.image || article.urlToImage;
    
    if (imageHtml) {
        const img = document.createElement('img');
        img.src = imageHtml;
        img.style.cssText = 'width:100%;height:150px;object-fit:cover;border-radius:4px;margin-bottom:10px;';
        img.loading = 'lazy';
        card.appendChild(img);
    }
    
    const title = document.createElement('h3');
    title.innerHTML = `${article.title} <span class="hot-badge">🔥</span>`;
    card.appendChild(title);
    
    const excerpt = article.excerpt || article.description || "";
    if (excerpt) {
        const p = document.createElement('p');
        p.textContent = excerpt;
        card.appendChild(p);
    }
    
    const source = document.createElement('p');
    source.innerHTML = `<strong>Source:</strong> ${article.source || article.source?.name || 'OnlineKhabar'}`;
    card.appendChild(source);
    
    const link = document.createElement('a');
    link.href = article.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Read Full Article →';
    card.appendChild(link);
    
    return card;
}

// Auto-refresh every 10 minutes
setInterval(() => loadAllNews(), 600000);

// Initial load when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllNews);
} else {
    loadAllNews();
}
