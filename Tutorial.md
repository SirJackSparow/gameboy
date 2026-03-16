# React Native UI Components — Jetpack Compose Comparison

A quick reference for Android (Compose) developers learning React Native.

---

## Component Mapping

| Compose | React Native | Notes |
|---|---|---|
| `Column` | `View` | Default flex direction is **column** in RN |
| `Row` | `View` + `flexDirection: 'row'` | Must set explicitly |
| `Box` | `View` + `position: 'absolute'` on children | For overlapping/stacking |
| `Text` | `Text` | Same concept |
| `Image` | `Image` | Same concept |
| `Spacer` | `View` with `flex: 1` or `margin` | Fills available space |
| `LazyColumn` | `FlatList` | Virtualized vertical list |
| `LazyRow` | `FlatList` with `horizontal` | Virtualized horizontal list |
| `Button` | `Button` / `TouchableOpacity` | `TouchableOpacity` is more customizable |
| `Scaffold` | Manual `View` structure | No built-in equivalent |
| `Modifier.padding()` | `style={{ padding: 8 }}` | Via StyleSheet or inline |
| `Modifier.fillMaxSize()` | `style={{ flex: 1 }}` | Fill parent container |

---

## Code Examples

### Column (vertical stack)

**Compose:**
```kotlin
Column {
    Text("Item 1")
    Text("Item 2")
}
```

**React Native:**
```tsx
// flexDirection: 'column' is the DEFAULT, so a plain <View> works
<View>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>
```

---

### Row (horizontal stack)

**Compose:**
```kotlin
Row {
    Text("Left")
    Text("Right")
}
```

**React Native:**
```tsx
<View style={{ flexDirection: 'row' }}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

---

### Box (overlay / stack children)

**Compose:**
```kotlin
Box {
    Image(painter = painterResource(R.drawable.photo), contentDescription = null)
    Text(
        text = "Caption",
        modifier = Modifier.align(Alignment.BottomStart).padding(8.dp)
    )
}
```

**React Native:**
```tsx
<View style={{ position: 'relative', width: 200, height: 200 }}>
  <Image source={require('./assets/photo.png')} style={{ width: 200, height: 200 }} />
  {/* Overlay on top */}
  <Text style={{ position: 'absolute', bottom: 8, left: 8 }}>
    Caption
  </Text>
</View>
```

---

### Spacer

**Compose:**
```kotlin
Row {
    Text("Left")
    Spacer(modifier = Modifier.weight(1f))
    Text("Right")
}
```

**React Native:**
```tsx
<View style={{ flexDirection: 'row' }}>
  <Text>Left</Text>
  <View style={{ flex: 1 }} /> {/* Spacer */}
  <Text>Right</Text>
</View>
```

---

### LazyColumn → FlatList

**Compose:**
```kotlin
LazyColumn {
    items(myList) { item ->
        Text(item.name)
    }
}
```

**React Native:**
```tsx
<FlatList
  data={myList}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <Text>{item.name}</Text>}
/>
```

---

### LazyRow → FlatList (horizontal)

**Compose:**
```kotlin
LazyRow {
    items(myList) { item ->
        Text(item.name)
    }
}
```

**React Native:**
```tsx
<FlatList
  horizontal
  data={myList}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <Text>{item.name}</Text>}
/>
```

---

## Key Differences to Remember

- **RN's default axis is already `column`** — a plain `<View>` behaves like Compose's `Column`.
- **No `Box` component** — simulate it with `position: 'absolute'` on children.
- **All layout is Flexbox** — Compose uses its own layout model; RN is pure CSS Flexbox.
- **Styling is inline or via `StyleSheet`** — no `Modifier` chain; everything goes in the `style` prop.
- **No `Scaffold`** — structure your own screen layout with nested `View`s.

---

### Lists and Styling

**Compose (LazyColumn with custom items):**
```kotlin
LazyColumn {
    items(myList) { item ->
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .background(Color.White)
        ) {
            Text(
                text = item.name,
                style = MaterialTheme.typography.h6
            )
        }
    }
}
```

**React Native (FlatList with StyleSheet):**
```tsx
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

const MyList = ({ data }) => {
  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};

// Styling in React Native is done via StyleSheet (similar to CSS)
const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  listItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // for Android shadow
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

#### Key Styling Concepts:
1. **`StyleSheet.create()`**: This is the standard way to define styles. It's performant and acts like a mapping of CSS classes.
2. **`contentContainerStyle`**: On lists (`FlatList`, `ScrollView`), use this instead of `style` to apply padding or styling to the *inner content wrapping* the items, rather than the list box itself.
3. **No `Modifier` chain**: Instead of stringing modifiers together (`.padding().background()`), you pass an array or object to the `style` prop: `style={[styles.listItem, { backgroundColor: 'red' }]}`.

---

### Simple Style Mappings (Compose → React Native)

**The Rule of Thumb:** 
In Compose, you chain `Modifier` functions. In React Native, styles are just JavaScript objects passed to the `style` prop, and they closely mirror standard web CSS. You don't chain them; you group them together.

#### Form & Layout
- **`Modifier.background(Color.Red)`**  →  `backgroundColor: 'red'` *(Colors are string values)*
- **`Modifier.padding(16.dp)`**  →  `padding: 16` *(Values are unitless numbers, representing density-independent pixels)*
- **`Modifier.padding(horizontal = 16.dp)`**  →  `paddingHorizontal: 16` *(Specific wrapper for left/right combined)*
- **`Modifier.fillMaxWidth()`**  →  `width: '100%'` *(Percentages must be in quotes)*
- **`Modifier.fillMaxSize()`**  →  `flex: 1` *(Makes a view expand to fill all remaining parent space)*
- **`Modifier.size(50.dp)`**  →  `width: 50, height: 50` *(No single `size` shortcut exists)*

#### Shapes & Borders
- **`Modifier.clip(RoundedCornerShape(8.dp))`**  →  `borderRadius: 8` *(Direct integer property)*
- **`Modifier.clip(CircleShape)`**  →  `borderRadius: 9999` *(Set radius very high, or exactly half width/height, to achieve a pill/circle shape)*
- **`Modifier.border(2.dp, Color.Black)`**  →  `borderWidth: 2, borderColor: 'black'` *(Handled via two separate properties)*
- **`Modifier.alpha(0.5f)`**  →  `opacity: 0.5` *(Decimal number from 0 to 1)*

#### Text Properties
- **`Text(color = Color.Blue)`**  →  `color: 'blue'`
- **`Text(fontSize = 18.sp)`**  →  `fontSize: 18` *(Number only, no 'sp' suffix)*
- **`Text(fontWeight = FontWeight.Bold)`**  →  `fontWeight: 'bold'`

---

### Advanced Styling Concepts

#### 1. Shadows & Elevation
Shadows in React Native are handled differently on iOS and Android:
- **Compose**: `Modifier.shadow(4.dp)`
- **React Native (Android)**: `elevation: 4` *(Uses the native Android z-axis elevation)*
- **React Native (iOS)**: `shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84` *(Uses granular, CSS-like shadow properties)*

#### 2. Absolute Positioning (Overlays)
When you want things to detach from the normal flow and overlap (like a floating icon in a `Box` in Compose):
- **Compose**: `Box { ... Modifier.align(Alignment.TopEnd) }`
- **React Native**: `position: 'absolute', top: 0, right: 0` *(You pin the item to the absolute edges relative to the parent view)*

#### 3. Flexbox Alignment
Compose uses `Arrangement` (main axis) and `Alignment` (cross axis). React Native uses universal CSS Flexbox:
- **`Arrangement.Center` / `Arrangement.SpaceBetween`**  →  `justifyContent: 'center'` or `'space-between'` *(Distributes space along the main axis)*
- **`Alignment.CenterVertically`**  →  `alignItems: 'center'` *(Aligns children perpendicularly against the cross axis)*

#### 4. Safe Areas (Notches & Home Indicators)
Handling the physical notches on modern phones:
- **Compose**: Usually handled via `Scaffold` padding values or `Modifier.windowInsetsPadding()`.
- **React Native**: Built-in `<SafeAreaView>` component wraps your main layout, or use the `react-native-safe-area-context` library for granular padding hooks (`useSafeAreaInsets()`).

#### 5. Grids
- **Compose**: `LazyVerticalGrid`
- **React Native**: Simply use a `FlatList` and pass the `numColumns={2}` prop. Unlike Compose where you need a dedicated grid component, React Native's `FlatList` inherently supports columns.

#### 6. Aspect Ratio
Keeping images or views in a specific shape (e.g. perfect square or 16:9):
- **Compose**: `Modifier.aspectRatio(16f / 9f)`
- **React Native**: `aspectRatio: 16/9` *(Just attach it to the style object. E.g. `aspectRatio: 1` creates a perfect square based on the width)*

#### 7. Gradients
- **Compose**: `Modifier.background(Brush.linearGradient(...))`
- **React Native**: Gradients are **not** built into the core React Native `<View>`. You must use a library component, most commonly `expo-linear-gradient` (installed via `npx expo install expo-linear-gradient`) and wrap it like `<LinearGradient colors={['red', 'blue']}>`.

---

## State Management (Redux vs Compose)

When handling global state across multiple screens or components, **Redux Toolkit (RTK)** in React Native is a common equivalent to **ViewModel + StateFlow/LiveData** in Jetpack Compose.

### Key Concepts

| Compose (ViewModel) | React Native (Redux Toolkit) | Explanation |
|---|---|---|
| `StateFlow<T>` or `LiveData<T>` | `Slice` / `State` | The single source of truth for your data. |
| `viewModel.updateData()` | `dispatch(action())` | How you trigger a change. Instead of calling a function directly, you dispatch an action. |
| `collectAsState()` / `observeAsState()` | `useSelector` | How a UI component listens to changes and triggers recomposition (re-renders). |
| `ViewModelStoreOwner` | `Provider` | Wraps the application to make the global state available anywhere in the tree. |

### Example: Storing the User's Current Screen

**Jetpack Compose:**
```kotlin
// 1. Define ViewModel
class NavigationViewModel : ViewModel() {
    private val _currentScreen = MutableStateFlow("dashboard")
    val currentScreen: StateFlow<String> = _currentScreen

    fun setScreen(screen: String) {
        _currentScreen.value = screen
    }
}

// 2. Consume in UI
@Composable
fun App(viewModel: NavigationViewModel = viewModel()) {
    val screen by viewModel.currentScreen.collectAsState()
    
    when(screen) {
        "dashboard" -> DashboardScreen { viewModel.setScreen("chess") }
        "chess" -> ChessGame { viewModel.setScreen("dashboard") }
    }
}
```

**React Native (Redux Toolkit):**
```tsx
// 1. Define a Slice (gameSlice.ts)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const gameSlice = createSlice({
  name: 'game',
  initialState: { currentGame: 'dashboard' },
  reducers: {
    setCurrentGame: (state, action: PayloadAction<string>) => {
      // Immer library allows mutating state directly here
      state.currentGame = action.payload;
    },
  },
});
export const { setCurrentGame } = gameSlice.actions;
export default gameSlice.reducer;

// 2. Setup Store and Provider (store.ts & App.tsx)
// Assume `store` is created via configureStore({ reducer: { game: gameReducer } })
export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

// 3. Consume in UI (RootNavigator.tsx)
import { useSelector, useDispatch } from 'react-redux';

export const RootNavigator = () => {
  // Equivalent to collectAsState()
  const currentGame = useSelector((state: RootState) => state.game.currentGame);
  const dispatch = useDispatch();

  return (
    <View>
      {currentGame === 'dashboard' && (
        <Button title="Play Chess" onPress={() => dispatch(setCurrentGame('chess'))} />
      )}
      {currentGame === 'chess' && (
        <Button title="Back" onPress={() => dispatch(setCurrentGame('dashboard'))} />
      )}
    </View>
  );
};
```
