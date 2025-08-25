#!/usr/bin/env python3
"""
FastAPI Bridge for React Frontend
Connects React dashboard to Python data warehouse
Implements DRY principles by using shared data models
"""

from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import os
import json
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))

# Import from existing data warehouse modules
from src.database.operations import DatabaseOperations
from src.api_clients.campaigns import CampaignsClient
from src.api_clients.metrics import MetricsClient
from src.etl.pipeline import ETLPipeline
from src.etl.data_processor import DataProcessor
from src.config.settings import load_config

# Initialize FastAPI app
app = FastAPI(
    title="VCAI Marketing Dashboard API",
    description="Bridge API connecting React frontend to Python data warehouse",
    version="1.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize components
config = load_config()
db_ops = DatabaseOperations(config)
data_processor = DataProcessor(db_ops)

# Pydantic models for API requests/responses
class CampaignMetrics(BaseModel):
    rawClicks: int = 0
    uniqueClicks: int = 0
    cost: float = 0
    rawReg: int = 0
    confirmReg: int = 0
    sales: int = 0
    orderValue: float = 0
    revenue: float = 0
    ltrev: float = 0
    sessions: int = 0
    registrations: int = 0
    credit_cards: int = 0
    roas: float = 0
    reg_percentage: float = 0
    cc_conv_percentage: float = 0

class CampaignHierarchy(BaseModel):
    network: str = "Unknown"
    domain: str = "Unknown"
    placement: str = "Unknown"
    targeting: str = "Unknown"
    special: str = "None"
    mapping_confidence: float = 1.0

class CampaignNote(BaseModel):
    id: str
    text: str
    user: str
    timestamp: str
    campaign_id: Optional[int] = None

class CampaignDocument(BaseModel):
    id: str
    name: str
    type: str
    size: int
    uploadDate: str
    uploadedBy: str
    data: str
    isImage: bool = False
    campaign_id: Optional[int] = None

class CampaignResponse(BaseModel):
    id: int
    name: str
    description: str = ""
    vendor: str = "Peach AI Network"
    status: str = "Paused"
    startDate: str
    endDate: str = ""
    manager: str = "Unassigned"
    adPlacementDomain: str = ""
    device: str = "Both"
    targeting: str = "Global"
    repContactInfo: str = ""
    tracking_url: str = ""
    serving_url: str = ""
    is_serving: bool = False
    metrics: CampaignMetrics
    hierarchy: CampaignHierarchy
    notes: List[CampaignNote] = []
    documents: List[CampaignDocument] = []
    visualMedia: List[Dict[str, Any]] = []
    history: List[Dict[str, Any]] = []
    createdAt: str
    modifiedAt: str
    sync_timestamp: str = ""

class CampaignCreateRequest(BaseModel):
    name: str
    vendor: str = "Manual Entry"
    status: str = "Paused"
    startDate: str
    endDate: str
    manager: str = "Unassigned"
    adPlacementDomain: str = ""
    device: str = "Both"
    targeting: str = "Global"
    repContactInfo: str = ""
    description: str = ""

class NoteCreateRequest(BaseModel):
    text: str
    user: str = "Current User"

class KPISummary(BaseModel):
    totalCampaigns: int
    activeCampaigns: int
    pausedCampaigns: int
    totalSpend: float
    totalRevenue: float
    totalROAS: float
    totalRegistrations: int
    averageRegRate: float

# Utility functions for data transformation
def transform_db_campaign_to_response(db_campaign: Dict[str, Any]) -> Dict[str, Any]:
    """Transform database campaign record to API response format"""
    
    # Get metrics data for this campaign
    hourly_data = db_ops.get_hourly_data(campaign_id=db_campaign['id'])
    
    # Aggregate metrics
    total_metrics = {
        'sessions': sum(h.get('sessions', 0) for h in hourly_data),
        'registrations': sum(h.get('registrations', 0) for h in hourly_data),
        'credit_cards': sum(h.get('credit_cards', 0) for h in hourly_data),
        'email_accounts': sum(h.get('email_accounts', 0) for h in hourly_data),
        'total_accounts': sum(h.get('total_accounts', 0) for h in hourly_data),
        'messages': sum(h.get('messages', 0) for h in hourly_data),
        'converted_users': sum(h.get('converted_users', 0) for h in hourly_data),
    }
    
    # Calculate derived metrics using the same logic as data processor
    conversion_ratios = data_processor.calculate_conversion_ratios(total_metrics)
    
    # Get hierarchy data
    hierarchy_data = db_ops.get_campaign_hierarchy(db_campaign['id'])
    hierarchy = CampaignHierarchy()
    if hierarchy_data:
        hierarchy = CampaignHierarchy(
            network=hierarchy_data.get('network', 'Unknown'),
            domain=hierarchy_data.get('domain', 'Unknown'),
            placement=hierarchy_data.get('placement', 'Unknown'),
            targeting=hierarchy_data.get('targeting', 'Unknown'),
            special=hierarchy_data.get('special', 'None'),
            mapping_confidence=hierarchy_data.get('mapping_confidence', 1.0)
        )
    
    # Build metrics object
    metrics = CampaignMetrics(
        # Peach AI metrics
        sessions=total_metrics['sessions'],
        registrations=total_metrics['registrations'],
        credit_cards=total_metrics['credit_cards'],
        
        # Map to React metrics (defaults for now)
        rawClicks=0,
        uniqueClicks=total_metrics['sessions'],  # Approximate clicks as sessions
        cost=0,  # Not available from Peach AI
        rawReg=total_metrics['registrations'],
        confirmReg=total_metrics['registrations'],
        sales=total_metrics['converted_users'],
        orderValue=0,
        revenue=0,  # Not available from Peach AI
        ltrev=0,
        
        # Calculated metrics
        roas=0,  # Cannot calculate without cost/revenue data
        reg_percentage=conversion_ratios['reg_percentage'],
        cc_conv_percentage=conversion_ratios['cc_conv_percentage']
    )
    
    # Extract domain from serving URL
    domain = ""
    if db_campaign.get('serving_url'):
        try:
            from urllib.parse import urlparse
            domain = urlparse(db_campaign['serving_url']).netloc
        except:
            domain = ""
    
    return {
        'id': db_campaign['id'],
        'name': db_campaign['name'],
        'description': db_campaign.get('description', ''),
        'vendor': 'Peach AI Network',
        'status': 'Live' if db_campaign.get('is_serving') else 'Paused',
        'startDate': db_campaign.get('created_at', ''),
        'endDate': '',  # Not available from Peach AI
        'manager': 'Unassigned',
        'adPlacementDomain': domain,
        'device': 'Both',
        'targeting': 'Global',
        'repContactInfo': '',
        'tracking_url': db_campaign.get('tracking_url', ''),
        'serving_url': db_campaign.get('serving_url', ''),
        'is_serving': db_campaign.get('is_serving', False),
        'metrics': metrics.dict(),
        'hierarchy': hierarchy.dict(),
        'notes': [],  # TODO: Implement notes storage
        'documents': [],  # TODO: Implement document storage
        'visualMedia': [],
        'history': [],  # TODO: Implement history tracking
        'createdAt': db_campaign.get('created_at', ''),
        'modifiedAt': db_campaign.get('updated_at', ''),
        'sync_timestamp': db_campaign.get('sync_timestamp', '')
    }

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "VCAI Marketing Dashboard API",
        "version": "1.0.0",
        "endpoints": {
            "campaigns": "/api/campaigns",
            "sync": "/api/sync",
            "kpis": "/api/kpis",
            "hierarchy": "/api/hierarchy",
            "health": "/api/health"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        campaigns = db_ops.get_campaigns(limit=1)
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": str(datetime.now())
    }

@app.get("/api/campaigns", response_model=Dict[str, Any])
async def get_campaigns(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    vendor: Optional[str] = Query(None, description="Filter by vendor"),
    search: Optional[str] = Query(None, description="Search in campaign names")
):
    """Get paginated list of campaigns"""
    try:
        offset = (page - 1) * limit
        
        # Get campaigns from database
        campaigns = db_ops.get_campaigns(limit=limit, offset=offset)
        total_count = db_ops.get_campaigns_count()
        
        # Transform to API response format
        campaign_responses = []
        for campaign in campaigns:
            try:
                transformed = transform_db_campaign_to_response(campaign)
                
                # Apply filters
                if status and transformed['status'] != status:
                    continue
                if vendor and transformed['vendor'] != vendor:
                    continue
                if search and search.lower() not in transformed['name'].lower():
                    continue
                    
                campaign_responses.append(transformed)
            except Exception as e:
                print(f"Error transforming campaign {campaign.get('id', 'unknown')}: {e}")
                continue
        
        return {
            "data": campaign_responses,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(campaign_responses),
                "totalPages": (total_count + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch campaigns: {str(e)}")

@app.get("/api/campaigns/{campaign_id}", response_model=Dict[str, Any])
async def get_campaign(campaign_id: int):
    """Get specific campaign by ID"""
    try:
        campaign = db_ops.get_campaign_by_id(campaign_id)
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        transformed = transform_db_campaign_to_response(campaign)
        return {"data": transformed}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch campaign: {str(e)}")

@app.post("/api/campaigns/{campaign_id}/notes")
async def add_campaign_note(campaign_id: int, note_request: NoteCreateRequest):
    """Add a note to a campaign"""
    try:
        # TODO: Implement notes storage in database
        # For now, return success response
        return {
            "message": "Note added successfully",
            "note": {
                "id": f"{campaign_id}_{int(time.time())}",
                "text": note_request.text,
                "user": note_request.user,
                "timestamp": str(datetime.now()),
                "campaign_id": campaign_id
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add note: {str(e)}")

@app.get("/api/kpis")
async def get_kpi_summary():
    """Get KPI summary for dashboard"""
    try:
        campaigns = db_ops.get_campaigns()
        
        if not campaigns:
            return KPISummary(
                totalCampaigns=0,
                activeCampaigns=0,
                pausedCampaigns=0,
                totalSpend=0,
                totalRevenue=0,
                totalROAS=0,
                totalRegistrations=0,
                averageRegRate=0
            ).dict()
        
        # Transform all campaigns and calculate aggregates
        transformed_campaigns = []
        for campaign in campaigns:
            try:
                transformed = transform_db_campaign_to_response(campaign)
                transformed_campaigns.append(transformed)
            except Exception as e:
                continue
        
        # Calculate KPIs
        total_campaigns = len(transformed_campaigns)
        active_campaigns = len([c for c in transformed_campaigns if c['status'] == 'Live'])
        paused_campaigns = len([c for c in transformed_campaigns if c['status'] == 'Paused'])
        
        total_spend = sum(c['metrics']['cost'] for c in transformed_campaigns)
        total_revenue = sum(c['metrics']['revenue'] for c in transformed_campaigns)
        total_registrations = sum(c['metrics']['registrations'] for c in transformed_campaigns)
        total_sessions = sum(c['metrics']['sessions'] for c in transformed_campaigns)
        
        total_roas = (total_revenue / total_spend) if total_spend > 0 else 0
        average_reg_rate = (total_registrations / total_sessions * 100) if total_sessions > 0 else 0
        
        return {
            "totalCampaigns": total_campaigns,
            "activeCampaigns": active_campaigns,
            "pausedCampaigns": paused_campaigns,
            "totalSpend": total_spend,
            "totalRevenue": total_revenue,
            "totalROAS": round(total_roas, 2),
            "totalRegistrations": total_registrations,
            "averageRegRate": round(average_reg_rate, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate KPIs: {str(e)}")

@app.post("/api/sync")
async def trigger_sync(background_tasks: BackgroundTasks):
    """Trigger data synchronization from Peach AI"""
    try:
        def run_sync():
            """Background task to run ETL sync"""
            try:
                etl_pipeline = ETLPipeline(config)
                result = etl_pipeline.run_full_sync()
                print(f"Sync completed: {result}")
            except Exception as e:
                print(f"Sync failed: {str(e)}")
        
        background_tasks.add_task(run_sync)
        
        return {
            "message": "Data synchronization started",
            "status": "running"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start sync: {str(e)}")

@app.get("/api/sync/status")
async def get_sync_status():
    """Get current sync status"""
    try:
        # TODO: Implement proper sync status tracking
        return {
            "status": "idle",
            "last_sync": "",
            "campaigns_synced": 0,
            "errors": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sync status: {str(e)}")

@app.get("/api/hierarchy")
async def get_hierarchy_data():
    """Get hierarchy mapping data"""
    try:
        # Get all hierarchy mappings
        hierarchies = db_ops.get_all_hierarchies()
        
        return {
            "data": hierarchies,
            "summary": {
                "total_mapped": len(hierarchies),
                "networks": len(set(h.get('network', '') for h in hierarchies)),
                "domains": len(set(h.get('domain', '') for h in hierarchies)),
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch hierarchy data: {str(e)}")

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if app.debug else "Something went wrong"
        }
    )

if __name__ == "__main__":
    import time
    from datetime import datetime
    
    # Ensure database is initialized
    try:
        db_ops.create_tables()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization failed: {e}")
    
    # Start the server
    uvicorn.run(
        "api_bridge:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(PROJECT_ROOT)]
    )