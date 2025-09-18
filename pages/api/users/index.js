import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const normalizedAddress = address.toLowerCase();
    const db = await getDb();
    const user = await db.collection('users').findOne({
      $or: [{ address }, { addressLower: normalizedAddress }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id) {
      user._id = user._id.toString();
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
