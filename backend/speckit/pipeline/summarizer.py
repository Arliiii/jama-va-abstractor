import os
from typing import Dict, Any, List
import asyncio
import json
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from gemini_service import get_gemini_service, GeminiService

class AISummarizer:
    def __init__(self):
        # Initialize Gemini service
        self.gemini_service = get_gemini_service()
        
        # Check if Gemini is available
        if self.gemini_service.is_available():
            print("Gemini API service initialized successfully.")
        else:
            print("Warning: No valid Gemini API key found. Using mock responses.")
        
        # Define word limits for VA template fields
        self.word_limits = {
            "title": 15,
            "population": 25,
            "intervention": 30,
            "setting": 20,
            "primary_outcome": 25,
            "findings": 40
        }
        
        # Medical icon categories
        self.medical_icons = {
            'cardiology': '🫀',
            'neurology': '🧠', 
            'oncology': '🎗️',
            'infectious_disease': '🦠',
            'surgery': '🏥',
            'pharmacy': '💊',
            'endocrinology': '🩺',
            'pulmonology': '🫁',
            'psychiatry': '🧘',
            'orthopedics': '🦴',
            'dermatology': '🧴',
            'gastroenterology': '🫄',
            'general_medicine': '⚕️'
        }
    
    async def summarize(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Summarize extracted data to meet VA template requirements
        """
        try:
            summaries = {}
            
            # Summarize each field that has content
            for field, word_limit in self.word_limits.items():
                if extracted_data.get(field):
                    summary = await self.summarize_field(
                        field, 
                        extracted_data[field], 
                        word_limit
                    )
                    summaries[field] = summary
            
            # Select appropriate medical icon
            medical_icon = await self.select_medical_icon(extracted_data)
            
            # Generate additional VA-specific content
            va_summary = await self.generate_va_summary(summaries)
            
            return {
                "success": True,
                "summaries": summaries,
                "medical_icon": medical_icon,
                "va_summary": va_summary,
                "icon_emoji": self.medical_icons.get(medical_icon, self.medical_icons['general_medicine'])
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"AI summarization failed: {str(e)}",
                "error_type": "summarization_error"
            }


    
    async def summarize_field(self, field_name: str, content: Any, word_limit: int) -> str:
        """Summarize a specific field with AI"""
        
        # Handle different content types
        if isinstance(content, list):
            content_text = ". ".join(str(item) for item in content)
        else:
            content_text = str(content)
        
        # Limit input content length to avoid token limits
        if len(content_text) > 2000:
            content_text = content_text[:2000] + "..."
        
        # Create field-specific prompts
        prompts = {
            "title": f"""
            Shorten this medical study title to {word_limit} words maximum while keeping the key clinical focus:
            
            Title: {content_text}
            
            Shortened title:""",
            
            "population": f"""
            Summarize this study population in {word_limit} words maximum for a VA medical abstract. Focus on sample size, demographics, and key inclusion criteria:
            
            Population: {content_text}
            
            Summary:""",
            
            "intervention": f"""
            Summarize this medical intervention in {word_limit} words maximum for a VA abstract. Focus on treatment type, duration, and key details:
            
            Intervention: {content_text}
            
            Summary:""",
            
            "setting": f"""
            Summarize this study setting in {word_limit} words maximum. Focus on location type and key characteristics:
            
            Setting: {content_text}
            
            Summary:""",
            
            "primary_outcome": f"""
            Summarize this primary outcome measure in {word_limit} words maximum. Focus on what was measured and when:
            
            Primary Outcome: {content_text}
            
            Summary:""",
            
            "findings": f"""
            Summarize these key findings in {word_limit} words maximum for a VA abstract. Focus on the most clinically significant results with statistics if available:
            
            Findings: {content_text}
            
            Summary:"""
        }
        
        prompt = prompts.get(field_name, f"Summarize this {field_name} in {word_limit} words maximum: {content_text}")
        
        try:
            # Use Gemini service for summarization
            response = await self.gemini_service.generate_text(
                prompt=prompt,
                system_instruction="You are a medical writing expert specializing in VA-style clinical abstracts. Provide concise, accurate summaries that maintain clinical precision.",
                max_tokens=word_limit * 3,  # Allow some buffer
                temperature=0.3  # Lower temperature for more consistent results
            )
            
            if not response.success:
                raise Exception(f"Gemini API error: {response.error}")
            
            summary = response.content.strip()
            
            # Ensure word limit compliance
            words = summary.split()
            if len(words) > word_limit:
                summary = " ".join(words[:word_limit])
            
            return summary
            
        except Exception as e:
            # Fallback: simple truncation if AI fails
            words = content_text.split()[:word_limit]
            return " ".join(words)
    
    async def select_medical_icon(self, data: Dict[str, Any]) -> str:
        """Select appropriate medical icon based on study content"""
        
        # Combine relevant content for analysis
        content_parts = []
        for field in ['title', 'intervention', 'primary_outcome', 'findings']:
            value = data.get(field)
            if value:
                if isinstance(value, list):
                    content_parts.append(" ".join(str(item) for item in value))
                else:
                    content_parts.append(str(value))
        
        combined_content = " ".join(content_parts)[:1000]  # Limit length
        
        if not combined_content.strip():
            return 'general_medicine'
        
        # Create icon selection prompt
        icon_categories = list(self.medical_icons.keys())
        prompt = f"""
        Based on this medical study content, select the most appropriate medical specialty category:
        
        Content: {combined_content}
        
        Available categories:
        {', '.join(icon_categories)}
        
        Consider the main medical focus, intervention type, and primary outcomes.
        
        Return only the category name (e.g., "cardiology", "neurology", etc.):
        """
        
        try:
            # Use Gemini service for medical icon selection
            response = await self.gemini_service.generate_text(
                prompt=prompt,
                system_instruction="You are a medical specialist classifier. Analyze study content and select the most appropriate medical specialty category.",
                max_tokens=20,
                temperature=0.1
            )
            
            if not response.success:
                return self.keyword_based_icon_selection(combined_content)
            
            selected_category = response.content.strip().lower()
            
            # Validate the response
            if selected_category in self.medical_icons:
                return selected_category
            else:
                # Fallback logic based on keywords
                return self.keyword_based_icon_selection(combined_content)
                
        except Exception:
            # Fallback to keyword-based selection
            return self.keyword_based_icon_selection(combined_content)
    
    def keyword_based_icon_selection(self, content: str) -> str:
        """Fallback method for icon selection using keywords"""
        content_lower = content.lower()
        
        keyword_mappings = {
            'cardiology': ['heart', 'cardiac', 'cardiovascular', 'blood pressure', 'hypertension', 'coronary', 'myocardial'],
            'neurology': ['brain', 'neurological', 'stroke', 'alzheimer', 'parkinson', 'seizure', 'cognitive'],
            'oncology': ['cancer', 'tumor', 'chemotherapy', 'radiation', 'oncology', 'malignant', 'neoplasm'],
            'infectious_disease': ['infection', 'antibiotic', 'virus', 'bacteria', 'antimicrobial', 'sepsis'],
            'surgery': ['surgical', 'operation', 'procedure', 'operative', 'postoperative', 'incision'],
            'pharmacy': ['drug', 'medication', 'pharmaceutical', 'dose', 'dosage', 'therapy'],
            'endocrinology': ['diabetes', 'insulin', 'glucose', 'hormone', 'thyroid', 'endocrine'],
            'pulmonology': ['lung', 'respiratory', 'asthma', 'copd', 'pneumonia', 'breathing'],
            'psychiatry': ['mental health', 'depression', 'anxiety', 'psychiatric', 'psychological'],
            'orthopedics': ['bone', 'joint', 'fracture', 'orthopedic', 'musculoskeletal'],
            'dermatology': ['skin', 'dermatologic', 'rash', 'dermatitis', 'melanoma'],
            'gastroenterology': ['gastric', 'intestinal', 'digestive', 'liver', 'stomach', 'colon']
        }
        
        scores = {}
        for category, keywords in keyword_mappings.items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        return 'general_medicine'
    
    async def generate_va_summary(self, summaries: Dict[str, str]) -> str:
        """Generate a brief VA-style overall summary"""
        
        if not summaries:
            return "Clinical study summary not available."
        
        # Combine key summaries
        key_points = []
        if summaries.get('population'):
            key_points.append(f"Study of {summaries['population']}")
        if summaries.get('intervention'):
            key_points.append(f"using {summaries['intervention']}")
        if summaries.get('findings'):
            key_points.append(f"Found: {summaries['findings']}")
        
        base_summary = ". ".join(key_points)
        
        if len(base_summary) < 50:
            return base_summary
        
        # Use AI to create a cohesive summary
        prompt = f"""
        Create a 2-sentence VA-style clinical summary from these key points:
        
        {base_summary}
        
        Make it professional and concise for a VA medical abstract:
        """
        
        try:
            # Use Gemini service for VA summary generation
            response = await self.gemini_service.generate_text(
                prompt=prompt,
                system_instruction="You are a VA medical writer creating concise clinical summaries.",
                max_tokens=100,
                temperature=0.3
            )
            
            if response.success:
                return response.content.strip()
            else:
                return base_summary[:200]  # Fallback to truncated base summary
            
        except Exception:
            return base_summary[:200]  # Fallback to truncated base summary

# For testing
if __name__ == "__main__":
    async def test_summarizer():
        # Mock data for testing
        test_data = {
            "title": "Effect of Digital Health Interventions on Cardiovascular Risk Factors: A Randomized Clinical Trial",
            "population": "500 adults aged 18-65 with hypertension, recruited from community health centers in Boston, Massachusetts",
            "intervention": "Mobile health application with daily blood pressure monitoring, medication reminders, and lifestyle coaching over 12 weeks",
            "setting": "Community health centers in urban Boston area with telemedicine support",
            "primary_outcome": "Change in systolic blood pressure from baseline to 12 weeks",
            "findings": ["Mean systolic BP decreased by 8.5 mmHg (95% CI: 6.2-10.8, p=0.003)", "Clinically significant reduction in cardiovascular risk observed", "High user engagement with 85% app usage compliance"]
        }
        
        summarizer = AISummarizer()
        result = await summarizer.summarize(test_data)
        
        if result["success"]:
            print("Summarization successful!")
            print(f"Medical Icon: {result['medical_icon']} {result['icon_emoji']}")
            print("\nSummaries:")
            for field, summary in result["summaries"].items():
                print(f"- {field}: {summary}")
            print(f"\nVA Summary: {result['va_summary']}")
        else:
            print(f"Summarization failed: {result['message']}")
    
    # Run test with Gemini API (will use mock if no API key)
    asyncio.run(test_summarizer())