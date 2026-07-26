import os
from neo4j import GraphDatabase
from database import DatabaseOperations

class KnowledgeGraphManager:
    def __init__(self, uri="bolt://neo4j:7687", user="neo4j", password="password"):
        # Default to neo4j:7687 for docker networking, or localhost if running locally
        neo4j_uri = os.environ.get("NEO4J_URI", uri)
        neo4j_user = os.environ.get("NEO4J_USER", user)
        neo4j_password = os.environ.get("NEO4J_PASSWORD", password)
        try:
            self.driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        except Exception as e:
            print(f"Failed to connect to Neo4j: {e}")
            self.driver = None

    def close(self):
        if self.driver:
            self.driver.close()

    def _create_disease_graph_tx(self, tx, pathway_data):
        disease_name = pathway_data['disease_name']
        
        # Merge Disease Node
        tx.run(
            "MERGE (d:Disease {name: $disease_name})",
            disease_name=disease_name
        )

        for stage_name, stage_data in pathway_data.get('stages', {}).items():
            # Merge Stage Node
            tx.run(
                """
                MERGE (s:Stage {name: $stage_name})
                MERGE (d:Disease {name: $disease_name})
                MERGE (d)-[:HAS_STAGE]->(s)
                SET s.stakeholders = $stakeholders, s.overview = $overview
                """,
                stage_name=stage_name,
                disease_name=disease_name,
                stakeholders=stage_data.get('stakeholders', ''),
                overview=stage_data.get('overview', '')
            )

            for pp in stage_data.get('pain_points', []):
                description = pp.get('description', '')
                if not description:
                    continue
                
                # Merge PainPoint Node
                tx.run(
                    """
                    MERGE (p:PainPoint {description: $description})
                    MERGE (s:Stage {name: $stage_name})
                    MERGE (s)-[:CONTAINS_PAIN_POINT]->(p)
                    SET p.sources = $sources, p.coverage = $coverage, p.existing_solutions = $existing_solutions
                    """,
                    description=description,
                    stage_name=stage_name,
                    sources=pp.get('sources', ''),
                    coverage=pp.get('coverage', ''),
                    existing_solutions=pp.get('existing_solutions', '')
                )

                for sol_type, solutions in pp.get('solutions', {}).items():
                    for sol_desc in solutions:
                        if not sol_desc:
                            continue
                        # Merge Solution Node
                        tx.run(
                            """
                            MERGE (sol:Solution {description: $sol_desc})
                            MERGE (p:PainPoint {description: $description})
                            MERGE (p)-[:RESOLVED_BY {type: $sol_type}]->(sol)
                            SET sol.type = $sol_type
                            """,
                            sol_desc=sol_desc,
                            description=description,
                            sol_type=sol_type
                        )

    def sync_disease_to_graph(self, disease_name: str, db_ops: DatabaseOperations):
        """Sync a disease from SQL Server to Neo4j."""
        if not self.driver:
            print("Neo4j driver not initialized. Skipping graph sync.")
            return False

        pathway_data = db_ops.get_complete_disease_pathway_data(disease_name)
        if not pathway_data:
            print(f"No pathway data found for disease: {disease_name}")
            return False

        try:
            with self.driver.session() as session:
                session.execute_write(self._create_disease_graph_tx, pathway_data)
            return True
        except Exception as e:
            print(f"Error syncing to Neo4j: {e}")
            return False

    def clear_database(self):
        """Clear all nodes and relationships. Use with caution."""
        if not self.driver:
            return
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
