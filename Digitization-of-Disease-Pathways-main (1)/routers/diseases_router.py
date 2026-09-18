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
from cache_manager import cache

router = APIRouter(
    prefix="/diseases",
    tags=["Diseases"]
)

@router.get("", response_model=List[DiseaseListResponse])
async def get_all_diseases(db: Session = Depends(get_db)):
    """Get list of all diseases - Public endpoint"""
    try:
        # 1. Check Distributed Cache
        cache_key = "api:diseases:all"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
            
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
        
        # 2. Store in Cache (1 hour TTL)
        cache.set(cache_key, [r.dict() for r in result], expire_seconds=3600)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching diseases: {str(e)}")

@router.get("/{disease_name}", response_model=DiseaseResponse)
async def get_disease_details(disease_name: str, db: Session = Depends(get_db)):
    """Get detailed disease information - Public endpoint"""
    try:
        cache_key = f"api:disease:{disease_name.lower()}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        db_ops = DatabaseOperations(db)
        disease = db_ops.get_disease_by_name(disease_name.lower())
        
        if not disease:
            raise HTTPException(status_code=404, detail=f"Disease '{disease_name}' not found")

        disease_resp = DiseaseResponse.from_orm(disease)
        cache.set(cache_key, disease_resp.dict(), expire_seconds=3600)
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
        cache_key = f"api:pathway:{disease_name.lower()}:full_{full}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
            
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
                    urgency=pain_point_data.get('urgency'),
                    tags=pain_point_data.get('tags'),
                    urgency_breakdown=pain_point_data.get('urgency_breakdown'),
                    tags_breakdown=pain_point_data.get('tags_breakdown'),
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

        response = PathwayVisualizationResponse(
            disease_name=disease_name,
            stages=stages,
            total_stages=len(stages),
            total_pain_points=total_pain_points,
            total_solutions=total_solutions
        )
        
        # Cache the pathway response for faster subsequent loads
        cache.set(cache_key, response.dict(), expire_seconds=3600)
        return response

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
@router.get("/{disease_name}/similar")
async def get_similar_diseases(disease_name: str, top_k: int = 3, db: Session = Depends(get_db)):
    """Get similar diseases based on pain point textual overlap (BM25)"""
    try:
        from ml_utils import similarity_engine
        
        # If engine not initialized with data, build the corpus
        if not similarity_engine.disease_names:
            db_ops = DatabaseOperations(db)
            all_diseases = db_ops.get_all_diseases()
            
            corpus_data = []
            for d in all_diseases:
                # Get all text for this disease
                text_chunks = []
                for stage in d.stages:
                    for pp in stage.pain_points:
                        text_chunks.append(pp.description or "")
                
                corpus_data.append({
                    "name": d.name.lower(),
                    "text": " ".join(text_chunks)
                })
            
            similarity_engine.fit(corpus_data)
            
        # Get query text
        db_ops = DatabaseOperations(db)
        query_disease = db_ops.get_disease_by_name(disease_name.lower())
        if not query_disease:
            raise HTTPException(status_code=404, detail=f"Disease '{disease_name}' not found")
            
        # Construct query text
        query_text_chunks = []
        for stage in query_disease.stages:
            for pp in stage.pain_points:
                query_text_chunks.append(pp.description or "")
        query_text = " ".join(query_text_chunks)
        
        # Get similarities
        similar = similarity_engine.get_similar(query_text, exclude_name=disease_name.lower(), top_k=top_k)
        
        return {"similar_diseases": similar}
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error calculating similarity: {str(e)}")
