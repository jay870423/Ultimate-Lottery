export interface Participant {
  id: string;
  name: string;
  department?: string;
  avatar?: string; // Optional URL or base64
  customLabel?: string;
}

export interface Prize {
  id: string;
  name: string;
  count: number; // Total number of winners for this prize
  image?: string;
  level: number; // 1 is highest (Grand Prize)
}

// Maps Prize ID to array of Winner Participant IDs
export type WinnersMap = Record<string, Participant[]>;

// Maps Prize ID to array of Participant IDs who MUST win (Rigged)
export type RiggedMap = Record<string, string[]>;

export interface AppState {
  participants: Participant[];
  prizes: Prize[];
  winners: WinnersMap;
  riggedMatches: RiggedMap;
  currentPrizeId: string | null;
  isDrawing: boolean;
  showAdmin: boolean;
}
