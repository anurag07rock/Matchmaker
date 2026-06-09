import { query } from './connection';

export async function createSchema() {
  console.log('Initializing database schema tables...');

  // 1. Users (Matchmaker Account) Table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT,
      theme TEXT DEFAULT 'light'
    )
  `);

  // 2. Customers Table
  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      avatarUrl TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      gender TEXT NOT NULL,
      age INTEGER NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      maritalStatus TEXT NOT NULL,
      dob TEXT NOT NULL,
      height TEXT NOT NULL,
      religion TEXT,
      caste TEXT,
      motherTongue TEXT NOT NULL,
      languages TEXT NOT NULL,
      bio TEXT NOT NULL,
      occupation TEXT,
      designation TEXT NOT NULL,
      company TEXT NOT NULL,
      college TEXT NOT NULL,
      degree TEXT NOT NULL,
      income TEXT NOT NULL,
      familyType TEXT NOT NULL,
      siblings TEXT NOT NULL,
      hobbies TEXT NOT NULL,
      interests TEXT NOT NULL,
      diet TEXT NOT NULL,
      smoking TEXT NOT NULL,
      drinking TEXT NOT NULL,
      openToRelocate TEXT NOT NULL,
      openToPets TEXT NOT NULL,
      hasChildren BOOLEAN NOT NULL DEFAULT FALSE,
      wantsChildren TEXT NOT NULL DEFAULT 'open',
      wantKids TEXT NOT NULL DEFAULT 'open',
      matchPreferences TEXT NOT NULL,
      horoscope TEXT,
      verificationStatus TEXT DEFAULT 'verified',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // 3. Matches Table
  await query(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      proposedMatchId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'proposed',
      matchmakerNotes TEXT,
      aiReport TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // 4. Notes Table
  await query(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  // 5. Activities Table
  await query(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      customerId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      details TEXT NOT NULL
    )
  `);

  console.log('Database schema tables verified successfully.');
}
