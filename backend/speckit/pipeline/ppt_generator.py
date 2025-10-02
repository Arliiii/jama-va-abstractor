from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import os
from typing import Dict, Any
from datetime import datetime

class VAPowerPointGenerator:
    def __init__(self):
        self.template_path = os.path.join(os.path.dirname(__file__), '..', '..', 'templates', 'va_template.pptx')
        
        # VA Color Scheme
        self.va_colors = {
            'navy': RGBColor(0, 32, 96),      # VA Navy Blue
            'blue': RGBColor(70, 130, 180),   # Steel Blue
            'gray': RGBColor(105, 105, 105),  # Dim Gray
            'light_gray': RGBColor(211, 211, 211),  # Light Gray
            'white': RGBColor(255, 255, 255), # White
            'green': RGBColor(34, 139, 34),   # Forest Green (for positive results)
            'red': RGBColor(220, 20, 60),     # Crimson (for significant findings)
        }
        
        # Medical icon mappings
        self.icon_symbols = {
            'cardiology': '♥',
            'neurology': '🧠',
            'oncology': '※',
            'infectious_disease': '⚡',
            'surgery': '✚',
            'pharmacy': '⚕',
            'endocrinology': '◈',
            'pulmonology': '◔',
            'psychiatry': '◊',
            'orthopedics': '⬟',
            'dermatology': '◉',
            'gastroenterology': '◐',
            'general_medicine': '⚕'
        }
    
    def generate_presentation(self, summaries: Dict[str, str], medical_icon: str, job_id: str) -> Dict[str, Any]:
        """
        Generate VA-style PowerPoint presentation
        """
        try:
            # Create new presentation
            prs = Presentation()
            
            # Set slide dimensions (16:9 aspect ratio)
            prs.slide_width = Inches(13.33)
            prs.slide_height = Inches(7.5)
            
            # Create main slide
            slide_layout = prs.slide_layouts[5]  # Blank layout
            slide = prs.slides.add_slide(slide_layout)
            
            # Add content to slide
            self.create_va_slide(slide, summaries, medical_icon)
            
            # Save presentation
            output_dir = "output"
            os.makedirs(output_dir, exist_ok=True)
            filename = f"va_abstract_{job_id}.pptx"
            file_path = os.path.join(output_dir, filename)
            
            prs.save(file_path)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            return {
                "success": True,
                "file_path": file_path,
                "file_size": file_size,
                "filename": filename
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"PowerPoint generation failed: {str(e)}",
                "error_type": "ppt_generation_error"
            }
    
    def create_va_slide(self, slide, summaries: Dict[str, str], medical_icon: str):
        """Create the main VA-style slide with all content"""
        
        # Slide dimensions
        slide_width = slide.slide_layout.width
        slide_height = slide.slide_layout.height
        
        # Header Section
        self.add_header(slide, summaries.get('title', 'Clinical Study Abstract'), medical_icon)
        
        # Main content area (divided into sections)
        content_top = Inches(1.5)
        content_height = slide_height - Inches(2.5)
        
        # Left column - Study Details
        left_width = slide_width * 0.48
        self.add_study_details(slide, summaries, Inches(0.5), content_top, left_width, content_height)
        
        # Right column - Findings
        right_left = slide_width * 0.52
        right_width = slide_width * 0.46
        self.add_findings_section(slide, summaries, right_left, content_top, right_width, content_height)
        
        # Footer
        self.add_footer(slide)
    
    def add_header(self, slide, title: str, medical_icon: str):
        """Add header with title and VA branding"""
        
        # VA Logo/Branding area (left)
        logo_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(2), Inches(0.8))
        logo_frame = logo_box.text_frame
        logo_frame.margin_left = 0
        logo_frame.margin_right = 0
        logo_frame.margin_top = 0
        logo_frame.margin_bottom = 0
        
        logo_p = logo_frame.paragraphs[0]
        logo_p.text = "VA"
        logo_p.alignment = PP_ALIGN.LEFT
        
        logo_run = logo_p.runs[0]
        logo_run.font.name = 'Arial Black'
        logo_run.font.size = Pt(24)
        logo_run.font.color.rgb = self.va_colors['navy']
        logo_run.font.bold = True
        
        # Medical icon
        icon_symbol = self.icon_symbols.get(medical_icon, self.icon_symbols['general_medicine'])
        icon_box = slide.shapes.add_textbox(Inches(2.5), Inches(0.2), Inches(1), Inches(0.8))
        icon_frame = icon_box.text_frame
        icon_p = icon_frame.paragraphs[0]
        icon_p.text = icon_symbol
        icon_p.alignment = PP_ALIGN.CENTER
        
        icon_run = icon_p.runs[0]
        icon_run.font.size = Pt(32)
        icon_run.font.color.rgb = self.va_colors['blue']
        
        # Title
        title_box = slide.shapes.add_textbox(Inches(3.5), Inches(0.2), Inches(9), Inches(0.8))
        title_frame = title_box.text_frame
        title_frame.word_wrap = True
        title_frame.margin_left = 0
        title_frame.margin_right = 0
        
        title_p = title_frame.paragraphs[0]
        title_p.text = title
        title_p.alignment = PP_ALIGN.LEFT
        
        title_run = title_p.runs[0]
        title_run.font.name = 'Arial'
        title_run.font.size = Pt(18)
        title_run.font.color.rgb = self.va_colors['navy']
        title_run.font.bold = True
        
        # Header divider line
        line = slide.shapes.add_connector(
            1, Inches(0.5), Inches(1.1), 
            Inches(12.5), Inches(1.1)
        )
        line.line.color.rgb = self.va_colors['navy']
        line.line.width = Pt(2)
    
    def add_study_details(self, slide, summaries: Dict[str, str], left: float, top: float, width: float, height: float):
        """Add study details section (left column)"""
        
        section_spacing = height / 4
        
        # Population
        self.add_detail_box(
            slide, "POPULATION", summaries.get('population', 'Not specified'),
            left, top, width, section_spacing * 0.8
        )
        
        # Intervention
        self.add_detail_box(
            slide, "INTERVENTION", summaries.get('intervention', 'Not specified'),
            left, top + section_spacing, width, section_spacing * 0.8
        )
        
        # Setting
        self.add_detail_box(
            slide, "SETTING", summaries.get('setting', 'Not specified'),
            left, top + section_spacing * 2, width, section_spacing * 0.8
        )
        
        # Primary Outcome
        self.add_detail_box(
            slide, "PRIMARY OUTCOME", summaries.get('primary_outcome', 'Not specified'),
            left, top + section_spacing * 3, width, section_spacing * 0.8
        )
    
    def add_findings_section(self, slide, summaries: Dict[str, str], left: float, top: float, width: float, height: float):
        """Add findings section (right column)"""
        
        # Main findings box
        findings_height = height * 0.7
        
        # Create findings container with border
        findings_shape = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, left, top, width, findings_height
        )
        
        # Style the findings box
        findings_shape.fill.solid()
        findings_shape.fill.fore_color.rgb = RGBColor(248, 248, 255)  # Very light blue
        findings_shape.line.color.rgb = self.va_colors['blue']
        findings_shape.line.width = Pt(2)
        
        # Add findings text
        findings_frame = findings_shape.text_frame
        findings_frame.margin_left = Inches(0.2)
        findings_frame.margin_right = Inches(0.2)
        findings_frame.margin_top = Inches(0.2)
        findings_frame.margin_bottom = Inches(0.2)
        findings_frame.word_wrap = True
        
        # Findings header
        findings_p = findings_frame.paragraphs[0]
        findings_p.text = "KEY FINDINGS"
        findings_p.alignment = PP_ALIGN.CENTER
        
        header_run = findings_p.runs[0]
        header_run.font.name = 'Arial'
        header_run.font.size = Pt(16)
        header_run.font.color.rgb = self.va_colors['navy']
        header_run.font.bold = True
        
        # Findings content
        findings_text = summaries.get('findings', 'No findings available')
        content_p = findings_frame.add_paragraph()
        content_p.text = findings_text
        content_p.alignment = PP_ALIGN.LEFT
        
        content_run = content_p.runs[0]
        content_run.font.name = 'Arial'
        content_run.font.size = Pt(14)
        content_run.font.color.rgb = self.va_colors['navy']
        
        # VA Summary box (bottom right)
        summary_top = top + findings_height + Inches(0.2)
        summary_height = height - findings_height - Inches(0.2)
        
        summary_box = slide.shapes.add_textbox(left, summary_top, width, summary_height)
        summary_frame = summary_box.text_frame
        summary_frame.word_wrap = True
        
        # Get VA summary from summaries or create one
        va_summary = summaries.get('va_summary', self.create_brief_summary(summaries))
        
        summary_p = summary_frame.paragraphs[0]
        summary_p.text = f"CLINICAL SIGNIFICANCE: {va_summary}"
        summary_p.alignment = PP_ALIGN.LEFT
        
        summary_run = summary_p.runs[0]
        summary_run.font.name = 'Arial'
        summary_run.font.size = Pt(12)
        summary_run.font.color.rgb = self.va_colors['gray']
        summary_run.font.italic = True
    
    def add_detail_box(self, slide, label: str, content: str, left: float, top: float, width: float, height: float):
        """Add a detail box with label and content"""
        
        # Container box
        container = slide.shapes.add_textbox(left, top, width, height)
        container_frame = container.text_frame
        container_frame.word_wrap = True
        container_frame.margin_left = Inches(0.1)
        container_frame.margin_right = Inches(0.1)
        container_frame.margin_top = Inches(0.05)
        container_frame.margin_bottom = Inches(0.05)
        
        # Label paragraph
        label_p = container_frame.paragraphs[0]
        label_p.text = label
        label_p.alignment = PP_ALIGN.LEFT
        
        label_run = label_p.runs[0]
        label_run.font.name = 'Arial'
        label_run.font.size = Pt(12)
        label_run.font.color.rgb = self.va_colors['blue']
        label_run.font.bold = True
        
        # Content paragraph
        content_p = container_frame.add_paragraph()
        content_p.text = content
        content_p.alignment = PP_ALIGN.LEFT
        
        content_run = content_p.runs[0]
        content_run.font.name = 'Arial'
        content_run.font.size = Pt(11)
        content_run.font.color.rgb = self.va_colors['navy']
        
        # Add subtle border
        border_shape = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, left, top, width, height
        )
        border_shape.fill.background()
        border_shape.line.color.rgb = self.va_colors['light_gray']
        border_shape.line.width = Pt(1)
        
        # Move border to back
        border_shape.element.getparent().remove(border_shape.element)
        slide.shapes._spTree.insert(2, border_shape.element)
    
    def add_footer(self, slide):
        """Add footer with generation info"""
        
        slide_width = slide.slide_layout.width
        slide_height = slide.slide_layout.height
        
        footer_top = slide_height - Inches(0.6)
        
        # Footer line
        footer_line = slide.shapes.add_connector(
            1, Inches(0.5), footer_top, 
            slide_width - Inches(0.5), footer_top
        )
        footer_line.line.color.rgb = self.va_colors['light_gray']
        footer_line.line.width = Pt(1)
        
        # Footer text
        footer_box = slide.shapes.add_textbox(
            Inches(0.5), footer_top + Inches(0.1), 
            slide_width - Inches(1), Inches(0.4)
        )
        footer_frame = footer_box.text_frame
        
        current_date = datetime.now().strftime("%B %d, %Y")
        footer_p = footer_frame.paragraphs[0]
        footer_p.text = f"Generated by JAMA VA Abstractor • {current_date} • Veterans Affairs"
        footer_p.alignment = PP_ALIGN.CENTER
        
        footer_run = footer_p.runs[0]
        footer_run.font.name = 'Arial'
        footer_run.font.size = Pt(10)
        footer_run.font.color.rgb = self.va_colors['gray']
    
    def create_brief_summary(self, summaries: Dict[str, str]) -> str:
        """Create a brief clinical significance summary if not provided"""
        
        if summaries.get('findings'):
            return f"Study demonstrates {summaries['findings'][:100]}..."
        elif summaries.get('intervention') and summaries.get('population'):
            return f"Clinical evaluation of {summaries['intervention']} in {summaries['population']}"
        else:
            return "Clinical study with potential VA healthcare implications"

# For testing
if __name__ == "__main__":
    # Test data
    test_summaries = {
        "title": "Digital Health Interventions for Cardiovascular Risk",
        "population": "500 veterans aged 50-75 with hypertension",
        "intervention": "Mobile app with daily BP monitoring and coaching",
        "setting": "VA community health centers nationwide",
        "primary_outcome": "Systolic blood pressure reduction at 12 weeks",
        "findings": "Mean 8.5 mmHg reduction (95% CI: 6.2-10.8, p=0.003). Clinically significant improvement in cardiovascular risk profile.",
        "va_summary": "Mobile health intervention significantly reduces BP in veteran population with high user engagement and clinical benefit."
    }
    
    generator = VAPowerPointGenerator()
    result = generator.generate_presentation(test_summaries, "cardiology", "test_123")
    
    if result["success"]:
        print(f"Successfully generated PowerPoint: {result['filename']}")
        print(f"File size: {result['file_size']} bytes")
        print(f"Saved to: {result['file_path']}")
    else:
        print(f"Generation failed: {result['message']}")