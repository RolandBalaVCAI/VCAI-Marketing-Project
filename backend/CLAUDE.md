# Peach AI Data Warehouse POC

## Project Overview
Data warehouse system that pulls from 3 Peach AI endpoints, maps campaigns to a 5-tier hierarchy, and exports to Google Sheets.

## Production Configuration
The system uses `config/settings.yaml` for all configuration:
- **API settings** - Production Peach AI endpoints and authentication
- **Database config** - SQLite path and backup settings  
- **Google Sheets** - Export credentials and default titles
- **ETL pipeline** - Batch sizes, workers, quality thresholds
- **Environment overrides** - Use PEACHAI_API_TOKEN env var for security

## Quick Commands
### Production Workflow:
- `pip install -r requirements.txt` - Install dependencies
- Edit `config/settings.yaml` - Set your bearer token
- `python main.py sync` - Sync 200 campaigns from Peach AI
- `python main.py export --format csv` - Export to CSV for Google Sheets
- `python main.py status --detailed` - Check data quality

### Alternative Commands:
- `make test` or `npm test` - Run all tests  
- `make setup` or `npm run setup` - Complete project setup

## Development Status  
- ✅ Production-ready configuration system
- ✅ Database schema with 5-tier hierarchy mapping
- ✅ API clients with retry logic and authentication  
- ✅ Complete ETL pipeline with 200+ campaign support
- ✅ CSV/Google Sheets export functionality
- ✅ Full CLI interface with settings integration

## Architecture
- Production Peach AI API integration
- SQLite database with comprehensive schema  
- Robust API clients with authentication & retries
- ETL pipeline with configurable YAML hierarchy rules
- Google Sheets and CSV export functionality
- CLI interface with settings.yaml configuration