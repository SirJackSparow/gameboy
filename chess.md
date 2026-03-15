# Building a Chess Game in React Native

This guide covers how we built the fully playable chess game in this project using React Native and `chess.js`.

## Overview

Writing chess logic (move validation, check, checkmate, en passant, castling) from scratch is extremely complex. Therefore, the architecture relies on two distinct parts:
1. **Game Engine (`chess.js`)**: A headless data model that strictly enforces all rules of chess.
2. **UI Layer (React Native)**: Visualizes the `chess.js` board state and pushes user moves back to the engine.

---

## Step 1: Install Dependencies

We used `chess.js` to handle all chess rules and validations.

```bash
npm install chess.js
```

---

## Step 2: Define UI Constants & Pieces

Instead of using heavy images for chess pieces, we utilized standard Unicode characters for the pieces (`♟ ♜ ♞ ♝ ♛ ♚`). 

We created `/src/chess/constants.ts` to map the `chess.js` piece notation (e.g., `'p'`, `'n'`, `'k'`) to these Unicode symbols, and to define the board colors.

```typescript
export const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚', // Black
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔', // White
};

export const COLORS = {
  lightSquare: '#eeeed2',
  darkSquare: '#769656',
  highlightSelect: 'rgba(255, 255, 51, 0.5)',
  highlightMove: 'rgba(20, 85, 30, 0.3)',
};
```

---

## Step 3: Create the `ChessSquare` Component

We needed a component (`/src/chess/ChessSquare.tsx`) to render individual squares on the 8x8 board.

**Key Features of the Square:**
- It uses a `TouchableOpacity` to detect when a user taps it.
- Its background color depends on its coordinate (light/dark alternate).
- It conditionally renders the assigned piece using the Unicode map.
- It conditionally renders styling overlays:
  - A yellow overlay when it is the currently selected piece.
  - A green dot overlay when it is a valid move target for the currently selected piece.

---

## Step 4: Create the Main `ChessGame` Engine/UI Bridge

The core of the logic lives in `/src/chess/ChessGame.tsx`. 

### A. Initializing the Engine
We initialize the engine using a `useRef` so the game state persists across React renders.
```typescript
const chessRef = useRef(new Chess());
const chess = chessRef.current;
```

### B. React State
To make React Native re-render the board when a move occurs, we keep standard state variables:
```typescript
const [boardFen, setBoardFen] = useState(chess.fen()); // Triggers board redraw
const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
const [validMoves, setValidMoves] = useState<string[]>([]);
```

### C. Handing User Interaction
When a user taps a square, the component goes through a decision tree:

1. **If a square is already selected:**
   - **Tapping the same square**: Deselects the piece.
   - **Tapping a target square**: We check if that square exists in the `validMoves` array. If it does, we command `chess.js` to execute the move (`chess.move({ from, to })`). We then update `.fen()` in state to force a UI redraw.
2. **If no square is selected:**
   - Check if the tapped square contains a piece belonging to the player whose turn it currently is.
   - If yes, we select it, and ask `chess.js` for all valid moves (`chess.moves({ square })`). We store these targets in the `validMoves` state so the green dots render.

### D. Game Status Checking
After every move, we evaluate the game state using built in `chess.js` functions:
- `chess.isCheckmate()`
- `chess.isCheck()`
- `chess.isDraw() / chess.isStalemate()`

If any of these trigger, we freeze the board interactions and display the appropriate UI message.

### E. Rendering the Grid
We ask `chess.js` for the current 2D array representation of the board (`chess.board()`), loop over the rows and columns using nested `.map()` functions, and render `ChessSquare` components accordingly.

---

## Step 5: Render in `App.tsx`

Finally, we simply imported the `<ChessGame />` component into the root `App.tsx` file to render it on screen!
