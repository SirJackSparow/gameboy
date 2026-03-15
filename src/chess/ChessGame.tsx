import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Chess } from 'chess.js';
import { ChessSquare } from './ChessSquare';
import { COLORS } from './constants';

const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.95; // 95% of screen width
const SQUARE_SIZE = BOARD_SIZE / 8;

export const ChessGame: React.FC = () => {
  // Use a ref to hold the chess instance to avoid recreating it on every render
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  // State to trigger re-renders when the board changes
  const [boardFen, setBoardFen] = useState(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  
  // Game status states
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState("White to move");

  const board = chess.board();

  useEffect(() => {
    updateGameStatus();
  }, [boardFen]);

  const updateGameStatus = () => {
    if (chess.isCheckmate()) {
      setIsGameOver(true);
      setGameStatus(`Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`);
    } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
      setIsGameOver(true);
      setGameStatus("Draw!");
    } else if (chess.isCheck()) {
      setGameStatus(`Check! ${chess.turn() === 'w' ? 'White' : 'Black'} to move.`);
    } else {
      setGameStatus(`${chess.turn() === 'w' ? 'White' : 'Black'} to move`);
    }
  };

  const handleSquarePress = (square: string) => {
    if (isGameOver) return;

    // If we have a selected square, try to move there
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect if tapping the same square
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // Is it a valid move target?
      if (validMoves.includes(square)) {
        try {
          // chess.js handles promotions. For simplicity in this demo, always auto-promote to queen.
          const move = chess.move({
            from: selectedSquare,
            to: square,
            promotion: 'q',
          });

          if (move) {
            // Valid move executed!
            setBoardFen(chess.fen());
            setSelectedSquare(null);
            setValidMoves([]);
            return;
          }
        } catch (e) {
          // Invalid move caught by chess.js
        }
      }
    }

    // Otherwise, try to select the piece
    const piece = chess.get(square as any);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      
      // Get valid moves for this piece
      const moves = chess.moves({ square: square as any, verbose: true });
      // verbose: true returns objects like { to: 'e4', ... }
      setValidMoves((moves as any[]).map(m => m.to));
    } else {
      // Tap empty square or opponent piece without selection
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const resetGame = () => {
    chess.reset();
    setBoardFen(chess.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    setIsGameOver(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Chess</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, isGameOver && styles.gameOverText]}>
          {gameStatus}
        </Text>
      </View>

      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.boardRow}>
            {row.map((piece, colIndex) => {
              // Convert row/col to algebraic notation (e.g. 0,0 is a8 / 7,7 is h1)
              const file = String.fromCharCode('a'.charCodeAt(0) + colIndex);
              const rank = 8 - rowIndex;
              const position = `${file}${rank}`;
              
              const isDark = (rowIndex + colIndex) % 2 === 1;

              return (
                <ChessSquare
                  key={position}
                  position={position}
                  squareColor={isDark ? 'dark' : 'light'}
                  piece={piece}
                  isSelected={selectedSquare === position}
                  isValidMove={validMoves.includes(position)}
                  onPress={handleSquarePress}
                  size={SQUARE_SIZE}
                />
              );
            })}
          </View>
        ))}
      </View>

      {isGameOver && (
        <Text style={styles.resetButton} onPress={resetGame}>
          Play Again
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333', // Dark background around the board
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 8,
    width: BOARD_SIZE,
    alignItems: 'center',
  },
  statusText: {
    color: '#eee',
    fontSize: 18,
    fontWeight: '600',
  },
  gameOverText: {
    color: '#ffdd57',
    fontWeight: 'bold',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderWidth: 2,
    borderColor: '#222',
  },
  boardRow: {
    flexDirection: 'row',
  },
  resetButton: {
    color: '#fff',
    fontSize: 20,
    marginTop: 30,
    padding: 15,
    backgroundColor: '#2b8a3e', // Green button
    borderRadius: 8,
    overflow: 'hidden',
  }
});
