import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PieceSymbol, Color } from 'chess.js';
import { PIECE_SYMBOLS, COLORS } from './constants';

export interface ChessSquareProps {
  position: string; // e.g. 'e2'
  squareColor: 'light' | 'dark';
  piece?: { type: PieceSymbol; color: Color } | null;
  isSelected?: boolean;
  isValidMove?: boolean;
  onPress: (position: string) => void;
  size: number;
}

export const ChessSquare: React.FC<ChessSquareProps> = ({
  position,
  squareColor,
  piece,
  isSelected,
  isValidMove,
  onPress,
  size,
}) => {
  const getPieceSymbol = () => {
    if (!piece) return '';
    // `chess.js` uses lowercase 'p' for type, and 'w'/'b' for color
    const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
    return PIECE_SYMBOLS[key] || '';
  };

  const isLight = squareColor === 'light';
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(position)}
      style={[
        styles.square,
        { width: size, height: size },
        { backgroundColor: isLight ? COLORS.lightSquare : COLORS.darkSquare },
      ]}
    >
      {isSelected && (
        <View style={styles.selectedHighlight} />
      )}
      
      {isValidMove && (
        <View style={[styles.validMoveDot, { backgroundColor: piece ? 'rgba(0,0,0,0.1)' : COLORS.highlightMove }]} />
      )}

      <Text style={[styles.piece, { fontSize: size * 0.75 }]}>
        {getPieceSymbol()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  piece: {
    color: '#000', // Unicode characters often handle their own color, but fallback.
  },
  selectedHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.highlightSelect,
  },
  validMoveDot: {
    position: 'absolute',
    width: '30%',
    height: '30%',
    borderRadius: 100,
  },
});
