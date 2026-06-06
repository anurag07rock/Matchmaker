export type MatchStatus = 'proposed' | 'liked' | 'disliked' | 'approved' | 'rejected' | 'successful';

export interface AICompatibilityReport {
  score: number; // 0 to 100
  pros: string[];
  cons: string[];
  summary: string;
  generatedAt: string;
}

export interface Match {
  id: string;
  customerId: string; // The client we are matching for
  proposedMatchId: string; // The match candidate
  status: MatchStatus;
  matchmakerNotes?: string;
  aiReport?: AICompatibilityReport;
  createdAt: string;
  updatedAt: string;
}
