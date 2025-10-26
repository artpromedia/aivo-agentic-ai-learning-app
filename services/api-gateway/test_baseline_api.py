"""
Test Baseline Assessment API
"""
import requests
import json

BASE_URL = "http://localhost:9000"

def test_start_session():
    """Test starting a new baseline assessment session"""
    print("\n🧪 Test 1: Start Assessment Session")
    print("=" * 60)
    
    response = requests.post(
        f"{BASE_URL}/api/v1/baseline/start-session",
        json={
            "learner_id": "test-learner-001",
            "grade_band": "K-5",
            "audio_enabled": False,
            "tts_enabled": True
        }
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Session Created: {data['session_id']}")
        print(f"   Current Domain: {data['current_domain']}")
        print(f"   First Item: {data['first_item']['stem'][:50]}...")
        print(f"   Initial Theta (reading): {data['ability_estimates']['reading']}")
        return data['session_id'], data['first_item']['id']
    else:
        print(f"❌ Error: {response.text}")
        return None, None

def test_submit_response(session_id, item_id):
    """Test submitting an item response"""
    print("\n🧪 Test 2: Submit Response")
    print("=" * 60)
    
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    start = now - timedelta(seconds=15)
    
    response = requests.post(
        f"{BASE_URL}/api/v1/baseline/submit-response",
        json={
            "session_id": session_id,
            "item_id": item_id,
            "response": {
                "selectedOptions": ["yes"],
                "selfRating": "easy"
            },
            "engagement_metrics": {
                "hesitationCount": 0,
                "focusLevel": "high"
            },
            "time_started": start.isoformat() + "Z",
            "time_submitted": now.isoformat() + "Z"
        }
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Response Scored")
        print(f"   Correct: {data['correct']}")
        print(f"   Score: {data['score']}/{data['max_score']}")
        print(f"   Updated Theta: {data['updated_theta']:.3f}")
        print(f"   Updated SE: {data['updated_se']:.3f}")
        if data['next_item']:
            print(f"   Next Item: {data['next_item']['stem'][:50]}...")
        if data['assessment_complete']:
            print("   🎉 Assessment Complete!")
    else:
        print(f"❌ Error: {response.text}")

def test_get_session(session_id):
    """Test getting session status"""
    print("\n🧪 Test 3: Get Session Status")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/api/v1/baseline/session/{session_id}")
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Session Status")
        print(f"   Status: {data['status']}")
        print(f"   Current Domain: {data['current_domain']}")
        print(f"   Items Answered: {data['items_answered']}")
        print(f"   Domains Completed: {data['domains_completed']}")
    else:
        print(f"❌ Error: {response.text}")

def test_get_items():
    """Test getting domain items"""
    print("\n🧪 Test 4: Get Domain Items")
    print("=" * 60)
    
    response = requests.get(f"{BASE_URL}/api/v1/baseline/items/reading/K-5")
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Retrieved Items")
        print(f"   Domain: {data['domain']}")
        print(f"   Grade Band: {data['grade_band']}")
        print(f"   Item Count: {data['item_count']}")
        if data['items']:
            print(f"\n   Sample Items:")
            for item in data['items'][:3]:
                print(f"   • {item['stem'][:50]}... (b={item['difficulty']:.2f})")
    else:
        print(f"❌ Error: {response.text}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 BASELINE ASSESSMENT API TESTS")
    print("=" * 60)
    
    # Check if server is running
    try:
        health = requests.get(f"{BASE_URL}/health")
        if health.status_code == 200:
            print("✅ API Gateway is running")
        else:
            print("❌ API Gateway health check failed")
            exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API Gateway at http://localhost:9000")
        print("   Please start the server first:")
        print("   cd services/api-gateway && python -m uvicorn app.main:app --reload --port 9000")
        exit(1)
    
    # Run tests
    test_get_items()
    session_id, item_id = test_start_session()
    
    if session_id and item_id:
        test_submit_response(session_id, item_id)
        test_get_session(session_id)
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60 + "\n")
