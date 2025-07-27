import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userData = req.body;

    if (!userData.address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Read the users.json file
    const dataPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Check if user already exists
    const existingUser = usersData.users.find(user => user.address === userData.address);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with ID
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reliabilityScore: 85,
      nftBadges: [],
      totalReviews: 0,
      averageRating: 0
    };

    // Add user to the array
    usersData.users.push(newUser);

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(usersData, null, 2));

    return res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 