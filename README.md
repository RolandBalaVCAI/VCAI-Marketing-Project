# VCAI Marketing Project

A unified marketing campaign management system combining a React frontend with a Python data warehouse backend. This project implements DRY (Don't Repeat Yourself) principles by sharing common code between frontend and backend systems.

## Architecture

```
VCAIProject/
├── shared/                 # Shared code (DRY principle)
│   ├── models/            # Unified data models
│   ├── utils/             # Common utilities
│   ├── constants/         # Shared constants
│   ├── adapters/          # Data adapters
│   └── metrics/           # Metric calculations
├── frontend/              # React dashboard
├── backend/               # Python data warehouse
└── docs/                  # Documentation
```

## Key Features

### Unified Data Models
- **Single source of truth** for campaign structure
- **Shared validation** logic between systems
- **Consistent calculations** across frontend and backend
- **Type-safe adapters** for data transformation

### Smart API Client
- **Automatic fallback** from backend to mock API
- **Health checking** and caching
- **Graceful degradation** when backend is unavailable
- **Consistent interface** regardless of data source

### Data Warehouse Integration
- **Real-time sync** from Peach AI API
- **5-tier hierarchy mapping** for campaign organization
- **SQLite storage** with comprehensive metrics
- **Export capabilities** to CSV and Google Sheets

### React Dashboard
- **Real-time campaign management**
- **Advanced filtering and search**
- **KPI calculations and trending**
- **Document and media management**
- **Optimistic updates** with backend sync

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- Git

### 1. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install
cd ..

# Backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment

```bash
# Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit configuration files as needed
```

### 3. Start Development Servers

```bash
# Terminal 1: Start React frontend
cd frontend
npm run dev

# Terminal 2: Start Python backend
cd backend
python api_bridge.py
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Configuration

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK=false  # Set to true for mock data
```

### Backend (.env)
```bash
PEACHAI_API_TOKEN=your_token_here
DATABASE_URL=sqlite:///./datawarehouse.db
API_PORT=8000
```

## Usage

### Mock Mode (Default)
The system starts in mock mode using localStorage data:
- No external API dependencies
- Full functionality for development
- Sample campaign data included

### Production Mode
Configure with real Peach AI credentials:
- Real-time data synchronization
- Production-grade SQLite database
- Export to Google Sheets
- Hierarchy mapping and analytics

### Commands

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting

# Backend
python api_bridge.py      # Start API server
python main.py sync       # Sync data from Peach AI
python main.py export     # Export to CSV
python main.py status     # Check system status
```

## Development

### Adding New Features

1. **Update shared models** in `shared/models/` if data structure changes
2. **Add calculations** to `shared/utils/calculations.js` for DRY compliance
3. **Update adapters** in `shared/adapters/` for data transformation
4. **Implement in frontend** with React components
5. **Add backend endpoints** in `backend/api_bridge.py`

### Shared Code Pattern

```javascript
// shared/models/campaign.js - Single source of truth
export const CampaignModel = { /* unified structure */ };

// shared/utils/calculations.js - DRY calculations  
export const calculateROAS = (spend, revenue) => { /* logic */ };

// shared/adapters/campaignAdapter.js - Data transformation
export const adaptPeachAIToUnified = (data) => { /* transform */ };
```

### Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests  
cd backend
python -m pytest

# Integration tests
npm run test:integration
```

## API Integration

### Smart Fallback System
The frontend automatically detects backend availability:

1. **Health Check**: Pings `/api/health` endpoint
2. **Auto-fallback**: Uses mock API if backend unavailable
3. **Graceful degradation**: Shows appropriate status indicators
4. **Cache optimization**: Reduces unnecessary health checks

### Data Flow

```
Peach AI API → Python Backend → SQLite DB → FastAPI → React Frontend
                     ↓                                      ↑
               Shared Models ←→ Shared Calculations ←→ Mock API
```

## Troubleshooting

### Common Issues

**Backend not connecting**
- Check Python dependencies: `pip install -r backend/requirements.txt`
- Verify port 8000 is available
- Check console for startup errors

**Frontend API errors**
- System automatically falls back to mock mode
- Check browser console for health check status
- Verify VITE_API_URL in `.env` file

**Data sync issues**
- Verify PEACHAI_API_TOKEN is configured
- Check network connectivity to Peach AI
- Review sync logs in backend terminal

### Debug Mode

Set debug flags for detailed logging:
```bash
# Frontend
VITE_DEBUG_MODE=true

# Backend  
DEBUG=true
LOG_LEVEL=DEBUG
```

## Contributing

1. Follow DRY principles - use shared code modules
2. Update both systems when adding features
3. Test with both mock and real backend modes
4. Document API changes in this README

## License

MIT License - see LICENSE file for details.