import csv
import os
import pandas as pd
from database import DatabaseOperations, get_db, SessionLocal
from pathlib import Path

def parse_csv_pathway(file_path):
    # CSV parser logic
    print(f"Parsing {file_path}")
    df = pd.read_csv(file_path, encoding='cp1252')
    
    disease_name = Path(file_path).name.split('(')[-1].replace(').csv', '')
    if disease_name.lower().endswith('.csv'):
        disease_name = disease_name[:-4]

    parsed_data = {
        'disease_name': disease_name,
        'sections': {}
    }
    
    current_stage = ""
    current_overview = ""
    current_stakeholders = ""
    
    row_count = 0
    # Process from row index 1 (skipping the subheader row "Stage,,,,"Digitalization...")
    for idx, row in df.iterrows():
        if idx == 0:
            continue
            
        stage_val = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ""
        overview_val = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else ""
        stakeholders_val = str(row.iloc[2]).strip() if pd.notna(row.iloc[2]) else ""
        
        if stage_val and stage_val.lower() != 'nan':
            current_stage = stage_val
        if overview_val and overview_val.lower() != 'nan':
            current_overview = overview_val
        if stakeholders_val and stakeholders_val.lower() != 'nan':
            current_stakeholders = stakeholders_val
            
        if not current_stage:
            continue
            
        stage_key = current_stage.lower()
        if stage_key not in parsed_data['sections']:
            parsed_data['sections'][stage_key] = {
                'name': current_stage,
                'overview': current_overview,
                'stakeholders': current_stakeholders,
                'data': [],
                'row_count': 0
            }
            
        pain_point_val = str(row.iloc[3]).strip() if pd.notna(row.iloc[3]) else ""
        if pain_point_val and pain_point_val.lower() != 'nan':
            row_count += 1
            row_data = {
                'row_number': row_count,
                'pain_point': pain_point_val,
                'solutions': {
                    'digitalization': str(row.iloc[4]).strip() if pd.notna(row.iloc[4]) else "",
                    'automation': str(row.iloc[5]).strip() if pd.notna(row.iloc[5]) else "",
                    'sensing': str(row.iloc[6]).strip() if pd.notna(row.iloc[6]) else "",
                    'clinical_innovation': str(row.iloc[7]).strip() if pd.notna(row.iloc[7]) else "",
                    'process_innovation': str(row.iloc[8]).strip() if pd.notna(row.iloc[8]) else "",
                },
                'coverage': str(row.iloc[9]).strip() if pd.notna(row.iloc[9]) else "",
                'existing_solutions': str(row.iloc[10]).strip() if len(row) > 10 and pd.notna(row.iloc[10]) else "",
                'sources': str(row.iloc[11]).strip() if len(row) > 11 and pd.notna(row.iloc[11]) else ""
            }
            parsed_data['sections'][stage_key]['data'].append(row_data)
            parsed_data['sections'][stage_key]['row_count'] += 1

    return parsed_data

def main():
    db = SessionLocal()
    db_ops = DatabaseOperations(db)
    data_dir = Path("data")
    
    for file in data_dir.glob("*.csv"):
        try:
            parsed_data = parse_csv_pathway(file)
            print(f"Parsed {parsed_data['disease_name']}: {len(parsed_data['sections'])} stages")
            disease = db_ops.create_or_update_disease(parsed_data['disease_name'].lower(), parsed_data)
            print(f"Successfully imported {parsed_data['disease_name']}")
        except Exception as e:
            print(f"Failed to import {file.name}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()
