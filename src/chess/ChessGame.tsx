import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentGame } from '../store/gameSlice';
import { Chess, Square } from 'chess.js';
import { ChessSquare } from './ChessSquare';

const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.95;
const SQUARE_SIZE = BOARD_SIZE / 8;

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (from White's perspective)
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

const PST: Record<string, number[][]> = {
  p: PAWN_PST,
  n: KNIGHT_PST,
  b: BISHOP_PST,
  r: ROOK_PST,
  q: QUEEN_PST,
  k: KING_PST,
};

export const ChessGame: React.FC = () => {
  const dispatch = useDispatch();
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  const [boardFen, setBoardFen] = useState(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState("Your turn (White)");
  const [isCpuThinking, setIsCpuThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUpAnim, { 
        toValue: 0, 
        duration: 600, 
        easing: Easing.out(Easing.back(1.5)), 
        useNativeDriver: true 
      })
    ]).start();
  }, []);

  useEffect(() => {
    updateGameStatus();
    
    if (chess.turn() === 'b' && !isGameOver) {
      setIsCpuThinking(true);
      const thinkTime = difficulty === 'Easy' ? 200 : difficulty === 'Medium' ? 500 : 800;
      setTimeout(() => {
        makeCpuMove();
        setIsCpuThinking(false);
      }, thinkTime);
    }
  }, [boardFen, difficulty]);

  const updateGameStatus = () => {
    if (chess.isCheckmate()) {
      setIsGameOver(true);
      setGameStatus(`Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`);
    } else if (chess.isDraw() || chess.isStalemate()) {
      setIsGameOver(true);
      setGameStatus("Draw Game");
    } else if (chess.isCheck()) {
      setGameStatus(`Check! ${chess.turn() === 'w' ? 'White' : 'Black'}'s turn`);
    } else {
      setGameStatus(chess.turn() === 'w' ? "Your turn (White)" : `CPU (${difficulty}) is thinking...`);
    }
  };

  const evaluateBoard = (game: Chess) => {
    let totalEvaluation = 0;
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                const value = PIECE_VALUES[piece.type] || 0;
                // Piece Square Table (PST) value
                const pstTable = PST[piece.type];
                let pstValue = 0;
                if (pstTable) {
                    // For black, invert the rank index
                    const r = piece.color === 'w' ? i : 7 - i;
                    const c = piece.color === 'w' ? j : 7 - j;
                    pstValue = pstTable[r][c];
                }
                
                totalEvaluation += (piece.color === 'w' ? (value + pstValue) : -(value + pstValue));
            }
        }
    }
    return totalEvaluation;
  };

  const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
    if (depth === 0) {
        return -evaluateBoard(game);
    }

    const possibleMoves = game.moves();
    
    // Sort moves to improve pruning (captures first)
    possibleMoves.sort((a, b) => {
        if (a.includes('x') && !b.includes('x')) return -1;
        if (!a.includes('x') && b.includes('x')) return 1;
        return 0;
    });

    if (isMaximizingPlayer) {
        let bestValue = -Infinity;
        for (const move of possibleMoves) {
            game.move(move);
            bestValue = Math.max(bestValue, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) break; // Pruning
        }
        return bestValue;
    } else {
        let bestValue = Infinity;
        for (const move of possibleMoves) {
            game.move(move);
            bestValue = Math.min(bestValue, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
            game.undo();
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) break; // Pruning
        }
        return bestValue;
    }
  };

  const makeCpuMove = () => {
    const possibleMoves = chess.moves();
    if (possibleMoves.length === 0) return;

    let moveToMake = "";

    if (difficulty === 'Easy') {
        // Easy: 80% random, 20% evaluate
        if (Math.random() < 0.8) {
            moveToMake = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
            let bestValue = Infinity;
            for (const move of possibleMoves) {
                chess.move(move);
                const val = evaluateBoard(chess);
                chess.undo();
                if (val < bestValue) {
                    bestValue = val;
                    moveToMake = move;
                }
            }
        }
    } else if (difficulty === 'Medium') {
        // Medium: Minimax depth 2 with alpha-beta
        let bestValue = Infinity;
        let bestMoves: string[] = [];
        for (const move of possibleMoves) {
            chess.move(move);
            const val = minimax(chess, 1, -Infinity, Infinity, true);
            chess.undo();
            if (val < bestValue) {
                bestValue = val;
                bestMoves = [move];
            } else if (val === bestValue) {
                bestMoves.push(move);
            }
        }
        moveToMake = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else {
        // Hard: Minimax depth 3 with alpha-beta
        let bestValue = Infinity;
        let bestMoves: string[] = [];
        
        for (const move of possibleMoves) {
            chess.move(move);
            const val = minimax(chess, 2, -Infinity, Infinity, true);
            chess.undo();
            
            if (val < bestValue) {
                bestValue = val;
                bestMoves = [move];
            } else if (val === bestValue) {
                bestMoves.push(move);
            }
        }
        moveToMake = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    if (!moveToMake) moveToMake = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    chess.move(moveToMake);
    setBoardFen(chess.fen());
  };

  const handleSquarePress = (square: string) => {
    if (isGameOver || chess.turn() === 'b') return;

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      if (validMoves.includes(square)) {
        try {
          const move = chess.move({
            from: selectedSquare as Square,
            to: square as Square,
            promotion: 'q',
          });

          if (move) {
            setBoardFen(chess.fen());
            setSelectedSquare(null);
            setValidMoves([]);
            return;
          }
        } catch (e) {}
      }
    }

    const piece = chess.get(square as any);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as any, verbose: true });
      setValidMoves((moves as any[]).map(m => m.to));
    } else {
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

  const board = chess.board();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => dispatch(setCurrentGame('dashboard'))}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Classic <Text style={styles.titleHighlight}>Chess</Text></Text>
      </Animated.View>

      <Animated.View style={[styles.difficultyContainer, { opacity: fadeAnim }]}>
        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.diffBtn, difficulty === level && styles.diffBtnActive]}
            onPress={() => setDifficulty(level)}
            disabled={isCpuThinking || boardFen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
          >
            <Text style={[styles.diffBtnText, difficulty === level && styles.diffBtnTextActive]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <Animated.View style={[styles.statusContainer, { opacity: fadeAnim }]}>
        <View style={[styles.statusBadge, isCpuThinking && styles.thinkingBadge, isGameOver && styles.gameOverBadge]}>
          <Text style={styles.statusText}>{gameStatus}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.boardContainer, { opacity: fadeAnim }]}>
        <View style={styles.board}>
          {board.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.boardRow}>
              {row.map((piece, colIndex) => {
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
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>↻ Reset Board</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A', 
    paddingTop: 50,
    alignItems: 'center'
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  backButtonText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },
  titleHighlight: { color: '#769656' },
  
  difficultyContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  diffBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  diffBtnActive: {
    backgroundColor: '#769656',
    borderColor: '#769656',
  },
  diffBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  diffBtnTextActive: {
    color: '#F8FAFC',
  },

  statusContainer: {
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(118, 150, 86, 0.3)',
  },
  thinkingBadge: {
    borderColor: '#769656',
  },
  gameOverBadge: {
    borderColor: '#FBBF24',
  },
  statusText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },

  boardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderWidth: 4,
    borderColor: '#1E293B',
    backgroundColor: '#1E293B',
  },
  boardRow: { flexDirection: 'row' },
  
  footer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  resetButton: {
    padding: 10,
  },
  resetText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
