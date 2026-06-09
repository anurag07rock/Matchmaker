export interface MatchPreferences {
  genders: ('male' | 'female' | 'non-binary' | 'other')[];
  ageRange: {
    min: number;
    max: number;
  };
  locations: string[]; // Preferred cities or regions
  dealbreakers?: string[]; // e.g. "smoker", "no pets"
}

export type CustomerStatus = 'active' | 'inactive' | 'paused' | 'matched';
export type GenderType = 'male' | 'female' | 'non-binary' | 'other';
export type MaritalStatusType = 'single' | 'divorced' | 'widowed' | 'separated';

export interface Customer {
  // Original Identification & Status
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: CustomerStatus;
  gender: GenderType;
  age: number;
  city: string;
  country: string;
  maritalStatus: MaritalStatusType;
  createdAt: string;
  updatedAt: string;

  // New & Extended Biodata - Basic Details
  dob: string;            // Date of Birth (YYYY-MM-DD)
  height: string;         // e.g. "5'11\"" or "180 cm"
  religion?: string;
  caste?: string;
  motherTongue: string;
  languages: string[];
  bio: string;            // Self-intro / bio description

  // New & Extended Biodata - Career & Education
  occupation?: string;    // e.g. "Software Engineer"
  designation: string;    // e.g. "Senior Frontend Developer"
  company: string;        // e.g. "Google"
  college: string;        // e.g. "Stanford University"
  degree: string;         // e.g. "M.S. in Computer Science"
  income: string;         // e.g. "$120,000 / year" or "12 LPA"

  // New & Extended Biodata - Family
  familyType: 'nuclear' | 'joint' | 'extended' | 'other' | string;
  siblings: string;       // e.g. "1 brother, 1 sister"

  // New & Extended Biodata - Lifestyle & Habits
  hobbies: string[];
  interests: string[];
  diet: 'veg' | 'non-veg' | 'vegan' | 'halal' | 'kosher' | 'other' | string;
  smoking: 'yes' | 'no' | 'occasionally' | string;
  drinking: 'yes' | 'no' | 'socially' | string;
  openToRelocate: 'yes' | 'no' | 'open' | boolean | string;
  openToPets: 'yes' | 'no' | 'open' | boolean | string;

  // Matching Preferences
  hasChildren: boolean;
  wantsChildren: 'yes' | 'no' | 'open'; // Legacy alignment
  wantKids: 'yes' | 'no' | 'open';      // Added for Day 2 compliance
  matchPreferences: MatchPreferences;
  internalNotes?: string[]; // Matchmaker internal notes
  horoscope?: string;
  verificationStatus?: 'verified' | 'pending' | 'unverified' | string;
}

