import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_retrieve_single_empreinte_carbone_entry_invalid_id():
    invalid_id = "nonexistent-id-12345"
    url = f"{BASE_URL}/api/empreinte_carbone/{invalid_id}"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 404, f"Expected status code 404 but got {response.status_code}"
        json_response = response.json()
        # The response body should indicate the entry was not found. 
        # We check for common keys/messages.
        assert (
            "not found" in response.text.lower() or 
            "error" in json_response or 
            "message" in json_response or 
            "detail" in json_response
        ), "Response body does not indicate that the entry was not found."
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_retrieve_single_empreinte_carbone_entry_invalid_id()