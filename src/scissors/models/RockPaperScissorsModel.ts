// Model: Defines the data structures and domain types.

export type Move = 'ROCK' | 'PAPER' | 'SCISSORS' | null;

export type GameResult = 'WIN' | 'LOSE' | 'DRAW' | null;

export interface GameState {
  playerMove: Move;
  computerMove: Move;
  result: GameResult;
  playerScore: number;
  computerScore: number;
}
