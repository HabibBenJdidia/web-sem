import requests

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_retrieve_single_empreinte_carbone_entry():
    create_url = f"{BASE_URL}/api/empreinte_carbone"
    sample_payload = {"valeur_co2_kg": 42.0}

    # Create a new resource first to have a valid ID for retrieval
    response_create = requests.post(create_url, json=sample_payload, headers=HEADERS, timeout=TIMEOUT)
    assert response_create.status_code == 201, f"Failed to create resource, status code: {response_create.status_code}"
    created_entry = response_create.json()
    # Assume the response returns the created resource with an 'id' field
    entry_id = created_entry.get("id")
    assert entry_id is not None, "Created resource does not have an 'id' field"

    get_url = f"{BASE_URL}/api/empreinte_carbone/{entry_id}"
    try:
        response_get = requests.get(get_url, headers=HEADERS, timeout=TIMEOUT)
        assert response_get.status_code == 200, f"GET request failed with status code {response_get.status_code}"
        retrieved_entry = response_get.json()
        # Validate that the retrieved entry matches the created data
        assert retrieved_entry.get("id") == entry_id, "The retrieved entry ID does not match the requested ID"
        assert "valeur_co2_kg" in retrieved_entry, "The retrieved entry does not contain 'valeur_co2_kg'"
        # Check if 'valeur_co2_kg' can be converted to a float and matches the original
        try:
            valeur_co2 = float(retrieved_entry["valeur_co2_kg"])
        except (ValueError, TypeError):
            assert False, "'valeur_co2_kg' is not a number"
        assert valeur_co2 == sample_payload["valeur_co2_kg"], "Carbon emission value does not match"
    finally:
        # Clean up: delete the created resource
        delete_url = f"{BASE_URL}/api/empreinte_carbone/{entry_id}"
        requests.delete(delete_url, headers=HEADERS, timeout=TIMEOUT)

test_retrieve_single_empreinte_carbone_entry()
