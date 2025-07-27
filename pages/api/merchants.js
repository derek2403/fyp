import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'merchants.json');

function readData() {
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    return { merchants: [] };
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
        const { address, id } = req.query;
        
        if (address) {
          const merchant = data.merchants.find(m => m.address === address);
          return res.status(200).json(merchant || null);
        }
        
        if (id) {
          const merchant = data.merchants.find(m => m.id === id);
          return res.status(200).json(merchant || null);
        }
        
        return res.status(200).json(data.merchants);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to read merchants' });
      }

    case 'POST':
      try {
        const data = readData();
        const newMerchant = {
          id: `merchant_${Date.now()}`,
          ...req.body,
          totalReviews: 0,
          averageRating: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalCustomers: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        data.merchants.push(newMerchant);
        writeData(data);
        
        return res.status(201).json(newMerchant);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create merchant' });
      }

    case 'PUT':
      try {
        const data = readData();
        const { id } = req.query;
        const merchantIndex = data.merchants.findIndex(m => m.id === id);
        
        if (merchantIndex === -1) {
          return res.status(404).json({ error: 'Merchant not found' });
        }
        
        data.merchants[merchantIndex] = {
          ...data.merchants[merchantIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        
        writeData(data);
        return res.status(200).json(data.merchants[merchantIndex]);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update merchant' });
      }

    case 'DELETE':
      try {
        const data = readData();
        const { id } = req.query;
        const merchantIndex = data.merchants.findIndex(m => m.id === id);
        
        if (merchantIndex === -1) {
          return res.status(404).json({ error: 'Merchant not found' });
        }
        
        data.merchants.splice(merchantIndex, 1);
        writeData(data);
        
        return res.status(200).json({ message: 'Merchant deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete merchant' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}