import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { RootNavigator } from './src/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
