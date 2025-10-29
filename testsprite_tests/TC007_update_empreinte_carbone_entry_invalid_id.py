import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_update_empreinte_carbone_entry_invalid_id():
    invalid_id = "nonexistent-id-12345"
    url = f"{BASE_URL}/api/empreinte_carbone/{invalid_id}"
    payload = {
        "valeur_co2_kg": 50.0
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.put(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 404, f"Expected status code 404, got {response.status_code}"
    # Assert that response body indicates entry not found
    # We will check for typical not found keywords in JSON or text response
    try:
        resp_json = response.json()
        assert any(
            k in resp_json.get("message", "").lower() or k in resp_json.get("error", "").lower()
            for k in ["not found", "not exist", "does not exist", "not found"]
        ), f"Response JSON does not indicate 'not found': {resp_json}"
    except ValueError:
        # If response is not JSON, check text content
        resp_text = response.text.lower()
        assert "not found" in resp_text or "does not exist" in resp_text, f"Response text does not indicate 'not found': {resp_text}"

test_update_empreinte_carbone_entry_invalid_id()