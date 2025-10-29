from flask import Blueprint, request
from controllers.empreinte_carbone_controller import EmpreinteCarboneController
from config import NAMESPACE

empreinte_carbone_bp = Blueprint('empreinte_carbone', __name__)

controller = EmpreinteCarboneController()

@empreinte_carbone_bp.route('', methods=['POST'])
def create_empreinte_carbone():
    return controller.create()

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
    return controller.update(uri)

@empreinte_carbone_bp.route('/<id>', methods=['DELETE'])
def delete_empreinte_carbone(id):
    uri = f"{NAMESPACE}EmpreinteCarbone_{id}"
    return controller.delete(uri)