from flask import jsonify, request
from models.empreinte_carbone import EmpreinteCarbone
from Mangage.sparql_manager import SPARQLManager
from config import NAMESPACE
from utils.file_upload import save_uploaded_file, delete_file, get_file_url

class EmpreinteCarboneController:
    def __init__(self):
        
        self.manager = SPARQLManager()

    def create(self, data=None, image_file=None):
        try:
            if data is None:
                data = request.get_json()
            
            # Validation - handle string-to-number conversion for FormData
            if 'valeur_co2_kg' in data:
                try:
                    data['valeur_co2_kg'] = float(str(data['valeur_co2_kg']))
                except (ValueError, TypeError):
                    return jsonify({'error': 'Invalid input for valeur_co2_kg. Must be a number.'}), 400
            else:
                return jsonify({'error': 'Missing required field: valeur_co2_kg is required'}), 400
            
            if not data.get('name'):
                return jsonify({'error': 'Missing required field: name is required'}), 400
            
            if len(data.get('name', '')) > 255:
                return jsonify({'error': 'Name field must be 255 characters or less'}), 400
            
            if data.get('description') and len(data.get('description', '')) > 1000:
                return jsonify({'error': 'Description field must be 1000 characters or less'}), 400
            
            # Handle image upload if provided
            image_filename = None
            if image_file:
                # Handle file upload
                image_filename, error = save_uploaded_file(image_file)
                if error:
                    return jsonify({'error': error}), 400
            elif data.get('image'):
                # If image URL is provided instead of file upload
                image_filename = data.get('image')
            
            empreinte = EmpreinteCarbone(
                valeur_co2_kg=data['valeur_co2_kg'],
                name=data.get('name'),
                description=data.get('description'),
                image=image_filename
            )
            result = self.manager.create(empreinte)
            
            empreinte_dict = empreinte.to_dict()
            if empreinte.uri and 'EmpreinteCarbone_' in empreinte.uri:
                empreinte_dict['id'] = empreinte.uri.split('EmpreinteCarbone_')[1]
            
            # Return image URL if exists
            if empreinte_dict.get('image'):
                empreinte_dict['image'] = get_file_url(empreinte_dict['image'])
            
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
                    # Extract ID from URI - handle both patterns
                    if 'EmpreinteCarbone_' in subj:
                        resources[subj]['id'] = subj.split('EmpreinteCarbone_')[1]
                    elif 'Empreinte_' in subj:
                        resources[subj]['id'] = subj.split('Empreinte_')[1]
                    elif '#' in subj:
                        # Last resort: use the part after #
                        resources[subj]['id'] = subj.split('#')[-1]
                
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                # Handle different property names
                if prop_name in ['valeur_co2_kg', 'valeurCO2kg']:
                    try:
                        resources[subj]['valeur_co2_kg'] = float(obj)
                    except ValueError:
                        resources[subj]['valeur_co2_kg'] = obj
                elif prop_name in ['name', 'description', 'image']:
                    resources[subj][prop_name] = obj
                elif prop_name != 'type' or 'EmpreinteCarbone' not in obj:
                    # Store other properties as-is
                    if prop_name != 'type':
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
            
            # Extract ID from URI - handle both patterns
            if 'EmpreinteCarbone_' in uri:
                empreinte_data['id'] = uri.split('EmpreinteCarbone_')[1]
            elif 'Empreinte_' in uri:
                empreinte_data['id'] = uri.split('Empreinte_')[1]
            elif '#' in uri:
                empreinte_data['id'] = uri.split('#')[-1]
            
            for binding in results:
                pred = binding.get('p', {}).get('value')
                obj = binding.get('o', {}).get('value')
                if not pred or not obj:
                    continue
                prop_name = pred.split('#')[-1] if '#' in pred else pred.split('/')[-1]
                
                # Handle different property names
                if prop_name in ['valeur_co2_kg', 'valeurCO2kg']:
                    try:
                        empreinte_data['valeur_co2_kg'] = float(obj)
                    except ValueError:
                        empreinte_data['valeur_co2_kg'] = obj
                elif prop_name in ['name', 'description', 'image']:
                    empreinte_data[prop_name] = obj
                elif prop_name != 'type' or 'EmpreinteCarbone' not in obj:
                    if prop_name != 'type':
                        empreinte_data[prop_name] = obj
            
            return jsonify(empreinte_data)
        except Exception as e:
            print(f"Error in get: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500

    def update(self, uri, image_file=None, form_data=None):
        try:
            # Handle different content types properly
            if image_file or form_data:
                # FormData case
                data = form_data or request.form.to_dict()
            else:
                # JSON case - only try to parse if content type is application/json
                if request.content_type and 'application/json' in request.content_type:
                    data = request.get_json()
                else:
                    # Try to get form data as fallback
                    data = request.form.to_dict() if request.form else request.get_json(silent=True)
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            current = self.manager.get_by_uri(uri)
            if not current or 'error' in current:
                return jsonify({'error': 'Empreinte Carbone not found for update'}), 404

            updates = []
            if 'valeur_co2_kg' in data:
                if data['valeur_co2_kg'] is None:
                    return jsonify({'error': 'Invalid input for valeur_co2_kg. Must be a number.'}), 400
                # Convert string to float for FormData compatibility
                try:
                    data['valeur_co2_kg'] = float(str(data['valeur_co2_kg']))
                except (ValueError, TypeError):
                    return jsonify({'error': 'Invalid input for valeur_co2_kg. Must be a number.'}), 400
                updates.append(('valeur_co2_kg', data['valeur_co2_kg']))
            
            if 'name' in data:
                if not data['name'] or not isinstance(data['name'], str):
                    return jsonify({'error': 'Invalid input for name. Must be a non-empty string.'}), 400
                if len(data['name']) > 255:
                    return jsonify({'error': 'Name field must be 255 characters or less'}), 400
                updates.append(('name', data['name']))
            
            if 'description' in data:
                if data['description'] is not None and not isinstance(data['description'], str):
                    return jsonify({'error': 'Invalid input for description. Must be a string or null.'}), 400
                if data['description'] and len(data['description']) > 1000:
                    return jsonify({'error': 'Description field must be 1000 characters or less'}), 400
                updates.append(('description', data['description']))
            
            # Handle image upload/update
            if image_file:
                # Save new image
                image_filename, error = save_uploaded_file(image_file)
                if error:
                    return jsonify({'error': error}), 400
                updates.append(('image', image_filename))
            elif 'image' in data:
                if data['image'] is not None and not isinstance(data['image'], str):
                    return jsonify({'error': 'Invalid input for image. Must be a string URL or null.'}), 400
                updates.append(('image', data['image']))

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
                
                if prop_name in ['name', 'description', 'image']:
                    updated_data[prop_name] = obj
                elif prop_name != 'type' or 'EmpreinteCarbone' not in obj:
                    updated_data[prop_name] = obj
            
            # Return image URL if exists
            if updated_data.get('image'):
                updated_data['image'] = get_file_url(updated_data['image'])
            
            return jsonify({'message': 'Empreinte Carbone updated successfully', 'data': updated_data})

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