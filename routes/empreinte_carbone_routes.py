from flask import Blueprint, request
from controllers.empreinte_carbone_controller import EmpreinteCarboneController
from config import NAMESPACE
import os

empreinte_carbone_bp = Blueprint('empreinte_carbone', __name__)

controller = EmpreinteCarboneController()

@empreinte_carbone_bp.route('', methods=['POST'])
def create_empreinte_carbone():
    # Handle both JSON and multipart form data
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Handle file upload
        image_file = request.files.get('image')
        data = request.form.to_dict()
        return controller.create(data, image_file)
    else:
        # Handle JSON data
        data = request.get_json()
        return controller.create(data)

@empreinte_carbone_bp.route('', methods=['GET'])
def get_empreintes_carbone():
    return controller.get_all()

@empreinte_carbone_bp.route('/<id>', methods=['GET'])
def get_empreinte_carbone(id):
    uri = f"{NAMESPACE}EmpreinteCarbone_{id}"
    return controller.get(uri)

@empreinte_carbone_bp.route('/<id>', methods=['PUT'])
def update_empreinte_carbone(id):
    uri = f"{NAMESPACE}EmpreinteCarbone_{id}"
    # Handle both JSON and multipart form data
    if request.files and request.files.get('image'):
        # Handle file upload - pass both form data and image file
        image_file = request.files.get('image')
        return controller.update(uri, image_file=image_file, form_data=request.form.to_dict())
    else:
        # Handle JSON data - only try to parse JSON if content type is application/json
        if request.content_type and 'application/json' in request.content_type:
            return controller.update(uri)
        else:
            # For other content types, try to get form data if available
            if request.form:
                return controller.update(uri, form_data=request.form.to_dict())
            else:
                return controller.update(uri)

@empreinte_carbone_bp.route('/<id>', methods=['DELETE'])
def delete_empreinte_carbone(id):
    uri = f"{NAMESPACE}EmpreinteCarbone_{id}"
    return controller.delete(uri)