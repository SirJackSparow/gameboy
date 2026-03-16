import { useState } from 'react';
import { GameState, Move } from '../models/RockPaperScissorsModel';
import { GameService } from '../services/GameService';

// ViewModel: Connects Models/Services to the View via a Custom Hook.
// It manages the React state and provides intent functions (play, reset).

export const useRockPaperScissorsViewModel = () => {
  // Encapsulate all state related to the game
  const [gameState, setGameState] = useState<GameState>({
    playerMove: null,
    computerMove: null,
    result: null,
    playerScore: 0,
    computerScore: 0,
  });

  // Intent: User physically makes a move
  const playMove = (playerMove: Move) => {
    const computerMove = GameService.generateComputerMove();
    const result = GameService.determineWinner(playerMove, computerMove);

    setGameState((prevState) => {
      let newPlayerScore = prevState.playerScore;
      let newComputerScore = prevState.computerScore;

      if (result === 'WIN') newPlayerScore += 1;
      if (result === 'LOSE') newComputerScore += 1;

      return {
        ...prevState,
        playerMove,
        computerMove,
        result,
        playerScore: newPlayerScore,
        computerScore: newComputerScore,
      };
    });
  };

  // Intent: User resets the game
  const resetGame = () => {
    setGameState({
      playerMove: null,
      computerMove: null,
      result: null,
      playerScore: 0,
      computerScore: 0,
    });
  };

  // Expose state and intents to the View
  return {
    gameState,
    playMove,
    resetGame,
  };
};
