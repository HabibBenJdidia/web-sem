from flask import Blueprint
from controllers.energie_renouvelable_controller import EnergieRenouvelableController

# Create a Blueprint for energy routes
energie_bp = Blueprint('energie', __name__)

# Define routes
@energie_bp.route('', methods=['POST'])
def create_energie():
    return EnergieRenouvelableController.create()

@energie_bp.route('', methods=['GET'])
def get_energies():
    return EnergieRenouvelableController.get_all()

@energie_bp.route('/<path:uri>', methods=['GET'])
def get_energie(uri):
    return EnergieRenouvelableController.get(uri)

@energie_bp.route('/<path:uri>', methods=['PUT'])
def update_energie(uri):
    return EnergieRenouvelableController.update(uri)

@energie_bp.route('/<path:uri>', methods=['DELETE'])
def delete_energie(uri):
    return EnergieRenouvelableController.delete(uri)
