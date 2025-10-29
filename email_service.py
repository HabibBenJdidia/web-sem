"""
Email Service for sending verification emails and password reset emails
Uses Flask-Mail with Gmail SMTP
"""

from flask_mail import Mail, Message
from flask import render_template_string
import os
import secrets
import jwt
from datetime import datetime, timedelta
from config import NAMESPACE

mail = Mail()

def init_mail(app):
    """Initialize Flask-Mail with the app"""
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = (
        os.getenv('MAIL_FROM_NAME', 'Travel-Tourism'),
        os.getenv('MAIL_DEFAULT_SENDER', os.getenv('MAIL_USERNAME'))
    )
    
    mail.init_app(app)
    return mail

def generate_verification_token(email):
    """Generate a verification token for email verification"""
    payload = {
        'email': email,
        'purpose': 'email_verification',
        'exp': datetime.utcnow() + timedelta(hours=24)  # 24 hours validity
    }
    token = jwt.encode(payload, os.getenv('JWT_SECRET_KEY', 'secret'), algorithm='HS256')
    return token

def generate_reset_token(email):
    """Generate a password reset token"""
    payload = {
        'email': email,
        'purpose': 'password_reset',
        'exp': datetime.utcnow() + timedelta(hours=1)  # 1 hour validity
    }
    token = jwt.encode(payload, os.getenv('JWT_SECRET_KEY', 'secret'), algorithm='HS256')
    return token

def verify_token(token, purpose='email_verification'):
    """Verify a token and return the email if valid"""
    try:
        payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY', 'secret'), algorithms=['HS256'])
        
        if payload.get('purpose') != purpose:
            return None
        
        return payload.get('email')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def send_verification_email(email, name, frontend_url='http://localhost:5173'):
    """Send email verification to new user"""
    token = generate_verification_token(email)
    verification_link = f"{frontend_url}/auth/verify-email?token={token}"
    
    # HTML Email Template
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 40px 30px;
                color: #333333;
            }}
            .content h2 {{
                color: #667eea;
                margin-top: 0;
            }}
            .verify-button {{
                display: inline-block;
                padding: 15px 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
                text-align: center;
            }}
            .verify-button:hover {{
                opacity: 0.9;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666666;
                font-size: 12px;
            }}
            .divider {{
                height: 1px;
                background-color: #e0e0e0;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌍 Travel-Tourism</h1>
                <p>Bienvenue dans votre aventure écotouristique!</p>
            </div>
            <div class="content">
                <h2>Bonjour {name}! 👋</h2>
                <p>Merci de vous être inscrit sur <strong>Travel-Tourism</strong>, votre plateforme d'écotourisme.</p>
                <p>Pour activer votre compte et commencer votre aventure, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous:</p>
                
                <div style="text-align: center;">
                    <a href="{verification_link}" class="verify-button">
                        ✓ Vérifier mon email
                    </a>
                </div>
                
                <div class="divider"></div>
                
                <p><strong>Ou copiez ce lien dans votre navigateur:</strong></p>
                <p style="word-break: break-all; color: #667eea; font-size: 12px;">{verification_link}</p>
                
                <div class="divider"></div>
                
                <p style="color: #999; font-size: 14px;">
                    ⏰ Ce lien est valable pendant <strong>24 heures</strong>.<br>
                    ⚠️ Si vous n'avez pas créé de compte, ignorez cet email.
                </p>
            </div>
            <div class="footer">
                <p>© 2025 Travel-Tourism - Plateforme d'Écotourisme</p>
                <p>Cet email a été envoyé à {email}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_body = f"""
    Bonjour {name}!
    
    Merci de vous être inscrit sur Travel-Tourism.
    
    Pour activer votre compte, cliquez sur ce lien:
    {verification_link}
    
    Ce lien est valable pendant 24 heures.
    
    Si vous n'avez pas créé de compte, ignorez cet email.
    
    Cordialement,
    L'équipe Travel-Tourism
    """
    
    try:
        msg = Message(
            subject="🌍 Vérifiez votre email - Travel-Tourism",
            recipients=[email],
            html=html_body,
            body=text_body
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False

def send_password_reset_email(email, name, frontend_url='http://localhost:5173'):
    """Send password reset email"""
    token = generate_reset_token(email)
    reset_link = f"{frontend_url}/auth/reset-password?token={token}"
    
    # HTML Email Template
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                padding: 30px;
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 40px 30px;
                color: #333333;
            }}
            .content h2 {{
                color: #f5576c;
                margin-top: 0;
            }}
            .reset-button {{
                display: inline-block;
                padding: 15px 40px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
                text-align: center;
            }}
            .reset-button:hover {{
                opacity: 0.9;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666666;
                font-size: 12px;
            }}
            .divider {{
                height: 1px;
                background-color: #e0e0e0;
                margin: 20px 0;
            }}
            .warning {{
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Travel-Tourism</h1>
                <p>Réinitialisation de mot de passe</p>
            </div>
            <div class="content">
                <h2>Bonjour {name},</h2>
                <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>Travel-Tourism</strong>.</p>
                <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_link}" class="reset-button">
                        🔑 Réinitialiser mon mot de passe
                    </a>
                </div>
                
                <div class="divider"></div>
                
                <p><strong>Ou copiez ce lien dans votre navigateur:</strong></p>
                <p style="word-break: break-all; color: #f5576c; font-size: 12px;">{reset_link}</p>
                
                <div class="divider"></div>
                
                <div class="warning">
                    <p style="margin: 0; color: #856404;">
                        <strong>⚠️ Attention:</strong><br>
                        • Ce lien est valable pendant <strong>1 heure seulement</strong><br>
                        • Si vous n'avez pas demandé cette réinitialisation, ignorez cet email<br>
                        • Votre mot de passe actuel reste inchangé jusqu'à ce que vous en créiez un nouveau
                    </p>
                </div>
            </div>
            <div class="footer">
                <p>© 2025 Travel-Tourism - Plateforme d'Écotourisme</p>
                <p>Cet email a été envoyé à {email}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    text_body = f"""
    Bonjour {name},
    
    Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.
    
    Pour réinitialiser votre mot de passe, cliquez sur ce lien:
    {reset_link}
    
    Ce lien est valable pendant 1 heure.
    
    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    Votre mot de passe actuel reste inchangé.
    
    Cordialement,
    L'équipe Travel-Tourism
    """
    
    try:
        msg = Message(
            subject="🔐 Réinitialisation de mot de passe - Travel-Tourism",
            recipients=[email],
            html=html_body,
            body=text_body
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False

def send_welcome_email(email, name):
    """Send welcome email after email verification"""
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                padding: 30px;
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 32px;
            }}
            .content {{
                padding: 40px 30px;
                color: #333333;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bienvenue {name}!</h1>
                <p>Votre compte est maintenant actif</p>
            </div>
            <div class="content">
                <h2>Félicitations! 🌟</h2>
                <p>Votre email a été vérifié avec succès. Vous faites maintenant partie de la communauté <strong>Travel-Tourism</strong>!</p>
                
                <h3>Que pouvez-vous faire maintenant?</h3>
                <ul>
                    <li>🏨 Découvrir des hébergements écologiques</li>
                    <li>🌳 Explorer des activités écotouristiques</li>
                    <li>🗺️ Planifier vos destinations durables</li>
                    <li>🌍 Contribuer à un tourisme responsable</li>
                </ul>
                
                <p>Prêt à commencer votre aventure? Connectez-vous dès maintenant!</p>
            </div>
            <div class="footer">
                <p>© 2025 Travel-Tourism - Plateforme d'Écotourisme</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        msg = Message(
            subject="🎉 Bienvenue sur Travel-Tourism!",
            recipients=[email],
            html=html_body
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return False

