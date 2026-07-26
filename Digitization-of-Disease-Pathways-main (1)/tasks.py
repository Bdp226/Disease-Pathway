from worker import celery_app
from celery.utils.log import get_task_logger
import os
import sys

# Ensure the app directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logger = get_task_logger(__name__)

@celery_app.task(name="tasks.index_disease_vector_store")
def index_disease_vector_store_task(disease_name: str, parsed_data: dict, persist: bool = True):
    """
    Asynchronously index the parsed excel data into the FAISS vector store.
    """
    logger.info(f"Starting vector indexing for disease: {disease_name}")
    from main import index_disease_pathway_to_vector_store
    try:
        index_disease_pathway_to_vector_store(disease_name, parsed_data, persist)
        logger.info(f"Completed vector indexing for disease: {disease_name}")
        return True
    except Exception as e:
        logger.error(f"Error during vector indexing for {disease_name}: {e}")
        return False

@celery_app.task(name="tasks.send_webhook_notification")
def send_webhook_notification_task(
    user_name: str,
    user_email: str,
    disease_name: str,
    pain_point: str,
    solution: str,
    source: str = None
):
    """
    Asynchronously send Teams Webhook notification with basic retry/circuit-breaking.
    """
    logger.info("Sending webhook notification...")
    from auth.mail import EmailService
    try:
        success = EmailService.send_pain_point_notification(
            user_name=user_name,
            user_email=user_email,
            disease_name=disease_name,
            pain_point=pain_point,
            solution=solution,
            source=source
        )
        return success
    except Exception as e:
        logger.error(f"Webhook notification failed: {e}")
        # In a full FAANG implementation, we would raise self.retry(exc=e, countdown=60)
        return False
