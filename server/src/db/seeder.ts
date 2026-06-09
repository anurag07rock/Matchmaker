import bcrypt from 'bcryptjs';
import { initDb, query } from './connection';
import { createSchema } from './schema';
import { mockCustomers } from '../data/customers';
import { mockMatches } from '../data/matches';

const PRESET_USERS = [
  {
    id: 'user_01',
    email: 'maggie@thedatecrew.com',
    phone: '+1 555-0199',
    password: 'password123',
    name: 'Maggie Crew',
    title: 'Senior Matchmaker',
    theme: 'light'
  },
  {
    id: 'user_02',
    email: 'william@thedatecrew.com',
    phone: '+1 555-0188',
    password: 'password456',
    name: 'William Sterling',
    title: 'Lead Matchmaker',
    theme: 'dark'
  },
  {
    id: 'user_03',
    email: 'chloe@thedatecrew.com',
    phone: '+1 555-0177',
    password: 'password789',
    name: 'Chloe Valance',
    title: 'Associate Matchmaker',
    theme: 'light'
  },
  {
    id: 'user_04',
    email: 'alex@thedatecrew.com',
    phone: '+1 555-0166',
    password: 'password321',
    name: 'Alex Thorne',
    title: 'Matchmaking Agent',
    theme: 'dark'
  }
];

const HOROSCOPES = [
  'Aries (Mesh)', 'Taurus (Vrishabh)', 'Gemini (Mithun)', 'Cancer (Kark)',
  'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrishchik)',
  'Sagittarius (Dhanu)', 'Capricorn (Makar)', 'Aquarius (Kumbha)', 'Pisces (Meen)'
];

const VERIFICATION_STATUSES = ['verified', 'verified', 'verified', 'pending'];

export async function seed() {
  try {
    await initDb();
    await createSchema();

    console.log('Clearing existing database tables...');
    await query('DELETE FROM users');
    await query('DELETE FROM customers');
    await query('DELETE FROM matches');
    await query('DELETE FROM notes');
    await query('DELETE FROM activities');
    console.log('Tables cleared.');

    console.log('Seeding matchmaker accounts...');
    for (const user of PRESET_USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await query(
        `INSERT INTO users (id, email, phone, password, name, title, theme) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, user.email, user.phone, hashedPassword, user.name, user.title, user.theme]
      );
    }
    console.log(`Seeded ${PRESET_USERS.length} matchmaker accounts.`);

    console.log('Seeding customer profiles...');
    let custCount = 0;
    for (const c of mockCustomers) {
      // Add dynamic horoscope and verificationStatus
      const hIndex = Math.abs(c.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % HOROSCOPES.length;
      const vIndex = Math.abs(c.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % VERIFICATION_STATUSES.length;
      
      const horoscope = c.horoscope || HOROSCOPES[hIndex];
      const verificationStatus = c.verificationStatus || VERIFICATION_STATUSES[vIndex];

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
          c.id,
          c.firstName,
          c.lastName,
          c.email,
          c.phone,
          c.avatarUrl || null,
          c.status,
          c.gender,
          c.age,
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
          JSON.stringify(c.matchPreferences),
          horoscope,
          verificationStatus,
          c.createdAt || new Date().toISOString(),
          c.updatedAt || new Date().toISOString()
        ]
      );

      // Seed internal notes from customer details if present
      if (c.internalNotes && c.internalNotes.length > 0) {
        for (let idx = 0; idx < c.internalNotes.length; idx++) {
          const noteText = c.internalNotes[idx];
          const noteId = `note_seed_${c.id}_${idx}`;
          // Extract text if note is stored as JSON string in legacy structure
          let text = noteText;
          let author = 'Maggie Crew (Senior Matchmaker)';
          let createdAt = c.createdAt;

          try {
            if (noteText.trim().startsWith('{')) {
              const parsed = JSON.parse(noteText);
              text = parsed.text || noteText;
              author = parsed.author || author;
              createdAt = parsed.createdAt || createdAt;
            }
          } catch (e) {
            // Not JSON, keep text as is
          }

          await query(
            `INSERT INTO notes (id, customerId, text, author, createdAt) 
             VALUES ($1, $2, $3, $4, $5)`,
            [noteId, c.id, text, author, createdAt]
          );
        }
      }

      custCount++;
    }
    console.log(`Seeded ${custCount} customer profiles with extended fields.`);

    console.log('Seeding initial match pairs...');
    let matchCount = 0;
    for (const m of mockMatches) {
      await query(
        `INSERT INTO matches (id, customerId, proposedMatchId, status, matchmakerNotes, aiReport, createdAt, updatedAt) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          m.id,
          m.customerId,
          m.proposedMatchId,
          m.status,
          m.matchmakerNotes || null,
          JSON.stringify(m.aiReport || {}),
          m.createdAt,
          m.updatedAt
        ]
      );
      matchCount++;
    }
    console.log(`Seeded ${matchCount} match records.`);

    console.log('Seeding initial system activity logs...');
    const initialActivities = [
      {
        id: 'act_01',
        type: 'customer_added',
        timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
        customerId: 'cust_01',
        customerName: 'Alexander Wright',
        details: 'Profile onboarding completed.'
      },
      {
        id: 'act_02',
        type: 'match_suggested',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
        customerId: 'cust_01',
        customerName: 'Alexander Wright',
        details: 'Algorithmic recommendation generated with Sophia Chen.'
      },
      {
        id: 'act_03',
        type: 'note_added',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        customerId: 'cust_02',
        customerName: 'Sophia Chen',
        details: 'Interview note added: Expresses strong desire for a creative partner.'
      }
    ];

    for (const act of initialActivities) {
      await query(
        `INSERT INTO activities (id, type, timestamp, customerId, customerName, details) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [act.id, act.type, act.timestamp, act.customerId, act.customerName, act.details]
      );
    }
    console.log('Seeded initial dashboard activities.');

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  seed().then(() => process.exit(0));
}
