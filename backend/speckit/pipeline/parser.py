from bs4 import BeautifulSoup
import re
from typing import Dict, Any, Optional, List
import logging

class JAMAParser:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def parse_content(self, content: str, source_url: str = "") -> Dict[str, Any]:
        """
        Extract structured data from article content (HTML or plain text)
        """
        try:
            # Determine if content is HTML or plain text
            if content.strip().startswith('<'):
                return self.parse_html_content(content, source_url)
            else:
                return self.parse_text_content(content)
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Content parsing failed: {str(e)}",
                "error_type": "parsing_error"
            }
    
    def parse_html_content(self, html_content: str, source_url: str) -> Dict[str, Any]:
        """Parse HTML content from scraped JAMA article"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        extracted_data = {
            "title": self.extract_title(soup),
            "authors": self.extract_authors(soup),
            "publication_date": self.extract_publication_date(soup),
            "doi": self.extract_doi(soup),
            "abstract": self.extract_abstract(soup),
            "population": self.extract_population(soup),
            "intervention": self.extract_intervention(soup),
            "setting": self.extract_setting(soup),
            "primary_outcome": self.extract_primary_outcome(soup),
            "findings": self.extract_findings(soup),
            "full_text": self.extract_full_text(soup)[:5000]  # Limit for processing
        }
        
        # Calculate quality score
        quality_score = self.calculate_quality_score(extracted_data)
        
        return {
            "success": True,
            "extracted_data": extracted_data,
            "quality_score": quality_score,
            "source_type": "html",
            "source_url": source_url
        }
    
    def parse_text_content(self, text_content: str) -> Dict[str, Any]:
        """Parse plain text content (from PDF)"""
        extracted_data = {
            "title": self.extract_title_from_text(text_content),
            "authors": self.extract_authors_from_text(text_content),
            "publication_date": self.extract_date_from_text(text_content),
            "doi": self.extract_doi_from_text(text_content),
            "abstract": self.extract_abstract_from_text(text_content),
            "population": self.extract_population_from_text(text_content),
            "intervention": self.extract_intervention_from_text(text_content),
            "setting": self.extract_setting_from_text(text_content),
            "primary_outcome": self.extract_primary_outcome_from_text(text_content),
            "findings": self.extract_findings_from_text(text_content),
            "full_text": text_content[:5000]  # Limit for processing
        }
        
        quality_score = self.calculate_quality_score(extracted_data)
        
        return {
            "success": True,
            "extracted_data": extracted_data,
            "quality_score": quality_score,
            "source_type": "text"
        }
    
    # HTML extraction methods
    def extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract article title from HTML"""
        selectors = [
            'h1.meta-article-title',
            '.article-title',
            'h1[data-testid="article-title"]',
            '.title',
            'h1.article-header-title',
            'meta[property="og:title"]',
            'title'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    return element.get('content', '').strip()
                else:
                    title = element.get_text(strip=True)
                    if title and len(title) > 10:  # Avoid short, generic titles
                        return title
        
        return None
    
    def extract_authors(self, soup: BeautifulSoup) -> List[str]:
        """Extract authors from HTML"""
        authors = []
        
        # Try various author selectors
        selectors = [
            '.article-authors .author',
            '.authors .author-name',
            '.byline .author',
            '.meta-authors .author',
            '.author-list .author'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                for element in elements:
                    author = element.get_text(strip=True)
                    if author and author not in authors:
                        authors.append(author)
                break
        
        # Fallback: look for author patterns in text
        if not authors:
            text = soup.get_text()
            author_patterns = [
                r'Authors?[:\s]+([A-Z][a-zA-Z\s,\.]+?)(?:\n|;|$)',
                r'By[:\s]+([A-Z][a-zA-Z\s,\.]+?)(?:\n|;|$)'
            ]
            
            for pattern in author_patterns:
                matches = re.findall(pattern, text, re.MULTILINE)
                if matches:
                    authors_text = matches[0]
                    authors = [author.strip() for author in re.split(r'[,;]', authors_text) if author.strip()]
                    break
        
        return authors[:5]  # Limit to first 5 authors
    
    def extract_abstract(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract abstract from HTML"""
        selectors = [
            '.article-abstract',
            '.abstract-content',
            '.abstract p',
            '[data-testid="abstract"]',
            '.summary'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                abstract = element.get_text(strip=True)
                if len(abstract) > 100:  # Ensure we have substantial content
                    return abstract[:1000]  # Limit length
        
        return None
    
    def extract_population(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract population information from HTML"""
        # Look in methods section or similar
        sections = soup.find_all(['div', 'section'], class_=re.compile(r'methods|participants|subjects', re.I))
        
        for section in sections:
            text = section.get_text()
            
            # Look for population patterns
            patterns = [
                r'(\d+\s+(?:patients|participants|subjects|individuals)[^.]*)',
                r'((?:patients|participants|subjects)\s+aged[^.]*)',
                r'(inclusion criteria[:\s][^.]*)',
                r'(study population[:\s][^.]*)',
                r'(sample size[:\s][^.]*)'
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    return matches[0][:200]  # Limit length
        
        # Fallback: search entire text
        full_text = soup.get_text()
        population_pattern = r'(\d+\s+(?:patients|participants|subjects)(?:[^.]{0,100})?)'
        matches = re.findall(population_pattern, full_text, re.IGNORECASE)
        
        if matches:
            return matches[0][:200]
        
        return None
    
    def extract_intervention(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract intervention information from HTML"""
        # Look for intervention/treatment sections
        sections = soup.find_all(['div', 'section'], class_=re.compile(r'intervention|treatment|methods', re.I))
        
        for section in sections:
            text = section.get_text()
            
            patterns = [
                r'(intervention[:\s][^.]*)',
                r'(treatment[:\s][^.]*)',
                r'(therapy[:\s][^.]*)',
                r'(drug[:\s][^.]*)',
                r'(medication[:\s][^.]*)'
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    return matches[0][:200]
        
        return None
    
    def extract_setting(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract study setting from HTML"""
        full_text = soup.get_text()
        
        patterns = [
            r'(setting[:\s][^.]*)',
            r'(conducted at[^.]*)',
            r'(hospital[^.]*)',
            r'(clinic[^.]*)',
            r'(medical center[^.]*)',
            r'(university[^.]*)',
            r'(institution[^.]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, full_text, re.IGNORECASE)
            if matches:
                return matches[0][:150]
        
        return None
    
    def extract_primary_outcome(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract primary outcome from HTML"""
        full_text = soup.get_text()
        
        patterns = [
            r'(primary outcome[^.]*)',
            r'(primary endpoint[^.]*)',
            r'(main outcome[^.]*)',
            r'(primary measure[^.]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, full_text, re.IGNORECASE)
            if matches:
                return matches[0][:200]
        
        return None
    
    def extract_findings(self, soup: BeautifulSoup) -> List[str]:
        """Extract key findings from HTML"""
        findings = []
        
        # Look for results section
        results_sections = soup.find_all(['div', 'section'], class_=re.compile(r'results|findings', re.I))
        
        for section in results_sections:
            text = section.get_text()
            
            # Look for statistical findings
            stat_patterns = [
                r'([^.]*p\s*[<>=]\s*[\d\.]+[^.]*)',
                r'([^.]*95%\s*CI[^.]*)',
                r'([^.]*confidence interval[^.]*)',
                r'([^.]*significant[^.]*)',
                r'([^.]*reduction[^.]*)',
                r'([^.]*increase[^.]*)'
            ]
            
            for pattern in stat_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches[:3]:  # Limit to 3 findings
                    if len(match.strip()) > 20:
                        findings.append(match.strip()[:150])
        
        return findings[:3]  # Return top 3 findings
    
    # Text extraction methods (for PDF content)
    def extract_title_from_text(self, text: str) -> Optional[str]:
        """Extract title from plain text"""
        lines = text.split('\n')
        
        # Usually title is in the first few lines
        for line in lines[:10]:
            line = line.strip()
            if len(line) > 20 and len(line) < 200 and not line.isupper():
                # Avoid lines that look like headers or metadata
                if not re.match(r'^(abstract|introduction|methods|results)', line.lower()):
                    return line
        
        return None
    
    def extract_authors_from_text(self, text: str) -> List[str]:
        """Extract authors from plain text"""
        # Look for author patterns
        patterns = [
            r'Authors?[:\s]+([A-Z][a-zA-Z\s,\.]+?)(?:\n|Abstract|Introduction)',
            r'By[:\s]+([A-Z][a-zA-Z\s,\.]+?)(?:\n|Abstract|Introduction)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            if matches:
                authors_text = matches[0]
                return [author.strip() for author in re.split(r'[,;]', authors_text) if author.strip()][:5]
        
        return []
    
    def extract_population_from_text(self, text: str) -> Optional[str]:
        """Extract population from plain text"""
        patterns = [
            r'(\d+\s+(?:patients|participants|subjects)[^.]*)',
            r'(study population[^.]*)',
            r'(participants included[^.]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0][:200]
        
        return None
    
    # Helper methods for both HTML and text
    def extract_publication_date(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract publication date from HTML"""
        selectors = [
            'meta[name="citation_publication_date"]',
            'meta[property="article:published_time"]',
            '.publication-date',
            '.article-date'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    return element.get('content', '').strip()
                else:
                    return element.get_text(strip=True)
        
        return None
    
    def extract_doi(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract DOI from HTML"""
        selectors = [
            'meta[name="citation_doi"]',
            'meta[name="dc.identifier"]',
            'a[href*="doi.org"]'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    doi = element.get('content', '').strip()
                elif element.name == 'a':
                    href = element.get('href', '')
                    doi_match = re.search(r'10\.\d+/[^\s]+', href)
                    if doi_match:
                        doi = doi_match.group()
                    else:
                        doi = href
                
                if doi.startswith('10.'):
                    return doi
        
        return None
    
    def extract_full_text(self, soup: BeautifulSoup) -> str:
        """Extract full text content from HTML"""
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    # Text-based extraction methods
    def extract_date_from_text(self, text: str) -> Optional[str]:
        """Extract date from plain text"""
        date_patterns = [
            r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',
            r'(\w+\s+\d{1,2},\s+\d{4})',
            r'(\d{1,2}\s+\w+\s+\d{4})'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        
        return None
    
    def extract_doi_from_text(self, text: str) -> Optional[str]:
        """Extract DOI from plain text"""
        doi_pattern = r'(10\.\d+/[^\s]+)'
        matches = re.findall(doi_pattern, text)
        if matches:
            return matches[0]
        return None
    
    def extract_abstract_from_text(self, text: str) -> Optional[str]:
        """Extract abstract from plain text"""
        # Look for abstract section
        abstract_pattern = r'abstract[:\s]+(.*?)(?:introduction|keywords|key words|background|\n\n)'
        matches = re.findall(abstract_pattern, text, re.IGNORECASE | re.DOTALL)
        
        if matches:
            abstract = matches[0].strip()
            return abstract[:1000]  # Limit length
        
        return None
    
    def extract_intervention_from_text(self, text: str) -> Optional[str]:
        """Extract intervention from plain text"""
        patterns = [
            r'intervention[:\s]+([^.]*)',
            r'treatment[:\s]+([^.]*)',
            r'therapy[:\s]+([^.]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0][:200]
        
        return None
    
    def extract_setting_from_text(self, text: str) -> Optional[str]:
        """Extract setting from plain text"""
        patterns = [
            r'setting[:\s]+([^.]*)',
            r'conducted at ([^.]*)',
            r'study site[:\s]+([^.]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0][:150]
        
        return None
    
    def extract_primary_outcome_from_text(self, text: str) -> Optional[str]:
        """Extract primary outcome from plain text"""
        patterns = [
            r'primary outcome[:\s]+([^.]*)',
            r'primary endpoint[:\s]+([^.]*)',
            r'main outcome[:\s]+([^.]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0][:200]
        
        return None
    
    def extract_findings_from_text(self, text: str) -> List[str]:
        """Extract findings from plain text"""
        findings = []
        
        # Look for statistical results
        patterns = [
            r'([^.]*p\s*[<>=]\s*[\d\.]+[^.]*)',
            r'([^.]*95%\s*CI[^.]*)',
            r'([^.]*significant[^.]*reduction[^.]*)',
            r'([^.]*significant[^.]*increase[^.]*)'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches[:3]:
                if len(match.strip()) > 20:
                    findings.append(match.strip()[:150])
        
        return findings[:3]
    
    def calculate_quality_score(self, extracted_data: Dict[str, Any]) -> float:
        """Calculate extraction quality score (0-1)"""
        required_fields = [
            'title', 'population', 'intervention', 
            'setting', 'primary_outcome', 'findings'
        ]
        
        found_fields = 0
        for field in required_fields:
            value = extracted_data.get(field)
            if value:
                if isinstance(value, list) and len(value) > 0:
                    found_fields += 1
                elif isinstance(value, str) and len(value.strip()) > 0:
                    found_fields += 1
        
        return found_fields / len(required_fields)

# For testing
if __name__ == "__main__":
    parser = JAMAParser()
    
    # Test with sample HTML
    sample_html = """
    <html>
        <h1 class="meta-article-title">Effect of Digital Health Interventions on Cardiovascular Risk</h1>
        <div class="authors">
            <span class="author">Smith, J.</span>
            <span class="author">Johnson, M.</span>
        </div>
        <div class="methods">
            Study included 500 patients aged 18-65 with hypertension.
            Intervention consisted of mobile app with daily monitoring.
            Setting was community health centers in Boston.
            Primary outcome was reduction in systolic blood pressure.
        </div>
        <div class="results">
            Mean systolic BP decreased by 8.5 mmHg (95% CI: 6.2-10.8, p=0.003).
            Clinically significant reduction in cardiovascular risk observed.
        </div>
    </html>
    """
    
    result = parser.parse_content(sample_html)
    print(f"Success: {result['success']}")
    print(f"Quality Score: {result['quality_score']:.1%}")
    
    if result['success']:
        data = result['extracted_data']
        print(f"Title: {data['title']}")
        print(f"Population: {data['population']}")
        print(f"Intervention: {data['intervention']}")
        print(f"Findings: {data['findings']}")