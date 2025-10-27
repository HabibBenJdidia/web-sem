from flask import jsonify, request
from models.energie_renouvelable import EnergieRenouvelable
from Mangage.sparql_manager import SPARQLManager

manager = SPARQLManager()

class EnergieRenouvelableController:
    @staticmethod
    def create():
        try:
            data = request.get_json()
            if not data.get('nom') or not data.get('type'):
                return jsonify({'error': 'Missing required fields: nom and type are required'}), 400
                
            energie = EnergieRenouvelable(
                nom=data['nom'],
                type_=data['type'],
                description=data.get('description', '')
            )
            manager.create(energie)
            return jsonify(energie.to_dict()), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @staticmethod
    def get_all():
        try:
            result = manager.get_all('EnergieRenouvelable')
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def get(uri):
        try:
            result = manager.get_by_uri(uri)
            if not result:
                return jsonify({'error': 'Energy source not found'}), 404
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def update(uri):
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400
                
            energie = EnergieRenouvelable(
                uri=uri,
                nom=data.get('nom'),
                type_=data.get('type'),
                description=data.get('description', '')
            )
            result = manager.update(energie)
            if not result:
                return jsonify({'error': 'Failed to update energy source'}), 400
            return jsonify(energie.to_dict())
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @staticmethod
    def delete(uri):
        try:
            success = manager.delete(uri)
            if not success:
                return jsonify({'error': 'Failed to delete energy source'}), 400
            return jsonify({'message': 'Energy source deleted successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
