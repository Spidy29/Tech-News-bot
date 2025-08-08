const cron = require('node-cron');
const NewsService = require('./newsService');
const AIService = require('./aiService');
const config = require('./config');
require('dotenv').config();

class NewsBot {
    constructor() {
        this.newsService = new NewsService();
        this.aiService = new AIService();
        this.newsCategories = {
            tech: 'Technology and Programming',
            security: 'Cybersecurity Updates',
            ai: 'Artificial Intelligence',
            global: 'Global News',
            frameworks: 'Development Frameworks',
            advice: 'Developer Career Advice',
            future: 'Future Technology Trends'
        };
    }

    // Schedule daily news at 9 AM
    startScheduler() {
        console.log('📅 News bot scheduler started! Daily news will be delivered at 9:00 AM');
        
        // Run at 9:00 AM every day
        cron.schedule(config.schedule.dailyDigest, () => {
            console.log('🌅 Good morning! Generating your daily news digest...');
            this.generateDailyDigest();
        });

        // For testing - run immediately
        console.log('🧪 Running test digest now...');
        this.generateDailyDigest();
    }

    // Main function to generate daily news digest
    async generateDailyDigest() {
        try {
            console.log('📰 Fetching latest news from multiple sources...');
            
            const allNews = await this.newsService.getAllNews();
            const trendingTopics = this.newsService.getTrendingTopics(allNews);
            
            console.log('🤖 Processing news with AI analysis...');
            const processedNews = await this.processNewsWithAI(allNews, trendingTopics);
            
            await this.formatAndDisplayNews(processedNews, trendingTopics);
            
        } catch (error) {
            console.error('❌ Error generating daily digest:', error.message);
            await this.displayErrorFallback();
        }
    }

    // Fetch news from multiple sources
    async fetchNewsFromMultipleSources() {
        const sources = [
            this.fetchTechNews(),
            this.fetchSecurityNews(),
            this.fetchAINews(),
            this.fetchGlobalNews(),
            this.fetchFrameworkUpdates()
        ];

        try {
            const results = await Promise.allSettled(sources);
            return results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value)
                .flat();
        } catch (error) {
            console.error('Error fetching news:', error.message);
            return [];
        }
    }

    // Fetch technology news
    async fetchTechNews() {
        const techSources = [
            'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TechCrunch',
            'https://api.rss2json.com/v1/api.json?rss_url=https://www.wired.com/feed/rss',
            'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.arstechnica.com/arstechnica/technology-lab'
        ];

        const news = [];
        for (const source of techSources) {
            try {
                const response = await axios.get(source, { timeout: 10000 });
                if (response.data.items) {
                    news.push(...response.data.items.slice(0, 3).map(item => ({
                        title: item.title,
                        description: item.description,
                        link: item.link,
                        category: 'tech',
                        source: response.data.feed?.title || 'Tech News'
                    })));
                }
            } catch (error) {
                console.log(`⚠️ Could not fetch from tech source: ${error.message}`);
            }
        }
        return news;
    }

    // Fetch security news
    async fetchSecurityNews() {
        const securitySources = [
            'https://api.rss2json.com/v1/api.json?rss_url=https://krebsonsecurity.com/feed/',
            'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews'
        ];

        const news = [];
        for (const source of securitySources) {
            try {
                const response = await axios.get(source, { timeout: 10000 });
                if (response.data.items) {
                    news.push(...response.data.items.slice(0, 2).map(item => ({
                        title: item.title,
                        description: item.description,
                        link: item.link,
                        category: 'security',
                        source: response.data.feed?.title || 'Security News'
                    })));
                }
            } catch (error) {
                console.log(`⚠️ Could not fetch from security source: ${error.message}`);
            }
        }
        return news;
    }

    // Fetch AI news
    async fetchAINews() {
        const aiSources = [
            'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/venturebeat/SZYF',
            'https://api.rss2json.com/v1/api.json?rss_url=https://blogs.nvidia.com/feed/'
        ];

        const news = [];
        for (const source of aiSources) {
            try {
                const response = await axios.get(source, { timeout: 10000 });
                if (response.data.items) {
                    news.push(...response.data.items.slice(0, 2).map(item => ({
                        title: item.title,
                        description: item.description,
                        link: item.link,
                        category: 'ai',
                        source: response.data.feed?.title || 'AI News'
                    })));
                }
            } catch (error) {
                console.log(`⚠️ Could not fetch from AI source: ${error.message}`);
            }
        }
        return news;
    }

    // Fetch global news
    async fetchGlobalNews() {
        const globalSources = [
            'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/rss.xml',
            'https://api.rss2json.com/v1/api.json?rss_url=https://rss.cnn.com/rss/edition.rss'
        ];

        const news = [];
        for (const source of globalSources) {
            try {
                const response = await axios.get(source, { timeout: 10000 });
                if (response.data.items) {
                    news.push(...response.data.items.slice(0, 3).map(item => ({
                        title: item.title,
                        description: item.description,
                        link: item.link,
                        category: 'global',
                        source: response.data.feed?.title || 'Global News'
                    })));
                }
            } catch (error) {
                console.log(`⚠️ Could not fetch from global source: ${error.message}`);
            }
        }
        return news;
    }

    // Fetch framework updates
    async fetchFrameworkUpdates() {
        const frameworkSources = [
            'https://api.rss2json.com/v1/api.json?rss_url=https://dev.to/feed',
            'https://api.rss2json.com/v1/api.json?rss_url=https://blog.npmjs.org/rss'
        ];

        const news = [];
        for (const source of frameworkSources) {
            try {
                const response = await axios.get(source, { timeout: 10000 });
                if (response.data.items) {
                    news.push(...response.data.items.slice(0, 2).map(item => ({
                        title: item.title,
                        description: item.description,
                        link: item.link,
                        category: 'frameworks',
                        source: response.data.feed?.title || 'Framework News'
                    })));
                }
            } catch (error) {
                console.log(`⚠️ Could not fetch from framework source: ${error.message}`);
            }
        }
        return news;
    }

    // Process news with Gemini AI
    async processNewsWithGemini(newsItems) {
        if (!newsItems || newsItems.length === 0) {
            return await this.generateBackupContent();
        }

        const categorizedNews = this.categorizeNews(newsItems);
        const processedCategories = {};

        for (const [category, items] of Object.entries(categorizedNews)) {
            if (items.length > 0) {
                try {
                    const prompt = this.createCategoryPrompt(category, items);
                    const result = await this.model.generateContent(prompt);
                    const response = await result.response;
                    processedCategories[category] = {
                        summary: response.text(),
                        items: items
                    };
                } catch (error) {
                    console.error(`Error processing ${category} with Gemini:`, error.message);
                    processedCategories[category] = {
                        summary: `Summary not available for ${category}`,
                        items: items
                    };
                }
            }
        }

        // Generate advice and future insights
        processedCategories.advice = await this.generateAdvice();
        processedCategories.future = await this.generateFutureInsights();

        return processedCategories;
    }

    // Categorize news items
    categorizeNews(newsItems) {
        const categorized = {
            tech: [],
            security: [],
            ai: [],
            global: [],
            frameworks: []
        };

        newsItems.forEach(item => {
            if (categorized[item.category]) {
                categorized[item.category].push(item);
            }
        });

        return categorized;
    }

    // Create category-specific prompts for Gemini
    createCategoryPrompt(category, items) {
        const newsText = items.map(item => `Title: ${item.title}\nDescription: ${item.description}\n`).join('\n');
        
        const prompts = {
            tech: `Analyze these technology news items and provide a concise summary highlighting the most important developments for backend developers. Focus on practical implications:\n\n${newsText}`,
            security: `Analyze these cybersecurity news items and provide a summary with actionable insights for developers. Highlight any critical vulnerabilities or security practices:\n\n${newsText}`,
            ai: `Analyze these AI/ML news items and provide a summary focusing on practical applications and tools that backend developers should know about:\n\n${newsText}`,
            global: `Analyze these global news items and provide a brief summary focusing on events that might impact the tech industry or global economy:\n\n${newsText}`,
            frameworks: `Analyze these framework and development news items. Highlight important updates, new releases, or changes that backend developers should be aware of:\n\n${newsText}`
        };

        return prompts[category] || `Summarize these news items:\n\n${newsText}`;
    }

    // Generate advice for developers
    async generateAdvice() {
        const prompt = `As an experienced backend developer mentor, provide 3-4 practical career advice tips for today. Focus on current industry trends, skill development, and professional growth. Make it actionable and relevant for ${new Date().toDateString()}.`;
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return { summary: response.text(), items: [] };
        } catch (error) {
            return { 
                summary: "• Stay updated with latest tech trends\n• Practice system design regularly\n• Build side projects\n• Network with other developers", 
                items: [] 
            };
        }
    }

    // Generate future insights
    async generateFutureInsights() {
        const prompt = `Provide insights about future technology trends and opportunities for backend developers in 2025. Focus on emerging technologies, market demands, and skills that will be valuable. Keep it practical and forward-looking.`;
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return { summary: response.text(), items: [] };
        } catch (error) {
            return { 
                summary: "• Cloud-native development will continue growing\n• AI integration in backend systems\n• Microservices and containerization\n• Focus on scalability and performance", 
                items: [] 
            };
        }
    }

    // Generate backup content when news fetch fails
    async generateBackupContent() {
        const prompt = `Generate a comprehensive daily tech digest for a backend developer including:
        1. Current technology trends
        2. Security best practices
        3. AI/ML developments
        4. Framework updates
        5. Career advice
        6. Future technology insights
        
        Make it informative and practical for ${new Date().toDateString()}.`;
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return {
                general: { summary: response.text(), items: [] }
            };
        } catch (error) {
            return {
                general: { 
                    summary: "Daily tech digest temporarily unavailable. Please check your internet connection and Gemini API key.", 
                    items: [] 
                }
            };
        }
    }

    // Format and display the news
    async formatAndDisplayNews(processedNews) {
        console.log('\n' + '='.repeat(80));
        console.log('📰 DAILY TECH NEWS DIGEST - ' + new Date().toDateString());
        console.log('='.repeat(80));

        const categoryIcons = {
            tech: '💻',
            security: '🔒',
            ai: '🤖',
            global: '🌍',
            frameworks: '⚛️',
            advice: '💡',
            future: '🔮'
        };

        const categoryTitles = {
            tech: 'TECHNOLOGY NEWS',
            security: 'SECURITY UPDATES',
            ai: 'AI & MACHINE LEARNING',
            global: 'GLOBAL NEWS',
            frameworks: 'FRAMEWORK UPDATES',
            advice: 'DEVELOPER ADVICE',
            future: 'FUTURE INSIGHTS'
        };

        for (const [category, data] of Object.entries(processedNews)) {
            if (data && data.summary) {
                console.log(`\n${categoryIcons[category] || '📌'} ${categoryTitles[category] || category.toUpperCase()}`);
                console.log('-'.repeat(50));
                console.log(data.summary);
                
                if (data.items && data.items.length > 0) {
                    console.log('\n📎 Sources:');
                    data.items.forEach((item, index) => {
                        console.log(`  ${index + 1}. ${item.title}`);
                        console.log(`     🔗 ${item.link}`);
                    });
                }
                console.log('');
            }
        }

        console.log('='.repeat(80));
        console.log('✨ That\'s your daily digest! Have a great day coding! ');
        console.log('='.repeat(80));
    }
}

module.exports = NewsBot;
