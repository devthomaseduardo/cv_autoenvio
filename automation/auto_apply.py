import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from dotenv import load_dotenv

load_dotenv()

class AutoApplier:
    def __init__(self):
        self.email_user = os.getenv("EMAIL_USER")
        self.email_pass = os.getenv("EMAIL_PASS")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))

    def send_application_email(self, target_email, subject, body, resume_path):
        if not self.email_user or not self.email_pass:
            print("Email credentials not configured in .env")
            return False

        msg = MIMEMultipart()
        msg['From'] = self.email_user
        msg['To'] = target_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        # Attach resume
        try:
            with open(resume_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f"attachment; filename= {os.path.basename(resume_path)}",
                )
                msg.attach(part)
        except Exception as e:
            print(f"Error attaching file: {e}")
            return False

        # Send email
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_pass)
            server.send_message(msg)
            server.quit()
            print(f"✅ Email sent successfully to {target_email}")
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    def apply_on_platform(self, platform_url, credentials):
        # This would use Playwright to navigate, login and apply
        # Logic depends on the specific platform (LinkedIn, Gupy, etc.)
        print(f"Platform automation for {platform_url} not yet implemented.")
        pass
