# 🤖 News Bot Configuration Guide

## Quick Setup

1. **Update your preferences** in `src/config.js`:

```javascript
// Change schedule (default: 9:00 AM daily)
schedule: {
    dailyDigest: '0 8 * * *', // 8:00 AM
}

// Update your developer profile
developer: {
    focusAreas: [
        'backend development',
        'microservices',        // Add your interests
        'cloud architecture',
        'api design'
    ],
    experienceLevel: 'advanced',  // beginner, intermediate, advanced
    preferredLanguages: ['Node.js', 'Python', 'Go'] // Your tech stack
}
```

## Time Zone Configuration

The bot uses your system's local time. To change the schedule:

- `'0 9 * * *'` = 9:00 AM daily
- `'30 8 * * 1-5'` = 8:30 AM weekdays only
- `'0 9 * * 1,3,5'` = 9:00 AM Monday, Wednesday, Friday

## Adding News Sources

Edit `src/newsService.js` to add custom RSS feeds:

```javascript
this.sources = {
    tech: [
        'https://api.rss2json.com/v1/api.json?rss_url=YOUR_TECH_FEED',
        // ... existing sources
    ]
};
```

## Commands

- `npm start` - Run with daily scheduling
- `npm test` - Run once without scheduling  
- `npm run dev` - Same as npm start

## Customizing AI Prompts

Edit `src/aiService.js` to modify how news is analyzed:

```javascript
const prompts = {
    tech: `Your custom analysis prompt for tech news...`,
    security: `Your custom prompt for security news...`,
    // ... other categories
};
```

---

**Your bot is ready! Run `npm start` to begin.** 🚀
