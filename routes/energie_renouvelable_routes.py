from flask import Blueprint
from controllers.energie_renouvelable_controller import EnergieRenouvelableController
from config import NAMESPACE

# Create a Blueprint for energy routes
energie_bp = Blueprint('energie', __name__)

# Define routes
@energie_bp.route('', methods=['POST'])
def create_energie():
    return EnergieRenouvelableController.create()

@energie_bp.route('', methods=['GET'])
def get_energies():
    return EnergieRenouvelableController.get_all()

@energie_bp.route('/<id>', methods=['GET'])
def get_energie(id):
    # Convert ID to full URI
    uri = f"{NAMESPACE}EnergieRenouvelable_{id}"
    return EnergieRenouvelableController.get(uri)

@energie_bp.route('/<id>', methods=['PUT'])
def update_energie(id):
    # Convert ID to full URI
    uri = f"{NAMESPACE}EnergieRenouvelable_{id}"
    return EnergieRenouvelableController.update(uri)

@energie_bp.route('/<id>', methods=['DELETE'])
def delete_energie(id):
    # Convert ID to full URI
    uri = f"{NAMESPACE}EnergieRenouvelable_{id}"
    return EnergieRenouvelableController.delete(uri)