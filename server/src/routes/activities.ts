import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

// Helper to map DB activity row
export function mapDbActivity(row: any) {
  if (!row) return null;
  const getVal = (lowerKey: string, camelKey: string) => {
    return row[lowerKey] !== undefined ? row[lowerKey] : row[camelKey];
  };
  return {
    id: row.id,
    type: row.type,
    timestamp: row.timestamp,
    customerId: getVal('customerid', 'customerId'),
    customerName: getVal('customername', 'customerName'),
    details: row.details
  };
}

// 1. GET /activities - Retrieve recent logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM activities ORDER BY timestamp DESC LIMIT 50');
    const activities = result.rows.map(mapDbActivity);
    return res.json(activities);
  } catch (error) {
    console.error('GET /activities error:', error);
    return res.status(500).json({ error: 'Failed to retrieve activity history.' });
  }
});

export default router;
