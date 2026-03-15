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
