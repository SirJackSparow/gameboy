import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentGame } from '../store/gameSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const GameCard = ({ title, desc, icon, onPress, index }: { title: string, desc: string, icon: string, onPress: () => void, index: number }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity, marginRight: 20 }}>
      <TouchableOpacity
        style={styles.gameCard}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>PLAY NOW</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Welcome to</Text>
          <Text style={styles.title}>GameHub <Text style={styles.titleHighlight}>Pro</Text></Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
        >
          <GameCard
            index={0}
            title="Grandmaster Chess"
            desc="Experience advanced AI strategy"
            icon="♟️"
            onPress={() => dispatch(setCurrentGame('chess'))}
          />

          <GameCard
            index={1}
            title="Rock Paper Scissors"
            desc="Classic duel with animations"
            icon="✂️"
            onPress={() => dispatch(setCurrentGame('scissors'))}
          />

          <GameCard
            index={2}
            title="Tank Arena"
            desc="2D combat logic shooter"
            icon="🕹️"
            onPress={() => dispatch(setCurrentGame('tank'))}
          />

          <GameCard
            index={3}
            title="Flappy Bird"
            desc="Addictive retro flight game"
            icon="🐤"
            onPress={() => dispatch(setCurrentGame('flappybird'))}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerHint}>Swipe horizontally to explore →</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  titleHighlight: {
    color: '#38BDF8',
  },
  scrollContent: {
    paddingLeft: 24,
    paddingRight: 4,
    paddingBottom: 40,
  },
  gameCard: {
    width: CARD_WIDTH,
    height: 400,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 32,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  icon: {
    fontSize: 50,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F1F5F9',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  playButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 20,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  playButtonText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerHint: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  }
});
