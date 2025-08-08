# 📧 Email Setup Guide

## Quick Email Setup

Your news bot can now send beautiful HTML emails to your personal email! Follow these steps:

### Step 1: Configure Your Email in .env

Update your `.env` file with your email details:

```env
# For Gmail (Recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-digit-app-password
RECIPIENT_EMAIL=your-personal-email@gmail.com
```

### Step 2: Generate Gmail App Password

**Important:** Use an App Password, NOT your regular Gmail password!

1. **Enable 2-Step Verification** on your Google Account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-digit password (like `abcd efgh ijkl mnop`)
   - Use this as your `EMAIL_APP_PASSWORD`

### Step 3: Test Configuration

Run the bot to test email setup:

```bash
npm start
```

You should see:
- ✅ Email is configured and ready!
- 📧 Email sent successfully: [message-id]

## Alternative Email Providers

### For Outlook/Hotmail:

```env
EMAIL_USER=your-email@outlook.com
EMAIL_APP_PASSWORD=your-app-password
RECIPIENT_EMAIL=your-personal-email@outlook.com
```

### For Custom SMTP:

```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
RECIPIENT_EMAIL=your-personal-email@gmail.com
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
```

Then uncomment the custom SMTP section in `src/emailService.js`.

## Email Features

Your daily email includes:

- 📱 **Beautiful HTML Design** - Professional, mobile-friendly layout
- 🎯 **Trending Topics** - Visual tags showing what's hot
- 📊 **Article Statistics** - Number of articles analyzed per category
- 🔗 **Direct Links** - Click to read full articles
- 📰 **Source Attribution** - Know where news comes from
- 🎨 **Emoji Categories** - Easy visual identification

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Use App Password, not regular password
   - Enable 2-Step Verification first

2. **"Email not configured" message**:
   - Check all three variables are set in .env
   - Restart the bot after updating .env

3. **SMTP connection failed**:
   - Check your internet connection
   - Verify email provider settings

### Test Email Only:

Create a test script to send a sample email:

```javascript
// test-email.js
const EmailService = require('./src/emailService');

async function testEmail() {
    const emailService = new EmailService();
    const testNews = {
        tech: {
            summary: "This is a test email from your news bot!",
            items: [],
            count: 0
        }
    };
    
    await emailService.sendNewsDigest(testNews, []);
}

testEmail();
```

Run with: `node test-email.js`

## Email Schedule

- **Daily at 9:00 AM** - Automatic delivery
- **Console + Email** - You get both console output and email
- **Fallback Support** - If email fails, console still works

---

**Ready to receive your daily tech news in your inbox! 📧🚀**
