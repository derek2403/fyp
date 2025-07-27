import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Read the merchants.json file
    const dataPath = path.join(process.cwd(), 'data', 'merchants.json');
    const merchantsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Find merchant by wallet address
    const merchant = merchantsData.merchants.find(merchant => merchant.address === address);

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    return res.status(200).json(merchant);
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 