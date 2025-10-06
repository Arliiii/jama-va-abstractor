"""
Google Gemini API Service Module
Provides async wrapper for Google Gemini API with error handling and rate limiting
"""

import os
import asyncio
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class GeminiResponse:
    """Structured response from Gemini API"""
    success: bool
    content: str
    error: Optional[str] = None
    usage: Optional[Dict[str, int]] = None

class GeminiService:
    """
    Async service wrapper for Google Gemini API
    Provides error handling, rate limiting, and consistent response format
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini service
        
        Args:
            api_key: Google Gemini API key. If None, reads from GEMINI_API_KEY env var
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        self.model_name = "gemini-2.0-flash"  # Using available model
        self.use_mock = False
        
        if not self.api_key or self.api_key == 'your_gemini_api_key_here':
            logger.warning("No valid Gemini API key found. Using mock responses.")
            self.use_mock = True
            self.model = None
        else:
            try:
                # Configure Gemini
                genai.configure(api_key=self.api_key)
                
                # Initialize model with safety settings
                self.model = genai.GenerativeModel(
                    model_name=self.model_name,
                    safety_settings={
                        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    }
                )
                
                # Generation config for consistent responses
                self.generation_config = genai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=2048,
                    temperature=0.3,
                )
                
                logger.info(f"Gemini service initialized with model: {self.model_name}")
                
            except Exception as e:
                logger.error(f"Failed to initialize Gemini API: {str(e)}")
                self.use_mock = True
                self.model = None
    
    async def generate_text(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.3
    ) -> GeminiResponse:
        """
        Generate text using Gemini API
        
        Args:
            prompt: Input prompt for generation
            system_instruction: System instruction to guide the model
            max_tokens: Maximum tokens to generate
            temperature: Generation temperature (0.0-1.0)
            
        Returns:
            GeminiResponse with generated content or error
        """
        
        if self.use_mock:
            return await self._get_mock_response(prompt)
        
        try:
            # Create full prompt with system instruction if provided
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"System: {system_instruction}\n\nUser: {prompt}"
            
            # Update generation config for this request
            config = genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=min(max_tokens, 2048),  # Respect model limits
                temperature=max(0.0, min(1.0, temperature)),  # Clamp temperature
            )
            
            # Generate content
            response = await asyncio.to_thread(
                self.model.generate_content,
                full_prompt,
                generation_config=config
            )
            
            # Check if response was blocked
            if response.candidates[0].finish_reason.name in ['SAFETY', 'RECITATION']:
                return GeminiResponse(
                    success=False,
                    content="",
                    error=f"Response blocked due to: {response.candidates[0].finish_reason.name}"
                )
            
            # Extract content
            content = response.text.strip()
            
            # Extract usage info if available
            usage = None
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                usage = {
                    'prompt_tokens': response.usage_metadata.prompt_token_count,
                    'completion_tokens': response.usage_metadata.candidates_token_count,
                    'total_tokens': response.usage_metadata.total_token_count
                }
            
            return GeminiResponse(
                success=True,
                content=content,
                usage=usage
            )
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return GeminiResponse(
                success=False,
                content="",
                error=f"API error: {str(e)}"
            )
    
    async def _get_mock_response(self, prompt: str) -> GeminiResponse:
        """
        Generate mock response for development/testing
        
        Args:
            prompt: Input prompt (used to generate relevant mock)
            
        Returns:
            Mock GeminiResponse
        """
        
        # Add small delay to simulate API call
        await asyncio.sleep(0.5)
        
        # Generate contextual mock responses based on prompt content
        prompt_lower = prompt.lower()
        
        # Medical summarization mocks
        if 'summarize' in prompt_lower and 'title' in prompt_lower:
            mock_content = "Clinical Study of Medical Intervention Effects"
        elif 'summarize' in prompt_lower and 'population' in prompt_lower:
            mock_content = "Adult patients aged 18-75 with specific medical condition"
        elif 'summarize' in prompt_lower and 'intervention' in prompt_lower:
            mock_content = "Novel therapeutic approach compared to standard care"
        elif 'summarize' in prompt_lower and 'setting' in prompt_lower:
            mock_content = "Multi-center randomized controlled trial"
        elif 'summarize' in prompt_lower and 'outcome' in prompt_lower:
            mock_content = "Significant improvement in primary endpoint measures"
        elif 'summarize' in prompt_lower and 'findings' in prompt_lower:
            mock_content = "Statistically significant results with clinical relevance and good safety profile"
        
        # Medical specialty classification mocks
        elif 'medical specialty' in prompt_lower or 'category' in prompt_lower:
            mock_content = "general_medicine"
        
        # VA summary mocks
        elif 'va-style' in prompt_lower or 'va summary' in prompt_lower:
            mock_content = "This clinical study demonstrates effective treatment outcomes with favorable safety profile in the target population."
        
        # Generic fallback
        else:
            mock_content = "Mock response for development purposes. Replace with actual Gemini API key for real functionality."
        
        return GeminiResponse(
            success=True,
            content=mock_content,
            usage={'prompt_tokens': 100, 'completion_tokens': 50, 'total_tokens': 150}
        )
    
    async def batch_generate(
        self, 
        prompts: List[str], 
        system_instruction: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.3,
        delay_between_requests: float = 1.0
    ) -> List[GeminiResponse]:
        """
        Generate text for multiple prompts with rate limiting
        
        Args:
            prompts: List of prompts to process
            system_instruction: System instruction for all prompts
            max_tokens: Maximum tokens per response
            temperature: Generation temperature
            delay_between_requests: Delay between API calls to respect rate limits
            
        Returns:
            List of GeminiResponse objects
        """
        
        responses = []
        
        for i, prompt in enumerate(prompts):
            if i > 0:  # Add delay between requests (except for first)
                await asyncio.sleep(delay_between_requests)
            
            response = await self.generate_text(
                prompt=prompt,
                system_instruction=system_instruction,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            responses.append(response)
        
        return responses
    
    def is_available(self) -> bool:
        """Check if Gemini API is properly configured and available"""
        return not self.use_mock and self.model is not None

# Singleton instance for easy import
_gemini_service = None

def get_gemini_service() -> GeminiService:
    """Get singleton instance of GeminiService"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service

# For testing
if __name__ == "__main__":
    async def test_gemini_service():
        """Test the Gemini service with various prompts"""
        
        service = GeminiService()
        
        print(f"Gemini service available: {service.is_available()}")
        print(f"Using mock responses: {service.use_mock}")
        print()
        
        # Test basic generation
        response = await service.generate_text(
            prompt="Summarize this in 15 words: A clinical study showed significant improvement in patient outcomes.",
            system_instruction="You are a medical writing expert specializing in clinical abstracts."
        )
        
        print("Test 1 - Basic generation:")
        print(f"Success: {response.success}")
        print(f"Content: {response.content}")
        if response.usage:
            print(f"Usage: {response.usage}")
        print()
        
        # Test batch generation
        test_prompts = [
            "Classify this medical content: heart disease treatment study",
            "Create a 2-sentence VA summary: Diabetes management with mobile app showed 15% improvement",
        ]
        
        batch_responses = await service.batch_generate(
            prompts=test_prompts,
            system_instruction="You are a medical AI assistant.",
            delay_between_requests=0.5
        )
        
        print("Test 2 - Batch generation:")
        for i, resp in enumerate(batch_responses):
            print(f"  Response {i+1}: {resp.content}")
        print()
    
    # Run test
    asyncio.run(test_gemini_service())