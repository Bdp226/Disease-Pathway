from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from datetime import datetime
import io
from fastapi.responses import StreamingResponse

from database import get_db, DatabaseOperations
from models import (
    DiseaseResponse,
    DiseaseListResponse,
    PathwayVisualizationResponse,
    PathwayStage,
    PathwayPainPoint,
    SolutionsByType
)
from csv_utils import generate_pathway_csv

router = APIRouter(
    prefix="/diseases",
    tags=["Diseases"]
)

@router.get("", response_model=List[DiseaseListResponse])
async def get_all_diseases(db: Session = Depends(get_db)):
    """Get list of all diseases - Public endpoint"""
    try:
        db_ops = DatabaseOperations(db)
        diseases = db_ops.get_all_diseases()
        result = []
        
        for disease in diseases:
            total_pain_points = sum(stage.pain_points_count for stage in disease.stages)
            result.append(DiseaseListResponse(
                id=disease.id,
                name=disease.name,
                created_at=disease.created_at,
                updated_at=disease.updated_at,
                stage_count=len(disease.stages),
                total_pain_points=total_pain_points
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching diseases: {str(e)}")

@router.get("/{disease_name}", response_model=DiseaseResponse)
async def get_disease_details(disease_name: str, db: Session = Depends(get_db)):
    """Get detailed disease information - Public endpoint"""
    try:
        db_ops = DatabaseOperations(db)
        disease = db_ops.get_disease_by_name(disease_name.lower())
        
        if not disease:
            raise HTTPException(status_code=404, detail=f"Disease '{disease_name}' not found")

        return disease
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching disease details: {str(e)}")

@router.get("/{disease_name}/pathway", response_model=PathwayVisualizationResponse)
async def get_disease_pathway(
    disease_name: str, 
    full: bool = False,
    db: Session = Depends(get_db)
):
    """Get disease pathway data formatted for visualization - Public endpoint"""
    try:
        db_ops = DatabaseOperations(db)
        
        if full:
            pathway_data = db_ops.get_complete_disease_pathway_data(disease_name.lower())
        else:
            pathway_data = db_ops.get_disease_pathway_data(disease_name.lower())
        
        if not pathway_data:
            raise HTTPException(status_code=404, detail=f"Disease '{disease_name}' not found")

        stages = {}
        total_pain_points = 0
        total_solutions = 0

        for stage_name, stage_data in pathway_data['stages'].items():
            pain_points = []
            for pain_point_data in stage_data['pain_points']:
                solutions_count = sum(len(solutions) for solutions in pain_point_data['solutions'].values())
                total_solutions += solutions_count

                solutions = SolutionsByType(
                    digitalization=pain_point_data['solutions'].get('digitalization', []),
                    automation=pain_point_data['solutions'].get('automation', []),
                    sensing=pain_point_data['solutions'].get('sensing', []),
                    clinical_innovation=pain_point_data['solutions'].get('clinical_innovation', []),
                    process_innovation=pain_point_data['solutions'].get('process_innovation', [])
                )

                pain_points.append(PathwayPainPoint(
                    description=pain_point_data['description'],
                    sources=pain_point_data.get('sources'),
                    coverage=pain_point_data.get('coverage'),
                    existing_solutions=pain_point_data.get('existing_solutions'),
                    solutions=solutions
                ))

            stages[stage_name] = PathwayStage(
                id=stage_data['id'],
                name=stage_data['name'],
                stakeholders=stage_data.get('stakeholders'),
                overview=stage_data.get('overview'),
                pain_points=pain_points
            )
            total_pain_points += len(pain_points)

        return PathwayVisualizationResponse(
            disease_name=disease_name,
            stages=stages,
            total_stages=len(stages),
            total_pain_points=total_pain_points,
            total_solutions=total_solutions
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pathway data: {str(e)}")

@router.get("/{disease_name}/download-csv")
async def download_pathway_csv(disease_name: str, db: Session = Depends(get_db)):
    """Download complete pathway data as CSV - Public endpoint"""
    try:
        db_ops = DatabaseOperations(db)
        disease = db_ops.get_disease_by_name(disease_name.lower())
        
        if not disease:
            raise HTTPException(status_code=404, detail=f"Disease '{disease_name}' not found")

        pathway_data = db_ops.get_disease_pathway_data_for_csv(disease_name.lower())
        if not pathway_data:
            raise HTTPException(status_code=404, detail=f"No pathway data found")

        csv_content = generate_pathway_csv(pathway_data)
        
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={disease_name}_pathway.csv"}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating CSV: {str(e)}")
