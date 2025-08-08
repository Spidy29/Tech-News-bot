const NewsBot = require('./src/newsBot');

async function runQuickTest() {
    console.log('🧪 Quick News Bot Test');
    console.log('='.repeat(50));
    
    try {
        const bot = new NewsBot();
        await bot.generateDailyDigest();
        
        console.log('\n✅ Test completed successfully!');
        console.log('📅 To run the scheduled version, use: npm start');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    
    process.exit(0);
}

runQuickTest();
