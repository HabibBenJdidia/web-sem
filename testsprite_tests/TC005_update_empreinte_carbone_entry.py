import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_update_empreinte_carbone_entry():
    # First, create a new EmpreinteCarbone entry to update
    create_url = f"{BASE_URL}/api/empreinte_carbone"
    create_payload = {"valeur_co2_kg": 10.5}
    created_id = None

    try:
        create_response = requests.post(create_url, json=create_payload, timeout=TIMEOUT)
        assert create_response.status_code == 201, f"Expected 201 on creation but got {create_response.status_code}"
        create_data = create_response.json()
        # Try to find the id in the response; assume it contains the created resource including its id
        # Find an identifier key in create_data; guessing 'id' or '_id'
        # Fallback: if no id field, fail
        if isinstance(create_data, dict):
            if "id" in create_data:
                created_id = create_data["id"]
            elif "_id" in create_data:
                created_id = create_data["_id"]
            else:
                # If no id, try to get from Location header
                location = create_response.headers.get("Location")
                if location and location.strip():
                    created_id = location.rstrip("/").split("/")[-1]
        assert created_id, "Created resource ID not found in response."

        # Prepare update payload with a new carbon emission value
        update_url = f"{BASE_URL}/api/empreinte_carbone/{created_id}"
        update_payload = {"valeur_co2_kg": 20.75}

        update_response = requests.put(update_url, json=update_payload, timeout=TIMEOUT)
        assert update_response.status_code == 200, f"Expected 200 on update but got {update_response.status_code}"

        update_data = update_response.json()
        # Confirm that response body confirms the update, e.g. contains updated value or success message
        assert isinstance(update_data, dict), "Update response is not a JSON object"
        # Check updated value present and correct in response, if returned
        # If response contains the updated resource or message
        valeur = update_data.get("valeur_co2_kg")
        if valeur is not None:
            assert abs(valeur - update_payload["valeur_co2_kg"]) < 1e-6, "Updated valeur_co2_kg does not match"
        else:
            # Otherwise, check a success message or confirmation field
            success_message = update_data.get("message") or update_data.get("detail") or ""
            assert "update" in success_message.lower() or "success" in success_message.lower(), "Update confirmation missing in response"

    finally:
        # Cleanup: delete the created entry if it was created
        if created_id:
            delete_url = f"{BASE_URL}/api/empreinte_carbone/{created_id}"
            try:
                requests.delete(delete_url, timeout=TIMEOUT)
            except Exception:
                pass


test_update_empreinte_carbone_entry()