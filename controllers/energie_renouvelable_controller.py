from flask import jsonify, request
from models.energie_renouvelable import EnergieRenouvelable
from Mangage.sparql_manager import SPARQLManager

manager = SPARQLManager()

class EnergieRenouvelableController:
    def __init__(self):
        self.manager = SPARQLManager()

    def create(self):
        try:
            data = request.get_json()
            if not data.get('nom') or not data.get('type'):
                return jsonify({'error': 'Missing required fields: nom and type are required'}), 400
                
            energie = EnergieRenouvelable(
                nom=data['nom'],
                type_=data['type'],
                description=data.get('description', '')
            )
            result = self.manager.create(energie)
            
            # Return the created energie with its ID extracted from URI
            energie_dict = energie.to_dict()
            if energie.uri and 'EnergieRenouvelable_' in energie.uri:
                energie_dict['id'] = energie.uri.split('EnergieRenouvelable_')[1]
            
            return jsonify(energie_dict), 201
        except Exception as e:
            print(f"Error creating energie: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 400

    def get_all(self):
        try:
            results = self.manager.get_all('EnergieRenouvelable')
            
            # If no results, return empty array
            if not results:
                print("No energies found")
                return jsonify([])
            
            print(f"Raw results from SPARQL: {results}")
                
            # Group triples by subject
            resources = {}
            for binding in results:
                subj = binding.get('s', {}).get('value')
                pred = binding.get('p', {}).get('value')
                obj = binding.get('o', {}).get('value')
                
                if not all([subj, pred, obj]):
                    continue
                    
                if subj not in resources:
                    resources[subj] = {'uri': subj}
                    # Extract ID from URI
                    if 'EnergieRenouvelable_' in subj:
                        resources[subj]['id'] = subj.split('EnergieRenouvelable_')[1]
                
                # Extract property name from the predicate URI
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                # Skip the 'type' predicate (rdf:type)
                if prop_name != 'type' or 'EnergieRenouvelable' not in obj:
                    resources[subj][prop_name] = obj
            
            # Convert to list of dictionaries
            energies = list(resources.values())
            print(f"Processed energies: {energies}")
            return jsonify(energies)
        except Exception as e:
            print(f"Error in get_all: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

    def get(self, uri):
        try:
            print(f"Getting energie with URI: {uri}")
            results = self.manager.get_by_uri(uri)
            
            if not results or 'error' in results:
                print(f"Energy source not found for URI: {uri}")
                return jsonify({'error': 'Energy source not found'}), 404
            
            # Convert SPARQL results to a dictionary
            energy_data = {'uri': uri}
            
            # Extract ID from URI
            if 'EnergieRenouvelable_' in uri:
                energy_data['id'] = uri.split('EnergieRenouvelable_')[1]
            
            for binding in results:
                pred = binding.get('p', {}).get('value')
                obj = binding.get('o', {}).get('value')
                if not pred or not obj:
                    continue
                # Extract property name from the predicate URI
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                # Skip the 'type' predicate
                if prop_name != 'type' or 'EnergieRenouvelable' not in obj:
                    energy_data[prop_name] = obj
            
            print(f"Retrieved energy data: {energy_data}")
            return jsonify(energy_data)
        except Exception as e:
            print(f"Error in get: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

    def update(self, uri):
        try:
            print(f"Updating energie with URI: {uri}")
            data = request.get_json()
            print(f"Update data: {data}")
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            # Get the current energy resource
            current = self.manager.get_by_uri(uri)
            if not current or 'error' in current:
                print(f"Energy source not found for update: {uri}")
                return jsonify({'error': 'Energy source not found'}), 404

            # Update the properties
            updates = []
            if 'nom' in data:
                updates.append(('nom', data['nom']))
            if 'type' in data:
                updates.append(('type', data['type']))
            if 'description' in data:
                updates.append(('description', data['description']))

            # Apply updates
            for prop, value in updates:
                print(f"Updating property {prop} to {value}")
                result = self.manager.update_property(uri, prop, value)
                if 'error' in result:
                    print(f"Error updating property: {result}")
                    return jsonify(result), 400

            # Return the updated resource
            updated_results = self.manager.get_by_uri(uri)
            
            # Convert SPARQL results to dictionary
            updated_data = {'uri': uri}
            
            # Extract ID from URI
            if 'EnergieRenouvelable_' in uri:
                updated_data['id'] = uri.split('EnergieRenouvelable_')[1]
            
            for binding in updated_results:
                pred = binding.get('p', {}).get('value')
                obj = binding.get('o', {}).get('value')
                if not pred or not obj:
                    continue
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                # Skip the 'type' predicate
                if prop_name != 'type' or 'EnergieRenouvelable' not in obj:
                    updated_data[prop_name] = obj
            
            print(f"Update successful: {updated_data}")
            return jsonify(updated_data)

        except Exception as e:
            error_msg = f'Error updating energy source: {str(e)}'
            print(error_msg)
            import traceback
            traceback.print_exc()
            return jsonify({'error': error_msg}), 500

    def delete(self, uri):
        try:
            print(f"Deleting energie with URI: {uri}")
            success = self.manager.delete(uri)
            if not success:
                print(f"Failed to delete energy source: {uri}")
                return jsonify({'error': 'Failed to delete energy source'}), 400
            print(f"Successfully deleted: {uri}")
            return jsonify({'message': 'Energy source deleted successfully'})
        except Exception as e:
            print(f"Error in delete: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500