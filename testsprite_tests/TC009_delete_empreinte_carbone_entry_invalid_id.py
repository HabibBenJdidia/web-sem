import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_delete_empreinte_carbone_entry_invalid_id():
    invalid_id = "nonexistent-id-12345"
    url = f"{BASE_URL}/api/empreinte_carbone/{invalid_id}"
    try:
        response = requests.delete(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 404, f"Expected status 404 but got {response.status_code}"
    try:
        body = response.json()
    except ValueError:
        assert False, "Response body is not valid JSON"

    # Check that response body indicates entry was not found
    # The exact message is not defined, so check for typical keys or messages
    not_found_messages = [
        "not found",
        "Entry not found",
        "empreinte carbone not found",
        "does not exist"
    ]
    body_str = str(body).lower()
    assert any(msg in body_str for msg in map(str.lower, not_found_messages)), \
        f"Response body does not indicate entry not found: {body}"

test_delete_empreinte_carbone_entry_invalid_id()