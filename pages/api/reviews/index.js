import { ethers } from 'ethers';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "getAllReviews",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "id", "type": "string"},
          {"internalType": "string", "name": "userId", "type": "string"},
          {"internalType": "string", "name": "merchantId", "type": "string"},
          {"internalType": "string", "name": "username", "type": "string"},
          {"internalType": "string", "name": "restaurantName", "type": "string"},
          {"internalType": "uint8", "name": "rating", "type": "uint8"},
          {"internalType": "string", "name": "reviewText", "type": "string"},
          {"internalType": "string", "name": "date", "type": "string"},
          {"internalType": "uint256", "name": "upvotes", "type": "uint256"},
          {"internalType": "uint256", "name": "downvotes", "type": "uint256"},
          {"internalType": "uint256", "name": "confidenceScore", "type": "uint256"},
          {"internalType": "string", "name": "createdAt", "type": "string"},
          {"internalType": "uint8", "name": "foodQuality", "type": "uint8"},
          {"internalType": "uint8", "name": "service", "type": "uint8"},
          {"internalType": "uint8", "name": "atmosphere", "type": "uint8"},
          {"internalType": "uint8", "name": "value", "type": "uint8"},
          {"internalType": "string", "name": "orderId", "type": "string"},
          {"internalType": "uint256", "name": "orderTotal", "type": "uint256"},
          {"internalType": "string", "name": "updatedAt", "type": "string"}
        ],
        "internalType": "struct ReviewContract.Review[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, merchantId } = req.query;

    if (!userId && !merchantId) {
      return res.status(400).json({ message: 'Either userId or merchantId is required' });
    }

    // Create provider for Base Sepolia (read-only, no private key needed)
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get all reviews from smart contract
    const allReviews = await contract.getAllReviews();

    // Convert blockchain data to readable format
    const reviews = allReviews.map(review => ({
      id: review[0],
      userId: review[1],
      merchantId: review[2],
      username: review[3],
      restaurantName: review[4],
      rating: Number(review[5]),
      review: review[6], // reviewText
      date: review[7],
      upvotes: Number(review[8]),
      downvotes: Number(review[9]),
      confidenceScore: Number(review[10]),
      createdAt: review[11],
      foodQuality: Number(review[12]),
      service: Number(review[13]),
      atmosphere: Number(review[14]),
      value: Number(review[15]),
      orderId: review[16],
      orderTotal: Number(review[17]),
      updatedAt: review[18]
    }));

    // Filter reviews based on query parameters
    let filteredReviews = [];
    if (userId) {
      filteredReviews = reviews.filter(review => review.userId === userId);
    } else if (merchantId) {
      filteredReviews = reviews.filter(review => review.merchantId === merchantId);
    }

    return res.status(200).json({
      reviews: filteredReviews || []
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 