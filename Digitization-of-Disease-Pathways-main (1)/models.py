# models.py

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class PainPointCreate(BaseModel):
    description: str
    sources: Optional[str] = None
    coverage: Optional[str] = None
    existing_solutions: Optional[str] = None
    urgency: Optional[str] = "low"
    tags: Optional[str] = ""

class SolutionResponse(BaseModel):
    id: int
    solution_type: str
    description: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PainPointResponse(BaseModel):
    id: int
    description: str
    row_number: int
    sources: Optional[str] = None
    coverage: Optional[str] = None              # NEW
    existing_solutions: Optional[str] = None    # NEW
    status: str = "approved"
    urgency: Optional[str] = "low"
    tags: Optional[str] = ""
    created_at: datetime
    solutions: List[SolutionResponse] = []
    
    class Config:
        from_attributes = True

class StageResponse(BaseModel):
    id: int
    name: str
    stakeholders: Optional[str] = None
    overview: Optional[str] = None              # NEW
    pain_points_count: int
    created_at: datetime
    pain_points: List[PainPointResponse] = []
    
    class Config:
        from_attributes = True

class DiseaseResponse(BaseModel):
    id: int
    name: str
    group: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    stages: List[StageResponse] = []
    
    class Config:
        from_attributes = True

class DiseaseListResponse(BaseModel):
    id: int
    name: str
    group: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    stage_count: int
    total_pain_points: int
    
    class Config:
        from_attributes = True

class ExcelUploadResponse(BaseModel):
    message: str
    disease_name: str
    stages_created: List[str]
    total_stages: int
    total_pain_points: int
    total_solutions: int
    summary_stats: Dict[str, Any]

class SolutionsByType(BaseModel):
    digitalization: List[str]
    automation: List[str]
    sensing: List[str]
    clinical_innovation: List[str]
    process_innovation: List[str]

class PathwayPainPoint(BaseModel):
    description: str
    sources: Optional[str] = None
    coverage: Optional[str] = None              # NEW
    existing_solutions: Optional[str] = None    # NEW
    status: str = "approved"
    urgency: Optional[str] = "low"
    tags: Optional[str] = ""
    urgency_breakdown: Optional[dict] = None
    tags_breakdown: Optional[dict] = None
    solutions: SolutionsByType

class PathwayStage(BaseModel):
    id: int
    name: str
    stakeholders: Optional[str] = None
    overview: Optional[str] = None              # NEW
    pain_points: List[PathwayPainPoint]

class PathwayVisualizationResponse(BaseModel):
    disease_name: str
    stages: Dict[str, PathwayStage]
    total_stages: int
    total_pain_points: int
    total_solutions: int
