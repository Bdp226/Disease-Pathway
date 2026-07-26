# database.py

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from typing import Optional
import os
import urllib,pyodbc
# Database setup
SQLITE_DATABASE_URL = "sqlite:///./disease_pathway.db"
server ='a0057-ittdatabase2024-dev.database.windows.net'  
database = 'a0057-isedasqldb01-dev'               
username = 'isedasqldbuser'                   
password = 'N6eWkET@WiUYA>[/>Nh!14BiKe(f(k28'                    
driver = 'ODBC Driver 17 for SQL Server'
password_encoded = urllib.parse.quote_plus(password)
connection_string = (
        f"mssql+pyodbc://{username}:{password_encoded}@{server}/"
        f"{database}?driver={urllib.parse.quote_plus(driver)}"
        f"&Encrypt=yes&TrustServerCertificate=no&Connection Timeout=30"
    )
engine = create_engine(SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Disease(Base):
    __tablename__ = "diseases"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    group = Column(String(100), nullable=True) # NEW: Disease Group
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    
    # Relationships
    stages = relationship("Stage", back_populates="disease", cascade="all, delete-orphan")

class Stage(Base):
    __tablename__ = "stages"
    
    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"))
    name = Column(String(100), index=True)
    stakeholders = Column(Text)
    overview = Column(Text, nullable=True)  # NEW: Stage overview
    pain_points_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now())
    
    # Relationships
    disease = relationship("Disease", back_populates="stages")
    pain_points = relationship("PainPoint", back_populates="stage", cascade="all, delete-orphan")

class PainPoint(Base):
    __tablename__ = "pain_points"
    
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("stages.id"))
    description = Column(Text)
    row_number = Column(Integer)
    sources = Column(Text)
    coverage = Column(Text, nullable=True)              
    existing_solutions = Column(Text, nullable=True)    
    status = Column(String(20), default="approved")     

    created_at = Column(DateTime, default=datetime.now())
    
    # Relationships
    stage = relationship("Stage", back_populates="pain_points")
    solutions = relationship("Solution", back_populates="pain_point", cascade="all, delete-orphan")

class Solution(Base):
    __tablename__ = "solutions"
    
    id = Column(Integer, primary_key=True, index=True)
    pain_point_id = Column(Integer, ForeignKey("pain_points.id"))
    solution_type = Column(String(50))
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.now())
    
    # Relationships
    pain_point = relationship("PainPoint", back_populates="solutions")

class ChatbotFeedback(Base):
    __tablename__ = "chatbot_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    message_index = Column(Integer, index=True)
    user_query = Column(Text, nullable=True)
    bot_response = Column(Text, nullable=True)
    feedback_value = Column(Integer)  # 1 for upvote, -1 for downvote
    created_at = Column(DateTime, default=datetime.now())

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database operations
class DatabaseOperations:
    def __init__(self, db):
        self.db = db

    def create_or_update_disease(self, disease_name: str, parsed_data: dict, disease_group: str = None):
        """Create or update disease with incremental data updates"""
        
        # Get or create disease
        disease = self.db.query(Disease).filter(Disease.name == disease_name).first()
        if not disease:
            disease = Disease(name=disease_name, group=disease_group)
            self.db.add(disease)
            self.db.commit()
            self.db.refresh(disease)
        else:
            if disease_group:
                disease.group = disease_group
            disease.updated_at = datetime.now()
            self.db.commit()

        # Get existing stages for comparison
        existing_stages = {stage.name: stage for stage in disease.stages}
        new_stage_names = set(parsed_data['sections'].keys())
        
        # Remove stages that no longer exist
        for stage_name in list(existing_stages.keys()):
            if stage_name not in new_stage_names:
                self.db.delete(existing_stages[stage_name])
        
        # Process each stage
        for stage_name, stage_info in parsed_data['sections'].items():
            stage = existing_stages.get(stage_name)
            
            # Get stage overview and stakeholders
            overview = stage_info.get('overview', '')
            stakeholders = stage_info.get('stakeholders', '')
            
            if not stage:
                # Create new stage
                stage = Stage(
                    disease_id=disease.id,
                    name=stage_name,
                    stakeholders=stakeholders,
                    overview=overview,
                    pain_points_count=stage_info['row_count']
                )
                self.db.add(stage)
            else:
                # Update existing stage
                stage.stakeholders = stakeholders
                stage.overview = overview
                stage.pain_points_count = stage_info['row_count']
            
            self.db.commit()
            self.db.refresh(stage)
            
            # Update pain points incrementally
            self._update_pain_points(stage, stage_info['data'])
        
        self.db.commit()
        return disease

    def _update_pain_points(self, stage, pain_points_data):
        """Update pain points incrementally"""
        
        # Get existing pain points by row number
        existing_pain_points = {pp.row_number: pp for pp in stage.pain_points}
        new_row_numbers = {row['row_number'] for row in pain_points_data if row.get('pain_point')}
        
        # Remove pain points that no longer exist
        for row_num in list(existing_pain_points.keys()):
            if row_num not in new_row_numbers:
                self.db.delete(existing_pain_points[row_num])
        
        # Process each pain point
        for row_data in pain_points_data:
            if not row_data.get('pain_point'):
                continue
                
            row_number = row_data['row_number']
            pain_point = existing_pain_points.get(row_number)
            
            if not pain_point:
                # Create new pain point
                pain_point = PainPoint(
                    stage_id=stage.id,
                    description=row_data['pain_point'],
                    row_number=row_number,
                    sources=row_data.get('sources', ''),
                    coverage=row_data.get('coverage', ''),
                    existing_solutions=row_data.get('existing_solutions', '')
                )
                self.db.add(pain_point)
            else:
                # Update existing pain point
                pain_point.description = row_data['pain_point']
                pain_point.sources = row_data.get('sources', '')
                pain_point.coverage = row_data.get('coverage', '')
                pain_point.existing_solutions = row_data.get('existing_solutions', '')
            
            self.db.commit()
            self.db.refresh(pain_point)
            
            # Update solutions
            self._update_solutions(pain_point, row_data['solutions'])

    def _update_solutions(self, pain_point, solutions_data):
        """Update solutions incrementally"""
        
        # Get existing solutions by type
        existing_solutions = {sol.solution_type: sol for sol in pain_point.solutions}
        
        # Process each solution type
        for solution_type, solution_text in solutions_data.items():
            solution = existing_solutions.get(solution_type)
            
            if solution_text:
                if not solution:
                    # Create new solution
                    solution = Solution(
                        pain_point_id=pain_point.id,
                        solution_type=solution_type,
                        description=solution_text
                    )
                    self.db.add(solution)
                else:
                    # Update existing solution
                    solution.description = solution_text
            else:
                # Remove solution if text is empty
                if solution:
                    self.db.delete(solution)

    def get_disease_by_name(self, disease_name: str):
        """Get disease with all stages and data"""
        return self.db.query(Disease).filter(Disease.name == disease_name).first()

    def get_all_diseases(self):
        """Get all diseases"""
        return self.db.query(Disease).all()

    def delete_disease(self, disease_name: str):
        """Delete a disease and all its data"""
        disease = self.db.query(Disease).filter(Disease.name == disease_name).first()
        if disease:
            self.db.delete(disease)
            self.db.commit()
            return True
        return False

    def get_complete_disease_pathway_data(self, disease_name: str):
        """Get formatted pathway data for visualization"""
        disease = self.get_disease_by_name(disease_name)
        if not disease:
            return None

        pathway_data = {
            'disease_name': disease_name,
            'stages': {}
        }

        for stage in disease.stages:
            stage_data = {
                'id': stage.id,
                'name': stage.name,
                'stakeholders': stage.stakeholders,
                'overview': stage.overview,  # NEW
                'pain_points': []
            }

            for pain_point in stage.pain_points:
                if pain_point.status != "approved":
                    continue
                pain_point_data = {
                    'description': pain_point.description,
                    'sources': pain_point.sources,
                    'coverage': pain_point.coverage,              # NEW
                    'existing_solutions': pain_point.existing_solutions,  # NEW
                    'solutions': {
                        'digitalization': [],
                        'automation': [],
                        'sensing': [],
                        'clinical_innovation': [],
                        'process_innovation': []
                    }
                }

                # Group solutions by type
                for solution in pain_point.solutions:
                    if solution.solution_type in pain_point_data['solutions']:
                        pain_point_data['solutions'][solution.solution_type].append(solution.description)

                stage_data['pain_points'].append(pain_point_data)

            pathway_data['stages'][stage.name] = stage_data

        return pathway_data
    def get_disease_pathway_data(self, disease_name: str):
        """Get formatted pathway data for visualization"""
        disease = self.get_disease_by_name(disease_name)
        if not disease:
            return None

        pathway_data = {
            'disease_name': disease_name,
            'stages': {}
        }

        for stage in disease.stages:
            stage_data = {
                'id': stage.id,
                'name': stage.name,
                'stakeholders': stage.stakeholders,
                'overview': stage.overview,  # NEW
                'pain_points': []
            }
            painpoints=stage.pain_points[:6]
            for pain_point in  painpoints:
                if pain_point.status != "approved":
                    continue
                pain_point_data = {
                    'description': pain_point.description,
                    'sources': pain_point.sources,
                    'coverage': pain_point.coverage,              # NEW
                    'existing_solutions': pain_point.existing_solutions,  # NEW
                    'solutions': {
                        'digitalization': [],
                        'automation': [],
                        'sensing': [],
                        'clinical_innovation': [],
                        'process_innovation': []
                    }
                }

                # Group solutions by type
                for solution in pain_point.solutions:
                    if solution.solution_type in pain_point_data['solutions']:
                        pain_point_data['solutions'][solution.solution_type].append(solution.description)

                stage_data['pain_points'].append(pain_point_data)

            pathway_data['stages'][stage.name] = stage_data

        return pathway_data
    # database.py (additions to existing DatabaseOperations class)

    def get_disease_pathway_data_for_csv(self, disease_name: str):
        """Get complete pathway data for CSV generation (no limitations)"""
        return self.get_complete_disease_pathway_data(disease_name)

    def get_disease_updated_at(self, disease_name: str) -> Optional[datetime]:
        """Get last update timestamp for disease"""
        disease = self.get_disease_by_name(disease_name)
        return disease.updated_at if disease else None

    def add_pain_point(self, disease_name: str, stage_id: int, description: str, sources: str = "", coverage: str = "", existing_solutions: str = "", status: str = "pending"):
        """Add a single new verified pain point to a specific stage."""
        stage = self.db.query(Stage).filter(Stage.id == stage_id, Stage.disease.has(name=disease_name.lower())).first()
        if not stage:
            return None
            
        # Determine the next row number
        current_max = max([pp.row_number for pp in stage.pain_points], default=0)
        
        new_pp = PainPoint(
            stage_id=stage.id,
            description=description,
            row_number=current_max + 1,
            sources=sources,
            coverage=coverage,
            existing_solutions=existing_solutions,
            status=status
        )
        self.db.add(new_pp)
        
        # Also update the disease timestamp
        disease = self.get_disease_by_name(disease_name)
        if disease:
            disease.updated_at = datetime.now()
            
        self.db.commit()
        self.db.refresh(new_pp)
        return new_pp
