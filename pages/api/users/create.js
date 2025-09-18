import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData = req.body;

    if (!userData.address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const normalizedAddress = userData.address.toLowerCase();
    const db = await getDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({
      $or: [{ address: userData.address }, { addressLower: normalizedAddress }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      addressLower: normalizedAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reliabilityScore: 85,
      nftBadges: [],
      totalReviews: 0,
      averageRating: 0,
    };

    await usersCollection.insertOne(newUser);

    return res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
