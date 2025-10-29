import os
import uuid
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

# Configuration
UPLOAD_FOLDER = 'uploads'
MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file(file):
    """Validate file type and size"""
    if not file:
        return False, "No file provided"
    
    if not allowed_file(file.filename):
        return False, f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    
    # Check file size by reading the stream
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer
    
    if file_size > MAX_CONTENT_LENGTH:
        return False, f"File size too large. Maximum size: {MAX_CONTENT_LENGTH // (1024 * 1024)}MB"
    
    return True, None

def save_uploaded_file(file, upload_folder=UPLOAD_FOLDER):
    """Save uploaded file and return the file path"""
    if not file or file.filename == '':
        return None, "No file selected"
    
    # Validate file
    is_valid, error_message = validate_file(file)
    if not is_valid:
        return None, error_message
    
    # Create upload directory if it doesn't exist
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # Generate unique filename
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Save file
    file_path = os.path.join(upload_folder, unique_filename)
    try:
        file.save(file_path)
        return unique_filename, None
    except Exception as e:
        return None, f"Error saving file: {str(e)}"

def delete_file(filename, upload_folder=UPLOAD_FOLDER):
    """Delete a file from the upload folder"""
    if not filename:
        return True, None
    
    file_path = os.path.join(upload_folder, filename)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
        return True, None
    except Exception as e:
        return False, f"Error deleting file: {str(e)}"

def get_file_url(filename, base_url="/uploads"):
    """Get the URL for a saved file"""
    if not filename:
        return None
    return f"{base_url}/{filename}"