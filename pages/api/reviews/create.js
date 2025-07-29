import { ethers } from 'ethers';

// Smart contract configuration
const CONTRACT_ADDRESS = "0xE00f2f9355442921C8B5Dc14F74BAAcBD971B828";
const CONTRACT_ABI = [
  {
    "inputs": [
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
        "internalType": "struct ReviewContract.ReviewInput",
        "name": "data",
        "type": "tuple"
      }
    ],
    "name": "addReview",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const reviewData = req.body;

    if (!reviewData.userId || !reviewData.merchantId || !reviewData.review) {
      return res.status(400).json({ message: 'userId, merchantId, and review are required' });
    }

    // Create provider for Base Sepolia
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");
    
    // Create wallet instance (you'll need to provide a private key or use environment variable)
    const privateKey = process.env.PRIVATE_KEY; // Add your private key to .env.local
    if (!privateKey || privateKey === 'your_private_key_here') {
      return res.status(500).json({ 
        message: 'Private key not configured. Please add your private key to .env.local file.',
        instructions: 'Add PRIVATE_KEY=your_actual_private_key to .env.local file'
      });
    }
    
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    // Prepare review data for smart contract
    const reviewInput = {
      id: reviewData.id || `review_${Date.now()}`,
      userId: reviewData.userId,
      merchantId: reviewData.merchantId,
      username: reviewData.username || "Anonymous",
      restaurantName: reviewData.restaurantName || "Unknown Restaurant",
      rating: reviewData.rating || 0,
      reviewText: reviewData.review,
      date: reviewData.date || new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      confidenceScore: reviewData.confidenceScore || 85,
      createdAt: reviewData.createdAt || new Date().toISOString(),
      foodQuality: reviewData.foodQuality || 0,
      service: reviewData.service || 0,
      atmosphere: reviewData.atmosphere || 0,
      value: reviewData.value || 0,
      orderId: reviewData.orderId || "",
      orderTotal: reviewData.orderTotal || 0,
      updatedAt: reviewData.updatedAt || new Date().toISOString()
    };

    // Call smart contract to add review
    const tx = await contract.addReview(reviewInput);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return res.status(201).json({
      message: 'Review created successfully on blockchain',
      review: reviewInput,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 