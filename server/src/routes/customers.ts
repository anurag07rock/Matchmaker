import { Router, Request, Response } from 'express';
import { query } from '../db/connection';

const router = Router();

// Helper to map DB row keys (handles both SQLite camelCase and PostgreSQL lowercase folding)
export function mapDbCustomer(row: any, notesArray: string[] = []) {
  if (!row) return null;
  
  const getVal = (lowerKey: string, camelKey: string) => {
    return row[lowerKey] !== undefined ? row[lowerKey] : row[camelKey];
  };

  const parseJsonField = (lowerKey: string, camelKey: string) => {
    const rawVal = getVal(lowerKey, camelKey);
    if (typeof rawVal === 'string') {
      try {
        return JSON.parse(rawVal);
      } catch (e) {
        return [];
      }
    }
    return rawVal || [];
  };

  const hasChildrenVal = getVal('haschildren', 'hasChildren');

  return {
    id: row.id,
    firstName: getVal('firstname', 'firstName'),
    lastName: getVal('lastname', 'lastName'),
    email: row.email,
    phone: row.phone,
    avatarUrl: getVal('avatarurl', 'avatarUrl'),
    status: row.status,
    gender: row.gender,
    age: Number(row.age),
    city: row.city,
    country: row.country,
    maritalStatus: getVal('maritalstatus', 'maritalStatus'),
    dob: row.dob,
    height: row.height,
    religion: row.religion,
    caste: row.caste,
    motherTongue: getVal('mothertongue', 'motherTongue'),
    languages: parseJsonField('languages', 'languages'),
    bio: row.bio,
    occupation: row.occupation,
    designation: row.designation,
    company: row.company,
    college: row.college,
    degree: row.degree,
    income: row.income,
    familyType: getVal('familytype', 'familyType'),
    siblings: row.siblings,
    hobbies: parseJsonField('hobbies', 'hobbies'),
    interests: parseJsonField('interests', 'interests'),
    diet: row.diet,
    smoking: row.smoking,
    drinking: row.drinking,
    openToRelocate: getVal('opentorelocate', 'openToRelocate'),
    openToPets: getVal('opentopets', 'openToPets'),
    hasChildren: hasChildrenVal === 1 || hasChildrenVal === true || hasChildrenVal === 'true',
    wantsChildren: getVal('wantschildren', 'wantsChildren'),
    wantKids: getVal('wantkids', 'wantKids'),
    matchPreferences: parseJsonField('matchpreferences', 'matchPreferences'),
    horoscope: row.horoscope,
    verificationStatus: getVal('verificationstatus', 'verificationStatus'),
    createdAt: getVal('createdat', 'createdAt'),
    updatedAt: getVal('updatedat', 'updatedAt'),
    internalNotes: notesArray
  };
}

// 1. GET /customers - Get all customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM customers ORDER BY id DESC');
    
    // Retrieve all notes to attach to customers
    const notesResult = await query('SELECT * FROM notes ORDER BY createdAt ASC');
    const notesByCustId: { [key: string]: string[] } = {};
    for (const n of notesResult.rows) {
      const cId = n.customerid !== undefined ? n.customerid : n.customerId;
      if (!notesByCustId[cId]) {
        notesByCustId[cId] = [];
      }
      notesByCustId[cId].push(JSON.stringify({
        id: n.id,
        text: n.text,
        createdAt: n.createdat !== undefined ? n.createdat : n.createdAt,
        author: n.author
      }));
    }

    const customers = result.rows.map(row => mapDbCustomer(row, notesByCustId[row.id] || []));
    return res.json(customers);
  } catch (error) {
    console.error('GET /customers error:', error);
    return res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
});

// 2. GET /customers/:id - Get a single customer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Customer profile not found.' });
    }

    // Retrieve notes for this customer
    const notesResult = await query('SELECT * FROM notes WHERE customerId = $1 ORDER BY createdAt ASC', [id]);
    const internalNotes = notesResult.rows.map(n => JSON.stringify({
      id: n.id,
      text: n.text,
      createdAt: n.createdat !== undefined ? n.createdat : n.createdAt,
      author: n.author
    }));

    return res.json(mapDbCustomer(result.rows[0], internalNotes));
  } catch (error) {
    console.error('GET /customers/:id error:', error);
    return res.status(500).json({ error: 'Failed to retrieve customer profile.' });
  }
});

// 3. POST /customers - Onboard new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const c = req.body;
    const id = c.id || `cust_${Date.now()}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO customers (
        id, firstName, lastName, email, phone, avatarUrl, status, gender, age, city, country, 
        maritalStatus, dob, height, religion, caste, motherTongue, languages, bio, occupation, 
        designation, company, college, degree, income, familyType, siblings, hobbies, interests, 
        diet, smoking, drinking, openToRelocate, openToPets, hasChildren, wantsChildren, wantKids, 
        matchPreferences, horoscope, verificationStatus, createdAt, updatedAt
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42
      )`,
      [
        id,
        c.firstName,
        c.lastName,
        c.email,
        c.phone || null,
        c.avatarUrl || null,
        c.status || 'active',
        c.gender,
        Number(c.age),
        c.city,
        c.country,
        c.maritalStatus,
        c.dob,
        c.height,
        c.religion || null,
        c.caste || null,
        c.motherTongue,
        JSON.stringify(c.languages || []),
        c.bio,
        c.occupation || null,
        c.designation,
        c.company,
        c.college,
        c.degree,
        c.income,
        c.familyType,
        c.siblings,
        JSON.stringify(c.hobbies || []),
        JSON.stringify(c.interests || []),
        c.diet,
        c.smoking,
        c.drinking,
        String(c.openToRelocate),
        String(c.openToPets),
        c.hasChildren ? 1 : 0,
        c.wantsChildren || 'open',
        c.wantKids || 'open',
        JSON.stringify(c.matchPreferences || {}),
        c.horoscope || 'N/A',
        c.verificationStatus || 'verified',
        c.createdAt || now,
        c.updatedAt || now
      ]
    );

    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    return res.status(201).json(mapDbCustomer(result.rows[0]));
  } catch (error) {
    console.error('POST /customers error:', error);
    return res.status(500).json({ error: 'Failed to onboard new customer.' });
  }
});

// 4. PATCH /customers/:id - Update customer details/status
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const checkResult = await query('SELECT * FROM customers WHERE id = $1', [id]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const currentCustomer = checkResult.rows[0];
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of keys) {
      let val = updates[key];
      if (['languages', 'hobbies', 'interests', 'matchPreferences'].includes(key)) {
        val = JSON.stringify(val);
      } else if (key === 'hasChildren') {
        val = val ? 1 : 0;
      }

      // We quote the column name to handle case folding if double quotes were used, or let SQL resolve it.
      // Standard SQL double quoting resolves exact casing: e.g. "firstName" or "firstName" -> SQLite/Postgres.
      setClauses.push(`"${key}" = $${idx}`);
      values.push(val);
      idx++;
    }

    values.push(new Date().toISOString());
    values.push(id);
    
    const queryText = `UPDATE customers SET ${setClauses.join(', ')}, "updatedAt" = $${idx} WHERE id = $${idx + 1}`;
    await query(queryText, values);

    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    return res.json(mapDbCustomer(result.rows[0]));
  } catch (error) {
    console.error('PATCH /customers/:id error:', error);
    return res.status(500).json({ error: 'Failed to update customer profile.' });
  }
});

export default router;
