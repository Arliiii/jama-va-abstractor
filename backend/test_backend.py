#!/usr/bin/env python3
"""
Simple test script to verify the JAMA VA Abstractor backend is working correctly.
Run this after setting up the backend to ensure all components are functioning.
"""

import requests
import json
import time
import sys
import os

# Configuration
BASE_URL = "http://localhost:8000"
TEST_URL = "https://jamanetwork.com/journals/jama/fullarticle/2812685"

def test_health_check():
    """Test the health endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running on localhost:8000?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_article_processing():
    """Test article processing with a sample JAMA URL"""
    print("\n🚀 Testing article processing...")
    
    # Start processing
    try:
        data = {"article_url": TEST_URL}
        response = requests.post(f"{BASE_URL}/process-article", json=data)
        
        if response.status_code != 200:
            print(f"❌ Failed to start processing: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        result = response.json()
        job_id = result.get("job_id")
        
        if not job_id:
            print("❌ No job ID returned")
            return False
            
        print(f"✅ Processing started with job ID: {job_id}")
        
        # Monitor progress
        print("⏳ Monitoring progress...")
        max_attempts = 60  # 5 minutes timeout
        
        for attempt in range(max_attempts):
            try:
                status_response = requests.get(f"{BASE_URL}/job-status/{job_id}")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    current_status = status_data.get("status")
                    print(f"   Status: {current_status}")
                    
                    if current_status == "completed":
                        print("✅ Processing completed successfully!")
                        return True
                    elif current_status == "failed":
                        error_msg = status_data.get("error", "Unknown error")
                        print(f"❌ Processing failed: {error_msg}")
                        return False
                        
                time.sleep(5)  # Wait 5 seconds between checks
                
            except Exception as e:
                print(f"⚠️ Error checking status: {e}")
                
        print("❌ Processing timed out")
        return False
        
    except Exception as e:
        print(f"❌ Article processing error: {e}")
        return False

def test_environment():
    """Test environment configuration"""
    print("\n🔧 Testing environment configuration...")
    
    # Check if .env file exists
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        print("⚠️ .env file not found - this is okay if using environment variables")
    else:
        print("✅ .env file found")
    
    # Check if Gemini API key is configured (we can't directly check the key)
    print("ℹ️ Make sure GEMINI_API_KEY is configured in your environment")
    return True

def main():
    """Run all tests"""
    print("🧪 JAMA VA Abstractor Backend Test Suite")
    print("=" * 50)
    
    # Test environment
    if not test_environment():
        print("\n❌ Environment test failed")
        sys.exit(1)
    
    # Test health check
    if not test_health_check():
        print("\n❌ Backend is not responding. Please check:")
        print("   1. Backend server is running (uvicorn main:app --reload)")
        print("   2. Server is on the correct port (8000)")
        print("   3. No firewall blocking the connection")
        sys.exit(1)
    
    # Test article processing (optional - requires Gemini API key)
    print("\n📝 Article processing test requires Gemini API key.")
    user_input = input("Run article processing test? (y/N): ").lower().strip()
    
    if user_input == 'y':
        if not test_article_processing():
            print("\n❌ Article processing test failed. Check:")
            print("   1. Gemini API key is correctly configured")
            print("   2. Gemini API account has sufficient quota")
            print("   3. Internet connection for web scraping")
            sys.exit(1)
    else:
        print("⏭️ Skipping article processing test")
    
    print("\n🎉 All tests passed! Your backend is ready to use.")
    print("\nNext steps:")
    print("1. Start the frontend with: npm run dev")
    print("2. Open http://localhost:5173 in your browser")
    print("3. Try processing a JAMA article!")

if __name__ == "__main__":
    main()