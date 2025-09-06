import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return res.status(500).json({ 
      message: 'OpenAI API key not configured',
      instructions: 'Please add your OpenAI API key to .env.local file'
    });
  }

  try {
    const { reviewData, orderData, userData, restaurantData } = req.body;

    if (!reviewData || !orderData || !userData || !restaurantData) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    // Read the reviews.txt file for RAG approach
    const fs = require('fs');
    const path = require('path');
    const reviewsPath = path.join(process.cwd(), 'reviews.txt');
    const reviewsText = fs.readFileSync(reviewsPath, 'utf8');

    // Parse reviews.txt to create reference data
    const referenceReviews = reviewsText.split('\n').map(line => {
      const [text, score] = line.split(',');
      return { text: text.trim(), score: parseInt(score) };
    }).filter(r => r.text && !isNaN(r.score));

    // Calculate spending context
    const priceRangeMap = {
      '$': 10,    // Average spending per person
      '$$': 20,
      '$$$': 35,
      '$$$$': 50
    };
    
    const expectedSpending = priceRangeMap[restaurantData.priceRange] || 20;
    const actualSpending = orderData.total;
    const spendingRatio = actualSpending / expectedSpending;

    // Check cuisine preference match
    const userPreferences = userData.selectedCategories || userData.preferences || [];
    const restaurantCuisine = restaurantData.cuisine?.toLowerCase();
    const cuisineMatch = userPreferences.some(pref => 
      pref.toLowerCase() === restaurantCuisine
    );

    // Prepare context for OpenAI
    const context = {
      orderItems: orderData.items.map(item => item.name).join(', '),
      restaurantCuisine: restaurantData.cuisine,
      userPreferences: userPreferences.join(', '),
      expectedSpending: expectedSpending,
      actualSpending: actualSpending,
      spendingRatio: spendingRatio,
      cuisineMatch: cuisineMatch,
      referenceReviews: referenceReviews.slice(0, 20) // Use first 20 as examples
    };

    // Create the prompt for OpenAI
    const prompt = `
You are an expert food review analyst. Calculate a confidence score (0-100) for this food review based on the following criteria:

REVIEW DATA:
- Review Text: "${reviewData.review}"
- Overall Rating: ${reviewData.rating}/5
- Food Quality: ${reviewData.foodQuality}/5
- Service: ${reviewData.service}/5
- Atmosphere: ${reviewData.atmosphere}/5
- Value: ${reviewData.value}/5

ORDER CONTEXT:
- Ordered Items: ${context.orderItems}
- Restaurant Cuisine: ${context.restaurantCuisine}
- User Preferences: ${context.userPreferences}
- Expected Spending: $${context.expectedSpending}
- Actual Spending: $${context.actualSpending}
- Spending Ratio: ${context.spendingRatio.toFixed(2)}

CONFIDENCE SCORING CRITERIA:

CORE SCORING (Base 100 points):
1. CONTEXT MATCHING (60% of base score = 60 points):
   - Does the review text match the ordered items? (0-60 points)
   - If reviewing pizza but ordered sushi, deduct heavily (0-20 points)
   - If reviewing the actual ordered items, give high points (40-60 points)
   - Partial context match gets medium points (20-40 points)

2. DETAIL LEVEL (40% of base score = 40 points):
   - More detailed reviews get higher confidence (0-40 points)
   - Reference these examples for scoring:
   ${context.referenceReviews.map(r => `- "${r.text}" (Score: ${r.score})`).join('\n')}
   - Very detailed reviews (100+ chars): 30-40 points
   - Medium detail (50-100 chars): 20-30 points
   - Basic reviews (20-50 chars): 10-20 points
   - Very short reviews (<20 chars): 0-10 points

BONUS POINTS (Additional to base 100):
3. SPENDING CONTEXT (Bonus: +0 to +15 points):
   - If spending is above expected (ratio > 1.2), add 5-10 points
   - If spending matches expected (0.8-1.2), add 2-5 points
   - If spending is below expected (ratio < 0.8), add 0-2 points

4. PREFERENCE MATCH (Bonus: +0 to +10 points):
   - If user preferences match restaurant cuisine, add 5-10 points
   - If no match, no penalty (0 points)

5. RATING CONSISTENCY (Bonus: +0 to +10 points):
   - Check if individual ratings align with overall rating
   - If all ratings are similar, add 5-10 points
   - If ratings are inconsistent, add 0-5 points

CALCULATION:
- Base score = Context Matching (0-60) + Detail Level (0-40)
- Bonus points = Spending Context (0-15) + Preference Match (0-10) + Rating Consistency (0-10)
- Final score = Base score + Bonus points (capped at 100)
- Round to nearest integer

Provide ONLY the final confidence score as a number (0-100), no explanation needed.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert food review analyst. Calculate confidence scores based on the given criteria. Respond with only the final score number."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    });

    const responseText = completion.choices[0].message.content.trim();
    const confidenceScore = parseInt(responseText);
    
    // Validate the score - if parsing fails, use a fallback calculation
    let finalScore;
    if (isNaN(confidenceScore) || confidenceScore < 0 || confidenceScore > 100) {
      // Fallback calculation based on new scoring system
      let baseScore = 0;
      let bonusPoints = 0;
      
      // CORE SCORING: Context Matching (0-60 points)
      const orderItemsLower = context.orderItems.toLowerCase();
      const reviewLower = reviewData.review.toLowerCase();
      
      if (orderItemsLower.includes('pizza') && reviewLower.includes('pizza')) {
        baseScore += 50; // High context match
      } else if (orderItemsLower.includes('sushi') && reviewLower.includes('sushi')) {
        baseScore += 50; // High context match
      } else if (orderItemsLower.includes('pasta') && reviewLower.includes('pasta')) {
        baseScore += 50; // High context match
      } else if (orderItemsLower.includes('burger') && reviewLower.includes('burger')) {
        baseScore += 50; // High context match
      } else {
        // Check for partial matches
        const hasAnyFoodMention = reviewLower.includes('food') || reviewLower.includes('meal') || reviewLower.includes('dish');
        if (hasAnyFoodMention) {
          baseScore += 30; // Partial context match
        } else {
          baseScore += 10; // Low context match
        }
      }
      
      // CORE SCORING: Detail Level (0-40 points)
      const reviewLength = reviewData.review.length;
      if (reviewLength >= 100) {
        baseScore += 35; // Very detailed
      } else if (reviewLength >= 50) {
        baseScore += 25; // Medium detail
      } else if (reviewLength >= 20) {
        baseScore += 15; // Basic detail
      } else {
        baseScore += 5; // Very short
      }
      
      // BONUS POINTS: Spending Context (0-15 points)
      if (context.spendingRatio > 1.2) {
        bonusPoints += 8; // Above expected spending
      } else if (context.spendingRatio >= 0.8) {
        bonusPoints += 5; // Expected spending range
      } else {
        bonusPoints += 2; // Below expected spending
      }
      
      // BONUS POINTS: Preference Match (0-10 points)
      if (context.cuisineMatch) {
        bonusPoints += 8; // Preference match
      }
      
      // BONUS POINTS: Rating Consistency (0-10 points)
      const ratings = [reviewData.foodQuality, reviewData.service, reviewData.atmosphere, reviewData.value];
      const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      const ratingVariance = ratings.reduce((sum, rating) => sum + Math.pow(rating - avgRating, 2), 0) / ratings.length;
      
      if (ratingVariance <= 1) {
        bonusPoints += 8; // Very consistent ratings
      } else if (ratingVariance <= 2) {
        bonusPoints += 5; // Moderately consistent
      } else {
        bonusPoints += 2; // Inconsistent ratings
      }
      
      finalScore = Math.max(0, Math.min(100, baseScore + bonusPoints));
    } else {
      finalScore = confidenceScore;
    }

    return res.status(200).json({
      confidenceScore: finalScore,
      breakdown: {
        scoringSystem: {
          core: {
            contextMatching: "0-60 points (60% of base score)",
            detailLevel: "0-40 points (40% of base score)"
          },
          bonus: {
            spendingContext: "0-15 bonus points",
            preferenceMatch: "0-10 bonus points", 
            ratingConsistency: "0-10 bonus points"
          }
        },
        contextMatch: {
          orderItems: context.orderItems,
          reviewText: reviewData.review,
          matchQuality: context.orderItems.toLowerCase().includes('pizza') && reviewData.review.toLowerCase().includes('pizza') ? 'High' : 'Partial'
        },
        detailLevel: {
          characterCount: reviewData.review.length,
          level: reviewData.review.length >= 100 ? 'Very Detailed' : 
                 reviewData.review.length >= 50 ? 'Medium' : 
                 reviewData.review.length >= 20 ? 'Basic' : 'Short'
        },
        spendingContext: {
          expected: expectedSpending,
          actual: actualSpending,
          ratio: spendingRatio,
          bonus: context.spendingRatio > 1.2 ? 'Above Expected' : 
                 context.spendingRatio >= 0.8 ? 'Expected Range' : 'Below Expected'
        },
        preferenceMatch: {
          matched: cuisineMatch,
          userPreferences: context.userPreferences,
          restaurantCuisine: context.restaurantCuisine
        },
        ratingConsistency: {
          overall: reviewData.rating,
          foodQuality: reviewData.foodQuality,
          service: reviewData.service,
          atmosphere: reviewData.atmosphere,
          value: reviewData.value
        }
      }
    });

  } catch (error) {
    console.error('Error calculating confidence score:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
