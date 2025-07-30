# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based marketing campaign management system built with Vite. The project provides a comprehensive dashboard for managing marketing campaigns with detailed tracking and analytics.

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

The application consists of two main components:

- **MarketingManagerV4**: The main dashboard component displaying campaign data, KPIs, and navigation
- **CampaignDetail**: Detailed campaign management interface with editing capabilities, document uploads, and history tracking

Key features:
- Components use React hooks (useState, useEffect) for state management
- Inline styling approach for consistent design
- View-based navigation without routing libraries
- Comprehensive campaign data structure with history tracking

### Key Patterns

1. **Inline Styling**: All components use inline styles for maintainability and consistency
2. **State Management**: View navigation is handled through state in MarketingManagerV4
3. **History Tracking**: All campaign changes are logged with timestamps and user information
4. **File Handling**: Document uploads are handled with FileReader API and base64 encoding

### Development Guidelines

1. Campaign data structure includes: name, status, spend, revenue, ROAS, startDate, endDate, manager, adPlacementDomain, device, targeting, repContactInfo, notes, documents, visualMedia
2. All edits to campaigns are tracked in the changeHistory array
3. Maintain consistent styling with the existing blue (#0066cc) color scheme
4. Follow responsive design patterns for mobile compatibility

## Important Notes

- **No Testing Framework**: The project currently lacks tests. When adding tests, consider installing Vitest for Vite compatibility
- **View Navigation**: Navigation between dashboard and campaign detail views is handled through state management
- **No Environment Variables**: All configuration is hardcoded
- **Development Port**: Vite dev server runs on http://localhost:5173 by default