# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based educational games and utilities collection built with Vite. The project contains multiple interactive applications designed to teach concepts through gamification.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Architecture

### Technology Stack
- **React 19.1.0** - UI framework
- **Vite 7.0.4** - Build tool and dev server
- **ESLint** - Code linting with React-specific rules
- **JavaScript/JSX** - No TypeScript configuration

### Component Structure

The application follows a simple component-swapping pattern where `App.jsx` imports and renders one component at a time. Each component is a self-contained game or utility:

- Components are stateful and use React hooks (useState, useEffect)
- Each component handles its own styling using inline styles
- No routing system - switching between apps requires manual import changes in App.jsx
- No shared state management - each component manages its own state

### Key Patterns

1. **Inline Styling**: All components use inline styles rather than CSS modules or styled-components
2. **Self-Contained Components**: Each game/utility is completely independent with no shared dependencies
3. **Educational Focus**: Components include explanatory text, statistics tracking, and learning outcomes

### Adding New Components

1. Create a new `.jsx` file in `tictactoe-app/src/`
2. Export as default: `export default ComponentName`
3. Import in `App.jsx` and replace the current component
4. Follow existing patterns for inline styling and state management

## Important Notes

- **No Testing Framework**: The project currently lacks tests. When adding tests, consider installing Vitest for Vite compatibility
- **Manual App Switching**: To switch between applications, manually edit the import in `App.jsx`
- **No Environment Variables**: All configuration is hardcoded
- **Development Port**: Vite dev server runs on http://localhost:5173 by default