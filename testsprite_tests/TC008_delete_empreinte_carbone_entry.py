import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}


def test_delete_empreinte_carbone_entry():
    # First create a resource to ensure we have a valid ID to delete
    create_payload = {"valeur_co2_kg": 12.34}
    response_create = requests.post(f"{BASE_URL}/api/empreinte_carbone", json=create_payload, headers=HEADERS, timeout=TIMEOUT)
    assert response_create.status_code == 201, f"Creation failed with status {response_create.status_code}"
    created_data = response_create.json()
    # EmpreinteCarbone created successfully should contain an 'id' or similar in response
    # Since the PRD does not specify the exact response body structure, we assume an 'id' field exists
    resource_id = created_data.get("id")
    assert resource_id, "Created resource ID not present in response"

    try:
        # Now test deleting the created resource
        response_delete = requests.delete(f"{BASE_URL}/api/empreinte_carbone/{resource_id}", headers=HEADERS, timeout=TIMEOUT)
        assert response_delete.status_code == 200, f"Delete failed with status {response_delete.status_code}"
        delete_response = response_delete.json()
        # Confirm the deletion via response body content - assume it contains a confirmation message or deleted id
        assert "deleted" in str(delete_response).lower() or resource_id in str(delete_response), "Deletion confirmation missing in response"
    finally:
        # Cleanup: ensure the resource is deleted in case delete request failed
        requests.delete(f"{BASE_URL}/api/empreinte_carbone/{resource_id}", headers=HEADERS, timeout=TIMEOUT)


test_delete_empreinte_carbone_entry()