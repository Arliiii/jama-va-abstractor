import asyncio
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import requests
import time
from typing import Dict, Any
import PyPDF2
import io

class JAMAScraper:
    def __init__(self):
        self.setup_chrome_options()
        
    def setup_chrome_options(self):
        """Configure Chrome options for scraping"""
        self.chrome_options = Options()
        self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--window-size=1920,1080")
        self.chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        self.chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Add user agent to appear more like a real browser
        self.chrome_options.add_argument(
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    
    async def scrape_article(self, url: str) -> Dict[str, Any]:
        """
        Scrape JAMA article with multiple fallback strategies
        """
        # Validate URL
        if not self.is_valid_jama_url(url):
            return {
                "success": False,
                "message": "Invalid JAMA URL. Please provide a valid JAMA Network article URL.",
                "error_type": "invalid_url"
            }
        
        # Try Selenium first (primary method)
        try:
            result = await self.scrape_with_selenium(url)
            if result["success"]:
                return result
        except Exception as selenium_error:
            print(f"Selenium failed: {selenium_error}")
        
        # Fallback to requests with headers
        try:
            result = await self.scrape_with_requests(url)
            if result["success"]:
                return result
        except Exception as requests_error:
            print(f"Requests failed: {requests_error}")
        
        # Both methods failed
        return {
            "success": False,
            "message": "Unable to access the article. The content may be behind a paywall or the URL may be incorrect.",
            "error_type": "scraping_failed"
        }
    
    async def scrape_with_selenium(self, url: str) -> Dict[str, Any]:
        """Scrape using Selenium WebDriver"""
        driver = None
        try:
            # Setup ChromeDriver
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=self.chrome_options)
            
            # Navigate to the page
            driver.get(url)
            
            # Wait for the page to load
            wait = WebDriverWait(driver, 15)
            
            # Try to find the main article content
            try:
                # Wait for article content to load
                wait.until(
                    EC.any_of(
                        EC.presence_of_element_located((By.CLASS_NAME, "article-full-text")),
                        EC.presence_of_element_located((By.CLASS_NAME, "article-content")),
                        EC.presence_of_element_located((By.TAG_NAME, "article")),
                    )
                )
            except:
                # Continue even if specific elements aren't found
                pass
            
            # Wait a bit more for dynamic content
            await asyncio.sleep(3)
            
            # Get page content
            page_source = driver.page_source
            page_title = driver.title
            
            # Check if we got meaningful content
            if len(page_source) < 1000:
                raise Exception("Retrieved content is too short, likely blocked")
            
            # Check for paywall indicators
            if self.detect_paywall(page_source):
                return {
                    "success": False,
                    "message": "Article appears to be behind a paywall. Full content access may be restricted.",
                    "error_type": "paywall_detected"
                }
            
            return {
                "success": True,
                "content": page_source,
                "title": page_title,
                "url": url,
                "method": "selenium",
                "content_length": len(page_source)
            }
            
        except Exception as e:
            raise Exception(f"Selenium scraping failed: {str(e)}")
        finally:
            if driver:
                driver.quit()
    
    async def scrape_with_requests(self, url: str) -> Dict[str, Any]:
        """Fallback scraping using requests with headers"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }
        
        session = requests.Session()
        session.headers.update(headers)
        
        try:
            response = session.get(url, timeout=30, allow_redirects=True)
            response.raise_for_status()
            
            content = response.text
            
            # Check content quality
            if len(content) < 1000:
                raise Exception("Retrieved content is too short")
            
            # Check for paywall
            if self.detect_paywall(content):
                return {
                    "success": False,
                    "message": "Article appears to be behind a paywall.",
                    "error_type": "paywall_detected"
                }
            
            return {
                "success": True,
                "content": content,
                "url": url,
                "method": "requests",
                "content_length": len(content),
                "status_code": response.status_code
            }
            
        except requests.RequestException as e:
            raise Exception(f"HTTP request failed: {str(e)}")
    
    async def process_pdf(self, file_path: str) -> Dict[str, Any]:
        """Process uploaded PDF file"""
        try:
            if not os.path.exists(file_path):
                return {
                    "success": False,
                    "message": "PDF file not found",
                    "error_type": "file_not_found"
                }
            
            # Extract text from PDF
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                if len(pdf_reader.pages) == 0:
                    return {
                        "success": False,
                        "message": "PDF file appears to be empty",
                        "error_type": "empty_pdf"
                    }
                
                # Extract text from all pages
                text_content = ""
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text_content += page.extract_text() + "\n"
                
                if len(text_content.strip()) < 100:
                    return {
                        "success": False,
                        "message": "Could not extract readable text from PDF. The file may be an image-based PDF.",
                        "error_type": "text_extraction_failed"
                    }
                
                return {
                    "success": True,
                    "content": text_content,
                    "method": "pdf_extraction",
                    "content_length": len(text_content),
                    "pages": len(pdf_reader.pages)
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"PDF processing failed: {str(e)}",
                "error_type": "pdf_processing_error"
            }
    
    def is_valid_jama_url(self, url: str) -> bool:
        """Check if URL is a valid JAMA Network URL"""
        valid_domains = [
            'jamanetwork.com',
            'jama.jamanetwork.com',
            'archinte.jamanetwork.com',
            'archsurg.jamanetwork.com',
            'archpedi.jamanetwork.com',
            'archpsyc.jamanetwork.com',
            'archopht.jamanetwork.com',
            'archneur.jamanetwork.com',
            'archfami.jamanetwork.com',
            'archderm.jamanetwork.com'
        ]
        
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            # Remove www. if present
            if domain.startswith('www.'):
                domain = domain[4:]
            
            return any(domain == valid_domain or domain.endswith('.' + valid_domain) 
                      for valid_domain in valid_domains)
        except:
            return False
    
    def detect_paywall(self, content: str) -> bool:
        """Detect if content is behind a paywall"""
        paywall_indicators = [
            "subscribe",
            "subscription required",
            "login required",
            "access restricted",
            "premium content",
            "subscriber access",
            "institutional access",
            "sign in to continue",
            "this content is restricted"
        ]
        
        content_lower = content.lower()
        return any(indicator in content_lower for indicator in paywall_indicators)

# For testing
if __name__ == "__main__":
    async def test_scraper():
        scraper = JAMAScraper()
        test_url = "https://jamanetwork.com/journals/jama/fullarticle/2812823"
        result = await scraper.scrape_article(test_url)
        print(f"Success: {result['success']}")
        if result['success']:
            print(f"Content length: {result['content_length']}")
        else:
            print(f"Error: {result['message']}")
    
    asyncio.run(test_scraper())