# Chess Game Implementation Analysis

This document explains the architecture and logic behind the Chess game implementation in the `react-native-project`.

## 1. Core Engine: `chess.js`
The game relies on the `chess.js` library to handle all "chess-specific" logic. This ensures that the implementation is robust and follows official FIDE rules.
- **Move Validation**: Checks if a move is legal (e.g., you can't move through other pieces, you must resolve check).
- **Game State**: Manages the board state using **FEN** (Forsyth–Edwards Notation).
- **History & Undo**: Provides easy methods to undo moves for the AI's search algorithm.

## 2. Artificial Intelligence (CPU)
The CPU opponent uses a classic chess AI approach: **Minimax with Alpha-Beta Pruning**.

### Evaluation Function ([evaluateBoard](file:///Users/fendy24/Downloads/reactxnative/src/chess/ChessGame.tsx#154-178))
To decide which move is better, the AI assigns a score to any given board position:
- **Material Weight**: Each piece has a base value (Pawn=100, Knight=320, ..., Queen=900).
- **Piece-Square Tables (PST)**: These tables add or subtract value based on *where* a piece is located. For example, knights are more valuable in the center, and pawns are more valuable as they approach promotion.

### Search Algorithm ([minimax](file:///Users/fendy24/Downloads/reactxnative/src/chess/ChessGame.tsx#179-215))
The AI "looks ahead" several moves to find the best response.
- **Depth**: 
  - **Easy**: Depth 1 (mostly random or direct captures).
  - **Medium**: Depth 2.
  - **Hard**: Depth 3.
- **Alpha-Beta Pruning**: An optimization that stops searching a branch as soon as it's proven to be worse than a previously analyzed branch, significantly speeding up the calculation.

## 3. React Native UI Layer
The UI is built with a focus on performance and "premium" aesthetics.

### Board Rendering
- The board is rendered as a 2D grid from the `chess.board()` method.
- **[ChessSquare.tsx](file:///Users/fendy24/Downloads/reactxnative/src/chess/ChessSquare.tsx)**: A reusable component for each square. It handles:
  - Background color (alternating light/dark).
  - Piece rendering using Unicode symbols (`♚`, `♛`, etc.).
  - Highlights for the **Selected Square** and **Valid Moves**.

### State Management
- **`chessRef`**: A `useRef` to hold the [Chess](file:///Users/fendy24/Downloads/reactxnative/src/chess/ChessGame.tsx#99-396) instance, preventing unnecessary re-renders.
- **`boardFen`**: A `useState` that stores the current FEN string. Updating this triggers a redraw of the board.
- **Animations**: Using React Native's `Animated` API for smooth transitions (fading in, sliding headers).

## 4. User Interaction Flow
1. **Selection**: When a user taps a square, [handleSquarePress](file:///Users/fendy24/Downloads/reactxnative/src/chess/ChessGame.tsx#280-318) checks if it's their turn and if a piece is present.
2. **Move Options**: The engine calculates all legal moves for that piece and highlights them on the board.
3. **Execution**: Tapping a highlighted square executes the move via `chess.move()`, updates the FEN, and triggers the CPU's turn.
