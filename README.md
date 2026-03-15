# Modern React Native MVVM Architecture

This folder (`src/rock`) demonstrates a modern **MVVM (Model-View-ViewModel)** architecture tailored for React Native.

In modern React Native, we typically use **Custom Hooks as ViewModels**. This cleanly separates our UI (Views) from our business logic and state management.

## Directory Structure

- **`models/`**: Contains the data structures, TypeScript interfaces, and types. It defines *what* the data is.
- **`services/`**: Contains pure business logic, API calls, database interactions, or external integrations. It handles *how* data is fetched or calculated independently of the UI.
- **`viewmodels/`**: Contains Custom Hooks (e.g., `useRockPaperScissors.ts`). This is the glue. It holds the React state, calls the services, and exposes variables and functions for the View to consume.
- **`views/`**: Contains the React Native components and screens (`.tsx` files). They should be as "dumb" as possible, only rendering what the ViewModel tells them to, and passing user interactions back to the ViewModel.

## Why this approach?
1. **Separation of Concerns**: UI developers can work on `views/` while logic developers work on `viewmodels/` and `services/`.
2. **Testability**: You can unit test the `viewmodels/` and `services/` without needing to render React components.
3. **Reusability**: The same ViewModel can be used by different Views (e.g., a Mobile View and a Web View).
