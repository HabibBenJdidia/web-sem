from flask import jsonify, request
from models.empreinte_carbone import EmpreinteCarbone
from Mangage.sparql_manager import SPARQLManager
from config import NAMESPACE

class EmpreinteCarboneController:
    def __init__(self):
        
        self.manager = SPARQLManager()

    def create(self):
        try:
            data = request.get_json()
            if not data.get('valeur_co2_kg'):
                return jsonify({'error': 'Missing required field: valeur_co2_kg is required'}), 400
                
            empreinte = EmpreinteCarbone(
                valeur_co2_kg=data['valeur_co2_kg']
            )
            result = self.manager.create(empreinte)
            
            empreinte_dict = empreinte.to_dict()
            if empreinte.uri and 'EmpreinteCarbone_' in empreinte.uri:
                empreinte_dict['id'] = empreinte.uri.split('EmpreinteCarbone_')[1]
            
            return jsonify(empreinte_dict), 201
        except Exception as e:
            print(f"Error creating empreinte carbone: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 400

    def get_all(self):
        try:
            results = self.manager.get_all('EmpreinteCarbone')
            
            if not results:
                print("No empreinte carbone found")
                return jsonify([])
            
            resources = {}
            for binding in results:
                subj = binding.get('s', {}).get('value')
                pred = binding.get('p', {}).get('value')
                obj = binding.get('o', {}).get('value')
                
                if not all([subj, pred, obj]):
                    continue
                    
                if subj not in resources:
                    resources[subj] = {'uri': subj}
                    if 'EmpreinteCarbone_' in subj:
                        resources[subj]['id'] = subj.split('EmpreinteCarbone_')[1]
                
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                if prop_name == 'valeur_co2_kg':
                    try:
                        resources[subj][prop_name] = float(obj)
                    except ValueError:
                        resources[subj][prop_name] = obj
                elif prop_name != 'type' or 'EmpreinteCarbone' not in obj:
                    resources[subj][prop_name] = obj
            
            empreintes = list(resources.values())
            return jsonify(empreintes)
        except Exception as e:
            print(f"Error in get_all: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

    def get(self, uri):
        try:
            results = self.manager.get_by_uri(uri)
            
            if not results or 'error' in results:
                return jsonify({'error': 'Empreinte Carbone not found'}), 404
            
            empreinte_data = {'uri': uri}
            
            if 'EmpreinteCarbone_' in uri:
                empreinte_data['id'] = uri.split('EmpreinteCarbone_')[1]
            
            for binding in results:
                pred = binding.get('p', {}).get('value')
                obj = binding.get('o', {}).get('value')
                if not pred or not obj:
                    continue
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                if prop_name != 'type' or 'EmpreinteCarbone' not in obj:
                    empreinte_data[prop_name] = obj
            
            return jsonify(empreinte_data)
        except Exception as e:
            print(f"Error in get: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

    def update(self, uri):
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            current = self.manager.get_by_uri(uri)
            if not current or 'error' in current:
                return jsonify({'error': 'Empreinte Carbone not found for update'}), 404

            updates = []
            if 'valeur_co2_kg' in data:
                if data['valeur_co2_kg'] is None or not isinstance(data['valeur_co2_kg'], (int, float)):
                    return jsonify({'error': 'Invalid input for valeur_co2_kg. Must be a number.'}), 400
                try:
                    data['valeur_co2_kg'] = float(data['valeur_co2_kg'])
                except ValueError:
                    return jsonify({'error': 'Invalid input for valeur_co2_kg. Must be a number.'}), 400
                updates.append(('valeur_co2_kg', data['valeur_co2_kg']))

            if not updates:
                return jsonify({'error': 'No valid fields provided for update'}), 400

            for prop, value in updates:
                result = self.manager.update_property(uri, prop, value)
                if 'error' in result:
                    return jsonify(result), 400

            updated_results = self.manager.get_by_uri(uri)
            
            updated_data = {'uri': uri}
            
            if 'EmpreinteCarbone_' in uri:
                updated_data['id'] = uri.split('EmpreinteCarbone_')[1]
            
            for binding in updated_results:
                pred = binding.get('p', {}).get('value')
                obj = binding.get('o', {}).get('value')
                if not pred or not obj:
                    continue
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                if prop_name != 'type' or 'EmpreinteCarbone' not in obj:
                    updated_data[prop_name] = obj
            
            return jsonify({'message': 'Empreinte Carbone updated successfully', 'id': updated_data['id']})

        except Exception as e:
            error_msg = f'Error updating empreinte carbone: {str(e)}'
            print(error_msg)
            import traceback
            traceback.print_exc()
            return jsonify({'error': error_msg}), 500

    def delete(self, uri):
        try:
            result = self.manager.delete(uri)
            if not result.get('success'):
                if result.get('error') == 'Entity not found':
                    return jsonify({'error': 'Empreinte Carbone not found'}), 404
                return jsonify({'error': 'Failed to delete empreinte carbone'}), 400
            return jsonify({'message': 'Empreinte Carbone deleted successfully'})
        except Exception as e:
            print(f"Error in delete: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500