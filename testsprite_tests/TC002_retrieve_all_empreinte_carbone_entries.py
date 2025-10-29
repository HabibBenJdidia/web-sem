import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_retrieve_all_empreinte_carbone_entries():
    url = f"{BASE_URL}/api/empreinte_carbone"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(data, list), f"Expected response body to be a list, got {type(data)}"

test_retrieve_all_empreinte_carbone_entries()