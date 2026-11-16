
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, "articles.json");

app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

// Create articles file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
}

// Read articles
function getArticles() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Save articles
function saveArticles(articles) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
}

// Get all articles
app.get("/api/articles", (req, res) => {
    res.json(getArticles());
});

// Publish an article
app.post("/api/articles", (req, res) => {
    const { author, title, image, content } = req.body;

    if (!author || !title || !content) {
        return res.status(400).json({
            error: "Author, title and content are required."
        });
    }

    const articles = getArticles();

    const newArticle = {
        id: Date.now().toString(),
        author,
        title,
        image: image || "",
        content,
        publishedAt: new Date().toISOString()
    };

    articles.unshift(newArticle);
    saveArticles(articles);

    res.status(201).json(newArticle);
});

// Delete an article
app.delete("/api/articles/:id", (req, res) => {
    const articles = getArticles();

    const updated = articles.filter(
        article => String(article.id) !== String(req.params.id)
    );

    if (updated.length === articles.length) {
        return res.status(404).json({
            error: "Article not found."
        });
    }

    saveArticles(updated);

    res.json({ message: "Article deleted successfully." });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Teal Spotlight running on port ${PORT}`);
});
