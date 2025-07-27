import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const reviewData = req.body;

    if (!reviewData.userId || !reviewData.merchantId || !reviewData.review) {
      return res.status(400).json({ message: 'userId, merchantId, and review are required' });
    }

    // Read the reviews.json file
    const dataPath = path.join(process.cwd(), 'data', 'reviews.json');
    const reviewsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Create new review with ID
    const newReview = {
      id: `review_${Date.now()}`,
      ...reviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      confidenceScore: 85
    };

    // Add review to the array
    reviewsData.reviews.push(newReview);

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(reviewsData, null, 2));

    return res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 