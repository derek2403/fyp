import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Read the users.json file
    const dataPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Check if user exists by wallet address
    const existingUser = usersData.users.find(user => user.address === address);

    if (existingUser) {
      return res.status(200).json({
        exists: true,
        user: existingUser
      });
    } else {
      return res.status(200).json({
        exists: false
      });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 