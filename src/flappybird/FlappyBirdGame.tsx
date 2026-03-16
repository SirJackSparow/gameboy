import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentGame } from '../store/gameSlice';

const { width, height } = Dimensions.get('window');

// Game Constants
const BIRD_SIZE = 40;
const ENEMY_SIZE = 35;
const GRAVITY = 0.6;
const JUMP_STRENGTH = -9;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 4;
const PIPE_INTERVAL = 1500;
const ENEMY_SPEED = 5;
const ENEMY_INTERVAL = 2500; // Spawns every 2.5 seconds

interface PipeData {
  id: string;
  x: number;
  topHeight: number;
}

interface EnemyData {
  id: string;
  x: number;
  y: number;
}

export const FlappyBirdGame: React.FC = () => {
  const dispatch = useDispatch();

  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(height / 3);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [enemies, setEnemies] = useState<EnemyData[]>([]);

  // Animation values
  const rotation = useRef(new Animated.Value(0)).current;

  // Internal values for physics
  const birdVelocity = useRef(0);
  const requestRef = useRef<number>(0);
  const lastPipeSpawnRef = useRef<number>(0);
  const lastEnemySpawnRef = useRef<number>(0);

  // Refs for collision state tracking
  const stateRef = useRef({ birdY, pipes, enemies, isPlaying, gameOver, score });
  useEffect(() => {
    stateRef.current = { birdY, pipes, enemies, isPlaying, gameOver, score };
  }, [birdY, pipes, enemies, isPlaying, gameOver, score]);

  const startGame = () => {
    setBirdY(height / 3);
    birdVelocity.current = 0;
    setPipes([]);
    setEnemies([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    const now = Date.now();
    lastPipeSpawnRef.current = now;
    lastEnemySpawnRef.current = now + 1000; // Delay first enemy
    rotation.setValue(0);
  };

  const jump = () => {
    if (gameOver) return;
    if (!isPlaying) {
      startGame();
    } else {
      birdVelocity.current = JUMP_STRENGTH;
      Animated.timing(rotation, {
        toValue: -20,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const gameLoop = () => {
    if (!stateRef.current.isPlaying || stateRef.current.gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const now = Date.now();

    // 1. Update Bird Movement
    birdVelocity.current += GRAVITY;
    const nextY = stateRef.current.birdY + birdVelocity.current;

    if (birdVelocity.current > 0) {
      const newRotation = Math.min(birdVelocity.current * 4, 90);
      rotation.setValue(newRotation);
    }

    if (nextY <= 0 || nextY >= height - 100) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setBirdY(nextY);
    }

    // 2. Spawn Pipes
    if (now - lastPipeSpawnRef.current > PIPE_INTERVAL) {
      const topHeight = Math.floor(Math.random() * (height - 400)) + 100;
      setPipes(prev => [...prev, {
        id: Math.random().toString(),
        x: width,
        topHeight
      }]);
      lastPipeSpawnRef.current = now;
    }

    // 3. Spawn Enemy Birds
    if (now - lastEnemySpawnRef.current > ENEMY_INTERVAL) {
      const enemyY = Math.floor(Math.random() * (height - 200)) + 50;
      setEnemies(prev => [...prev, {
        id: 'enemy-' + Math.random().toString(),
        x: width,
        y: enemyY
      }]);
      lastEnemySpawnRef.current = now;
    }

    // 4. Hitbox Constants
    const birdRect = {
      left: width / 4 + 8,
      right: width / 4 + BIRD_SIZE - 8,
      top: nextY + 8,
      bottom: nextY + BIRD_SIZE - 8
    };

    // 5. Move Pipes & Collision
    setPipes(prev => {
      const updatedPipes = prev.map(p => ({ ...p, x: p.x - PIPE_SPEED }));
      for (const pipe of updatedPipes) {
        if (birdRect.right > pipe.x && birdRect.left < pipe.x + PIPE_WIDTH) {
          if (birdRect.top < pipe.topHeight || birdRect.bottom > pipe.topHeight + PIPE_GAP) {
            setGameOver(true);
            setIsPlaying(false);
          }
        }
      }
      const filteredPipes = updatedPipes.filter(p => p.x > -PIPE_WIDTH);
      if (prev.length > filteredPipes.length) {
        setScore(curr => curr + 1);
      }
      return filteredPipes;
    });

    // 6. Move Enemies & Collision
    setEnemies(prev => {
      const updatedEnemies = prev.map(e => ({ ...e, x: e.x - ENEMY_SPEED }));
      for (const enemy of updatedEnemies) {
        if (
          birdRect.right > enemy.x + 5 && 
          birdRect.left < enemy.x + ENEMY_SIZE - 5 &&
          birdRect.bottom > enemy.y + 5 &&
          birdRect.top < enemy.y + ENEMY_SIZE - 5
        ) {
          setGameOver(true);
          setIsPlaying(false);
        }
      }
      return updatedEnemies.filter(e => e.x > -ENEMY_SIZE);
    });

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const birdRotation = rotation.interpolate({
    inputRange: [-20, 90],
    outputRange: ['-20deg', '90deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => dispatch(setCurrentGame('dashboard'))}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>{score}</Text>
        <View style={{ width: 60 }} />
      </View>

      <TouchableOpacity 
        style={styles.gameContainer} 
        activeOpacity={1} 
        onPress={jump}
      >
        {/* Bird */}
        <Animated.View style={[
          styles.birdContainer, 
          { 
            top: birdY, 
            left: width / 4,
            transform: [
              { rotate: birdRotation },
              { scaleX: -1 }
            ] 
          }
        ]}>
          <Text style={styles.birdEmoji}>🐤</Text>
        </Animated.View>

        {/* Enemies */}
        {enemies.map(enemy => (
          <View key={enemy.id} style={[styles.enemyContainer, { left: enemy.x, top: enemy.y }]}>
            <Text style={styles.enemyEmoji}>🦅</Text>
          </View>
        ))}

        {/* Pipes */}
        {pipes.map(pipe => (
          <React.Fragment key={pipe.id}>
            <View style={[styles.pipe, styles.topPipe, { left: pipe.x, height: pipe.topHeight }]} />
            <View style={[styles.pipe, styles.bottomPipe, { 
              left: pipe.x, 
              height: height - pipe.topHeight - PIPE_GAP, 
              top: pipe.topHeight + PIPE_GAP 
            }]} />
          </React.Fragment>
        ))}

        {!isPlaying && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>READY?</Text>
            <Text style={styles.instructionText}>AVOID THE EAGLES</Text>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>FLY</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverTitle}>CRASHED</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, zIndex: 10 },
  backBtn: { padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 12 },
  backBtnText: { color: '#94A3B8', fontWeight: 'bold' },
  scoreText: { color: '#F8FAFC', fontWeight: '900', fontSize: 36, textShadowColor: '#38BDF8', textShadowRadius: 10 },
  gameContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  birdContainer: { position: 'absolute', width: BIRD_SIZE, height: BIRD_SIZE, justifyContent: 'center', alignItems: 'center', zIndex: 3 },
  birdEmoji: { fontSize: BIRD_SIZE },
  enemyContainer: { position: 'absolute', width: ENEMY_SIZE, height: ENEMY_SIZE, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  enemyEmoji: { fontSize: ENEMY_SIZE },
  pipe: { position: 'absolute', width: PIPE_WIDTH, backgroundColor: '#10B981', borderColor: '#065F46', borderWidth: 3, borderRadius: 12, zIndex: 1 },
  topPipe: { borderTopWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  bottomPipe: { borderBottomWidth: 0, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  overlayTitle: { color: '#F8FAFC', fontSize: 60, fontWeight: '900', marginBottom: 10, letterSpacing: 2 },
  gameOverTitle: { color: '#EF4444', fontSize: 60, fontWeight: '900', marginBottom: 10 },
  instructionText: { color: '#38BDF8', fontSize: 20, fontWeight: '800', marginBottom: 40, letterSpacing: 4 },
  finalScore: { color: '#F8FAFC', fontSize: 80, fontWeight: '900', marginBottom: 40 },
  startBtn: { backgroundColor: '#38BDF8', paddingHorizontal: 60, paddingVertical: 18, borderRadius: 40, shadowColor: '#38BDF8', shadowOpacity: 0.8, shadowRadius: 20, elevation: 5 },
  startBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 20, letterSpacing: 2 },
});
