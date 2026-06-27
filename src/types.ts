export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: 'metal' | 'nonmetal' | 'noble-gas' | 'metalloid';
  group: number;
  period: number;
  electronConfig: string;
  shells: number[];
  funFact: string;
}

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'dashboard';

export interface ModuleProgress {
  completion: 'not-started' | 'in-progress' | 'completed';
  bestScore: number;
  timeSpent: number; // in seconds
}

export interface UserProgressData {
  completions: Record<ModuleId, 'not-started' | 'in-progress' | 'completed'>;
  bestScores: Record<ModuleId, number>;
  timeSpent: Record<ModuleId, number>;
  xp: number;
  unlockedBadges: string[];
  collectedElements: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

export type QuestionType = 'mcq' | 'tf' | 'match' | 'blank' | 'image';

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[]; // for mcq, image
  answer: number | boolean | string | Record<string, string>; // answer based on question type
  wordBank?: string[]; // for blank
  pairs?: { left: string; right: string }[]; // for match (e.g. left matches right)
  diagramType?: 'bohr' | 'lewis' | 'reaction' | 'ph' | 'alkane'; // for rendering custom SVGs in image questions
  hint?: string;
  reinforcement: string;
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
