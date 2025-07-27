import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'reviews.json');

function readData() {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    return { reviews: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const data = readData();
        const { userId, merchantId, id } = req.query;
        
        if (userId) {
          const reviews = data.reviews.filter(review => review.userId === userId);
          return res.status(200).json(reviews);
        }
        
        if (merchantId) {
          const reviews = data.reviews.filter(review => review.merchantId === merchantId);
          return res.status(200).json(reviews);
        }
        
        if (id) {
          const review = data.reviews.find(review => review.id === id);
          return res.status(200).json(review || null);
        }
        
        return res.status(200).json(data.reviews);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to read reviews' });
      }

    case 'POST':
      try {
        const data = readData();
        const newReview = {
          id: `review_${Date.now()}`,
          ...req.body,
          upvotes: 0,
          downvotes: 0,
          confidenceScore: 85, // Default confidence score
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        
        data.reviews.push(newReview);
        writeData(data);
        
        return res.status(201).json(newReview);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create review' });
      }

    case 'PUT':
      try {
        const data = readData();
        const { id } = req.query;
        const reviewIndex = data.reviews.findIndex(review => review.id === id);
        
        if (reviewIndex === -1) {
          return res.status(404).json({ error: 'Review not found' });
        }
        
        data.reviews[reviewIndex] = {
          ...data.reviews[reviewIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        writeData(data);
        return res.status(200).json(data.reviews[reviewIndex]);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update review' });
      }

    case 'DELETE':
      try {
        const data = readData();
        const { id } = req.query;
        const reviewIndex = data.reviews.findIndex(review => review.id === id);
        
        if (reviewIndex === -1) {
          return res.status(404).json({ error: 'Review not found' });
        }
        
        data.reviews.splice(reviewIndex, 1);
        writeData(data);
        
        return res.status(200).json({ message: 'Review deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete review' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}