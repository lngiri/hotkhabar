// script.js – now using Netlify Function
const newsContainer = document.getElementById("news-container");

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

async function loadNews(category = "general") {
    newsContainer.innerHTML = "Loading news...";
    try {
        // Call our own function (relative URL)
        const response = await fetch(`/.netlify/functions/getNews?category=${category}`);
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = "No news found.";
        }
    } catch (err) {
        newsContainer.innerHTML = "Error loading news.";
        console.error(err);
    }
}

async function displayNews(articles) {
    newsContainer.innerHTML = "";
    const articlesToShow = articles.slice(0, 5); // show first 5

    for (let article of articlesToShow) {
        // We'll skip AI summary for now to keep it simple
        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <h3>${article.title} <span class="hot-badge">🔥</span></h3>
            <p>${article.description || ""}</p>
            <p><strong>Source:</strong> ${article.source.name}</p>
            <a href="${article.url}" target="_blank">Read Full Article →</a>
        `;
        newsContainer.appendChild(card);
    }
}

// Auto-refresh every 5 minutes
setInterval(() => loadNews(), 300000);

// Initial load
loadNews();
