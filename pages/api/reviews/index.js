import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, merchantId } = req.query;

    if (!userId && !merchantId) {
      return res.status(400).json({ message: 'Either userId or merchantId is required' });
    }

    // Read the reviews.json file
    const dataPath = path.join(process.cwd(), 'data', 'reviews.json');
    const reviewsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    let reviews = [];

    if (userId) {
      // Filter reviews by user ID
      reviews = reviewsData.reviews.filter(review => review.userId === userId);
    } else if (merchantId) {
      // Filter reviews by merchant ID
      reviews = reviewsData.reviews.filter(review => review.merchantId === merchantId);
    }

    return res.status(200).json({
      reviews: reviews || []
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 