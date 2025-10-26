"""
Email Service for AIVO

Handles all email notifications:
- Verification emails
- Welcome emails
- Password reset
- Assessment reminders

Updated: 2025-10-23 06:03:55 UTC
By: aivo-ai
"""

import logging
from typing import Optional
from jinja2 import Template

logger = logging.getLogger(__name__)


class EmailService:
    """Email service using SendGrid."""

    def __init__(self):
        """Initialize email service with SendGrid."""
        # Note: Will need to configure SendGrid API key in production
        # from sendgrid import SendGridAPIClient
        # self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        self.from_email = "noreply@aivoai.com"
        self.from_name = "AIVO Team"
        self.base_url = "https://aivoai.com"

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ):
        """
        Send email via SendGrid.

        For development, logs email content.
        In production, this will use SendGrid API.
        """
        try:
            # Development: Log email instead of sending
            logger.info(f"[EMAIL] To: {to_email}")
            logger.info(f"[EMAIL] Subject: {subject}")
            logger.info(
                f"[EMAIL] HTML Content Length: {len(html_content)} chars"
            )

            # TODO: Production implementation
            # message = Mail(
            #     from_email=Email(self.from_email, self.from_name),
            #     to_emails=To(to_email),
            #     subject=subject,
            #     html_content=Content("text/html", html_content)
            # )
            # response = self.client.send(message)
            # logger.info(f"Email sent to {to_email}: {subject} (status: {response.status_code})")

            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False


# Email templates
VERIFICATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - AIVO</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to AIVO! 🎉</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>{{ full_name }}</strong>,</p>
        
        <p>Thank you for creating an AIVO account! We're excited to help personalize learning for you.</p>
        
        <p>Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ verification_url }}" 
               style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
            Or copy and paste this link in your browser:<br>
            <a href="{{ verification_url }}" style="color: #667eea;">{{ verification_url }}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999;">
            If you didn't create an AIVO account, you can safely ignore this email.
        </p>
        
        <p style="font-size: 12px; color: #999;">
            Need help? Contact us at <a href="mailto:support@aivoai.com" style="color: #667eea;">support@aivoai.com</a>
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #999;">
        <p>© 2025 AIVO - AI-Powered Virtual Learning Companion</p>
        <p>
            <a href="https://aivoai.com" style="color: #667eea; text-decoration: none;">aivoai.com</a> • 
            <a href="https://aivoai.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> • 
            <a href="https://aivoai.com/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
    </div>
</body>
</html>
"""

WELCOME_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AIVO!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Welcome to AIVO!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>{{ parent_name }}</strong>,</p>
        
        <p>Great news! You've successfully created an account for <strong>{{ child_name }}</strong>.</p>
        
        <h2 style="color: #667eea; margin-top: 30px;">What happens next?</h2>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">1. Baseline Assessment 📝</h3>
            <p>{{ child_name }} will take a quick 20-minute assessment to help us understand their current learning level.</p>
        </div>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #764ba2; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #764ba2;">2. Brain Cloning 🧠</h3>
            <p>We'll create a personalized AI tutor that adapts to {{ child_name }}'s learning style, grade level, and needs.</p>
        </div>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #48bb78; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #48bb78;">3. Start Learning! 🚀</h3>
            <p>{{ child_name }} can start getting homework help, personalized to their exact needs.</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="https://aivoai.com/dashboard" 
               style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Go to Dashboard
            </a>
        </div>
        
        <h3 style="color: #667eea;">Need Help Getting Started?</h3>
        <ul style="line-height: 2;">
            <li>📖 <a href="https://docs.aivoai.com/getting-started" style="color: #667eea;">Read our Getting Started Guide</a></li>
            <li>🎥 <a href="https://aivoai.com/tutorials" style="color: #667eea;">Watch Tutorial Videos</a></li>
            <li>💬 <a href="https://discord.gg/aivoai" style="color: #667eea;">Join our Community Discord</a></li>
            <li>📧 <a href="mailto:support@aivoai.com" style="color: #667eea;">Email Support</a></li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p>We're here to support {{ child_name }}'s learning journey!</p>
        
        <p>
            Best regards,<br>
            <strong>The AIVO Team</strong>
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #999;">
        <p>© 2025 AIVO - AI-Powered Virtual Learning Companion</p>
        <p>
            <a href="https://aivoai.com" style="color: #667eea; text-decoration: none;">aivoai.com</a> • 
            <a href="https://aivoai.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> • 
            <a href="https://aivoai.com/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
    </div>
</body>
</html>
"""


def send_verification_email(email: str, full_name: str, user_id: str):
    """Send email verification link."""
    # TODO: Implement token generation
    # from app.core.security import create_verification_token
    # token = create_verification_token(user_id)

    token = f"placeholder_token_{user_id}"
    verification_url = f"https://aivoai.com/verify-email/{token}"

    template = Template(VERIFICATION_EMAIL_TEMPLATE)
    html_content = template.render(
        full_name=full_name, verification_url=verification_url
    )

    email_service = EmailService()
    email_service.send_email(
        to_email=email,
        subject="Verify Your Email - AIVO",
        html_content=html_content,
    )


def send_welcome_email(parent_email: str, parent_name: str, child_name: str):
    """Send welcome email after child is added."""
    template = Template(WELCOME_EMAIL_TEMPLATE)
    html_content = template.render(
        parent_name=parent_name, child_name=child_name
    )

    email_service = EmailService()
    email_service.send_email(
        to_email=parent_email,
        subject=f"Welcome to AIVO - {child_name}'s Learning Journey Starts Now!",
        html_content=html_content,
    )


ENROLLMENT_CONFIRMATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enrollment Complete - AIVO</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Enrollment Complete!</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi <strong>{{ parent_name }}</strong>,</p>
        
        <p>Congratulations! You've successfully enrolled <strong>{{ learner_name }}</strong> in AIVO Learning.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">📋 Learner Profile</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;">Name:</td>
                    <td style="padding: 8px 0;"><strong>{{ learner_name }}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Grade Level:</td>
                    <td style="padding: 8px 0;"><strong>{{ grade_level }}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Age:</td>
                    <td style="padding: 8px 0;"><strong>{{ age }}</strong></td>
                </tr>
                {% if has_iep %}
                <tr>
                    <td style="padding: 8px 0; color: #666;">IEP Status:</td>
                    <td style="padding: 8px 0;"><span style="background: #48bb78; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Active IEP</span></td>
                </tr>
                {% endif %}
            </table>
        </div>
        
        {% if accessibility_features|length > 0 %}
        <div style="background: #e6fffa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38b2ac;">
            <h4 style="margin-top: 0; color: #38b2ac;">♿ Accessibility Features Enabled:</h4>
            <ul style="margin: 0; padding-left: 20px;">
                {% for feature in accessibility_features %}
                <li>{{ feature }}</li>
                {% endfor %}
            </ul>
        </div>
        {% endif %}
        
        <h2 style="color: #667eea; margin-top: 30px;">🚀 Next Steps</h2>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">1. Complete Baseline Assessment</h3>
            <p>{{ learner_name }} needs to complete a 20-minute assessment to help us understand their learning level.</p>
            <div style="text-align: center; margin-top: 15px;">
                <a href="{{ assessment_url }}" 
                   style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Start Assessment →
                </a>
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #764ba2; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #764ba2;">2. AI Brain Creation 🧠</h3>
            <p>Once the assessment is complete, we'll create {{ learner_name }}'s personalized AI tutor that adapts to their unique learning style.</p>
        </div>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #48bb78; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #48bb78;">3. Access Parent Dashboard</h3>
            <p>Monitor progress, view reports, and adjust settings from your dashboard.</p>
            <div style="text-align: center; margin-top: 15px;">
                <a href="{{ dashboard_url }}" 
                   style="background: #48bb78; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Go to Dashboard →
                </a>
            </div>
        </div>
        
        <div style="background: #fef5e7; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #f39c12;">
            <h3 style="margin-top: 0; color: #e67e22;">📚 Getting Started Resources</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li><a href="https://docs.aivoai.com/parent-guide" style="color: #e67e22;">Parent's Guide</a> - Everything you need to know</li>
                <li><a href="https://aivoai.com/tutorials" style="color: #e67e22;">Video Tutorials</a> - Watch how it works</li>
                <li><a href="https://aivoai.com/faq" style="color: #e67e22;">FAQ</a> - Common questions answered</li>
                <li><a href="https://discord.gg/aivoai" style="color: #e67e22;">Community</a> - Connect with other parents</li>
            </ul>
        </div>
        
        <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin-top: 0; color: #2d3748;">💬 Need Help?</h3>
            <p style="margin-bottom: 10px;">Our support team is here for you:</p>
            <ul style="margin: 0; padding-left: 20px;">
                <li>📧 Email: <a href="mailto:support@aivoai.com" style="color: #667eea;">support@aivoai.com</a></li>
                <li>💬 Live Chat: Available in your dashboard</li>
                <li>📞 Phone: 1-800-AIVO-HELP (Mon-Fri, 8am-6pm EST)</li>
            </ul>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p>We're excited to support {{ learner_name }}'s learning journey!</p>
        
        <p>
            Best regards,<br>
            <strong>The AIVO Team</strong>
        </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 20px; font-size: 12px; color: #999;">
        <p>© 2025 AIVO - AI-Powered Personalized Learning</p>
        <p>
            <a href="https://aivoai.com" style="color: #667eea; text-decoration: none;">aivoai.com</a> • 
            <a href="https://aivoai.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> • 
            <a href="https://aivoai.com/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
        </p>
        <p style="margin-top: 10px;">
            <a href="{{ unsubscribe_url }}" style="color: #999; text-decoration: none;">Unsubscribe from emails</a>
        </p>
    </div>
</body>
</html>
"""


def send_enrollment_confirmation(
    parent_email: str,
    parent_name: str,
    learner_name: str,
    learner_id: str,
    grade_level: str,
    age: int,
    has_iep: bool = False,
    accessibility_features: list = None,
):
    """Send enrollment confirmation email with next steps."""
    if accessibility_features is None:
        accessibility_features = []
    
    # Format accessibility features for display
    feature_names = {
        'textToSpeech': 'Text-to-Speech',
        'voiceInput': 'Voice Input',
        'largeText': 'Large Text',
        'highContrast': 'High Contrast',
        'reducedMotion': 'Reduced Motion',
        'calmMode': 'Calm Mode',
        'dyslexiaFont': 'Dyslexia-Friendly Font',
    }
    
    formatted_features = [
        feature_names.get(f, f) for f in accessibility_features if f in feature_names
    ]
    
    # Generate URLs
    assessment_url = f"http://localhost:3004/#/onboarding/assessment?learner_id={learner_id}"
    dashboard_url = "http://localhost:3001/dashboard"
    unsubscribe_url = f"https://aivoai.com/unsubscribe?email={parent_email}"
    
    template = Template(ENROLLMENT_CONFIRMATION_TEMPLATE)
    html_content = template.render(
        parent_name=parent_name,
        learner_name=learner_name,
        grade_level=grade_level,
        age=age,
        has_iep=has_iep,
        accessibility_features=formatted_features,
        assessment_url=assessment_url,
        dashboard_url=dashboard_url,
        unsubscribe_url=unsubscribe_url,
    )

    email_service = EmailService()
    return email_service.send_email(
        to_email=parent_email,
        subject=f"🎉 {learner_name}'s Enrollment Complete - Start Learning!",
        html_content=html_content,
    )
