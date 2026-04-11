const Groq = require('groq-sdk');
const Review = require('../models/Review');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code and give a structured review.

Your response MUST follow this exact format:

## Summary
Brief 1-2 sentence overview of the code quality.

## Issues Found
List each issue with this format:
- **[SEVERITY: critical/high/medium/low]** Description of the issue and why it's a problem.

## Security
Any security vulnerabilities or concerns.

## Performance
Performance issues or optimization opportunities.

## Best Practices
Code style, naming, structure improvements.

## Improved Code
\`\`\`
Provide the corrected/improved version of the code
\`\`\`

## Verdict
One line final verdict on the code quality.

Be specific, technical, and actionable. Focus on real issues.`;

const streamReview = async (req, res) => {
  const { code, language, title } = req.body;
  if (!code) return res.status(400).json({ message: 'No code provided' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let fullReview = '';

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Language: ${language || 'javascript'}\n\nCode to review:\n\`\`\`${language || 'javascript'}\n${code}\n\`\`\`` }
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        fullReview += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Parse severity
    const criticalMatch = fullReview.toLowerCase().includes('critical') ? 'critical' :
      fullReview.toLowerCase().includes('high') ? 'high' :
      fullReview.toLowerCase().includes('medium') ? 'medium' : 'low';

    const issueMatches = (fullReview.match(/\*\*\[SEVERITY:/g) || []).length;

    await Review.create({
      user: req.user._id,
      title: title || 'Untitled Review',
      language: language || 'javascript',
      code,
      review: fullReview,
      severity: criticalMatch,
      issuesFound: issueMatches,
    });

  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

const getReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 }).select('-code -review');
  res.json(reviews);
};

const getReview = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ message: 'Not found' });
  res.json(review);
};

const deleteReview = async (req, res) => {
  await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
};
const streamGenerate = async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) return res.status(400).json({ message: 'No prompt provided' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language} developer. Generate clean, production-ready code based on the user's request.
Always respond with ONLY the code — no explanations before or after.
Include helpful inline comments.
Follow best practices for ${language}.`
        },
        { role: 'user', content: `Generate ${language} code for: ${prompt}` }
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

module.exports = { streamReview, streamGenerate, getReviews, getReview, deleteReview };