from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    """
    FAANG-standard global error handler.
    Returns structured RFC 7807 Problem Details for HTTP APIs.
    """
    correlation_id = getattr(request.state, "correlation_id", "unknown")
    
    logger.error(f"Unhandled Exception: {str(exc)}", extra={"correlation_id": correlation_id})
    
    return JSONResponse(
        status_code=500,
        content={
            "type": "about:blank",
            "title": "Internal Server Error",
            "status": 500,
            "detail": "An unexpected error occurred while processing your request.",
            "instance": request.url.path,
            "trace_id": correlation_id
        }
    )
