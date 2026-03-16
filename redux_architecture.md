# Redux Architecture in ReactXNative

Redux acts as the central brain of our application. Instead of passing data manually from folder to folder, every game connects directly to the store. 

Here is a visual map showing how the different folders in your app interact with Redux:

```mermaid
graph TD
    %% Redux Core
    subgraph Redux Store
        A[<b>store.ts</b><br>Provides State to App]
        B[<b>gameSlice.ts</b><br>State: <i>currentGame</i>]
        A --- B
    end

    %% App Entry
    C[<b>App.tsx</b><br>Wraps app in Redux Provider] --> A

    %% Navigation
    D[<b>RootNavigator.tsx</b><br>Reads state to display correct screen]
    B -- "useSelector(state.game.currentGame)" --> D

    %% The Games (Folders)
    subgraph Game Folders
        R[<b>rock/</b><br>DashboardScreen]
        S[<b>scissors/</b><br>RockPaperScissors]
        T[<b>tank/</b><br>TankGame]
        CH[<b>chess/</b><br>ChessGame]
    end

    %% Actions
    R -- "useDispatch(setCurrentGame('tank'))" --> B
    R -- "useDispatch(setCurrentGame('chess'))" --> B
    S -- "useDispatch(setCurrentGame('dashboard'))" --> B
    T -- "useDispatch(setCurrentGame('dashboard'))" --> B
    CH -- "useDispatch(setCurrentGame('dashboard'))" --> B
    
    %% Rendering
    D -.-> R
    D -.-> S
    D -.-> T
    D -.-> CH
    
    style A fill:#764ABC,color:white,stroke:#5A36A0
    style B fill:#764ABC,color:white,stroke:#5A36A0
    style D fill:#282C34,color:#61DAFB,stroke:#61DAFB
    style R fill:#1E293B,color:white
    style S fill:#1E293B,color:white
    style T fill:#1E293B,color:white
    style CH fill:#1E293B,color:white
```

## How the Diagram Works

1. **The Core (Top):** [App.tsx](file:///Users/fendy24/Downloads/reactxnative/App.tsx) provides the store to the entire app. The store gets its intelligence from [gameSlice.ts](file:///Users/fendy24/Downloads/reactxnative/src/store/gameSlice.ts), which holds the state variable `currentGame`.
2. **The Decision Maker (Middle):** [RootNavigator.tsx](file:///Users/fendy24/Downloads/reactxnative/src/RootNavigator.tsx) functions like a traffic cop. It constantly monitors Redux via `useSelector`. If `currentGame` changes to `'tank'`, it hides the dashboard and renders the TankGame folder.
3. **The Game Folders (Bottom):** Each of the folders (`rock/`, `scissors/`, `tank/`, `chess/`) are isolated and independent. However, they all have the power to send remote controls back to the Redux Brain using `useDispatch()`.

When you click a button in the **Dashboard** inside the `rock` folder, it shoots a message up to Redux to change the state. Redux immediately tells the **RootNavigator** about the change, and the **RootNavigator** swaps the screens instantaneously!
