const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("./config");

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: config.ai.model,
      generationConfig: {
        temperature: config.ai.temperature,
        maxOutputTokens: config.ai.maxTokens,
      },
    });
  }

  async generateCategorySummary(category, articles) {
    if (!articles || articles.length === 0) {
      return this.generateEmptyCategorySummary(category);
    }

    const articlesText = articles
      .map((article) => `• ${article.title}\n  ${article.description}`)
      .join("\n\n");

    const prompts = {
      tech: `As a senior backend developer, analyze these technology news articles and provide a concise summary for fellow developers. Focus on:
- Impact on backend development
- New tools, frameworks, or technologies
- Industry trends affecting developers
- Practical takeaways

Articles:
${articlesText}

Provide a summary in 2-3 paragraphs with actionable insights.`,

      security: `As a cybersecurity expert, analyze these security news articles for backend developers. Focus on:
- Critical vulnerabilities and patches
- Security best practices
- Threats affecting backend systems
- Recommended actions

Articles:
${articlesText}

Provide a summary with immediate action items and security recommendations.`,

      ai: `As an AI/ML specialist, analyze these AI news articles for backend developers. Focus on:
- Practical AI tools for backend development
- Integration opportunities
- Performance implications
- Future considerations

Articles:
${articlesText}

Provide a summary highlighting practical applications and opportunities.`,

      frameworks: `As a full-stack architect, analyze these framework and development news. Focus on:
- Important updates and breaking changes
- New features and capabilities
- Migration considerations
- Performance improvements

Articles:
${articlesText}

Provide a summary with upgrade recommendations and compatibility notes.`,

      global: `As a tech industry analyst, analyze these global news items for their impact on the technology sector. Focus on:
- Economic implications for tech
- Policy changes affecting developers
- Market trends and opportunities
- Global tech developments

Articles:
${articlesText}

Provide a brief summary of the most relevant developments.`,
    };

    try {
      const prompt =
        prompts[category] ||
        `Summarize these ${category} news articles for backend developers:\n\n${articlesText}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Error generating ${category} summary:`, error.message);
      return this.generateEmptyCategorySummary(category);
    }
  }

  async generateDeveloperAdvice() {
    const currentDate = new Date().toDateString();
    const focusAreas = config.developer.focusAreas.join(", ");
    const languages = config.developer.preferredLanguages.join(", ");

    const prompt = `As an experienced tech mentor and backend development expert, provide 4-5 actionable career advice tips for today (${currentDate}). 

Context:
- Target audience: ${config.developer.experienceLevel} backend developers
- Focus areas: ${focusAreas}
- Preferred technologies: ${languages}

Provide practical advice covering:
1. Skill development priorities
2. Industry trends to watch
3. Career growth strategies
4. Technical best practices
5. Professional networking tips

Format as bullet points with brief explanations. Make it specific and actionable.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating advice:", error.message);
      return this.getDefaultAdvice();
    }
  }

  async generateFutureInsights() {
    const currentYear = new Date().getFullYear();
    const focusAreas = config.developer.focusAreas.join(", ");

    const prompt = `As a technology futurist and industry expert, provide insights about future technology trends and opportunities for backend developers in ${currentYear} and beyond.

Focus on:
- Emerging technologies with practical applications
- Market demands and skill evolution
- Architecture and system design trends
- Tools and platforms gaining traction
- Career opportunities and growth areas

Context: ${focusAreas}

Provide 4-5 key insights with practical implications for backend developers. Be specific about timelines and actionable steps.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating future insights:", error.message);
      return this.getDefaultFutureInsights();
    }
  }

  async generateTrendingAnalysis(trendingTopics) {
    if (!trendingTopics || trendingTopics.length === 0) {
      return "No trending topics identified from today's news.";
    }

    const topicsText = trendingTopics
      .map((t) => `${t.topic} (${t.mentions} mentions)`)
      .join(", ");

    const prompt = `Analyze these trending topics from today's tech news and explain their significance for backend developers:

Trending topics: ${topicsText}

Provide a brief analysis of:
1. Why these topics are trending
2. Relevance to backend development
3. Potential impact on the industry
4. What developers should know

Keep it concise and practical.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error analyzing trends:", error.message);
      return `Trending topics: ${topicsText}. Analysis temporarily unavailable.`;
    }
  }

  async generatePersonalizedRecommendations(allNews) {
    const totalArticles = Object.values(allNews).flat().length;
    const categories = Object.keys(allNews).filter(
      (cat) => allNews[cat].length > 0
    );

    const prompt = `Based on today's tech news digest with ${totalArticles} articles across ${categories.join(
      ", "
    )}, provide 3-4 personalized learning recommendations for a ${
      config.developer.experienceLevel
    } backend developer.

Focus areas: ${config.developer.focusAreas.join(", ")}
Preferred technologies: ${config.developer.preferredLanguages.join(", ")}

Recommendations should include:
- Specific skills to develop
- Resources to explore
- Projects to consider
- Technologies to investigate

Make it actionable and relevant to current industry trends.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating recommendations:", error.message);
      return this.getDefaultRecommendations();
    }
  }

  generateEmptyCategorySummary(category) {
    const fallbacks = {
      tech: "No major technology news available today. Stay updated with latest development practices and explore new tools in your spare time.",
      security:
        "No critical security alerts today. Continue following security best practices: keep dependencies updated, use HTTPS, validate inputs, and monitor your systems.",
      ai: "No significant AI news today. Consider exploring machine learning integration in your current projects or learning about AI-powered development tools.",
      frameworks:
        "No major framework updates today. Good time to review your current tech stack and plan any necessary upgrades.",
      global:
        "Global tech news quiet today. Focus on your development work and stay connected with the tech community.",
    };

    return fallbacks[category] || `No ${category} news available today.`;
  }

  getDefaultAdvice() {
    return `• **Stay Current**: Regularly update your skills with the latest backend technologies and frameworks
• **Practice System Design**: Work on designing scalable architectures and understanding distributed systems
• **Build Projects**: Create side projects that demonstrate your problem-solving abilities
• **Network Actively**: Engage with the developer community through conferences, meetups, and online forums
• **Focus on Fundamentals**: Master data structures, algorithms, and database optimization techniques`;
  }

  getDefaultFutureInsights() {
    return `• **Cloud-Native Development**: Containerization and serverless architectures will become standard
• **AI Integration**: Backend systems will increasingly incorporate AI/ML capabilities for automation and insights
• **Edge Computing**: Distributed computing at the edge will create new architectural challenges and opportunities
• **API-First Design**: GraphQL and advanced API patterns will shape how we build interconnected systems
• **Observability**: Advanced monitoring, logging, and tracing will be essential for complex distributed systems`;
  }

  getDefaultRecommendations() {
    return `• **Learn Container Orchestration**: Dive deeper into Kubernetes and Docker for scalable deployments
• **Explore API Design**: Study GraphQL, REST best practices, and API versioning strategies
• **Practice System Design**: Use resources like Designing Data-Intensive Applications and system design interviews
• **Try New Databases**: Experiment with modern databases like Redis, MongoDB, or time-series databases`;
  }
}

module.exports = AIService;
