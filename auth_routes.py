"""
Authentication Routes for Eco-Tourism System
Handles user registration, login, and authentication
"""
from flask import Blueprint, request, jsonify
from models.touriste import Touriste
from models.guide import Guide
from Mangage.sparql_manager import SPARQLManager
from email_service import send_verification_email, send_password_reset_email, send_welcome_email, verify_token
import jwt
import datetime
import hashlib
from functools import wraps

# Create Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Secret key for JWT (should be in environment variable in production)
JWT_SECRET = "your-secret-key-change-this-in-production"
JWT_ALGORITHM = "HS256"

manager = SPARQLManager()

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token(user_data):
    """Generate JWT token"""
    payload = {
        'uri': user_data['uri'],
        'email': user_data['email'],
        'type': user_data.get('type', 'Touriste'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Token expires in 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def token_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            request.current_user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (Tourist or Guide)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('nom') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Name, email, and password are required'}), 400
        
        email = data['email']
        
        # Check if user already exists
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?user WHERE {{
            ?user eco:email "{email}" .
        }}
        """
        existing = manager.execute_query(query)
        if existing:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Hash password
        hashed_password = hash_password(data['password'])
        
        # Determine user type (default to Tourist)
        user_type = data.get('type', 'touriste').lower()
        
        # Create user
        if user_type == 'guide':
            user = Guide(
                nom=data['nom'],
                age=data.get('age'),
                nationalite=data.get('nationalite'),
                organise=data.get('organise', []),
                organise_evenement=data.get('organise_evenement', [])
            )
        else:
            user = Touriste(
                nom=data['nom'],
                age=data.get('age'),
                nationalite=data.get('nationalite'),
                sejourne_dans=data.get('sejourne_dans'),
                participe_a=data.get('participe_a', []),
                se_deplace_par=data.get('se_deplace_par', [])
            )
        
        # Set email and password in user object
        user.email = email
        user.password = hashed_password
        
        # Create in RDF store
        manager.create(user)
        
        # Send verification email
        try:
            send_verification_email(email, data['nom'])
        except Exception as email_error:
            print(f"Failed to send verification email: {email_error}")
            # Continue with registration even if email fails
        
        # Generate token
        user_data = {
            'uri': user.uri,
            'email': email,
            'nom': data['nom'],
            'type': 'Guide' if user_type == 'guide' else 'Touriste',
            'age': data.get('age'),
            'nationalite': data.get('nationalite'),
            'emailVerified': False  # New users are not verified
        }
        token = generate_token(user_data)
        
        return jsonify({
            'message': 'User registered successfully. Please check your email to verify your account.',
            'token': token,
            'user': user_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email']
        hashed_password = hash_password(data['password'])
        
        # Query user by email and password
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?user ?nom ?age ?nationalite ?type WHERE {{
            ?user eco:email "{email}" .
            ?user eco:password "{hashed_password}" .
            ?user eco:nom ?nom .
            OPTIONAL {{ ?user eco:age ?age . }}
            OPTIONAL {{ ?user eco:nationalite ?nationalite . }}
            ?user a ?type .
            FILTER(?type = eco:Touriste || ?type = eco:Guide)
        }}
        """
        
        results = manager.execute_query(query)
        
        if not results:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        user_result = results[0]
        
        # Determine user type
        user_type_uri = user_result.get('type', {}).get('value', '')
        user_type = 'Guide' if 'Guide' in user_type_uri else 'Touriste'
        
        # Prepare user data
        user_data = {
            'uri': user_result['user']['value'],
            'email': email,
            'nom': user_result['nom']['value'],
            'type': user_type,
            'age': user_result.get('age', {}).get('value'),
            'nationalite': user_result.get('nationalite', {}).get('value')
        }
        
        # Generate token
        token = generate_token(user_data)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
    try:
        user_uri = request.current_user['uri']
        
        # Query user details
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?nom ?email ?age ?nationalite WHERE {{
            <{user_uri}> eco:nom ?nom .
            <{user_uri}> eco:email ?email .
            OPTIONAL {{ <{user_uri}> eco:age ?age . }}
            OPTIONAL {{ <{user_uri}> eco:nationalite ?nationalite . }}
        }}
        """
        
        results = manager.execute_query(query)
        
        if not results:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = results[0]
        
        return jsonify({
            'uri': user_uri,
            'nom': user_data['nom']['value'],
            'email': user_data['email']['value'],
            'age': user_data.get('age', {}).get('value'),
            'nationalite': user_data.get('nationalite', {}).get('value'),
            'type': request.current_user['type']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/validate', methods=['GET'])
@token_required
def validate_token():
    """Validate JWT token"""
    return jsonify({
        'valid': True,
        'user': request.current_user
    }), 200

# ==================== EMAIL VERIFICATION ENDPOINTS ====================

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify user email with token"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'error': 'Token is required'}), 400
        
        # Verify token
        email = verify_token(token, purpose='email_verification')
        
        if not email:
            return jsonify({'error': 'Invalid or expired token'}), 400
        
        # Update user as verified in RDF store
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        
        SELECT ?user WHERE {{
            ?user eco:email "{email}" .
        }}
        """
        
        results = manager.execute_query(query)
        
        if not results:
            return jsonify({'error': 'User not found'}), 404
        
        user_uri = results[0]['user']['value']
        
        # Add verified property
        update_query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        INSERT DATA {{
            <{user_uri}> eco:emailVerified true .
            <{user_uri}> eco:verifiedAt "{datetime.datetime.utcnow().isoformat()}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        }}
        """
        
        manager.execute_update(update_query)
        
        # Get user name for welcome email
        name_query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?nom WHERE {{
            <{user_uri}> eco:nom ?nom .
        }}
        """
        
        name_results = manager.execute_query(name_query)
        user_name = name_results[0]['nom']['value'] if name_results else "User"
        
        # Send welcome email
        send_welcome_email(email, user_name)
        
        return jsonify({
            'message': 'Email verified successfully',
            'email': email
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if user exists
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?user ?nom WHERE {{
            ?user eco:email "{email}" .
            ?user eco:nom ?nom .
        }}
        """
        
        results = manager.execute_query(query)
        
        if not results:
            return jsonify({'error': 'User not found'}), 404
        
        user_name = results[0]['nom']['value']
        
        # Send verification email
        send_verification_email(email, user_name)
        
        return jsonify({
            'message': 'Verification email sent successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== PASSWORD RESET ENDPOINTS ====================

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if user exists
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?user ?nom WHERE {{
            ?user eco:email "{email}" .
            ?user eco:nom ?nom .
        }}
        """
        
        results = manager.execute_query(query)
        
        if not results:
            # Don't reveal if email exists or not for security
            return jsonify({
                'message': 'If the email exists, a password reset link has been sent'
            }), 200
        
        user_name = results[0]['nom']['value']
        
        # Send password reset email
        send_password_reset_email(email, user_name)
        
        return jsonify({
            'message': 'Password reset email sent successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password():
    """Change user password (authenticated users only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('currentPassword') or not data.get('newPassword'):
            return jsonify({'error': 'Email, current password, and new password are required'}), 400
        
        email = data['email']
        current_password = data['currentPassword']
        new_password = data['newPassword']
        
        # Find user
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        SELECT ?user ?password WHERE {{
            ?user eco:email "{email}" .
            ?user eco:password ?password .
        }}
        """
        results = manager.execute_query(query)
        
        if not results:
            return jsonify({'error': 'User not found'}), 404
        
        user_uri = results[0]['user']['value']
        stored_password = results[0]['password']['value']
        
        # Verify current password
        hashed_current = hash_password(current_password)
        if hashed_current != stored_password:
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Hash new password
        hashed_new_password = hash_password(new_password)
        
        # Update password
        update_query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        DELETE {{
            <{user_uri}> eco:password ?oldPassword .
        }}
        INSERT {{
            <{user_uri}> eco:password "{hashed_new_password}" .
        }}
        WHERE {{
            <{user_uri}> eco:password ?oldPassword .
        }}
        """
        manager.execute_update(update_query)
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Verify token
        email = verify_token(token, purpose='password_reset')
        
        if not email:
            return jsonify({'error': 'Invalid or expired token'}), 400
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password in RDF store
        query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        
        SELECT ?user WHERE {{
            ?user eco:email "{email}" .
        }}
        """
        
        results = manager.execute_query(query)
        
        if not results:
            return jsonify({'error': 'User not found'}), 404
        
        user_uri = results[0]['user']['value']
        
        # Delete old password and insert new one
        update_query = f"""
        PREFIX eco: <http://example.org/eco-tourism#>
        
        DELETE {{
            <{user_uri}> eco:password ?oldPassword .
        }}
        INSERT {{
            <{user_uri}> eco:password "{hashed_password}" .
            <{user_uri}> eco:passwordResetAt "{datetime.datetime.utcnow().isoformat()}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        }}
        WHERE {{
            <{user_uri}> eco:password ?oldPassword .
        }}
        """
        
        manager.execute_update(update_query)
        
        return jsonify({
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

