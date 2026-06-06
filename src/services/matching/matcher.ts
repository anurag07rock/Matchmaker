import { Customer } from '@/types/customer';

// Helper to parse heights like "5'11\"" or "6'2\"" into total inches
export function parseHeightToInches(heightStr: string): number {
  if (!heightStr) return 66; // default average
  const match = heightStr.match(/(\d+)'(\d+)/);
  if (match) {
    return parseInt(match[1], 10) * 12 + parseInt(match[2], 10);
  }
  // Try fallback for metric (cm)
  const cmMatch = heightStr.match(/(\d+)\s*cm/);
  if (cmMatch) {
    return Math.round(parseInt(cmMatch[1], 10) / 2.54);
  }
  return 66;
}

// Helper to parse income strings like "$120,000 / year" or "12 LPA" to numbers
export function parseIncomeToNumber(incomeStr: string): number {
  if (!incomeStr) return 50000;
  const num = parseInt(incomeStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 50000 : num;
}

export interface CompatibilityResult {
  score: number;
  reasons: string[];
  pros: string[];
  cons: string[];
}

/**
 * Calculates a compatibility score from 0-100 and returns a list of reasons.
 */
export function calculateCompatibility(client: Customer, candidate: Customer): CompatibilityResult {
  const reasons: string[] = [];
  const pros: string[] = [];
  const cons: string[] = [];

  // --- HARD FILTER 1: Candidate Id Check ---
  if (client.id === candidate.id) {
    return { score: 0, reasons: ['Cannot match with self'], pros: [], cons: [] };
  }

  // --- HARD FILTER 2: Gender Preferences ---
  const clientWantsGenders = client.matchPreferences.genders;
  const candidateWantsGenders = candidate.matchPreferences.genders;

  // Does candidate match client's gender preference?
  if (!clientWantsGenders.includes(candidate.gender)) {
    return { score: 0, reasons: [`Gender mismatch: client prefers ${clientWantsGenders.join('/')}`], pros: [], cons: [] };
  }

  // Does client match candidate's gender preference?
  if (!candidateWantsGenders.includes(client.gender)) {
    return { score: 0, reasons: [`Gender mismatch: candidate prefers ${candidateWantsGenders.join('/')}`], pros: [], cons: [] };
  }

  // --- HARD FILTER 3: Dealbreakers ---
  // If client has dealbreaker "smoker" and candidate smokes
  if (client.matchPreferences.dealbreakers?.includes('smoker') && candidate.smoking === 'yes') {
    return { score: 0, reasons: ['Dealbreaker: Candidate is a smoker'], pros: [], cons: [] };
  }
  if (candidate.matchPreferences.dealbreakers?.includes('smoker') && client.smoking === 'yes') {
    return { score: 0, reasons: ['Dealbreaker: Client is a smoker'], pros: [], cons: [] };
  }

  // If client has dealbreaker "no pets" and candidate has pets (or vice versa)
  if (client.matchPreferences.dealbreakers?.includes('no pets') && candidate.openToPets === 'yes') {
    cons.push('Pet alignment friction');
  }

  let baseScore = 0;

  // --- SPECIFIC MATCHING LOGIC ---

  if (client.gender === 'male') {
    // === MALE CLIENT LOGIC ===
    // 1. Female only (Hard filter checked, but we double-check)
    if (candidate.gender !== 'female') {
      return { score: 0, reasons: ['Male matchmaking requires opposite gender'], pros: [], cons: [] };
    }
    
    // 2. Younger (25 points)
    if (candidate.age < client.age) {
      baseScore += 25;
      pros.push(`Younger partner (${candidate.age} vs ${client.age})`);
    } else {
      cons.push(`Candidate is not younger (${candidate.age} vs ${client.age})`);
    }

    // 3. Shorter (25 points)
    const clientHt = parseHeightToInches(client.height);
    const candidateHt = parseHeightToInches(candidate.height);
    if (candidateHt < clientHt) {
      baseScore += 25;
      pros.push(`Compatible height difference (Candidate is shorter: ${candidate.height} vs ${client.height})`);
    } else {
      cons.push(`Height difference friction (Candidate is taller/same height)`);
    }

    // 4. Lower income (25 points)
    const clientInc = parseIncomeToNumber(client.income);
    const candidateInc = parseIncomeToNumber(candidate.income);
    if (candidateInc < clientInc) {
      baseScore += 25;
      pros.push(`Income brackets align within preferred parameters`);
    } else {
      cons.push(`Income discrepancy (Candidate has higher income)`);
    }

    // 5. Same child preference (25 points)
    if (client.wantKids === candidate.wantKids) {
      baseScore += 25;
      pros.push(`Shared family planning outlook ("${client.wantKids}")`);
    } else {
      cons.push(`Friction on family planning: ${client.firstName} wants "${client.wantKids}", ${candidate.firstName} wants "${candidate.wantKids}"`);
    }

  } else if (client.gender === 'female') {
    // === FEMALE CLIENT LOGIC ===
    // 1. Profession compatibility (20 points)
    // Overlaps if in same domain or complementary
    const clientOcc = (client.occupation || '').toLowerCase();
    const candidateOcc = (candidate.occupation || '').toLowerCase();
    const isTechMatch = (clientOcc.includes('software') || clientOcc.includes('developer') || clientOcc.includes('tech') || clientOcc.includes('product') || clientOcc.includes('designer')) &&
                        (candidateOcc.includes('software') || candidateOcc.includes('developer') || candidateOcc.includes('tech') || candidateOcc.includes('product') || candidateOcc.includes('designer'));
    const isMedicalMatch = (clientOcc.includes('doctor') || clientOcc.includes('pediatrician') || clientOcc.includes('medical') || clientOcc.includes('clinical') || clientOcc.includes('nurse')) &&
                           (candidateOcc.includes('doctor') || candidateOcc.includes('pediatrician') || candidateOcc.includes('medical') || candidateOcc.includes('clinical') || candidateOcc.includes('nurse'));
    
    if (isTechMatch || isMedicalMatch || clientOcc === candidateOcc) {
      baseScore += 20;
      pros.push(`High professional compatibility (${client.occupation} & ${candidate.occupation})`);
    } else {
      // General professional match
      baseScore += 12;
      pros.push(`Complementary career paths (${client.occupation} & ${candidate.occupation})`);
    }

    // 2. Values compatibility - Religion & Politics (20 points)
    let valuesScore = 0;
    if (client.religion === candidate.religion) {
      valuesScore += 10;
      pros.push(`Shared faith background (${client.religion})`);
    } else {
      cons.push(`Different religious outlooks (${client.religion} vs ${candidate.religion || 'None'})`);
    }
    // We can also assume interests overlap count contributes
    const sharedInterests = client.interests.filter(i => candidate.interests.includes(i));
    if (sharedInterests.length >= 2) {
      valuesScore += 10;
      pros.push(`Strong overlap in values & interests (${sharedInterests.slice(0, 2).join(', ')})`);
    } else {
      valuesScore += 5;
    }
    baseScore += valuesScore;

    // 3. Education compatibility (20 points)
    // Check if both hold postgraduate degrees (Ph.D., MBA, J.D., M.D., M.S.)
    const clientEdu = (client.degree || '').toLowerCase();
    const candidateEdu = (candidate.degree || '').toLowerCase();
    const clientHasGrad = clientEdu.includes('phd') || clientEdu.includes('mba') || clientEdu.includes('jd') || clientEdu.includes('md') || clientEdu.includes('m.s') || clientEdu.includes('master');
    const candidateHasGrad = candidateEdu.includes('phd') || candidateEdu.includes('mba') || candidateEdu.includes('jd') || candidateEdu.includes('md') || candidateEdu.includes('m.s') || candidateEdu.includes('master');
    
    if (clientHasGrad === candidateHasGrad) {
      baseScore += 20;
      pros.push(`Matched academic accomplishments (${client.degree} & ${candidate.degree})`);
    } else {
      baseScore += 10;
      cons.push(`Academic divergence (${client.degree} vs ${candidate.degree})`);
    }

    // 4. Relocation compatibility (20 points)
    if (client.city === candidate.city) {
      baseScore += 20;
      pros.push(`Same metropolitan area (${client.city})`);
    } else if (client.openToRelocate === 'yes' || client.openToRelocate === 'open' || candidate.openToRelocate === 'yes' || candidate.openToRelocate === 'open') {
      baseScore += 15;
      pros.push(`Open to relocation bounds`);
    } else {
      cons.push(`Geographical friction (Different cities, not open to relocate)`);
    }

    // 5. Child preference compatibility (20 points)
    if (client.wantKids === candidate.wantKids) {
      baseScore += 20;
      pros.push(`Aligned family planning outlook ("${client.wantKids}")`);
    } else {
      cons.push(`Divergent views on kids: ${client.firstName} wants "${client.wantKids}", ${candidate.firstName} wants "${candidate.wantKids}"`);
    }

  } else {
    // === NON-BINARY / OTHER BALANCED LOGIC ===
    // Equal distribution for age range, location, child preferences, diet, and hobbies
    // Age Check
    const minAge = client.matchPreferences.ageRange.min;
    const maxAge = client.matchPreferences.ageRange.max;
    if (candidate.age >= minAge && candidate.age <= maxAge) {
      baseScore += 20;
      pros.push(`Within desired age range (${minAge}-${maxAge})`);
    }
    // Location
    if (client.city === candidate.city) {
      baseScore += 20;
      pros.push(`Same city (${client.city})`);
    }
    // Kids
    if (client.wantKids === candidate.wantKids) {
      baseScore += 20;
      pros.push(`Aligned family planning views`);
    }
    // Hobbies overlap
    const sharedHobbies = client.hobbies.filter(h => candidate.hobbies.includes(h));
    if (sharedHobbies.length >= 1) {
      baseScore += 20;
      pros.push(`Shared leisure interests (${sharedHobbies.join(', ')})`);
    }
    // Diet
    if (client.diet === candidate.diet) {
      baseScore += 20;
      pros.push(`Same dietary preference (${client.diet})`);
    }
  }

  // --- GENERAL ADJUSTMENTS ---
  // Ensure the score is clamped between 0 and 100
  const finalScore = Math.max(0, Math.min(100, baseScore));

  // Build the textual reasons
  if (finalScore >= 85) {
    reasons.push('Excellent profile synergy across core filters, interests, and family objectives.');
  } else if (finalScore >= 60) {
    reasons.push('Moderate alignment. Good common ground, though some preferences diverge.');
  } else {
    reasons.push('Low correlation on core lifestyle choices, brackets, or relationship values.');
  }

  if (pros.length > 0) {
    reasons.push(`Key Pros: ${pros.slice(0, 2).join(', ')}.`);
  }
  if (cons.length > 0) {
    reasons.push(`Friction Areas: ${cons.slice(0, 1).join(', ')}.`);
  }

  return {
    score: finalScore,
    reasons,
    pros,
    cons
  };
}

/**
 * Filters all candidates based on basic requirements (e.g. gender preference, dealbreakers).
 */
export function generateMatches(client: Customer, allCandidates: Customer[]): Customer[] {
  return allCandidates.filter(candidate => {
    const result = calculateCompatibility(client, candidate);
    return result.score > 0;
  });
}

/**
 * Evaluates compatibility for all candidates, ranks them, and returns top profiles with scores.
 */
export interface RankedMatch {
  candidate: Customer;
  compatibility: CompatibilityResult;
}

export function rankMatches(client: Customer, allCandidates: Customer[]): RankedMatch[] {
  const matches: RankedMatch[] = [];

  for (const candidate of allCandidates) {
    const compatibility = calculateCompatibility(client, candidate);
    if (compatibility.score > 0) {
      matches.push({
        candidate,
        compatibility
      });
    }
  }

  // Sort descending by score, and sub-sort by age proximity
  return matches.sort((a, b) => {
    if (b.compatibility.score !== a.compatibility.score) {
      return b.compatibility.score - a.compatibility.score;
    }
    return Math.abs(a.candidate.age - client.age) - Math.abs(b.candidate.age - client.age);
  });
}
