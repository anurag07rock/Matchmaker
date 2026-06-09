import { Customer } from '../types/customer';

const handCuratedCustomers: Customer[] = [
  {
    id: 'cust_01',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'alex.wright@email.com',
    phone: '555-0101',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'active',
    gender: 'male',
    age: 32,
    city: 'New York',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1994-04-12',
    height: "6'0\"",
    religion: 'Non-religious',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English', 'Spanish'],
    bio: 'Passionate about building solutions and exploring nature. Looking for someone to share morning coffees, weekend hikes, and thoughtful conversations about everything and nothing.',
    occupation: 'Software Engineer',
    designation: 'Senior Frontend Developer',
    company: 'Vercel',
    college: 'Cornell University',
    degree: 'M.S. in Computer Science',
    income: '$145,000 / year',
    familyType: 'nuclear',
    siblings: '1 younger sister',
    hobbies: ['Hiking', 'Photography', 'Cooking'],
    interests: ['Technology', 'Modern Art', 'Specialty Coffee', 'Indie Rock'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'open',
    wantKids: 'open',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 28, max: 35 },
      locations: ['New York', 'Brooklyn', 'Hoboken'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Very articulate and career-oriented. Values intellect and independent hobbies.',
      'Responsive in communications. Prefers casual first dates.'
    ],
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'cust_02',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@email.com',
    phone: '555-0102',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'active',
    gender: 'female',
    age: 30,
    city: 'New York',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1996-08-22',
    height: "5'5\"",
    religion: 'Spiritual',
    caste: 'N/A',
    motherTongue: 'Mandarin',
    languages: ['English', 'Mandarin'],
    bio: 'Creative soul with an analytical mind. I love finding beauty in the details of the city. Seeking a partner who is kind, driven, and values creativity and open communication.',
    occupation: 'UX Designer',
    designation: 'Lead Product Designer',
    company: 'Stripe',
    college: 'Rhode Island School of Design (RISD)',
    degree: 'B.F.A. in Communication Design',
    income: '$130,000 / year',
    familyType: 'nuclear',
    siblings: 'None (Only child)',
    hobbies: ['Oil Painting', 'Yoga', 'Baking'],
    interests: ['Design Systems', 'Foreign Films', 'Architectural History', 'Travel'],
    diet: 'veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'yes',
    wantKids: 'yes',
    matchPreferences: {
      genders: ['male', 'non-binary'],
      ageRange: { min: 29, max: 37 },
      locations: ['New York', 'Brooklyn'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Expresses a strong desire for a creative partner who understands design/art.',
      'Wants someone based in NYC; not open to relocation.'
    ],
    createdAt: '2026-02-10T10:15:00Z',
    updatedAt: '2026-05-28T14:45:00Z'
  },
  {
    id: 'cust_03',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.j@email.com',
    phone: '555-0103',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    gender: 'male',
    age: 35,
    city: 'San Francisco',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1991-11-05',
    height: "6'2\"",
    religion: 'Agnostic',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Curious researcher who loves the outdoors. I spend my weekdays looking at cells and my weekends scaling granite cliffs. Hoping to find an active partner who values science and adventure.',
    occupation: 'Biotech Researcher',
    designation: 'Principal Scientist',
    company: 'Genentech',
    college: 'UC Berkeley',
    degree: 'Ph.D. in Molecular Biology',
    income: '$165,000 / year',
    familyType: 'nuclear',
    siblings: '1 older brother',
    hobbies: ['Rock Climbing', 'Playing Guitar', 'Cycling'],
    interests: ['Science Fiction', 'Sustainability', 'Live Music', 'Craft Beer'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'yes',
    wantKids: 'yes',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 30, max: 38 },
      locations: ['San Francisco', 'Oakland', 'Berkeley'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Very down-to-earth and intelligent. Active lifestyle is a primary matching indicator.'
    ],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-06-03T10:00:00Z'
  },
  {
    id: 'cust_04',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@email.com',
    phone: '555-0104',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active',
    gender: 'female',
    age: 33,
    city: 'San Francisco',
    country: 'USA',
    maritalStatus: 'divorced',
    dob: '1993-01-30',
    height: "5'8\"",
    religion: 'Christian',
    caste: 'N/A',
    motherTongue: 'Russian',
    languages: ['English', 'Russian', 'French'],
    bio: 'Independent parent and tech professional. I love early morning runs and sunset sails. Looking for a mature, emotionally intelligent partner who is ready for a genuine, supportive partnership.',
    occupation: 'Product Manager',
    designation: 'Director of Product',
    company: 'Airbnb',
    college: 'Stanford Graduate School of Business',
    degree: 'MBA',
    income: '$210,000 / year',
    familyType: 'nuclear',
    siblings: 'None',
    hobbies: ['Running', 'Sailing', 'Wine Tasting'],
    interests: ['Economic History', 'Opera', 'French Cuisine', 'Mindfulness'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: true,
    wantsChildren: 'open',
    wantKids: 'open',
    matchPreferences: {
      genders: ['male'],
      ageRange: { min: 32, max: 42 },
      locations: ['San Francisco', 'Marin County'],
      dealbreakers: ['no pets']
    },
    internalNotes: [
      'Has a 6-year-old child. Requires partners who are comfortable with kids.'
    ],
    createdAt: '2026-03-12T14:20:00Z',
    updatedAt: '2026-05-30T09:15:00Z'
  },
  {
    id: 'cust_05',
    firstName: 'Taylor',
    lastName: 'Jordan',
    email: 'taylor.jordan@email.com',
    phone: '555-0105',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    status: 'active',
    gender: 'non-binary',
    age: 28,
    city: 'Austin',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1998-05-18',
    height: "5'7\"",
    religion: 'Spiritual',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Fluid, eclectic, and highly energetic. I live and breathe creative projects. Searching for a partner who is comfortable in their own skin, enjoys nightlife and art galleries, and doesn\'t take life too seriously.',
    occupation: 'Creative Director',
    designation: 'Senior Creative Director',
    company: 'Self-employed (Studio Jordan)',
    college: 'University of Texas at Austin',
    degree: 'B.A. in Fine Arts',
    income: '$95,000 / year',
    familyType: 'nuclear',
    siblings: '2 brothers',
    hobbies: ['DJing', 'Thrifting', 'Gardening'],
    interests: ['Electronic Music', 'Queer Cinema', 'Subtropical Plants', 'Tattoos'],
    diet: 'vegan',
    smoking: 'occasionally',
    drinking: 'socially',
    openToRelocate: 'yes',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'no',
    wantKids: 'no',
    matchPreferences: {
      genders: ['male', 'female', 'non-binary'],
      ageRange: { min: 25, max: 32 },
      locations: ['Austin'],
      dealbreakers: ['conservative']
    },
    internalNotes: [
      'Very liberal. Prefers dating within the creative and artistic community.'
    ],
    createdAt: '2026-01-20T11:40:00Z',
    updatedAt: '2026-06-04T16:22:00Z'
  },
  {
    id: 'cust_06',
    firstName: 'David',
    lastName: 'Miller',
    email: 'david.miller@email.com',
    phone: '555-0106',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'paused',
    gender: 'male',
    age: 41,
    city: 'Chicago',
    country: 'USA',
    maritalStatus: 'divorced',
    dob: '1985-02-14',
    height: "5'11\"",
    religion: 'Jewish',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English', 'Hebrew'],
    bio: 'Proud father of two teens. Balanced professional life with active fatherhood. Seeking a partner who is elegant, intelligent, independent, and values deep conversation and dry humor.',
    occupation: 'Corporate Lawyer',
    designation: 'Partner',
    company: 'Kirkland & Ellis',
    college: 'Northwestern University Pritzker School of Law',
    degree: 'J.D.',
    income: '$320,000 / year',
    familyType: 'nuclear',
    siblings: '1 sister',
    hobbies: ['Golf', 'Woodworking', 'Reading History'],
    interests: ['Rare Books', 'Jazz', 'Whiskey Tasting', 'Football'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: true,
    wantsChildren: 'no',
    wantKids: 'no',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 35, max: 45 },
      locations: ['Chicago', 'Evanston'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Shared custody of children. Needs a partner who does not want to have additional children.'
    ],
    createdAt: '2026-02-18T16:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z'
  },
  {
    id: 'cust_07',
    firstName: 'Sarah',
    lastName: 'Goldstein',
    email: 'sarah.g@email.com',
    phone: '555-0107',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'active',
    gender: 'female',
    age: 38,
    city: 'Chicago',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1988-06-03',
    height: "5'6\"",
    religion: 'Jewish',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Dedicated to my young patients but ready to invest in a loving partnership. I appreciate intellectual curiosity, kindness, and someone who can make me laugh after a long day at the clinic.',
    occupation: 'Pediatrician',
    designation: 'Attending Pediatrician',
    company: 'Ann & Robert H. Lurie Children\'s Hospital',
    college: 'UChicago Pritzker School of Medicine',
    degree: 'M.D.',
    income: '$185,000 / year',
    familyType: 'nuclear',
    siblings: '2 sisters',
    hobbies: ['Pilates', 'Gourmet Cooking', 'Violin'],
    interests: ['Classical Music', 'Travel Photography', 'Public Health', 'Dogs'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'open',
    wantKids: 'open',
    matchPreferences: {
      genders: ['male'],
      ageRange: { min: 35, max: 44 },
      locations: ['Chicago'],
      dealbreakers: ['no pets']
    },
    internalNotes: [
      'Very warm nature. Highly values Jewish holidays and traditions.'
    ],
    createdAt: '2026-04-05T08:00:00Z',
    updatedAt: '2026-06-02T13:40:00Z'
  },
  {
    id: 'cust_08',
    firstName: 'James',
    lastName: 'O\'Connor',
    email: 'james.oc@email.com',
    phone: '555-0108',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    status: 'active',
    gender: 'male',
    age: 29,
    city: 'Boston',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1997-03-24',
    height: "6'1\"",
    religion: 'Catholic',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Former collegiate rower, now navigating corporate finance. Family-oriented, traditional values, and very close with my siblings. Looking for a partner who values family, faith, and hard work.',
    occupation: 'Financial Analyst',
    designation: 'Senior Investment Analyst',
    company: 'Fidelity Investments',
    college: 'Boston College',
    degree: 'B.S. in Economics',
    income: '$110,000 / year',
    familyType: 'nuclear',
    siblings: '1 brother, 2 sisters',
    hobbies: ['Rowing', 'Skiing', 'Watching Sports'],
    interests: ['Macroeconomics', 'Historical Fiction', 'Irish Pubs', 'Real Estate'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'yes',
    wantKids: 'yes',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 25, max: 31 },
      locations: ['Boston', 'Cambridge'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Catholic values are important. Seeking a family-minded partner.'
    ],
    createdAt: '2026-03-20T10:30:00Z',
    updatedAt: '2026-05-20T11:10:00Z'
  },
  {
    id: 'cust_09',
    firstName: 'Chloe',
    lastName: 'Dubois',
    email: 'chloe.dubois@email.com',
    phone: '555-0109',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    status: 'active',
    gender: 'female',
    age: 27,
    city: 'Boston',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1999-09-12',
    height: "5'3\"",
    religion: 'Agnostic',
    caste: 'N/A',
    motherTongue: 'French',
    languages: ['English', 'French'],
    bio: 'Quiet observer and history lover. I love spending hours in dusty libraries and discovering vintage vinyl. Hoping to find a thoughtful partner who is intellectually curious and kind.',
    occupation: 'Museum Archivist',
    designation: 'Head Archivist',
    company: 'Boston Museum of Fine Arts',
    college: 'Harvard University',
    degree: 'M.A. in Art History',
    income: '$68,000 / year',
    familyType: 'nuclear',
    siblings: '1 younger brother',
    hobbies: ['Calligraphy', 'Visiting Museums', 'Thrift Shopping'],
    interests: ['Renaissance Art', 'Vinyl Records', 'French Literature', 'Vegetarianism'],
    diet: 'veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'open',
    wantKids: 'open',
    matchPreferences: {
      genders: ['male', 'female', 'non-binary'],
      ageRange: { min: 26, max: 34 },
      locations: ['Boston', 'Cambridge'],
      dealbreakers: ['hunter']
    },
    internalNotes: [
      'Warm and introverted. Values writing, arts, and low-key environments.'
    ],
    createdAt: '2026-02-25T14:15:00Z',
    updatedAt: '2026-06-03T09:00:00Z'
  },
  {
    id: 'cust_10',
    firstName: 'Michael',
    lastName: 'Patel',
    email: 'michael.patel@email.com',
    phone: '555-0110',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    status: 'matched',
    gender: 'male',
    age: 34,
    city: 'Seattle',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1992-07-15',
    height: "5'10\"",
    religion: 'Hindu',
    caste: 'Gujarati Patel',
    motherTongue: 'Gujarati',
    languages: ['English', 'Gujarati', 'Hindi'],
    bio: 'Outdoorsman who loves high tech. I roast my own coffee beans and love camping in the Cascades. Looking for a partner who is down-to-earth, loves nature, and enjoys cozy board game nights.',
    occupation: 'Cloud Architect',
    designation: 'Senior Cloud Engineer',
    company: 'Amazon Web Services',
    college: 'University of Washington',
    degree: 'B.S. in Engineering',
    income: '$175,000 / year',
    familyType: 'joint',
    siblings: '1 elder brother',
    hobbies: ['Backpacking', 'Photography', 'Coffee Roasting'],
    interests: ['Cloud Computing', 'National Parks', 'Board Games', 'Sci-fi Books'],
    diet: 'veg',
    smoking: 'no',
    drinking: 'no',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'yes',
    wantKids: 'yes',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 28, max: 34 },
      locations: ['Seattle', 'Bellevue'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Hindu culture is a strong parameter. Enjoys family get-togethers.'
    ],
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'cust_11',
    firstName: 'Olivia',
    lastName: 'Larson',
    email: 'olivia.l@email.com',
    phone: '555-0111',
    avatarUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=150',
    status: 'active',
    gender: 'female',
    age: 31,
    city: 'Seattle',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1995-10-10',
    height: "5'7\"",
    religion: 'Non-religious',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Advocate for the planet by day, amateur chef by night. I have a golden retriever who goes everywhere with me. Seeking an outdoorsy, conscious individual who likes dogs and simple living.',
    occupation: 'Environmental Attorney',
    designation: 'Associate Partner',
    company: 'Earthjustice',
    college: 'University of Oregon School of Law',
    degree: 'J.D. in Environmental Law',
    income: '$125,005 / year',
    familyType: 'nuclear',
    siblings: '1 brother',
    hobbies: ['Kayaking', 'Gardening', 'Cooking Vegetarian'],
    interests: ['Climate Action', 'Dog Training', 'Farmers Markets', 'Acoustic Folk'],
    diet: 'veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'open',
    wantKids: 'open',
    matchPreferences: {
      genders: ['male', 'non-binary'],
      ageRange: { min: 29, max: 37 },
      locations: ['Seattle', 'Tacoma'],
      dealbreakers: ['no pets']
    },
    internalNotes: [
      'Very passionate about sustainability. Has a golden retriever named Barley.'
    ],
    createdAt: '2026-03-05T09:12:00Z',
    updatedAt: '2026-06-01T15:30:00Z'
  },
  {
    id: 'cust_12',
    firstName: 'William',
    lastName: 'Vance',
    email: 'will.vance@email.com',
    phone: '555-0112',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    status: 'active',
    gender: 'male',
    age: 45,
    city: 'Miami',
    country: 'USA',
    maritalStatus: 'widowed',
    dob: '1981-04-18',
    height: "6'0\"",
    religion: 'Episcopalian',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English', 'German'],
    bio: 'Active boater and father. I value integrity, family, and enjoying the finer moments of life. Looking for an elegant, warm partner who enjoys travel, ocean breezes, and deep connections.',
    occupation: 'Real Estate Developer',
    designation: 'Managing Partner',
    company: 'Vance Development Group',
    college: 'University of Miami',
    degree: 'B.A. in Finance',
    income: '$280,000 / year',
    familyType: 'nuclear',
    siblings: '2 older brothers',
    hobbies: ['Boating', 'Tennis', 'Collecting Contemporary Art'],
    interests: ['Architecture', 'Caribbean Travel', 'Fine Dining', 'Wine'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: true,
    wantsChildren: 'no',
    wantKids: 'no',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 35, max: 46 },
      locations: ['Miami', 'Fort Lauderdale'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Widowed 4 years ago. Children are 14 and 16. Has dynamic social life.'
    ],
    createdAt: '2026-04-10T11:22:00Z',
    updatedAt: '2026-06-02T16:00:00Z'
  },
  {
    id: 'cust_13',
    firstName: 'Isabella',
    lastName: 'Santos',
    email: 'isabella.s@email.com',
    phone: '555-0113',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150',
    status: 'active',
    gender: 'female',
    age: 39,
    city: 'Miami',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1987-01-14',
    height: "5'4\"",
    religion: 'Catholic',
    caste: 'N/A',
    motherTongue: 'Portuguese',
    languages: ['English', 'Portuguese', 'Spanish'],
    bio: 'Vibrant gallery owner with a passion for Latin art and culture. I live life with color and style. Seeking a confident, sophisticated gentleman who shares a love for travel, art, and dancing.',
    occupation: 'Art Gallery Owner',
    designation: 'Founder & Director',
    company: 'Galeria Santos',
    college: 'Federal University of Rio de Janeiro',
    degree: 'B.F.A.',
    income: '$140,000 / year',
    familyType: 'nuclear',
    siblings: '1 sister',
    hobbies: ['Salsa Dancing', 'Travel', 'Interior Design'],
    interests: ['Latin American Art', 'Fashion', 'Seafood Gastronomy', 'Salsa Music'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'no',
    wantKids: 'no',
    matchPreferences: {
      genders: ['male'],
      ageRange: { min: 38, max: 48 },
      locations: ['Miami', 'Coral Gables'],
      dealbreakers: []
    },
    internalNotes: [
      'Very charismatic. Broad network in the local design and arts scene.'
    ],
    createdAt: '2026-02-05T13:40:00Z',
    updatedAt: '2026-05-25T11:00:00Z'
  },
  {
    id: 'cust_14',
    firstName: 'Robert',
    lastName: 'Kim',
    email: 'robert.kim@email.com',
    phone: '555-0114',
    avatarUrl: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150',
    status: 'active',
    gender: 'male',
    age: 31,
    city: 'Los Angeles',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1995-03-22',
    height: "5'9\"",
    religion: 'Non-religious',
    caste: 'N/A',
    motherTongue: 'Korean',
    languages: ['English', 'Korean'],
    bio: 'Storyteller who spends too much time in movie theaters and taco stands. I love humor and quick wit. Seeking a creative, conversational partner who appreciates storytelling and LA culture.',
    occupation: 'Screenwriter',
    designation: 'Staff Writer',
    company: 'Warner Bros. Discovery',
    college: 'USC School of Cinematic Arts',
    degree: 'M.F.A. in Screenwriting',
    income: '$88,000 / year',
    familyType: 'nuclear',
    siblings: '1 brother',
    hobbies: ['Watching Movies', 'Hiking', 'Stand-up Comedy'],
    interests: ['Cinema History', 'Comic Books', 'Indie Video Games', 'Tacos'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'no',
    wantKids: 'no',
    matchPreferences: {
      genders: ['female', 'non-binary'],
      ageRange: { min: 26, max: 33 },
      locations: ['Los Angeles', 'Santa Monica', 'Pasadena'],
      dealbreakers: ['conservative']
    },
    internalNotes: [
      'Very talkative, humorous, and values quick wit.'
    ],
    createdAt: '2026-03-15T10:45:00Z',
    updatedAt: '2026-06-03T14:10:00Z'
  },
  {
    id: 'cust_15',
    firstName: 'Maya',
    lastName: 'Lin',
    email: 'maya.lin@email.com',
    phone: '555-0115',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150',
    status: 'active',
    gender: 'female',
    age: 29,
    city: 'Los Angeles',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1997-09-08',
    height: "5'6\"",
    religion: 'Buddhist',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Mindful surfer finding peace in the swell. I teach yoga and love everything wellness. Looking for an open-hearted, active person who values self-growth, nature, and deep conversations.',
    occupation: 'Yoga Instructor',
    designation: 'Senior Yoga Teacher',
    company: 'Love Yoga Venice',
    college: 'UC San Diego',
    degree: 'B.A. in Psychology',
    income: '$62,000 / year',
    familyType: 'nuclear',
    siblings: '1 sister',
    hobbies: ['Meditation', 'Surfing', 'Hiking'],
    interests: ['Mindfulness', 'Healthy Cooking', 'Alternative Medicine', 'Folk Music'],
    diet: 'veg',
    smoking: 'no',
    drinking: 'no',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'open',
    wantKids: 'open',
    matchPreferences: {
      genders: ['male', 'female', 'non-binary'],
      ageRange: { min: 27, max: 36 },
      locations: ['Los Angeles', 'Santa Monica', 'Venice'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Highly spiritual. Prefers outdoor active lifestyles.'
    ],
    createdAt: '2026-01-22T09:30:00Z',
    updatedAt: '2026-06-04T08:50:00Z'
  },
  {
    id: 'cust_16',
    firstName: 'Daniel',
    lastName: 'Gomez',
    email: 'daniel.g@email.com',
    phone: '555-0116',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'active',
    gender: 'male',
    age: 38,
    city: 'Austin',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1988-03-11',
    height: "5'11\"",
    religion: 'Catholic',
    caste: 'N/A',
    motherTongue: 'Spanish',
    languages: ['English', 'Spanish'],
    bio: 'Chef and owner of two local restaurants. I love sharing good food, storytelling, and supporting local farmers. Looking for a partner who is passionate, loves food, and is ready for family life.',
    occupation: 'Restaurateur',
    designation: 'Chef & Owner',
    company: 'Gomez Cocina',
    college: 'Culinary Institute of America',
    degree: 'Culinary Arts Degree',
    income: '$150,000 / year',
    familyType: 'nuclear',
    siblings: '1 older brother, 1 younger sister',
    hobbies: ['Exploring food scenes', 'Gardening', 'Live Music'],
    interests: ['Gastronomy', 'Wine Pairing', 'Acoustic Guitar', 'Local Farms'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'yes',
    wantKids: 'yes',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 29, max: 38 },
      locations: ['Austin'],
      dealbreakers: []
    },
    internalNotes: [
      'Strongly values family life and expects to have children.'
    ],
    createdAt: '2026-02-28T15:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'cust_17',
    firstName: 'Rachel',
    lastName: 'Green',
    email: 'rachel.green@email.com',
    phone: '555-0117',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150',
    status: 'active',
    gender: 'female',
    age: 26,
    city: 'Austin',
    country: 'USA',
    maritalStatus: 'single',
    dob: '2000-07-04',
    height: "5'4\"",
    religion: 'Christian',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Energetic marketing manager. I love country music, early morning tennis, and trying out new brunch spots in Austin. Looking for a kind, athletic guy who is career-driven and values relationships.',
    occupation: 'Marketing Manager',
    designation: 'Senior Marketing Specialist',
    company: 'Whole Foods Market',
    college: 'University of Texas',
    degree: 'B.A. in Communications',
    income: '$75,000 / year',
    familyType: 'nuclear',
    siblings: '1 sister',
    hobbies: ['Tennis', 'Blogging', 'Craft Crafting'],
    interests: ['Social Media', 'Wellness', 'Brunching', 'Country Music'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'yes',
    wantKids: 'yes',
    matchPreferences: {
      genders: ['male'],
      ageRange: { min: 26, max: 33 },
      locations: ['Austin'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Sociable, active. Family values and Christian faith are primary indicators.'
    ],
    createdAt: '2026-04-01T10:30:00Z',
    updatedAt: '2026-06-04T12:00:00Z'
  },
  {
    id: 'cust_18',
    firstName: 'Aiden',
    lastName: 'Brooks',
    email: 'aiden.brooks@email.com',
    phone: '555-0118',
    avatarUrl: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150',
    status: 'active',
    gender: 'non-binary',
    age: 34,
    city: 'Seattle',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1992-09-15',
    height: "5'8\"",
    religion: 'Atheist',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Landscape architect focused on ecological urbanism. I spend my time designing parks and exploring woods. Looking for a curious, creative partner who values simple living and deep introspection.',
    occupation: 'Landscape Architect',
    designation: 'Lead Urban Designer',
    company: 'Mithun',
    college: 'University of Washington',
    degree: 'B.L.A. (Landscape Architecture)',
    income: '$92,000 / year',
    familyType: 'nuclear',
    siblings: 'None',
    hobbies: ['Sketching', 'Urban foraging', 'Kayaking'],
    interests: ['Native Plants', 'Architecture', 'Indie Video Games', 'Philosophy'],
    diet: 'veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'open',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'no',
    wantKids: 'no',
    matchPreferences: {
      genders: ['male', 'female', 'non-binary'],
      ageRange: { min: 29, max: 39 },
      locations: ['Seattle', 'Tacoma'],
      dealbreakers: ['conservative']
    },
    internalNotes: [
      'Very calm disposition. Artistic focus and eco-conscious lifestyle are critical.'
    ],
    createdAt: '2026-03-18T11:20:00Z',
    updatedAt: '2026-06-03T16:00:00Z'
  },
  {
    id: 'cust_19',
    firstName: 'Jonathan',
    lastName: 'Ward',
    email: 'jonathan.ward@email.com',
    phone: '555-0119',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'inactive',
    gender: 'male',
    age: 48,
    city: 'New York',
    country: 'USA',
    maritalStatus: 'divorced',
    dob: '1978-01-08',
    height: "5'10\"",
    religion: 'Protestant',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Experienced finance professional and loving dad. Ready to find companionship again. Seeking an intelligent, active, and refined partner to share fine dining, travel, and quiet weekends in the Hamptons.',
    occupation: 'Investment Banker',
    designation: 'Managing Director',
    company: 'Goldman Sachs',
    college: 'Wharton School of the University of Pennsylvania',
    degree: 'MBA in Finance',
    income: '$450,000 / year',
    familyType: 'nuclear',
    siblings: '1 brother',
    hobbies: ['Sailing', 'Skiing', 'Restoring Vintage Cars'],
    interests: ['Financial Markets', 'World History', 'Fine Wines', 'Jazz'],
    diet: 'non-veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: true,
    wantsChildren: 'no',
    wantKids: 'no',
    matchPreferences: {
      genders: ['female'],
      ageRange: { min: 38, max: 48 },
      locations: ['New York', 'Long Island'],
      dealbreakers: []
    },
    internalNotes: [
      'Divorced with 2 children. Highly affluent client, expects premium service.'
    ],
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-05-01T15:30:00Z'
  },
  {
    id: 'cust_20',
    firstName: 'Emily',
    lastName: 'Fisher',
    email: 'emily.fisher@email.com',
    phone: '555-0120',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'active',
    gender: 'female',
    age: 32,
    city: 'Chicago',
    country: 'USA',
    maritalStatus: 'single',
    dob: '1994-02-15',
    height: "5'5\"",
    religion: 'Catholic',
    caste: 'N/A',
    motherTongue: 'English',
    languages: ['English'],
    bio: 'Passionate educator who loves shaping young minds. In my free time, I rescue stray cats and bake sourdough bread. Looking for a reliable, family-minded partner who wants children and values kindness.',
    occupation: 'Elementary School Teacher',
    designation: 'Grade 3 Teacher',
    company: 'Chicago Public Schools',
    college: 'DePaul University',
    degree: 'M.Ed. in Education',
    income: '$64,000 / year',
    familyType: 'nuclear',
    siblings: '2 brothers, 1 sister',
    hobbies: ['Reading', 'Baking', 'Volunteering'],
    interests: ['Children\'s Literature', 'Crafts', 'Local Theater', 'Cat Rescues'],
    diet: 'veg',
    smoking: 'no',
    drinking: 'socially',
    openToRelocate: 'no',
    openToPets: 'yes',
    hasChildren: false,
    wantsChildren: 'yes',
    wantKids: 'yes',
    matchPreferences: {
      genders: ['male'],
      ageRange: { min: 30, max: 37 },
      locations: ['Chicago'],
      dealbreakers: ['smoker']
    },
    internalNotes: [
      'Very family-minded. Has 3 rescued cats. Pet compatibility is crucial.'
    ],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-06-02T09:10:00Z'
  }
];

// Generator function for generating 105 realistic profiles dynamically
function generateExtraCustomers(count: number): Customer[] {
  const list: Customer[] = [];
  
  const firstNamesMale = [
    'Daniel', 'Matthew', 'Andrew', 'Joshua', 'Ryan', 'Justin', 'Tyler', 'Brandon', 'Jonathan', 'Kevin', 
    'Eric', 'Brian', 'Adam', 'Timothy', 'Nathan', 'Benjamin', 'Christian', 'Patrick', 'Aaron', 'Sean',
    'Christopher', 'Nicholas', 'Kyle', 'Samuel', 'Jordan', 'Jose', 'Logan', 'Ethan', 'Gabriel', 'Owen'
  ];
  
  const firstNamesFemale = [
    'Emma', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 
    'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Scarlett', 'Grace', 'Chloe', 'Victoria', 'Madison',
    'Hannah', 'Lily', 'Lillian', 'Addison', 'Aubrey', 'Zoe', 'Natalie', 'Brooklyn', 'Zoey', 'Penelope'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 
    'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'
  ];
  
  const occupations = [
    'Software Developer', 'UX Designer', 'Product Manager', 'Data Analyst', 'Financial Analyst', 
    'Marketing Specialist', 'Civil Engineer', 'Accountant', 'Teacher', 'Nurse', 'Physician', 
    'Architect', 'Graphic Designer', 'Consultant', 'Research Scientist', 'HR Specialist'
  ];
  
  const companies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Fidelity', 'Deloitte', 'Accenture', 
    'Stripe', 'Airbnb', 'HubSpot', 'Salesforce', 'JPMorgan Chase', 'Netflix', 'Tesla', 'SpaceX'
  ];
  
  const colleges = [
    'Stanford University', 'UC Berkeley', 'Harvard University', 'MIT', 'New York University', 
    'University of Michigan', 'University of Texas', 'Boston University', 'Northwestern University', 
    'University of Washington', 'Cornell University', 'Columbia University'
  ];
  
  const degrees = [
    'B.S. in Computer Science', 'B.A. in Communications', 'MBA', 'M.S. in Engineering', 
    'B.F.A.', 'Ph.D. in Biology', 'M.Ed. in Education', 'J.D.', 'M.D.', 'B.S. in Finance'
  ];
  
  const cities = ['New York', 'San Francisco', 'Austin', 'Boston', 'Seattle', 'Miami', 'Chicago', 'Los Angeles'];
  
  const religions = ['Christian', 'Catholic', 'Jewish', 'Hindu', 'Buddhist', 'Spiritual', 'Agnostic', 'Atheist', 'Non-religious'];
  
  const castes = ['N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
  
  const diets = ['non-veg', 'veg', 'vegan', 'other'];
  const smokeOptions = ['no', 'no', 'no', 'occasionally'];
  const drinkOptions = ['socially', 'socially', 'no', 'yes'];
  const relocateOptions = ['yes', 'no', 'open'];
  const petOptions = ['yes', 'no', 'open'];
  
  const allHobbies = [
    'Hiking', 'Baking', 'Reading', 'Photography', 'Gardening', 'Yoga', 'Cooking', 'Running', 
    'Sailing', 'Rock Climbing', 'Playing Guitar', 'Cycling', 'Traveling', 'Kayaking', 'Painting', 'Tennis'
  ];
  const allInterests = [
    'Technology', 'Modern Art', 'Specialty Coffee', 'Live Music', 'Science Fiction', 'Sustainability', 
    'Foreign Films', 'Mindfulness', 'Classical Music', 'Dog Training', 'Gastronomy', 'Wellness'
  ];
  
  const motherTongues = ['English', 'Spanish', 'French', 'Mandarin', 'Gujarati', 'Hindi', 'Russian', 'Portuguese'];

  for (let i = 0; i < count; i++) {
    const isMale = i % 2 === 0;
    const gender = isMale ? 'male' : 'female';
    const firstName = isMale 
      ? firstNamesMale[i % firstNamesMale.length] 
      : firstNamesFemale[i % firstNamesFemale.length];
    const lastName = lastNames[(i + 5) % lastNames.length];
    const id = `gen_cust_${100 + i}`;
    
    // Distribute ages realistically between 24 and 48
    const age = 24 + (i % 25);
    const birthYear = 2026 - age;
    const dob = `${birthYear}-05-${(i % 28) + 1}`;
    
    const city = cities[i % cities.length];
    const country = 'USA';
    
    // Male heights around 5'8"-6'3", Female heights around 5'1"-5'9"
    const heightFeet = isMale ? 5 + Math.floor((i % 4) / 3) + 1 : 5;
    const heightInches = isMale ? (i % 6) + 6 : (i % 8) + 1;
    const height = `${heightFeet}'${heightInches}"`;
    
    // Income distribution
    const incomeNum = 55000 + (i % 12) * 15000;
    const income = `$${incomeNum.toLocaleString('en-US')} / year`;
    
    const occupation = occupations[i % occupations.length];
    const designation = `Senior ${occupation}`;
    const company = companies[i % companies.length];
    const college = colleges[i % colleges.length];
    const degree = degrees[i % degrees.length];
    
    const religion = religions[i % religions.length];
    const caste = castes[i % castes.length];
    
    const hobbies = [
      allHobbies[i % allHobbies.length], 
      allHobbies[(i + 4) % allHobbies.length]
    ];
    const interests = [
      allInterests[i % allInterests.length], 
      allInterests[(i + 6) % allInterests.length]
    ];
    
    const languages = ['English'];
    const mt = motherTongues[i % motherTongues.length];
    if (mt !== 'English') {
      languages.push(mt);
    }

    const wantKids = i % 3 === 0 ? 'yes' : i % 3 === 1 ? 'no' : 'open';
    const status = i % 15 === 0 ? 'paused' : i % 20 === 0 ? 'matched' : 'active';
    
    const matchPreferences = {
      genders: (isMale ? ['female'] : ['male']) as ('male' | 'female' | 'non-binary' | 'other')[],
      ageRange: { min: Math.max(20, age - 5), max: Math.min(60, age + 5) },
      locations: [city],
      dealbreakers: i % 5 === 0 ? ['smoker'] : []
    };

    list.push({
      id,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      phone: `555-${2000 + i}`,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 200000)}?w=150`,
      status,
      gender,
      age,
      city,
      country,
      maritalStatus: age > 33 && i % 3 === 0 ? 'divorced' : 'single',
      dob,
      height,
      religion,
      caste,
      motherTongue: mt,
      languages,
      bio: `Hi, I'm ${firstName}. I'm a dedicated ${occupation} at ${company}. Outside of work, I enjoy ${hobbies.join(' and ')}. I'm hoping to connect with a partner who shares similar goals and family preferences.`,
      occupation,
      designation,
      company,
      college,
      degree,
      income,
      familyType: i % 5 === 0 ? 'joint' : 'nuclear',
      siblings: `${i % 3} siblings`,
      hobbies,
      interests,
      diet: diets[i % diets.length],
      smoking: smokeOptions[i % smokeOptions.length],
      drinking: drinkOptions[i % drinkOptions.length],
      openToRelocate: relocateOptions[i % relocateOptions.length],
      openToPets: petOptions[i % petOptions.length],
      hasChildren: age > 33 && i % 3 === 0,
      wantsChildren: wantKids === 'open' ? 'open' : wantKids === 'yes' ? 'yes' : 'no',
      wantKids: wantKids === 'open' ? 'open' : wantKids === 'yes' ? 'yes' : 'no',
      matchPreferences,
      internalNotes: [`Generated test candidate #${i} initialized for matching lists.`],
      createdAt: '2026-05-15T09:00:00Z',
      updatedAt: '2026-06-01T14:00:00Z'
    });
  }
  
  return list;
}

export const mockCustomers: Customer[] = [...handCuratedCustomers, ...generateExtraCustomers(105)];
