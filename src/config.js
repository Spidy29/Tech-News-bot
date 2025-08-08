// Configuration for the News Bot
module.exports = {
    // Schedule configuration (cron format)
    schedule: {
        // Default: 9:00 AM every day
        dailyDigest: '0 9 * * *',
        // Optional: Weekly summary on Sunday at 10 AM
        weeklyDigest: '0 10 * * 0'
    },
    
    // News source priorities and limits
    sources: {
        maxItemsPerCategory: 3,
        timeout: 10000, // 10 seconds
        retryAttempts: 2
    },
    
    // Gemini AI configuration
    ai: {
        model: 'gemini-1.5-flash',
        maxTokens: 1000,
        temperature: 0.7
    },
    
    // Categories to include in daily digest
    categories: {
        tech: {
            enabled: true,
            priority: 1,
            keywords: ['programming', 'software', 'development', 'backend', 'api', 'database']
        },
        security: {
            enabled: true,
            priority: 2,
            keywords: ['vulnerability', 'security', 'breach', 'patch', 'exploit']
        },
        ai: {
            enabled: true,
            priority: 3,
            keywords: ['artificial intelligence', 'machine learning', 'ai', 'ml', 'neural network']
        },
        frameworks: {
            enabled: true,
            priority: 4,
            keywords: ['node.js', 'express', 'react', 'vue', 'angular', 'framework', 'library']
        },
        global: {
            enabled: true,
            priority: 5,
            keywords: ['technology', 'economy', 'policy', 'regulation']
        }
    },
    
    // Output formatting
    output: {
        includeLinks: true,
        includeSources: true,
        summaryLength: 'medium', // short, medium, long
        emojiEnabled: true
    },
    
    // Developer-specific settings
    developer: {
        focusAreas: [
            'backend development',
            'system design',
            'database optimization',
            'API development',
            'cloud technologies',
            'microservices',
            'DevOps',
            'performance optimization'
        ],
        experienceLevel: 'intermediate', // beginner, intermediate, advanced
        preferredLanguages: ['JavaScript', 'Python', 'Java', 'Go', 'TypeScript']
    }
};
