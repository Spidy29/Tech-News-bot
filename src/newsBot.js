const cron = require("node-cron");
const NewsService = require("./newsService");
const AIService = require("./aiService");
const EmailService = require("./emailService");
const config = require("./config");
require("dotenv").config();

class NewsBot {
  constructor() {
    this.newsService = new NewsService();
    this.aiService = new AIService();
    this.emailService = new EmailService();
    this.newsCategories = {
      tech: "Technology and Programming",
      security: "Cybersecurity Updates",
      ai: "Artificial Intelligence",
      global: "Global News",
      frameworks: "Development Frameworks",
      advice: "Developer Career Advice",
      future: "Future Technology Trends",
    };
  }

  // Schedule daily news at 9 AM
  startScheduler() {
    console.log(
      "📅 News bot scheduler started! Daily news will be delivered at 9:00 AM"
    );

    // Test email configuration
    this.testEmailSetup();

    // Run at 9:00 AM every day
    cron.schedule(config.schedule.dailyDigest, () => {
      console.log("🌅 Good morning! Generating your daily news digest...");
      this.generateDailyDigest();
    });

    // For testing - run immediately
    console.log("🧪 Running test digest now...");
    this.generateDailyDigest();
  }

  // Test email configuration
  async testEmailSetup() {
    console.log("📧 Testing email configuration...");
    const isValid = await this.emailService.testEmailConfiguration();
    if (isValid) {
      console.log("✅ Email is configured and ready!");
    } else {
      console.log("⚠️ Email configuration needs attention. Check .env file.");
    }
  }

  // Main function to generate daily news digest
  async generateDailyDigest() {
    try {
      console.log("📰 Fetching latest news from multiple sources...");

      const allNews = await this.newsService.getAllNews();
      const trendingTopics = this.newsService.getTrendingTopics(allNews);

      console.log("🤖 Processing news with AI analysis...");
      const processedNews = await this.processNewsWithAI(
        allNews,
        trendingTopics
      );

      // Display news in console
      await this.formatAndDisplayNews(processedNews, trendingTopics);
      
      // Send email digest
      console.log("📧 Sending email digest...");
      const emailSent = await this.emailService.sendNewsDigest(processedNews, trendingTopics);
      
      if (emailSent) {
        console.log("✅ Daily digest delivered to your email successfully!");
      } else {
        console.log("⚠️ Email delivery skipped. Check email configuration in .env file.");
      }
      
    } catch (error) {
      console.error("❌ Error generating daily digest:", error.message);
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
          const summary = await this.aiService.generateCategorySummary(
            category,
            articles
          );
          processedCategories[category] = {
            summary: summary,
            items: articles,
            count: articles.length,
          };
        } catch (error) {
          console.error(`Error processing ${category}:`, error.message);
        }
      }
    }

    // Generate additional insights
    console.log("💡 Generating insights and recommendations...");
    try {
      processedCategories.advice = {
        summary: await this.aiService.generateDeveloperAdvice(),
        items: [],
        count: 0,
      };

      processedCategories.future = {
        summary: await this.aiService.generateFutureInsights(),
        items: [],
        count: 0,
      };

      processedCategories.trending = {
        summary: await this.aiService.generateTrendingAnalysis(trendingTopics),
        items: [],
        count: trendingTopics.length,
      };

      processedCategories.recommendations = {
        summary: await this.aiService.generatePersonalizedRecommendations(
          allNews
        ),
        items: [],
        count: 0,
      };
    } catch (error) {
      console.error("Error generating insights:", error.message);
    }

    return processedCategories;
  }

  // Format and display the news
  async formatAndDisplayNews(processedNews, trendingTopics) {
    console.log("\n" + "=".repeat(90));
    console.log("📰 DAILY TECH NEWS DIGEST - " + new Date().toDateString());
    console.log("🎯 Tailored for Backend Developers");
    console.log("=".repeat(90));

    const categoryIcons = {
      tech: "💻",
      security: "🔒",
      ai: "🤖",
      global: "🌍",
      frameworks: "⚛️",
      advice: "💡",
      future: "🔮",
      trending: "📈",
      recommendations: "🎯",
    };

    const categoryTitles = {
      tech: "TECHNOLOGY NEWS",
      security: "SECURITY UPDATES",
      ai: "AI & MACHINE LEARNING",
      global: "GLOBAL NEWS IMPACT",
      frameworks: "FRAMEWORK UPDATES",
      advice: "DEVELOPER ADVICE",
      future: "FUTURE INSIGHTS",
      trending: "TRENDING TOPICS",
      recommendations: "PERSONALIZED RECOMMENDATIONS",
    };

    // Display trending topics first if available
    if (trendingTopics && trendingTopics.length > 0) {
      console.log(`\n📈 TRENDING TOPICS`);
      console.log("-".repeat(50));
      const topTrends = trendingTopics.slice(0, 5);
      topTrends.forEach((trend, index) => {
        console.log(
          `${index + 1}. ${trend.topic} (${trend.mentions} mentions)`
        );
      });
      console.log("");
    }

    // Display categories in priority order
    const priorityOrder = [
      "tech",
      "security",
      "ai",
      "frameworks",
      "global",
      "trending",
      "advice",
      "future",
      "recommendations",
    ];

    let totalArticles = 0;
    for (const category of priorityOrder) {
      const data = processedNews[category];
      if (data && data.summary) {
        console.log(
          `\n${categoryIcons[category] || "📌"} ${
            categoryTitles[category] || category.toUpperCase()
          }`
        );
        if (data.count > 0) {
          console.log(`📊 ${data.count} items analyzed`);
        }
        console.log("-".repeat(60));
        console.log(data.summary);

        if (config.output.includeLinks && data.items && data.items.length > 0) {
          console.log("\n📎 Key Sources:");
          data.items.slice(0, 3).forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.title}`);
            if (config.output.includeSources && item.source) {
              console.log(`     📰 ${item.source}`);
            }
            console.log(`     🔗 ${item.link}`);
          });
          totalArticles += data.items.length;
        }
        console.log("");
      }
    }

    console.log("=".repeat(90));
    console.log(
      `✨ Digest complete! Analyzed ${totalArticles} articles from multiple sources`
    );
    console.log(
      "🚀 Built with Google Gemini AI • Next update tomorrow at 9:00 AM"
    );
    console.log("=".repeat(90));
  }

  // Display error fallback when everything fails
  async displayErrorFallback() {
    console.log("\n" + "=".repeat(80));
    console.log("📰 DAILY TECH NEWS DIGEST - " + new Date().toDateString());
    console.log("⚠️  Service Temporarily Unavailable");
    console.log("=".repeat(80));

    console.log("\n💡 GENERAL TECH ADVICE FOR TODAY");
    console.log("-".repeat(50));
    console.log(
      "• Check GitHub trending repositories for interesting projects"
    );
    console.log("• Review your code for potential security vulnerabilities");
    console.log("• Update your dependencies and check for breaking changes");
    console.log("• Practice system design problems or algorithms");
    console.log("• Read documentation for tools you use daily");
    console.log("• Engage with the developer community on social platforms");

    console.log("\n🔮 TECH TRENDS TO WATCH");
    console.log("-".repeat(50));
    console.log("• Serverless and edge computing adoption");
    console.log("• AI/ML integration in backend systems");
    console.log("• Advanced database optimization techniques");
    console.log("• API security and rate limiting strategies");
    console.log("• Container orchestration and microservices");

    console.log("\n=".repeat(80));
    console.log(
      "📧 Please check your internet connection and API configuration"
    );
    console.log("🔄 Next attempt will be made tomorrow at 9:00 AM");
    console.log("=".repeat(80));
  }
}

module.exports = NewsBot;
