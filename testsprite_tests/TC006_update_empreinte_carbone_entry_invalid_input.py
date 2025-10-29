import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_update_empreinte_carbone_entry_invalid_input():
    # First create a valid resource to update
    create_payload = {"valeur_co2_kg": 10.5}
    create_response = requests.post(f"{BASE_URL}/api/empreinte_carbone", json=create_payload, headers=HEADERS, timeout=TIMEOUT)
    assert create_response.status_code == 201
    created_data = create_response.json()
    resource_id = created_data.get("id")
    assert resource_id is not None

    try:
        # Test updating with missing 'valeur_co2_kg' (empty payload)
        invalid_payloads = [
            {},  # missing valeur_co2_kg
            {"valeur_co2_kg": None},  # null valeur_co2_kg
            {"valeur_co2_kg": "not-a-number"},  # non-numeric valeur_co2_kg
            {"valeur_co2_kg": ""}  # empty string valeur_co2_kg
        ]
        for payload in invalid_payloads:
            response = requests.put(f"{BASE_URL}/api/empreinte_carbone/{resource_id}", json=payload, headers=HEADERS, timeout=TIMEOUT)
            assert response.status_code == 400
            resp_json = response.json()
            assert any(keyword in str(resp_json).lower() for keyword in ["invalid", "error", "valeur_co2_kg"])
    finally:
        # Clean up by deleting the created resource
        requests.delete(f"{BASE_URL}/api/empreinte_carbone/{resource_id}", headers=HEADERS, timeout=TIMEOUT)

test_update_empreinte_carbone_entry_invalid_input()