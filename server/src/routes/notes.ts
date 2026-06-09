import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

// Helper to map DB note row
export function mapDbNote(row: any) {
  if (!row) return null;
  const getVal = (lowerKey: string, camelKey: string) => {
    return row[lowerKey] !== undefined ? row[lowerKey] : row[camelKey];
  };
  return {
    id: row.id,
    customerId: getVal('customerid', 'customerId'),
    text: row.text,
    author: row.author,
    createdAt: getVal('createdat', 'createdAt')
  };
}

// 1. GET /notes/:customerId - Get notes for a specific customer
router.get('/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const result = await query(
      'SELECT * FROM notes WHERE customerId = $1 ORDER BY createdAt DESC',
      [customerId]
    );
    const notes = result.rows.map(mapDbNote);
    return res.json(notes);
  } catch (error) {
    console.error('GET /notes/:customerId error:', error);
    return res.status(500).json({ error: 'Failed to retrieve notes.' });
  }
});

// 2. POST /notes - Add a note
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, text, author } = req.body;

    if (!customerId || !text || !author) {
      return res.status(400).json({ error: 'customerId, text, and author are required.' });
    }

    const id = `note_${Date.now()}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO notes (id, customerId, text, author, createdAt) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, customerId, text, author, now]
    );

    // Create activity
    const clientResult = await query('SELECT firstName, lastName FROM customers WHERE id = $1', [customerId]);
    if (clientResult.rowCount > 0) {
      const clientName = `${clientResult.rows[0].firstname || clientResult.rows[0].firstName} ${clientResult.rows[0].lastname || clientResult.rows[0].lastName}`;
      const details = `Note logged: "${text.slice(0, 40)}${text.length > 40 ? '...' : ''}"`;
      await query(
        `INSERT INTO activities (id, type, timestamp, customerId, customerName, details) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`act_${Date.now()}`, 'note_added', now, customerId, clientName, details]
      );
    }

    const noteResult = await query('SELECT * FROM notes WHERE id = $1', [id]);
    return res.status(201).json(mapDbNote(noteResult.rows[0]));
  } catch (error) {
    console.error('POST /notes error:', error);
    return res.status(500).json({ error: 'Failed to create note.' });
  }
});

// 3. PUT /notes/:id - Edit a note
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required to update note.' });
    }

    const checkNote = await query('SELECT * FROM notes WHERE id = $1', [id]);
    if (checkNote.rowCount === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    await query(
      `UPDATE notes SET text = $1, createdAt = $2 WHERE id = $3`,
      [text, new Date().toISOString(), id]
    );

    const noteResult = await query('SELECT * FROM notes WHERE id = $1', [id]);
    return res.json(mapDbNote(noteResult.rows[0]));
  } catch (error) {
    console.error('PUT /notes/:id error:', error);
    return res.status(500).json({ error: 'Failed to update note.' });
  }
});

// 4. DELETE /notes/:id - Delete a note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const checkNote = await query('SELECT * FROM notes WHERE id = $1', [id]);
    if (checkNote.rowCount === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    await query('DELETE FROM notes WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('DELETE /notes/:id error:', error);
    return res.status(500).json({ error: 'Failed to delete note.' });
  }
});

export default router;
