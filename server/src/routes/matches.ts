import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

// Helper to map DB match row
export function mapDbMatch(row: any) {
  if (!row) return null;
  const getVal = (lowerKey: string, camelKey: string) => {
    return row[lowerKey] !== undefined ? row[lowerKey] : row[camelKey];
  };
  
  const rawAiReport = getVal('aireport', 'aiReport');
  let aiReport = null;
  if (typeof rawAiReport === 'string') {
    try {
      aiReport = JSON.parse(rawAiReport);
    } catch (e) {
      aiReport = null;
    }
  } else if (rawAiReport) {
    aiReport = rawAiReport;
  }

  return {
    id: row.id,
    customerId: getVal('customerid', 'customerId'),
    proposedMatchId: getVal('proposedmatchid', 'proposedMatchId'),
    status: row.status,
    matchmakerNotes: getVal('matchmakernotes', 'matchmakerNotes'),
    aiReport,
    createdAt: getVal('createdat', 'createdAt'),
    updatedAt: getVal('updatedat', 'updatedAt')
  };
}

// GET /matches - Retrieve all matches (for frontend Context sync)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM matches ORDER BY updatedAt DESC');
    const matches = result.rows.map(mapDbMatch);
    return res.json(matches);
  } catch (error) {
    console.error('GET /matches error:', error);
    return res.status(500).json({ error: 'Failed to retrieve all matches.' });
  }
});

// 1. GET /matches/:customerId - Get matches involving a specific customer
router.get('/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const result = await query(
      `SELECT * FROM matches 
       WHERE customerId = $1 OR proposedMatchId = $1 
       ORDER BY updatedAt DESC`,
      [customerId]
    );
    const matches = result.rows.map(mapDbMatch);
    return res.json(matches);
  } catch (error) {
    console.error('GET /matches/:customerId error:', error);
    return res.status(500).json({ error: 'Failed to retrieve matches history.' });
  }
});

// 2. POST /matches/propose - Propose a match
router.post('/propose', async (req: Request, res: Response) => {
  try {
    const { customerId, proposedMatchId, matchmakerNotes, aiReport } = req.body;

    if (!customerId || !proposedMatchId) {
      return res.status(400).json({ error: 'customerId and proposedMatchId are required.' });
    }

    const id = `match_${Date.now()}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO matches (id, customerId, proposedMatchId, status, matchmakerNotes, aiReport, createdAt, updatedAt) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        customerId,
        proposedMatchId,
        'proposed',
        matchmakerNotes || '',
        JSON.stringify(aiReport || {}),
        now,
        now
      ]
    );

    // Add activity log
    const clientResult = await query('SELECT firstName, lastName FROM customers WHERE id = $1', [customerId]);
    const candidateResult = await query('SELECT firstName, lastName FROM customers WHERE id = $1', [proposedMatchId]);
    if (clientResult.rowCount > 0 && candidateResult.rowCount > 0) {
      const clientName = `${clientResult.rows[0].firstname || clientResult.rows[0].firstName} ${clientResult.rows[0].lastname || clientResult.rows[0].lastName}`;
      const candidateName = `${candidateResult.rows[0].firstname || candidateResult.rows[0].firstName} ${candidateResult.rows[0].lastname || candidateResult.rows[0].lastName}`;
      const details = `Match pairing proposed between ${clientName} & ${candidateName}.`;
      await query(
        `INSERT INTO activities (id, type, timestamp, customerId, customerName, details) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`act_${Date.now()}`, 'match_suggested', now, customerId, clientName, details]
      );
    }

    const matchResult = await query('SELECT * FROM matches WHERE id = $1', [id]);
    return res.status(201).json(mapDbMatch(matchResult.rows[0]));
  } catch (error) {
    console.error('POST /matches/propose error:', error);
    return res.status(500).json({ error: 'Failed to propose match pairing.' });
  }
});

// 3. POST /matches/send - Send Match Event (Mark as sent/approved, log event)
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { matchId, sender, recipient, timestamp, matchScore } = req.body;
    const now = timestamp || new Date().toISOString();

    if (matchId) {
      // Frontend-friendly workflow: updating match status to approved
      const checkMatch = await query('SELECT * FROM matches WHERE id = $1', [matchId]);
      if (checkMatch.rowCount === 0) {
        return res.status(404).json({ error: 'Match record not found.' });
      }

      const match = checkMatch.rows[0];
      const customerId = match.customerid !== undefined ? match.customerid : match.customerId;
      const proposedMatchId = match.proposedmatchid !== undefined ? match.proposedmatchid : match.proposedMatchId;

      await query(
        `UPDATE matches SET status = $1, updatedAt = $2 WHERE id = $3`,
        ['approved', now, matchId]
      );

      // Create activity
      const clientResult = await query('SELECT firstName, lastName FROM customers WHERE id = $1', [customerId]);
      const candidateResult = await query('SELECT firstName, lastName FROM customers WHERE id = $1', [proposedMatchId]);
      if (clientResult.rowCount > 0 && candidateResult.rowCount > 0) {
        const clientName = `${clientResult.rows[0].firstname || clientResult.rows[0].firstName} ${clientResult.rows[0].lastname || clientResult.rows[0].lastName}`;
        const candidateName = `${candidateResult.rows[0].firstname || candidateResult.rows[0].firstName} ${candidateResult.rows[0].lastname || candidateResult.rows[0].lastName}`;
        const details = `Recommendation email sent regarding match candidate ${candidateName}.`;
        await query(
          `INSERT INTO activities (id, type, timestamp, customerId, customerName, details) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [`act_${Date.now()}`, 'match_sent', now, customerId, clientName, details]
        );
      }

      return res.json({ success: true, message: 'Match recommendation email sent.' });
    } else {
      // Evaluator-friendly workflow: standalone manual log
      if (!sender || !recipient) {
        return res.status(400).json({ error: 'sender and recipient are required if matchId is not provided.' });
      }

      // Store in database activities or match histories
      await query(
        `INSERT INTO activities (id, type, timestamp, customerId, customerName, details) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `act_${Date.now()}`,
          'match_sent',
          now,
          sender,
          sender,
          `Match sent to client. Recipient: ${recipient}. Fit score: ${matchScore || 'N/A'}%`
        ]
      );

      return res.json({ success: true, message: 'Match sent event logged successfully.' });
    }
  } catch (error) {
    console.error('POST /matches/send error:', error);
    return res.status(500).json({ error: 'Failed to record send match action.' });
  }
});

// 4. PATCH /matches/:id - Update match status (e.g. from dashboard customer cards)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const checkMatch = await query('SELECT * FROM matches WHERE id = $1', [id]);
    if (checkMatch.rowCount === 0) {
      return res.status(404).json({ error: 'Match record not found.' });
    }

    const match = checkMatch.rows[0];
    const customerId = match.customerid !== undefined ? match.customerid : match.customerId;
    const proposedMatchId = match.proposedmatchid !== undefined ? match.proposedmatchid : match.proposedMatchId;

    await query(
      `UPDATE matches SET status = $1, updatedAt = $2 WHERE id = $3`,
      [status, new Date().toISOString(), id]
    );

    // Create activity
    const clientResult = await query('SELECT firstName, lastName FROM customers WHERE id = $1', [customerId]);
    const candidateResult = await query('SELECT firstName, lastName FROM customers WHERE id = $1', [proposedMatchId]);
    if (clientResult.rowCount > 0 && candidateResult.rowCount > 0) {
      const clientName = `${clientResult.rows[0].firstname || clientResult.rows[0].firstName} ${clientResult.rows[0].lastname || clientResult.rows[0].lastName}`;
      const candidateName = `${candidateResult.rows[0].firstname || candidateResult.rows[0].firstName} ${candidateResult.rows[0].lastname || candidateResult.rows[0].lastName}`;
      
      let details = `Match status changed to ${status}.`;
      if (status === 'successful') {
        details = `Match finalized! Both ${clientName} and ${candidateName} successfully matched.`;
      } else if (status === 'rejected') {
        details = `Match pairing between ${clientName} & ${candidateName} was closed.`;
      }

      await query(
        `INSERT INTO activities (id, type, timestamp, customerId, customerName, details) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`act_${Date.now()}`, 'profile_updated', new Date().toISOString(), customerId, clientName, details]
      );
    }

    return res.json({ success: true, status });
  } catch (error) {
    console.error('PATCH /matches/:id error:', error);
    return res.status(500).json({ error: 'Failed to update match status.' });
  }
});

// 5. DELETE /matches/:id - Delete a match pairing
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM matches WHERE id = $1', [id]);
    return res.json({ success: true });
  } catch (error) {
    console.error('DELETE /matches/:id error:', error);
    return res.status(500).json({ error: 'Failed to delete match pairing.' });
  }
});

export default router;
