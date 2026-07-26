import requests
import json
import logging
from typing import Optional
from urllib3.exceptions import InsecureRequestWarning

# Suppress SSL warnings
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Power Automate Webhook URL
WEBHOOK_URL = "https://default5dbf1add202a4b8d815bbf0fb024e0.33.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/b589d73da8ba4bef88b594152c29ec16/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=z373D2f-65v56srd3OxxMoHYCDdARnAKJHOGA2t8oRc"

class EmailService:
    @staticmethod
    def send_pain_point_notification(
        user_name: str,
        user_email: str,
        disease_name: str,
        pain_point: str,
        solution: str,
        source: Optional[str] = None
    ) -> bool:
        """
        Send pain point submission notification via Power Automate webhook
        
        Args:
            user_name: Name of the user submitting the pain point
            user_email: Email of the user
            disease_name: Name of the disease
            pain_point: Description of the pain point
            solution: Proposed solution
            source: Source of information (optional)
            
        Returns:
            bool: True if notification sent successfully, False otherwise
        """
        try:
            print(f"Sending pain point notification for {user_name} ({user_email})...")
            
            # Create adaptive card payload with dynamic data
            payload = {
                "type": "message",
                "attachments": [
                    {
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": {
                            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            "type": "AdaptiveCard",
                            "version": "1.2",
                            "body": [
                                {
                                    "type": "TextBlock",
                                    "text": "🆕 New Pain Point Request",
                                    "weight": "Bolder",
                                    "size": "Large",
                                    "color": "Accent"
                                },
                                {
                                    "type": "FactSet",
                                    "facts": [
                                        {
                                            "title": "User Name:",
                                            "value": user_name
                                        },
                                        {
                                            "title": "Email:",
                                            "value": user_email
                                        }
                                    ]
                                },
                                {
                                    "type": "TextBlock",
                                    "text": "Pain Point Details",
                                    "weight": "Bolder",
                                    "size": "Medium",
                                    "separator": True
                                },
                                {
                                    "type": "TextBlock",
                                    "text": f"**Disease:** {disease_name}",
                                    "wrap": True
                                },
                                {
                                    "type": "TextBlock",
                                    "text": f"**Pain Point:**",
                                    "weight": "Bolder",
                                    "wrap": True
                                },
                                {
                                    "type": "TextBlock",
                                    "text": pain_point,
                                    "wrap": True,
                                    "separator": True
                                },
                                {
                                    "type": "TextBlock",
                                    "text": f"**Proposed Solution:**",
                                    "weight": "Bolder",
                                    "wrap": True
                                },
                                {
                                    "type": "TextBlock",
                                    "text": solution,
                                    "wrap": True,
                                    "separator": True
                                },
                                {
                                    "type": "TextBlock",
                                    "text": f"**Source:** {source if source else 'Not specified'}",
                                    "wrap": True,
                                    "isSubtle": True
                                }
                            ]
                        }
                    }
                ]
            }
            
            headers = {"Content-Type": "application/json"}
            
            # Send webhook request
            response = requests.post(
                WEBHOOK_URL,
                headers=headers,
                data=json.dumps(payload),
                verify=False,
                timeout=10
            )
            
            if response.status_code == 202 or response.status_code == 200:
                print(f"✅ Pain point notification sent successfully for {user_name}")
                logging.info(f"Pain point notification sent to webhook for user: {user_email}")
                return True
            else:
                print(f"❌ Failed to send notification. Status: {response.status_code}")
                logging.error(f"Webhook failed with status {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            error_msg = f"❌ Webhook request timeout for {user_email}"
            print(error_msg)
            logging.error(error_msg)
            return False
        except Exception as e:
            error_msg = f"❌ Failed to send pain point notification: {str(e)}"
            print(error_msg)
            logging.error(error_msg)
            return False
