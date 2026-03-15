import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ChessGame } from './src/chess/ChessGame';

export default function App() {
  return (
    <View style={styles.container}>
      <ChessGame />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
});
