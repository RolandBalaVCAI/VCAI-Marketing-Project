# Phase 1 Task 1: Set Up Project Structure for API Layer

## Objective
Create a well-organized project structure to support the mock API, state management, and separation of concerns.

## Current State
- Flat structure in `src/` with components directly at root level
- No separation between data, state, and UI layers

## Target Structure
```
tictactoe-app/src/
├── api/
│   ├── endpoints/
│   │   ├── campaigns.js
│   │   └── index.js
│   ├── mock/
│   │   ├── data/
│   │   │   ├── campaigns.js
│   │   │   └── vendors.js
│   │   └── server.js
│   └── client.js
├── stores/
│   ├── campaignsStore.js
│   ├── filtersStore.js
│   └── uiStore.js
├── components/
│   ├── common/
│   ├── MarketingManagerV4.jsx
│   └── CampaignDetail.jsx
├── hooks/
│   ├── useCampaigns.js
│   └── useFilters.js
├── utils/
│   ├── calculations.js
│   └── dateHelpers.js
└── types/
    └── campaign.js
```

## Implementation Steps

### 1. Create Directory Structure
```bash
mkdir -p src/api/endpoints
mkdir -p src/api/mock/data
mkdir -p src/stores
mkdir -p src/components/common
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
```

### 2. Move Existing Components
- Move `MarketingManagerV4.jsx` to `src/components/`
- Move `CampaignDetail.jsx` to `src/components/`
- Update import paths in `App.jsx`

### 3. Extract Utility Functions
- Extract calculation functions from components to `src/utils/calculations.js`
- Extract date formatting helpers to `src/utils/dateHelpers.js`

### 4. Create Type Definitions
- Define campaign data structure in `src/types/campaign.js`
- Include all fields currently used in the application

## Testing Criteria
- [ ] Application still runs without errors after restructuring
- [ ] All existing functionality works (dashboard, campaign detail, filtering)
- [ ] Import paths are correctly updated
- [ ] No broken references or missing files

## Definition of Done
- Clean, organized project structure following industry best practices
- All components moved to appropriate directories
- Utility functions extracted and reusable
- Type definitions created for data structures
- Application functionality unchanged
- All imports working correctly

## Files to Create/Modify
- New directory structure
- `src/types/campaign.js`
- `src/utils/calculations.js`
- `src/utils/dateHelpers.js`
- Update `src/App.jsx` imports
- Update component imports in moved files

## Estimated Time
1-2 hours

## Dependencies
None - this is the foundation task for all subsequent work.