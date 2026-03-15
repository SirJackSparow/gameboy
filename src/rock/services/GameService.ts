import { Move, GameResult } from '../models/RockPaperScissorsModel';

// Service: Pure business logic, independent of React state.

export class GameService {
  /**
   * Generates a random move for the computer.
   */
  static generateComputerMove(): Move {
    const moves: Move[] = ['ROCK', 'PAPER', 'SCISSORS'];
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  /**
   * Determines the winner based on RPS rules.
   */
  static determineWinner(playerMove: Move, computerMove: Move): GameResult {
    if (!playerMove || !computerMove) return null;
    if (playerMove === computerMove) return 'DRAW';

    if (
      (playerMove === 'ROCK' && computerMove === 'SCISSORS') ||
      (playerMove === 'PAPER' && computerMove === 'ROCK') ||
      (playerMove === 'SCISSORS' && computerMove === 'PAPER')
    ) {
      return 'WIN';
    }

    return 'LOSE';
  }
}
