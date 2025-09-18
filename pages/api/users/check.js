import { getDb } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const normalizedAddress = address.toLowerCase();
    const db = await getDb();
    const user = await db.collection('users').findOne({
      $or: [{ address }, { addressLower: normalizedAddress }],
    });

    if (user) {
      if (user._id) {
        user._id = user._id.toString();
      }
      return res.status(200).json({
        exists: true,
        user,
      });
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
