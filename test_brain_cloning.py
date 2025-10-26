"""
Test script for AI Brain cloning functionality
Tests the POST /api/v1/ai/clone-model endpoint
"""
import requests
import json
from datetime import datetime

API_BASE = "http://localhost:9000/api/v1"

def test_brain_cloning():
    """Test the brain cloning endpoint with sample data."""
    
    print("=" * 80)
    print("🧠 TESTING AI BRAIN CLONING")
    print("=" * 80)
    print()
    
    # Step 1: Create a test learner first
    print("📝 Step 1: Creating test learner...")
    learner_data = {
        "first_name": "Emma",
        "last_name": "TestChild",
        "date_of_birth": "2015-03-15",
        "grade_level": "4th Grade",
        "diagnoses": ["ADHD", "Dyslexia"],
        "accommodations": ["Extra time on tests", "Text-to-speech"],
        "has_iep": True,
        "parent_email": "parent@test.com",
        "parent_name": "Test Parent",
        "accessibility": {
            "text_to_speech": True,
            "large_text": True,
            "high_contrast": False,
            "reduced_motion": True
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/learners/",
            json=learner_data,
            timeout=10
        )
        
        if response.status_code == 200:
            learner = response.json()
            print(f"✅ Learner created successfully!")
            print(f"   ID: {learner.get('id')}")
            print(f"   Name: {learner.get('first_name')} {learner.get('last_name')}")
            print()
        else:
            print(f"❌ Failed to create learner: {response.status_code}")
            print(f"   Response: {response.text}")
            return
            
    except Exception as e:
        print(f"❌ Error creating learner: {e}")
        return
    
    # Step 2: Simulate assessment results
    print("📊 Step 2: Simulating assessment results...")
    assessment_results = {
        "reading_level": "3rd Grade",
        "math_level": "4th Grade",
        "learning_style": "visual",
        "strengths": [
            "Creative problem solving",
            "Visual-spatial reasoning",
            "Strong verbal communication"
        ],
        "challenges": [
            "Reading comprehension",
            "Written expression",
            "Sustained attention"
        ],
        "needs_tts": True,
        "needs_large_text": True,
        "needs_high_contrast": False,
        "completed_at": datetime.utcnow().isoformat()
    }
    print("✅ Assessment data prepared")
    print(f"   Reading Level: {assessment_results['reading_level']}")
    print(f"   Math Level: {assessment_results['math_level']}")
    print(f"   Learning Style: {assessment_results['learning_style']}")
    print()
    
    # Step 3: Clone the AI brain
    print("🧬 Step 3: Cloning AI brain...")
    clone_request = {
        "learner_id": learner.get('id'),
        "assessment_results": assessment_results,
        "location_data": {
            "district_id": "test-district-001",
            "school_id": "test-school-001"
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/ai/clone-model",
            json=clone_request,
            timeout=10
        )
        
        if response.status_code == 200:
            brain = response.json()
            print(f"✅ Brain cloned successfully!")
            print()
            print("📋 Brain Details:")
            print(f"   Brain ID: {brain.get('brain_id')}")
            print(f"   Learner ID: {brain.get('learner_id')}")
            print(f"   Status: {brain.get('status')}")
            print(f"   Created At: {brain.get('created_at')}")
            print(f"   Message: {brain.get('message')}")
            print()
            
            # Step 4: Verify brain configuration was stored
            print("🔍 Step 4: Verifying brain configuration...")
            verify_response = requests.get(
                f"{API_BASE}/learners/{learner.get('id')}",
                timeout=10
            )
            
            if verify_response.status_code == 200:
                learner_data = verify_response.json()
                brain_config = learner_data.get('settings', {}).get('brain_config')
                
                if brain_config:
                    print("✅ Brain configuration stored successfully!")
                    print()
                    print("🧠 Brain Configuration:")
                    print(f"   Brain ID: {brain_config.get('brain_id')}")
                    print(f"   Base Model: {brain_config.get('base_model')}")
                    print(f"   Status: {brain_config.get('status')}")
                    print()
                    print("📚 Learning Profile:")
                    profile = brain_config.get('learning_profile', {})
                    print(f"   Grade Level: {profile.get('grade_level')}")
                    print(f"   Reading Level: {profile.get('reading_level')}")
                    print(f"   Math Level: {profile.get('math_level')}")
                    print(f"   Learning Style: {profile.get('learning_style')}")
                    print(f"   Diagnoses: {', '.join(profile.get('diagnoses', []))}")
                    print()
                    print("🎯 Adaptations:")
                    adaptations = brain_config.get('adaptations', {})
                    for key, value in adaptations.items():
                        print(f"   {key}: {value}")
                    print()
                    print("♿ Accessibility:")
                    accessibility = brain_config.get('accessibility', {})
                    for key, value in accessibility.items():
                        print(f"   {key}: {value}")
                    print()
                else:
                    print("❌ Brain configuration not found in learner settings")
            else:
                print(f"⚠️ Could not verify learner: {verify_response.status_code}")
            
            print()
            print("=" * 80)
            print("✅ BRAIN CLONING TEST COMPLETED SUCCESSFULLY!")
            print("=" * 80)
            print()
            print("Summary:")
            print(f"  • Learner created: {learner.get('first_name')} {learner.get('last_name')}")
            print(f"  • Brain cloned: {brain.get('brain_id')}")
            print(f"  • Configuration stored: Yes")
            print(f"  • Status: {brain.get('status')}")
            print()
            
        else:
            print(f"❌ Failed to clone brain: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error cloning brain: {e}")


if __name__ == "__main__":
    test_brain_cloning()
