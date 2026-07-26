# csv_utils.py

import csv
import os
import glob
import time
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from pathlib import Path

import redis
import json

# Configuration
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024  # 50MB in bytes

# Secure connection using environment variable for company data protection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Warning: Failed to connect to Redis: {e}")
    redis_client = None

def get_redis_key(disease_name: str) -> str:
    return f"csv_cache:{disease_name}"

def cleanup_old_csv_files(disease_name: str):
    """No longer needed with Redis TTL"""
    pass

def check_file_size(file_path: str) -> Tuple[bool, int]:
    """Check size of cached content in Redis"""
    if not redis_client:
        return False, 0
    size = redis_client.strlen(file_path) # file_path acts as key here
    return size > 0, size

def generate_pathway_csv(pathway_data: Dict[str, Any]) -> str:
    """Generate CSV content from complete pathway data"""
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # CSV Headers - All fields including new ones
    headers = [
        "Disease Name",
        "Stage Name", 
        "Stage Overview",
        "Stakeholders",
        "Pain Point Description",
        "Pain Point Sources",
        "SHS Coverage",
        "Existing Solutions",
        "Digitalization Solutions",
        "Automation Solutions", 
        "Sensing Solutions",
        "Clinical Innovation Solutions",
        "Process Innovation Solutions"
    ]
    writer.writerow(headers)
    
    disease_name = pathway_data['disease_name']
    
    # Write data rows
    for stage_name, stage_data in pathway_data['stages'].items():
        stage_overview = stage_data.get('overview', '')
        stakeholders = stage_data.get('stakeholders', '')
        
        # If no pain points, write stage info only
        if not stage_data['pain_points']:
            row = [
                disease_name,
                stage_data['name'],
                stage_overview,
                stakeholders,
                '', '', '', '', '', '', '', '', ''
            ]
            writer.writerow(row)
        else:
            # Write each pain point as a separate row
            for pain_point in stage_data['pain_points']:
                solutions = pain_point.get('solutions', {})
                
                row = [
                    disease_name,
                    stage_data['name'],
                    stage_overview,
                    stakeholders,
                    pain_point.get('description', ''),
                    pain_point.get('sources', ''),
                    pain_point.get('coverage', ''),
                    pain_point.get('existing_solutions', ''),
                    '; '.join(solutions.get('digitalization', [])),
                    '; '.join(solutions.get('automation', [])),
                    '; '.join(solutions.get('sensing', [])),
                    '; '.join(solutions.get('clinical_innovation', [])),
                    '; '.join(solutions.get('process_innovation', []))
                ]
                writer.writerow(row)
    
    return output.getvalue()

def create_csv_cache(disease_name: str, pathway_data: Dict[str, Any]) -> Tuple[bool, str, Optional[str]]:
    """Create CSV cache file for disease
    
    Returns:
        Tuple[bool, str, Optional[str]]: (success, message, file_path)
    """
    try:
        if not redis_client:
            return False, "Redis client not available", None
            
        # Generate CSV content
        csv_content = generate_pathway_csv(pathway_data)
        
        # Check content size
        content_size = len(csv_content.encode('utf-8'))
        if content_size > MAX_FILE_SIZE_BYTES:
            return False, f"CSV content too large ({content_size / 1024 / 1024:.1f}MB). Maximum allowed: {MAX_FILE_SIZE_MB}MB", None
        
        # Generate key
        redis_key = get_redis_key(disease_name)
        
        # Write to Redis with 24 hour TTL to ensure data lifecycle management
        cache_data = {
            "content": csv_content,
            "created_at": datetime.now().isoformat(),
            "size": content_size
        }
        redis_client.setex(redis_key, 86400, json.dumps(cache_data))
        
        print(f"Generated CSV cache in Redis: {redis_key} ({content_size / 1024:.1f}KB)")
        
        return True, f"CSV generated successfully", redis_key
        
    except Exception as e:
        return False, f"Error generating CSV: {str(e)}", None

def get_csv_cache_status(disease_name: str, disease_updated_at: datetime) -> Tuple[bool, Optional[str]]:
    """Check if CSV cache is valid for disease
    
    Returns:
        Tuple[bool, Optional[str]]: (cache_valid, file_path)
    """
    if not redis_client:
        return False, None
        
    redis_key = get_redis_key(disease_name)
    cached_data_str = redis_client.get(redis_key)
    
    if not cached_data_str:
        return False, None
    
    try:
        cached_data = json.loads(cached_data_str)
        cache_created_at = datetime.fromisoformat(cached_data["created_at"])
        
        # Cache is valid if it's newer than disease update
        cache_valid = cache_created_at > disease_updated_at
        return cache_valid, redis_key if cache_valid else None
    except Exception:
        return False, None

def get_csv_file_info(file_path: str) -> Dict[str, Any]:
    """Get information about CSV file"""
    if not redis_client:
        return {"exists": False}
        
    cached_data_str = redis_client.get(file_path) # file_path acts as key here
    if not cached_data_str:
        return {"exists": False}
        
    try:
        cached_data = json.loads(cached_data_str)
        created_at = datetime.fromisoformat(cached_data["created_at"])
        size_bytes = cached_data["size"]
        return {
            "exists": True,
            "size_bytes": size_bytes,
            "size_mb": size_bytes / 1024 / 1024,
            "created_at": created_at,
            "modified_at": created_at,
            "filename": file_path
        }
    except Exception:
        return {"exists": False}
