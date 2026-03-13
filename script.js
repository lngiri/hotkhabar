// Keys
const NEWS_API_KEY = "9bd5c113fbd44cd582862e16c5d9f05c";
const OPENAI_API_KEY = "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";

const newsContainer = document.getElementById("news-container");

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

// Load News
async function loadNews(category="general") {
    newsContainer.innerHTML = "Loading news...";
    let url = `https://newsapi.org/v2/top-headlines?country=np&category=${category}&apiKey=${NEWS_API_KEY}`;
    
    if(category === "last5min"){
        const now = new Date();
        const fiveMinAgo = new Date(now.getTime() - 5*60000).toISOString();
        url = `https://newsapi.org/v2/everything?q=Nepal&from=${fiveMinAgo}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    displayNews(data.articles);
}

// Display News
async function displayNews(articles){
    newsContainer.innerHTML = "";
    for(let article of articles){
        const summary = await getAISummary(article.content || article.description || "");
        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <h3>${article.title} <span class="hot-badge">🔥</span></h3>
            <p>${article.description || ""}</p>
            <p><em>${summary}</em></p>
            <p>Source: ${article.source.name}</p>
            <a href="${article.url}" target="_blank">Read Full Article →</a>
        `;
        newsContainer.appendChild(card);
    }
}

// AI Summary Function
async function getAISummary(text){
    if(!text) return "";
    try{
        const res = await fetch("https://api.openai.com/v1/completions", {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: `Summarize this news in 3 lines: ${text}`,
                max_tokens: 60
            })
        });
        const data = await res.json();
        return data.choices[0].text.trim();
    }catch(err){
        return "";
    }
}

// Auto Refresh every 5 min
setInterval(() => loadNews(), 300000);

// Initial load
loadNews();
