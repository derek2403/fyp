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

    // Read the merchants.json file
    const dataPath = path.join(process.cwd(), 'data', 'merchants.json');
    const merchantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Check if merchant exists by wallet address
    const existingMerchant = merchantsData.merchants.find(merchant => merchant.address === address);

    if (existingMerchant) {
      return res.status(200).json({
        exists: true,
        merchant: existingMerchant
      });
    } else {
      return res.status(200).json({
        exists: false
      });
    }
  } catch (error) {
    console.error('Error checking merchant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 