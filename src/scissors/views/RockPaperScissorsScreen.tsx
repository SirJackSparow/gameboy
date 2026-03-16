import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentGame } from '../../store/gameSlice';
import { useRockPaperScissorsViewModel } from '../viewmodels/useRockPaperScissorsViewModel';
import { Move } from '../models/RockPaperScissorsModel';

const { width } = Dimensions.get('window');

const getMoveEmoji = (move: Move | null) => {
  switch (move) {
    case 'ROCK': return '🪨';
    case 'PAPER': return '📄';
    case 'SCISSORS': return '✂️';
    default: return '❓';
  }
};

const getMoveName = (move: Move | null) => {
  switch (move) {
    case 'ROCK': return 'Rock';
    case 'PAPER': return 'Paper';
    case 'SCISSORS': return 'Scissors';
    default: return 'Waiting...';
  }
};

export const RockPaperScissorsScreen: React.FC = () => {
  const { gameState, playMove, resetGame } = useRockPaperScissorsViewModel();
  const dispatch = useDispatch();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  // Entrance and Idle Animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.timing(slideUpAnim, { 
        toValue: 0, 
        duration: 800, 
        easing: Easing.out(Easing.back(1.5)), 
        useNativeDriver: true 
      })
    ]).start();

    // Pulse animation for the VS text
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Combat Shake Animation when both players have moved
  useEffect(() => {
    if (gameState.playerMove && gameState.computerMove) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true })
      ]).start();
    }
  }, [gameState.playerMove, gameState.computerMove, gameState.result]);

  const getResultColor = () => {
    if (gameState.result === 'WIN') return '#38BDF8'; // Light Blue
    if (gameState.result === 'LOSE') return '#F43F5E'; // Rose
    if (gameState.result === 'DRAW') return '#FBBF24'; // Amber
    return 'transparent';
  };

  const ActionButton = ({ move, index }: { move: Move, index: number }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(pressAnim, { 
        toValue: 0.9, 
        useNativeDriver: true 
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, { 
        toValue: 1, 
        friction: 3, 
        tension: 40, 
        useNativeDriver: true 
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => playMove(move)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionEmoji}>{getMoveEmoji(move)}</Text>
          <Text style={styles.actionText}>{getMoveName(move)}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => dispatch(setCurrentGame('dashboard'))}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>R.P.S <Text style={styles.titleHighlight}>Duel</Text></Text>
      </Animated.View>

      <Animated.View style={[styles.scoreBoard, { opacity: fadeAnim }]}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>YOU</Text>
          <Text style={styles.scoreValue}>{gameState.playerScore}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>CPU</Text>
          <Text style={styles.scoreValue}>{gameState.computerScore}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.battleArena, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.fighterBox}>
          <View style={[styles.emojiCircle, gameState.result === 'WIN' && styles.winnerGlow]}>
            <Text style={styles.combatEmoji}>{getMoveEmoji(gameState.playerMove)}</Text>
          </View>
          <Text style={styles.fighterName}>{getMoveName(gameState.playerMove)}</Text>
        </View>

        <Animated.View style={[styles.vsContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.vsText}>VS</Text>
        </Animated.View>

        <View style={styles.fighterBox}>
          <View style={[styles.emojiCircle, gameState.result === 'LOSE' && styles.loserGlow]}>
            <Text style={styles.combatEmoji}>{getMoveEmoji(gameState.computerMove)}</Text>
          </View>
          <Text style={styles.fighterName}>{getMoveName(gameState.computerMove)}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
        {gameState.result ? (
          <Text style={[styles.resultText, { color: getResultColor() }]}>
            {gameState.result === 'WIN' ? 'VICTORY' : gameState.result === 'LOSE' ? 'DEFEAT' : 'DRAW'}
          </Text>
        ) : (
          <Text style={styles.waitingText}>Make your move...</Text>
        )}
      </Animated.View>

      <Animated.View style={[styles.actionPad, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        {(['ROCK', 'PAPER', 'SCISSORS'] as Move[]).map((move, index) => (
          <ActionButton key={move} move={move} index={index} />
        ))}
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>↻ Reset Match</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A', // Slate 900
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  backButtonText: { 
    color: '#94A3B8', // Slate 400
    fontSize: 14, 
    fontWeight: '700' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  titleHighlight: {
    color: '#38BDF8',
  },
  scoreBoard: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    marginHorizontal: 40,
    borderRadius: 24,
    paddingVertical: 15,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  scoreCard: {
    alignItems: 'center',
    width: 80,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    color: '#F1F5F9',
    fontWeight: 'black',
  },
  scoreDivider: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  battleArena: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  fighterBox: { 
    alignItems: 'center',
  },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  winnerGlow: {
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  loserGlow: {
    borderColor: '#F43F5E',
    shadowColor: '#F43F5E',
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  combatEmoji: {
    fontSize: 50,
  },
  fighterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  vsContainer: {
    backgroundColor: '#1E293B',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  vsText: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: '#94A3B8', 
    fontStyle: 'italic',
  },
  resultContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resultText: { 
    fontSize: 36, 
    fontWeight: '900', 
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  waitingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actionPad: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 20,
  },
  actionButton: { 
    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
    paddingVertical: 15, 
    paddingHorizontal: 15,
    borderRadius: 20, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    width: (width - 70) / 3,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: { 
    color: '#CBD5E1', 
    fontWeight: '700',
    fontSize: 12,
  },
  resetButton: { 
    marginTop: 40, 
    alignSelf: 'center',
    padding: 15,
  },
  resetText: { 
    color: '#F43F5E', // Rose 500
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
