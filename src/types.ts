export type Difficulty = 'easy' | 'hard';

export interface BirthdayConfig {
  name: string;
  mainWish: string;
  wishes: string[]; // Emojis/Short text
  songUrl: string;
  lyrics?: string;
  difficulty?: Difficulty;
}

export type AppMode = 'create' | 'game' | 'reveal';
