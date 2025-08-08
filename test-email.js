const EmailService = require('./src/emailService');

async function testEmailSetup() {
    console.log('🧪 Testing Email Configuration');
    console.log('='.repeat(50));
    
    const emailService = new EmailService();
    
    // Test connection
    const isValid = await emailService.testEmailConfiguration();
    
    if (!isValid) {
        console.log('\n❌ Email test failed. Please check your .env configuration:');
        console.log('📧 Required variables:');
        console.log('   EMAIL_USER=your-email@gmail.com');
        console.log('   EMAIL_APP_PASSWORD=your-16-digit-app-password');
        console.log('   RECIPIENT_EMAIL=your-personal-email@gmail.com');
        console.log('\n💡 See EMAIL_SETUP.md for detailed instructions');
        process.exit(1);
    }
    
    // Send test email
    console.log('\n📧 Sending test email...');
    
    const testNews = {
        tech: {
            summary: "🧪 **Test Email from Your News Bot!**\n\nThis is a test to confirm your email setup is working correctly. If you're reading this, everything is configured properly!\n\n• Email delivery: ✅ Working\n• HTML formatting: ✅ Working\n• News integration: ✅ Ready",
            items: [{
                title: "Test Article - Email Configuration Successful",
                link: "https://github.com",
                source: "News Bot Test"
            }],
            count: 1
        },
        advice: {
            summary: "🎉 **Congratulations!** Your email setup is complete. You'll now receive daily tech news digests at 9:00 AM with beautiful HTML formatting, trending topics, and personalized insights.",
            items: [],
            count: 0
        }
    };
    
    const testTrending = [
        { topic: "email-setup", mentions: 1 },
        { topic: "news-bot", mentions: 1 },
        { topic: "testing", mentions: 1 }
    ];
    
    const emailSent = await emailService.sendNewsDigest(testNews, testTrending);
    
    if (emailSent) {
        console.log('\n✅ Test email sent successfully!');
        console.log('📱 Check your inbox for the test digest');
        console.log('🚀 Your news bot is ready to deliver daily updates');
    } else {
        console.log('\n❌ Failed to send test email');
        console.log('💡 Check EMAIL_SETUP.md for troubleshooting tips');
    }
    
    process.exit(0);
}

testEmailSetup();
