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

    // Process news with enhanced AI analysis
    async processNewsWithAI(allNews, trendingTopics) {
        const processedCategories = {};

        // Process each category
        for (const [category, articles] of Object.entries(allNews)) {
            if (articles.length > 0) {
                console.log(`🔍 Analyzing ${category} news...`);
                try {
                    const summary = await this.aiService.generateCategorySummary(category, articles);
                    processedCategories[category] = {
                        summary: summary,
                        items: articles,
                        count: articles.length
                    };
                } catch (error) {
                    console.error(`Error processing ${category}:`, error.message);
                }
            }
        }

        // Generate additional insights
        console.log('💡 Generating insights and recommendations...');
        try {
            processedCategories.advice = {
                summary: await this.aiService.generateDeveloperAdvice(),
                items: [],
                count: 0
            };

            processedCategories.future = {
                summary: await this.aiService.generateFutureInsights(),
                items: [],
                count: 0
            };

            processedCategories.trending = {
                summary: await this.aiService.generateTrendingAnalysis(trendingTopics),
                items: [],
                count: trendingTopics.length
            };

            processedCategories.recommendations = {
                summary: await this.aiService.generatePersonalizedRecommendations(allNews),
                items: [],
                count: 0
            };
        } catch (error) {
            console.error('Error generating insights:', error.message);
        }

        return processedCategories;
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
