import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GameKey = 'dashboard' | 'chess' | 'scissors' | 'tank' | 'flappybird';

interface GameState {
  currentGame: GameKey;
}

const initialState: GameState = {
  currentGame: 'dashboard',
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentGame: (state, action: PayloadAction<GameKey>) => {
      state.currentGame = action.payload;
    },
  },
});

export const { setCurrentGame } = gameSlice.actions;
export default gameSlice.reducer;
