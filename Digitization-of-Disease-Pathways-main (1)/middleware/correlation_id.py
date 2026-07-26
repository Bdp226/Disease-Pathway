import uuid
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import logging

logger = logging.getLogger(__name__)

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    FAANG-standard middleware that injects a unique Correlation ID into every request.
    This enables robust distributed tracing and observability.
    """
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        request.state.correlation_id = correlation_id
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            response.headers["X-Correlation-ID"] = correlation_id
            
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
        except Exception as e:
            logger.error(
                f"Request failed", 
                extra={"correlation_id": correlation_id, "error": str(e)}
            )
            raise
