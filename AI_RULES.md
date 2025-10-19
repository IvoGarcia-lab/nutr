# AI Development Rules for NutriAI

This document outlines the technical stack and development guidelines for the NutriAI application. Following these rules ensures consistency, maintainability, and adherence to the project's architectural principles.

## Tech Stack Overview

The application is built with a modern, lightweight tech stack focused on simplicity and performance.

*   **Framework**: React with TypeScript for building a type-safe and component-based user interface.
*   **Build Tool**: Vite serves as the build tool, providing a fast development server and optimized production builds.
*   **Styling**: Tailwind CSS is used exclusively for styling. All styling should be done via utility classes.
*   **AI Integration**: The Google Gemini API, accessed through the `@google/genai` package, powers all generative AI features.
*   **Data Visualization**: Recharts is the designated library for creating charts and graphs, such as the weight progression and macronutrient distribution pies.
*   **State Management**: Application state is managed primarily through React Hooks (`useState`, `useEffect`). Global state is centralized in the main `App.tsx` component.
*   **Routing**: Navigation is handled by a simple state-based view-switching mechanism within `App.tsx`. No external routing library (like React Router) is used.
*   **Data Persistence**: User data and session information are mocked and persisted locally using `localStorage` and `sessionStorage`.

## Library Usage and Coding Conventions

To maintain a clean and consistent codebase, adhere to the following rules when using libraries and writing code.

### UI and Components

*   **Base Components**: Always reuse the existing UI components from the `src/components/ui/` directory (e.g., `Button`, `Card`, `Input`, `Select`). This is crucial for maintaining a consistent look and feel.
*   **New Complex Components**: If a new, more complex UI element is required (e.g., dialogs, calendars, tooltips), use components from the **shadcn/ui** library.
*   **Icons**: Use icons from the **lucide-react** library for all iconography needs. Ensure icons are used consistently and have appropriate sizing and accessibility attributes.

### Styling

*   **Tailwind CSS Only**: All styling must be implemented using Tailwind CSS utility classes. Do not write custom CSS files or use inline `style` objects unless there is no other alternative.
*   **Responsive Design**: All components and layouts must be fully responsive, adapting gracefully to different screen sizes from mobile to desktop.

### AI Features

*   **Centralized Service**: All interactions with the Gemini API must be encapsulated within the `src/services/geminiService.ts` file. Do not make direct API calls from components. This centralizes API logic, key management, and prompt engineering.

### State Management

*   **React Hooks**: Continue using React Hooks for state management. Avoid introducing complex state management libraries like Redux. If prop-drilling becomes a significant issue, discuss the potential introduction of a simpler solution like Zustand or React Context.

### Dependencies

*   **Minimize New Dependencies**: Before adding a new npm package, check if the required functionality can be achieved with the existing libraries. Every new dependency adds to the bundle size and maintenance overhead.