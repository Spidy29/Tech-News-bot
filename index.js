const NewsBot = require('./src/newsBot');

async function main() {
    console.log('🚀 Starting Tech News Bot...');
    console.log('📧 Designed for Backend Developers');
    console.log('⏰ Daily delivery at 9:00 AM\n');

    try {
        const bot = new NewsBot();
        bot.startScheduler();
        
        // Keep the process running
        process.on('SIGINT', () => {
            console.log('\n👋 Shutting down news bot gracefully...');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Failed to start news bot:', error.message);
        console.error('Please check your .env file and ensure GEMINI_API_KEY is set correctly.');
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main();
