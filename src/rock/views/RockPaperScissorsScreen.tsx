import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRockPaperScissorsViewModel } from '../viewmodels/useRockPaperScissorsViewModel';
import { Move } from '../models/RockPaperScissorsModel';

// View: Completely dumb. It only knows how to render the `gameState` 
// and pass user actions to the `playMove` and `resetGame` functions.

export const RockPaperScissorsScreen: React.FC = () => {
  // Bind ViewModel strictly inside the View
  const { gameState, playMove, resetGame } = useRockPaperScissorsViewModel();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MVVM RPS</Text>
      
      <View style={styles.scoreBoard}>
        <Text style={styles.scoreText}>Player: {gameState.playerScore}</Text>
        <Text style={styles.scoreText}>CPU: {gameState.computerScore}</Text>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.moveText}>
          You: {gameState.playerMove || '?'}
        </Text>
        <Text style={styles.moveText}>
          CPU: {gameState.computerMove || '?'}
        </Text>
        
        {gameState.result && (
          <Text style={[styles.resultText, gameState.result === 'WIN' ? styles.win : styles.lose]}>
            You {gameState.result}!
          </Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        {(['ROCK', 'PAPER', 'SCISSORS'] as Move[]).map((move) => (
          <TouchableOpacity 
            key={move} 
            style={styles.actionButton}
            onPress={() => playMove(move)}
          >
            <Text style={styles.buttonText}>{move}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetText}>Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  scoreBoard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, paddingHorizontal: 20 },
  scoreText: { fontSize: 20, fontWeight: '600' },
  gameArea: { alignItems: 'center', marginBottom: 40 },
  moveText: { fontSize: 18, marginVertical: 5 },
  resultText: { fontSize: 24, fontWeight: 'bold', marginTop: 15 },
  win: { color: 'green' },
  lose: { color: 'red' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  resetButton: { marginTop: 40, alignSelf: 'center' },
  resetText: { color: 'red', fontSize: 16 }
});
