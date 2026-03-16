import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentGame } from '../store/gameSlice';

const { width, height } = Dimensions.get('window');

// Game constants
const GAME_AREA_WIDTH = width;
const GAME_AREA_HEIGHT = height * 0.6; // Top 60% of screen for game
const TANK_SIZE = 40;
const BULLET_SIZE = 8;
const ENEMY_SIZE = 40;
const BULLET_SPEED = 15;
const TANK_SPEED = 5;
const ENEMY_SPEED = 2;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

interface Tank extends Position {
  dir: Direction;
}

interface Bullet extends Position {
  dir: Direction;
  isPlayer: boolean;
  id: string;
}

interface Enemy extends Tank {
  id: string;
  lastFired: number;
}

export const TankGame: React.FC = () => {
  const dispatch = useDispatch();

  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const [player, setPlayer] = useState<Tank>({ 
    x: GAME_AREA_WIDTH / 2 - TANK_SIZE / 2, 
    y: GAME_AREA_HEIGHT - TANK_SIZE - 20, 
    dir: 'UP' 
  });
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);

  // Refs for game loop
  const requestRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const movingDirRef = useRef<Direction | null>(null);

  const stateRef = useRef({ player, bullets, enemies, isPlaying, gameOver, score });

  useEffect(() => {
    stateRef.current = { player, bullets, enemies, isPlaying, gameOver, score };
  }, [player, bullets, enemies, isPlaying, gameOver, score]);

  const startGame = () => {
    setPlayer({ 
      x: GAME_AREA_WIDTH / 2 - TANK_SIZE / 2, 
      y: GAME_AREA_HEIGHT - TANK_SIZE - 20, 
      dir: 'UP'
    });
    setBullets([]);
    setEnemies([{ x: 50, y: 50, dir: 'DOWN', id: Math.random().toString(), lastFired: 0 }]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    lastUpdateRef.current = Date.now();
  };

  const fireBullet = () => {
    if (!stateRef.current.isPlaying || stateRef.current.gameOver) return;
    
    const p = stateRef.current.player;
    let bx = p.x + TANK_SIZE / 2 - BULLET_SIZE / 2;
    let by = p.y + TANK_SIZE / 2 - BULLET_SIZE / 2;

    if (p.dir === 'UP') by -= TANK_SIZE / 2;
    if (p.dir === 'DOWN') by += TANK_SIZE / 2;
    if (p.dir === 'LEFT') bx -= TANK_SIZE / 2;
    if (p.dir === 'RIGHT') bx += TANK_SIZE / 2;

    setBullets(prev => [...prev, { x: bx, y: by, dir: p.dir, isPlayer: true, id: Math.random().toString() }]);
  };

  const handleMovePressin = (dir: Direction) => {
    movingDirRef.current = dir;
    setPlayer(prev => ({ ...prev, dir })); // Update rotation immediately
  };

  const handleMovePressout = () => {
    movingDirRef.current = null;
  };

  const gameLoop = () => {
    if (!stateRef.current.isPlaying || stateRef.current.gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    
    // Throttle updates slightly to ~30fps for stability
    if (delta > 30) {
      lastUpdateRef.current = now;
      let currentState = stateRef.current;

      // 1. Process Player Movement
      setPlayer(prev => {
        if (!movingDirRef.current) return prev;
        let nx = prev.x;
        let ny = prev.y;
        if (movingDirRef.current === 'UP') ny -= TANK_SPEED;
        if (movingDirRef.current === 'DOWN') ny += TANK_SPEED;
        if (movingDirRef.current === 'LEFT') nx -= TANK_SPEED;
        if (movingDirRef.current === 'RIGHT') nx += TANK_SPEED;

        // Boundaries
        nx = Math.max(0, Math.min(nx, GAME_AREA_WIDTH - TANK_SIZE));
        ny = Math.max(0, Math.min(ny, GAME_AREA_HEIGHT - TANK_SIZE));

        return { x: nx, y: ny, dir: prev.dir };
      });

      // 2. Process Bullets
      setBullets(prev => {
        return prev.map(b => {
          let nx = b.x;
          let ny = b.y;
          if (b.dir === 'UP') ny -= BULLET_SPEED;
          if (b.dir === 'DOWN') ny += BULLET_SPEED;
          if (b.dir === 'LEFT') nx -= BULLET_SPEED;
          if (b.dir === 'RIGHT') nx += BULLET_SPEED;
          return { ...b, x: nx, y: ny };
        }).filter(b => b.x > 0 && b.x < GAME_AREA_WIDTH && b.y > 0 && b.y < GAME_AREA_HEIGHT);
      });

      // 3. Process Enemies
      setEnemies(prev => {
        let newEnemies = prev.map(e => {
          let nx = e.x;
          let ny = e.y;
          let ndir = e.dir;
          
          // Basic AI: Move forward, occasionally change direction
          if (Math.random() < 0.02) {
            const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
            ndir = dirs[Math.floor(Math.random() * dirs.length)];
          }

          if (ndir === 'UP') ny -= ENEMY_SPEED;
          if (ndir === 'DOWN') ny += ENEMY_SPEED;
          if (ndir === 'LEFT') nx -= ENEMY_SPEED;
          if (ndir === 'RIGHT') nx += ENEMY_SPEED;

          // Enemy Boundaries
          if (nx <= 0 || nx >= GAME_AREA_WIDTH - ENEMY_SIZE || ny <= 0 || ny >= GAME_AREA_HEIGHT - ENEMY_SIZE) {
             const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
             ndir = dirs[Math.floor(Math.random() * dirs.length)];
             nx = Math.max(0, Math.min(nx, GAME_AREA_WIDTH - ENEMY_SIZE));
             ny = Math.max(0, Math.min(ny, GAME_AREA_HEIGHT - ENEMY_SIZE));
          }

          // Enemy firing
          if (now - e.lastFired > 1500 && Math.random() < 0.05) {
             let bx = nx + ENEMY_SIZE / 2 - BULLET_SIZE / 2;
             let by = ny + ENEMY_SIZE / 2 - BULLET_SIZE / 2;
             setBullets(currB => [...currB, { x: bx, y: by, dir: ndir, isPlayer: false, id: Math.random().toString() }]);
             return { ...e, x: nx, y: ny, dir: ndir, lastFired: now };
          }

          return { ...e, x: nx, y: ny, dir: ndir };
        });

        // Spawn new enemy
        if (newEnemies.length < 3 && Math.random() < 0.01) {
           newEnemies.push({
             x: Math.random() * (GAME_AREA_WIDTH - ENEMY_SIZE),
             y: Math.random() * (GAME_AREA_HEIGHT / 2), // Spawn in top half
             dir: 'DOWN',
             id: Math.random().toString(),
             lastFired: now
           });
        }
        return newEnemies;
      });

      // 4. Collision Detection
      currentState = stateRef.current; // Re-grab latest after async setters
      
      const pRect = { x: currentState.player.x, y: currentState.player.y, w: TANK_SIZE, h: TANK_SIZE };
      
      currentState.bullets.forEach(b => {
        const bRect = { x: b.x, y: b.y, w: BULLET_SIZE, h: BULLET_SIZE };
        
        // Enemy bullets hit player
        if (!b.isPlayer && !currentState.gameOver) {
          if (checkCollision(pRect, bRect)) {
            setGameOver(true);
            setIsPlaying(false);
          }
        }

        // Player bullets hit enemies
        if (b.isPlayer) {
          currentState.enemies.forEach(e => {
            const eRect = { x: e.x, y: e.y, w: ENEMY_SIZE, h: ENEMY_SIZE };
            if (checkCollision(eRect, bRect)) {
              // Destroy enemy & bullet
              setEnemies(prev => prev.filter(en => en.id !== e.id));
              setBullets(prev => prev.filter(bu => bu.id !== b.id));
              setScore(s => s + 10);
            }
          });
        }
      });
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const checkCollision = (r1: any, r2: any) => {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  const getRotation = (dir: Direction) => {
    switch(dir) {
      case 'UP': return '0deg';
      case 'RIGHT': return '90deg';
      case 'DOWN': return '180deg';
      case 'LEFT': return '270deg';
      default: return '0deg';
    }
  };

  const renderTank = (t: Tank, color: string, isEnemy = false) => (
    <View 
      key={isEnemy ? (t as Enemy).id : 'player'}
      style={[
        styles.tankBase, 
        { left: t.x, top: t.y, backgroundColor: color, transform: [{ rotate: getRotation(t.dir) }] }
      ]}
    >
      <View style={styles.tankTurret} />
      <View style={styles.tankTreadsLeft} />
      <View style={styles.tankTreadsRight} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => dispatch(setCurrentGame('dashboard'))}>
          <Text style={styles.backBtnText}>← Quit</Text>
        </TouchableOpacity>
        <Text style={styles.scoreText}>SCORE: {score}</Text>
      </View>

      <View style={styles.gameArea}>
        {/* Bullets */}
        {bullets.map(b => (
          <View 
            key={b.id} 
            style={[
              styles.bullet, 
              { left: b.x, top: b.y, backgroundColor: b.isPlayer ? '#38BDF8' : '#F43F5E' }
            ]} 
          />
        ))}

        {/* Enemies */}
        {enemies.map(e => renderTank(e, '#F43F5E', true))}

        {/* Player */}
        {!gameOver && renderTank(player, '#38BDF8')}

        {/* Overlays */}
        {!isPlaying && !gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>TANK ARENA</Text>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>START MISSION</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>MISSION FAILED</Text>
            <Text style={styles.finalScore}>FINAL SCORE: {score}</Text>
            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>RETRY</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.controlsArea}>
        {/* D-Pad */}
        <View style={styles.dpad}>
          <TouchableOpacity 
            style={[styles.dpadBtn, styles.dpadUp]} 
            onPressIn={() => handleMovePressin('UP')} 
            onPressOut={handleMovePressout}
          ><Text style={styles.dpadText}>▲</Text></TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dpadBtn, styles.dpadLeft]} 
            onPressIn={() => handleMovePressin('LEFT')} 
            onPressOut={handleMovePressout}
          ><Text style={styles.dpadText}>◀</Text></TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dpadBtn, styles.dpadRight]} 
            onPressIn={() => handleMovePressin('RIGHT')} 
            onPressOut={handleMovePressout}
          ><Text style={styles.dpadText}>▶</Text></TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dpadBtn, styles.dpadDown]} 
            onPressIn={() => handleMovePressin('DOWN')} 
            onPressOut={handleMovePressout}
          ><Text style={styles.dpadText}>▼</Text></TouchableOpacity>
        </View>

        {/* Action Button */}
        <View style={styles.actionPad}>
          <TouchableOpacity style={styles.fireBtn} onPress={fireBullet}>
            <Text style={styles.fireBtnText}>FIRE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0F19' }, // Very dark blue/black
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1E293B',
    borderBottomWidth: 2,
    borderColor: '#38BDF8',
  },
  backBtn: { padding: 5 },
  backBtnText: { color: '#94A3B8', fontWeight: 'bold' },
  scoreText: { color: '#F8FAFC', fontWeight: '900', fontSize: 18, letterSpacing: 2 },
  
  gameArea: {
    width: GAME_AREA_WIDTH,
    height: GAME_AREA_HEIGHT,
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },
  
  // TANK STYLES
  tankBase: {
    position: 'absolute',
    width: TANK_SIZE,
    height: TANK_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tankTurret: {
    width: 6,
    height: 20,
    backgroundColor: '#F8FAFC',
    position: 'absolute',
    top: -10,
    borderRadius: 3,
  },
  tankTreadsLeft: {
    position: 'absolute',
    left: -4,
    width: 8,
    height: TANK_SIZE + 4,
    backgroundColor: '#1E293B',
    borderRadius: 4,
  },
  tankTreadsRight: {
    position: 'absolute',
    right: -4,
    width: 8,
    height: TANK_SIZE + 4,
    backgroundColor: '#1E293B',
    borderRadius: 4,
  },
  
  // BULLET
  bullet: {
    position: 'absolute',
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    borderRadius: BULLET_SIZE / 2,
    zIndex: 5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },

  // OVERLAYS
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 25, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayTitle: { color: '#38BDF8', fontSize: 40, fontWeight: '900', letterSpacing: 4, marginBottom: 20 },
  finalScore: { color: '#F1F5F9', fontSize: 24, marginBottom: 40, fontWeight: '700' },
  startBtn: { backgroundColor: '#38BDF8', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  startBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16, letterSpacing: 2 },

  // CONTROLS
  controlsArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#1E293B',
    borderTopWidth: 2,
    borderColor: '#334155',
  },
  dpad: {
    width: 140,
    height: 140,
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 70,
  },
  dpadBtn: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  dpadText: { color: '#38BDF8', fontSize: 24 },
  dpadUp: { top: 0, left: 45 },
  dpadDown: { bottom: 0, left: 45 },
  dpadLeft: { top: 45, left: 0 },
  dpadRight: { top: 45, right: 0 },

  actionPad: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F43F5E',
  },
  fireBtnText: { color: '#F43F5E', fontWeight: '900', fontSize: 20, letterSpacing: 1 },
});
