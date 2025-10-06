"""
Test PowerPoint generation after fixing SlideLayout width issue
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from speckit.pipeline.ppt_generator import VAPowerPointGenerator

def test_ppt_generation():
    """Test PowerPoint generation with fixed slide dimensions"""
    print("🔧 Testing PowerPoint Generation Fix...")
    print("=" * 50)
    
    # Test data
    test_summaries = {
        "title": "Digital Health Interventions for Cardiovascular Risk Reduction",
        "population": "500 veterans aged 50-75 with hypertension",
        "intervention": "Mobile app with daily BP monitoring and coaching",
        "setting": "VA community health centers nationwide",
        "primary_outcome": "Systolic blood pressure reduction at 12 weeks",
        "findings": "Mean 8.5 mmHg reduction (95% CI: 6.2-10.8, p<0.001). Clinically significant improvement in cardiovascular risk profile with 78% user engagement rate.",
        "va_summary": "Mobile health intervention significantly reduces BP in veteran population with high user engagement and clinical benefit."
    }
    
    try:
        generator = VAPowerPointGenerator()
        result = generator.generate_presentation(test_summaries, "cardiology", "test_fix_123")
        
        if result["success"]:
            print("✅ PowerPoint generation SUCCESSFUL!")
            print(f"   Filename: {result['filename']}")
            print(f"   File size: {result['file_size']} bytes")
            print(f"   File path: {result['file_path']}")
            
            # Check if file actually exists
            if os.path.exists(result['file_path']):
                print("✅ File exists on disk!")
            else:
                print("❌ File not found on disk!")
                
        else:
            print("❌ PowerPoint generation FAILED!")
            print(f"   Error: {result.get('message', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Exception during generation: {str(e)}")
        import traceback
        print(f"   Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    test_ppt_generation()