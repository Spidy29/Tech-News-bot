const axios = require('axios');
const config = require('./config');

class NewsService {
    constructor() {
        this.sources = {
            tech: [
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TechCrunch',
                'https://api.rss2json.com/v1/api.json?rss_url=https://www.wired.com/feed/rss',
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.arstechnica.com/arstechnica/technology-lab',
                'https://api.rss2json.com/v1/api.json?rss_url=https://stackoverflow.blog/feed/',
                'https://api.rss2json.com/v1/api.json?rss_url=https://dev.to/feed'
            ],
            security: [
                'https://api.rss2json.com/v1/api.json?rss_url=https://krebsonsecurity.com/feed/',
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews',
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/SecurityWeek',
                'https://api.rss2json.com/v1/api.json?rss_url=https://blog.malwarebytes.com/feed/'
            ],
            ai: [
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/venturebeat/SZYF',
                'https://api.rss2json.com/v1/api.json?rss_url=https://blogs.nvidia.com/feed/',
                'https://api.rss2json.com/v1/api.json?rss_url=https://openai.com/blog/rss.xml',
                'https://api.rss2json.com/v1/api.json?rss_url=https://research.google/rss.xml'
            ],
            frameworks: [
                'https://api.rss2json.com/v1/api.json?rss_url=https://blog.npmjs.org/rss',
                'https://api.rss2json.com/v1/api.json?rss_url=https://nodejs.org/en/feed/blog.xml',
                'https://api.rss2json.com/v1/api.json?rss_url=https://reactjs.org/feed.xml',
                'https://api.rss2json.com/v1/api.json?rss_url=https://blog.angular.io/feed'
            ],
            global: [
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/rss.xml',
                'https://api.rss2json.com/v1/api.json?rss_url=https://rss.cnn.com/rss/edition.rss',
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.reuters.com/reuters/technologyNews'
            ]
        };
    }

    async fetchCategoryNews(category) {
        const sources = this.sources[category] || [];
        const news = [];
        
        for (const source of sources) {
            try {
                const response = await axios.get(source, { 
                    timeout: config.sources.timeout,
                    headers: {
                        'User-Agent': 'NewsBot/1.0'
                    }
                });
                
                if (response.data && response.data.items) {
                    const items = response.data.items
                        .slice(0, config.sources.maxItemsPerCategory)
                        .map(item => ({
                            title: this.cleanText(item.title),
                            description: this.cleanText(item.description),
                            link: item.link,
                            pubDate: item.pubDate,
                            category: category,
                            source: response.data.feed?.title || 'Unknown Source',
                            relevanceScore: this.calculateRelevance(item, category)
                        }))
                        .filter(item => item.relevanceScore > 0.3); // Filter relevant items
                    
                    news.push(...items);
                }
            } catch (error) {
                console.log(`⚠️ Could not fetch from ${category} source: ${error.message}`);
            }
        }
        
        // Sort by relevance and recency
        return news
            .sort((a, b) => {
                const scoreA = a.relevanceScore + (new Date(a.pubDate) / 1000000000); // Recent boost
                const scoreB = b.relevanceScore + (new Date(b.pubDate) / 1000000000);
                return scoreB - scoreA;
            })
            .slice(0, 5); // Top 5 most relevant
    }

    calculateRelevance(item, category) {
        const categoryConfig = config.categories[category];
        if (!categoryConfig || !categoryConfig.keywords) return 0.5;
        
        const text = `${item.title} ${item.description}`.toLowerCase();
        let score = 0;
        
        // Check for category keywords
        categoryConfig.keywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
                score += 0.3;
            }
        });
        
        // Check for developer-specific terms
        config.developer.focusAreas.forEach(area => {
            if (text.includes(area.toLowerCase())) {
                score += 0.2;
            }
        });
        
        // Check for preferred languages
        config.developer.preferredLanguages.forEach(lang => {
            if (text.includes(lang.toLowerCase())) {
                score += 0.15;
            }
        });
        
        // Boost recent articles
        const daysSincePublished = (Date.now() - new Date(item.pubDate)) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 1) score += 0.2;
        else if (daysSincePublished < 3) score += 0.1;
        
        return Math.min(score, 1.0); // Cap at 1.0
    }

    cleanText(text) {
        if (!text) return '';
        
        // Remove HTML tags
        text = text.replace(/<[^>]*>/g, '');
        
        // Decode HTML entities
        text = text.replace(/&nbsp;/g, ' ')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
        
        // Clean up extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    async getAllNews() {
        const allNews = {};
        const categories = Object.keys(config.categories).filter(cat => config.categories[cat].enabled);
        
        console.log(`📡 Fetching news from ${categories.length} categories...`);
        
        const promises = categories.map(async (category) => {
            try {
                const news = await this.fetchCategoryNews(category);
                allNews[category] = news;
                console.log(`✅ ${category}: ${news.length} articles`);
            } catch (error) {
                console.log(`❌ ${category}: Failed to fetch`);
                allNews[category] = [];
            }
        });
        
        await Promise.all(promises);
        
        return allNews;
    }

    // Get trending topics across all categories
    getTrendingTopics(allNews) {
        const topicCounts = {};
        
        Object.values(allNews).flat().forEach(article => {
            const words = `${article.title} ${article.description}`
                .toLowerCase()
                .match(/\b\w{4,}\b/g) || []; // Words with 4+ characters
            
            words.forEach(word => {
                if (!this.isStopWord(word)) {
                    topicCounts[word] = (topicCounts[word] || 0) + 1;
                }
            });
        });
        
        return Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ topic: word, mentions: count }));
    }

    isStopWord(word) {
        const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'way', 'too', 'any', 'few', 'use', 'her', 'own', 'say', 'she', 'how', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'water', 'been', 'call', 'who', 'come', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'];
        return stopWords.includes(word);
    }
}

module.exports = NewsService;
