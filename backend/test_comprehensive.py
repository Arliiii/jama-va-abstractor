"""
Comprehensive test script to verify all fixes are working
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from speckit.pipeline.scraper import JAMAScraper
from speckit.gemini_service import GeminiService
import traceback

async def test_scraper_fixes():
    """Test the enhanced scraper with all fixes"""
    print("🔧 Testing Enhanced JAMA Scraper...")
    print("=" * 50)
    
    scraper = JAMAScraper()
    
    # Test URLs
    test_urls = [
        "https://jamanetwork.com/journals/jama/fullarticle/2813900",
        "https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2812345"
    ]
    
    for i, url in enumerate(test_urls, 1):
        print(f"\n📝 Test {i}: {url}")
        print("-" * 30)
        
        try:
            result = await scraper.scrape_article(url)
            
            if result and result.get('success'):
                print("✅ SUCCESS!")
                print(f"   Title: {result.get('title', 'N/A')[:100]}...")
                print(f"   Content length: {len(result.get('content', ''))}")
                print(f"   Method used: {result.get('method_used', 'Unknown')}")
            else:
                print("❌ FAILED!")
                print(f"   Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ EXCEPTION: {str(e)}")
            print(f"   Traceback: {traceback.format_exc()}")

async def test_gemini_service():
    """Test Gemini service is working"""
    print("\n🤖 Testing Gemini Service...")
    print("=" * 50)
    
    try:
        gemini = GeminiService()
        
        test_prompt = "Summarize this medical finding: Patient presents with chest pain and elevated troponin levels."
        result = await gemini.generate_text(test_prompt)
        
        if result.success:
            print("✅ Gemini Service Working!")
            print(f"   Response: {result.content[:200]}...")
        else:
            print("❌ Gemini Service Failed!")
            print(f"   Error: {result.error}")
            
    except Exception as e:
        print(f"❌ Gemini Exception: {str(e)}")

async def test_backend_startup():
    """Test if backend can start without errors"""
    print("\n🚀 Testing Backend Startup...")
    print("=" * 50)
    
    try:
        # Import main components
        from main import app
        from speckit.pipeline.summarizer import AISummarizer
        
        # Test summarizer initialization
        summarizer = AISummarizer()
        print("✅ Summarizer initialized successfully")
        
        # Test FastAPI app
        print("✅ FastAPI app imported successfully")
        print("✅ Backend startup test passed!")
        
    except Exception as e:
        print(f"❌ Backend startup failed: {str(e)}")
        print(f"   Traceback: {traceback.format_exc()}")

async def main():
    """Run comprehensive tests"""
    print("🔍 JAMA VA Abstractor - Comprehensive Test Suite")
    print("=" * 60)
    
    # Test 1: Gemini Service
    await test_gemini_service()
    
    # Test 2: Backend Startup
    await test_backend_startup()
    
    # Test 3: Enhanced Scraper
    await test_scraper_fixes()
    
    print("\n" + "=" * 60)
    print("🏁 Comprehensive test completed!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())