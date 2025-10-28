from flask import Blueprint, request
from controllers.energie_renouvelable_controller import EnergieRenouvelableController
from config import NAMESPACE

# Create a Blueprint for energy routes
energie_bp = Blueprint('energie', __name__)

# Create controller instance
controller = EnergieRenouvelableController()

# Define routes
@energie_bp.route('', methods=['POST'])
def create_energie():
    return controller.create()

@energie_bp.route('', methods=['GET'])
def get_energies():
    return controller.get_all()

@energie_bp.route('/<id>', methods=['GET'])
def get_energie(id):
    # Convert ID to full URI
    uri = f"{NAMESPACE}EnergieRenouvelable_{id}"
    return controller.get(uri)

@energie_bp.route('/<id>', methods=['PUT'])
def update_energie(id):
    # Convert ID to full URI
    uri = f"{NAMESPACE}EnergieRenouvelable_{id}"
    return controller.update(uri)

@energie_bp.route('/<id>', methods=['DELETE'])
def delete_energie(id):
    # Convert ID to full URI
    uri = f"{NAMESPACE}EnergieRenouvelable_{id}"
    return controller.delete(uri)