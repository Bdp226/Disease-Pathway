import re

with open('main.py', encoding='utf-8') as f:
    content = f.read()

# First, remove the duplicate download_csv endpoint I added at the bottom
content = re.sub(r"@app\.get\('/diseases/\{disease_name\}/download-csv'\).*?raise HTTPException\(status_code=500, detail=str\(e\)\)", '', content, flags=re.DOTALL)

# Now replace the original download_pathway_csv
old_endpoint_regex = r"@app\.get\('/diseases/\{disease_name\}/download-csv'\).*?def download_pathway_csv.*?except Exception as e:.*?raise HTTPException\(status_code=500, detail=f'Error fetching pathway data: \{str\(e\)\}'\)"
old_endpoint_regex = old_endpoint_regex.replace("'", '"')

new_endpoint = '''@app.get("/diseases/{disease_name}/download-csv")
async def download_pathway_csv(
    disease_name: str,
    db: Session = Depends(get_db)
):
    """Download complete pathway data as CSV - Public endpoint (Bypassing Redis)"""
    try:
        db_ops = DatabaseOperations(db)
        disease = db_ops.get_disease_by_name(disease_name.lower())
        
        if not disease:
            raise HTTPException(
                status_code=404,
                detail=f"Disease '{disease_name}' not found"
            )

        pathway_data = db_ops.get_disease_pathway_data_for_csv(disease_name.lower())
        if not pathway_data:
            raise HTTPException(
                status_code=404,
                detail=f"No pathway data found for disease '{disease_name}'"
            )

        from csv_utils import generate_pathway_csv
        csv_content = generate_pathway_csv(pathway_data)
        
        import io
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            io.StringIO(csv_content),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={disease_name}_pathway.csv"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating CSV: {str(e)}")'''

content = re.sub(old_endpoint_regex, new_endpoint, content, flags=re.DOTALL)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
