const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.setupTransporter();
    }

    setupTransporter() {
        // Gmail configuration (you can modify for other email providers)
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password, not regular password
            }
        });

        // Alternative configuration for other email providers
        // Uncomment and modify as needed:
        
        // For Outlook/Hotmail:
        // this.transporter = nodemailer.createTransport({
        //     service: 'hotmail',
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASSWORD
        //     }
        // });

        // For custom SMTP:
        // this.transporter = nodemailer.createTransport({
        //     host: process.env.SMTP_HOST,
        //     port: process.env.SMTP_PORT,
        //     secure: process.env.SMTP_SECURE === 'true',
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASSWORD
        //     }
        // });
    }

    async sendNewsDigest(processedNews, trendingTopics) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD || !process.env.RECIPIENT_EMAIL) {
            console.log('⚠️ Email not configured. Skipping email delivery.');
            console.log('💡 Add EMAIL_USER, EMAIL_APP_PASSWORD, and RECIPIENT_EMAIL to .env file');
            return false;
        }

        try {
            const htmlContent = this.generateHTMLContent(processedNews, trendingTopics);
            const textContent = this.generateTextContent(processedNews, trendingTopics);

            const mailOptions = {
                from: `"Tech News Bot" <${process.env.EMAIL_USER}>`,
                to: process.env.RECIPIENT_EMAIL,
                subject: `📰 Daily Tech News Digest - ${new Date().toDateString()}`,
                text: textContent,
                html: htmlContent
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 Email sent successfully:', info.messageId);
            return true;

        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            if (error.message.includes('Invalid login')) {
                console.log('💡 Tip: Make sure you\'re using an App Password for Gmail, not your regular password');
                console.log('🔗 Create App Password: https://support.google.com/accounts/answer/185833');
            }
            return false;
        }
    }

    generateHTMLContent(processedNews, trendingTopics) {
        const currentDate = new Date().toDateString();
        
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Tech News Digest</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .section {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section-title {
            color: #4a5568;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.4em;
            font-weight: bold;
        }
        .trending-topics {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .trending-item {
            display: inline-block;
            background: #4299e1;
            color: white;
            padding: 5px 12px;
            margin: 3px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .news-summary {
            font-size: 1.1em;
            line-height: 1.7;
            margin-bottom: 20px;
        }
        .sources {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #4299e1;
            margin-top: 15px;
        }
        .source-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
        }
        .source-title {
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 5px;
        }
        .source-link {
            color: #4299e1;
            text-decoration: none;
            font-size: 0.9em;
        }
        .source-link:hover {
            text-decoration: underline;
        }
        .source-name {
            color: #718096;
            font-size: 0.8em;
            font-style: italic;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-top: 30px;
        }
        .emoji {
            font-size: 1.2em;
        }
        .stats {
            background: #edf2f7;
            padding: 10px;
            border-radius: 5px;
            font-size: 0.9em;
            color: #4a5568;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1><span class="emoji">📰</span> Daily Tech News Digest</h1>
        <p><span class="emoji">🎯</span> Tailored for Backend Developers • ${currentDate}</p>
    </div>
`;

        // Add trending topics
        if (trendingTopics && trendingTopics.length > 0) {
            html += `
    <div class="section">
        <div class="section-title"><span class="emoji">📈</span> Trending Topics</div>
        <div class="trending-topics">
`;
            trendingTopics.slice(0, 8).forEach(trend => {
                html += `            <span class="trending-item">${trend.topic} (${trend.mentions})</span>\n`;
            });
            html += `        </div>
    </div>
`;
        }

        // Categories with their icons
        const categoryIcons = {
            tech: '💻',
            security: '🔒',
            ai: '🤖',
            global: '🌍',
            frameworks: '⚛️',
            advice: '💡',
            future: '🔮',
            trending: '📈',
            recommendations: '🎯'
        };

        const categoryTitles = {
            tech: 'Technology News',
            security: 'Security Updates',
            ai: 'AI & Machine Learning',
            global: 'Global News Impact',
            frameworks: 'Framework Updates',
            advice: 'Developer Advice',
            future: 'Future Insights',
            trending: 'Trending Analysis',
            recommendations: 'Personalized Recommendations'
        };

        // Priority order for display
        const priorityOrder = ['tech', 'security', 'ai', 'frameworks', 'global', 'advice', 'future', 'recommendations'];
        
        let totalArticles = 0;
        
        priorityOrder.forEach(category => {
            const data = processedNews[category];
            if (data && data.summary) {
                totalArticles += data.items ? data.items.length : 0;
                
                html += `
    <div class="section">
        <div class="section-title">
            <span class="emoji">${categoryIcons[category] || '📌'}</span> ${categoryTitles[category] || category.toUpperCase()}
        </div>
`;
                
                if (data.count > 0) {
                    html += `        <div class="stats">📊 ${data.count} items analyzed</div>\n`;
                }
                
                html += `        <div class="news-summary">${this.formatTextForHTML(data.summary)}</div>\n`;
                
                if (data.items && data.items.length > 0) {
                    html += `        <div class="sources">
            <strong>📎 Key Sources:</strong>
`;
                    data.items.slice(0, 3).forEach((item, index) => {
                        html += `            <div class="source-item">
                <div class="source-title">${index + 1}. ${this.escapeHTML(item.title)}</div>
                <div class="source-name">📰 ${this.escapeHTML(item.source || 'Unknown Source')}</div>
                <a href="${item.link}" class="source-link">🔗 Read Article</a>
            </div>
`;
                    });
                    html += `        </div>\n`;
                }
                
                html += `    </div>\n`;
            }
        });

        html += `
    <div class="footer">
        <p><span class="emoji">✨</span> Digest complete! Analyzed ${totalArticles} articles from multiple sources</p>
        <p><span class="emoji">🚀</span> Built with Google Gemini AI • Next update tomorrow at 9:00 AM</p>
        <p><span class="emoji">🤖</span> Tech News Bot - Keeping developers informed</p>
    </div>
</body>
</html>`;

        return html;
    }

    generateTextContent(processedNews, trendingTopics) {
        const currentDate = new Date().toDateString();
        let text = `📰 DAILY TECH NEWS DIGEST - ${currentDate}\n`;
        text += `🎯 Tailored for Backend Developers\n`;
        text += `${'='.repeat(80)}\n\n`;

        // Add trending topics
        if (trendingTopics && trendingTopics.length > 0) {
            text += `📈 TRENDING TOPICS\n`;
            text += `${'-'.repeat(50)}\n`;
            trendingTopics.slice(0, 5).forEach((trend, index) => {
                text += `${index + 1}. ${trend.topic} (${trend.mentions} mentions)\n`;
            });
            text += '\n';
        }

        const categoryIcons = {
            tech: '💻',
            security: '🔒',
            ai: '🤖',
            global: '🌍',
            frameworks: '⚛️',
            advice: '💡',
            future: '🔮',
            recommendations: '🎯'
        };

        const categoryTitles = {
            tech: 'TECHNOLOGY NEWS',
            security: 'SECURITY UPDATES',
            ai: 'AI & MACHINE LEARNING',
            global: 'GLOBAL NEWS IMPACT',
            frameworks: 'FRAMEWORK UPDATES',
            advice: 'DEVELOPER ADVICE',
            future: 'FUTURE INSIGHTS',
            recommendations: 'PERSONALIZED RECOMMENDATIONS'
        };

        const priorityOrder = ['tech', 'security', 'ai', 'frameworks', 'global', 'advice', 'future', 'recommendations'];
        
        let totalArticles = 0;
        
        priorityOrder.forEach(category => {
            const data = processedNews[category];
            if (data && data.summary) {
                text += `\n${categoryIcons[category] || '📌'} ${categoryTitles[category] || category.toUpperCase()}\n`;
                if (data.count > 0) {
                    text += `📊 ${data.count} items analyzed\n`;
                }
                text += `${'-'.repeat(60)}\n`;
                text += `${data.summary}\n`;
                
                if (data.items && data.items.length > 0) {
                    text += `\n📎 Key Sources:\n`;
                    data.items.slice(0, 3).forEach((item, index) => {
                        text += `  ${index + 1}. ${item.title}\n`;
                        if (item.source) {
                            text += `     📰 ${item.source}\n`;
                        }
                        text += `     🔗 ${item.link}\n`;
                    });
                    totalArticles += data.items.length;
                }
                text += '\n';
            }
        });

        text += `${'='.repeat(80)}\n`;
        text += `✨ Digest complete! Analyzed ${totalArticles} articles from multiple sources\n`;
        text += `🚀 Built with Google Gemini AI • Next update tomorrow at 9:00 AM\n`;
        text += `${'='.repeat(80)}`;

        return text;
    }

    formatTextForHTML(text) {
        return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    escapeHTML(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    async testEmailConfiguration() {
        try {
            await this.transporter.verify();
            console.log('✅ Email server connection verified');
            return true;
        } catch (error) {
            console.error('❌ Email configuration test failed:', error.message);
            return false;
        }
    }
}

module.exports = EmailService;
