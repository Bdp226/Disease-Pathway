"""
Multi-Route Analyzer Agent

Decides whether to route a free-text query to:
 - a vector-search tool (semantic search)
 - direct SQL/DB aggregations via DatabaseOperations
 - a full CSV / full-pathway pull for exhaustive exports

The agent exposes a simple API: create an instance and call `route(query, ...)`.
"""
from typing import Callable, Optional, Dict, Any
import re

from database import DatabaseOperations


class MultiRouteAgent:
    def __init__(self, db_ops_cls=DatabaseOperations):
        self.db_ops_cls = db_ops_cls

    def decide_route(self, query: str) -> str:
        """Return one of: 'vector', 'sql', 'csv' based on simple heuristics."""
        q = (query or "").lower()

        # Strong signals for CSV / full export
        if re.search(r"\b(csv|download|export|file|complete export|full dump)\b", q):
            return "csv"

        # Explicit request for exhaustive / all / comprehensive lists -> prefer SQL aggregation
        if re.search(r"\b(all|every|comprehensive|complete|summary of all|list of all)\b", q) and re.search(r"\b(solution|solutions|digitalization|existing solutions)\b", q):
            return "sql"

        # Asking about existing solutions strongly favors DB aggregation
        if re.search(r"\b(existing solutions|existing solution|solutions by type)\b", q):
            return "sql"

        # Questions about how/compare/advise -> semantic vector route
        if re.search(r"\b(how|what|why|compare|best practice|recommend|advise|advantages|disadvantages)\b", q):
            return "vector"

        # Default to vector search for general Q&A
        return "vector"

    async def route(
        self,
        query: str,
        db_session=None,
        disease_name: Optional[str] = None,
        vector_search_fn: Optional[Callable[[str, Optional[str]], Any]] = None,
    ) -> Dict[str, Any]:
        """
        Route the query and return a dict with keys: `route` and `data`.

        - `vector_search_fn` should be an async callable `async def fn(query, disease_name)` returning semantic search results.
        - `db_session` is required for `sql` or `csv` routes (used to instantiate `DatabaseOperations`).
        """
        route = self.decide_route(query)

        if route == "sql":
            if db_session is None:
                raise ValueError("db_session is required for SQL routing")
            db_ops = self.db_ops_cls(db_session)
            agg = self._aggregate_solutions(db_ops, disease_name)
            return {"route": "sql", "data": agg}

        if route == "csv":
            if db_session is None:
                raise ValueError("db_session is required for CSV routing")
            if not disease_name:
                raise ValueError("disease_name is required for CSV/export routing")
            db_ops = self.db_ops_cls(db_session)
            pathway = db_ops.get_disease_pathway_data_for_csv(disease_name.lower())
            return {"route": "csv", "data": pathway}

        # vector
        if vector_search_fn is None:
            # Return routing decision; caller can perform vector search externally
            return {"route": "vector", "data": None}

        results = await vector_search_fn(query, disease_name)
        return {"route": "vector", "data": results}

    def _aggregate_solutions(self, db_ops: DatabaseOperations, disease_name: Optional[str]) -> Dict[str, Any]:
        """Aggregate solutions by type across the disease pathway.

        Returns a dict of solution_type -> list[str].
        """
        if not disease_name:
            return {}

        pathway = db_ops.get_complete_disease_pathway_data(disease_name.lower())
        if not pathway:
            return {}

        types = [
            "digitalization",
            "automation",
            "sensing",
            "clinical_innovation",
            "process_innovation",
        ]

        aggregate = {t: [] for t in types}

        for stage in pathway.get("stages", {}).values():
            for pp in stage.get("pain_points", []):
                sols = pp.get("solutions", {})
                for t in types:
                    for s in sols.get(t, []):
                        if s and s.strip() not in aggregate[t]:
                            aggregate[t].append(s.strip())

        return aggregate


def create_agent() -> MultiRouteAgent:
    return MultiRouteAgent()
