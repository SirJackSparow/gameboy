import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { DashboardScreen } from './rock/DashboardScreen';
import { ChessGame } from './chess/ChessGame';
import { RockPaperScissorsScreen } from './scissors/views/RockPaperScissorsScreen';
import { TankGame } from './tank/TankGame';
import { FlappyBirdGame } from './flappybird/FlappyBirdGame';
import { StatusBar } from 'expo-status-bar';

export const RootNavigator: React.FC = () => {
  const currentGame = useSelector((state: RootState) => state.game.currentGame);

  return (
    <View style={styles.container}>
      {currentGame === 'dashboard' && <DashboardScreen />}
      {currentGame === 'chess' && <ChessGame />}
      {currentGame === 'scissors' && <RockPaperScissorsScreen />}
      {currentGame === 'tank' && <TankGame />}
      {currentGame === 'flappybird' && <FlappyBirdGame />}
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
});
