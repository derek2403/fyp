import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reviews, restaurantName } = req.body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ message: 'No reviews provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured' });
    }

    // Prepare review data for analysis
    const reviewTexts = reviews.map(review => ({
      rating: review.rating,
      review: review.review,
      foodQuality: review.foodQuality,
      service: review.service,
      atmosphere: review.atmosphere,
      value: review.value,
      orderTotal: review.orderTotal,
      confidenceScore: review.confidenceScore
    }));

    // Create a comprehensive prompt for analysis
    const prompt = `Analyze the following customer reviews for ${restaurantName} and provide a concise, helpful summary that gives potential customers a clear understanding of what to expect. Focus on:

1. Overall performance and strengths
2. Common themes in customer feedback
3. What customers consistently praise
4. Any areas that could be improved
5. Value for money assessment
6. Atmosphere and service quality
7. Food quality highlights

Reviews data:
${JSON.stringify(reviewTexts, null, 2)}

Please provide a 1 paragraph summary that is:
- Informative but not too long
- Balanced and fair
- Helpful for decision-making
- Written in a friendly, conversational tone
- Focused on what customers can expect

Format the response as a clean summary without any markdown formatting or bullet points.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful food review analyst. Analyze customer reviews and provide clear, balanced summaries that help potential customers understand what to expect from a restaurant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('Failed to generate summary');
    }

    return res.status(200).json({ 
      summary,
      reviewCount: reviews.length,
      averageRating: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    });

  } catch (error) {
    console.error('Error generating review summary:', error);
    
    // Fallback summary if OpenAI fails
    const fallbackSummary = `Based on ${reviews.length} customer reviews, ${restaurantName} has received an average rating of ${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} out of 5 stars. Customers have shared their experiences across various aspects including food quality, service, atmosphere, and value for money. The reviews provide valuable insights into what you can expect when dining at this establishment.`;

    return res.status(200).json({ 
      summary: fallbackSummary,
      reviewCount: reviews.length,
      averageRating: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    });
  }
}
