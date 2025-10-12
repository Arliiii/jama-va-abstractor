from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.dml import MSO_THEME_COLOR
import os
from typing import Dict, Any
from datetime import datetime

class VAPowerPointGenerator:
    def __init__(self):
        # Modern VA Color Palette
        self.colors = {
            'navy': RGBColor(0, 32, 96),
            'accent': RGBColor(14, 78, 128),
            'light': RGBColor(248, 250, 252),
            'gray': RGBColor(71, 85, 105),
            'white': RGBColor(255, 255, 255),
            'success': RGBColor(34, 197, 94),
            'warning': RGBColor(251, 146, 60),
        }
        
        self.icons_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'icons')
        self.logos_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'logos')
        
        # Specialty keywords for auto-detection
        self.specialty_keywords = {
            'cardiology': ['cardio', 'heart', 'blood pressure', 'hypertension', 'myocardial', 'cardiac'],
            'neurology': ['neuro', 'brain', 'stroke', 'cognitive', 'dementia'],
            'oncology': ['cancer', 'tumor', 'oncology', 'metastasis'],
            'infectious_disease': ['infection', 'viral', 'bacterial', 'covid', 'sepsis'],
            'surgery': ['surgery', 'operative', 'surgical'],
            'pharmacy': ['drug', 'medication', 'pharmac'],
            'pulmonology': ['lung', 'respiratory', 'pneumonia', 'asthma'],
            'psychiatry': ['depress', 'anxiety', 'psychiat', 'mental'],
            'orthopedics': ['bone', 'fracture', 'orthop', 'arthritis'],
            'dermatology': ['skin', 'derma', 'rash'],
            'gastroenterology': ['GI', 'gastro', 'liver', 'intestinal'],
        }
    
    def generate_presentation(self, summaries: Dict[str, Any], medical_icon: str, job_id: str) -> Dict[str, Any]:
        """Create modern VA presentation."""
        try:
            # Auto-detect specialty
            if not medical_icon or medical_icon == 'general':
                medical_icon = self._detect_specialty(summaries) or 'general_medicine'
            
            prs = Presentation()
            prs.slide_width = Inches(13.33)
            prs.slide_height = Inches(7.5)
            
            # Title slide with modern design
            self._add_modern_title_slide(prs, summaries, medical_icon)
            
            # Overview slide
            self._add_modern_overview_slide(prs, summaries)
            
            # Key Findings slide
            self._add_modern_findings_slide(prs, summaries)
            
            # Conclusion
            self._add_modern_conclusion_slide(prs, summaries)
            
            # Save
            output_dir = 'output'
            os.makedirs(output_dir, exist_ok=True)
            filename = f"va_abstract_{job_id}.pptx"
            file_path = os.path.join(output_dir, filename)
            prs.save(file_path)
            
            return {
                'success': True,
                'file_path': file_path,
                'file_size': os.path.getsize(file_path),
                'filename': filename
            }
        except Exception as e:
            return {'success': False, 'message': str(e), 'error_type': 'ppt_generation_error'}
    
    def _add_modern_title_slide(self, prs, summaries, medical_icon):
        """Modern minimalist title slide."""
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        
        # Gradient background effect with shapes
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = self.colors['light']
        bg.line.fill.background()
        
        # Navy accent bar at top
        accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.15))
        accent.fill.solid()
        accent.fill.fore_color.rgb = self.colors['navy']
        accent.line.fill.background()
        
        # VA Logo
        logo_path = os.path.join(self.logos_dir, 'va_logo.png')
        if os.path.exists(logo_path):
            slide.shapes.add_picture(logo_path, Inches(0.7), Inches(0.6), width=Inches(1.2))
        
        # Specialty Icon
        icon_path = os.path.join(self.icons_dir, f'{medical_icon}.png')
        if os.path.exists(icon_path):
            slide.shapes.add_picture(icon_path, prs.slide_width - Inches(1.9), Inches(0.6), width=Inches(1.2))
        
        # Title with modern typography
        title = summaries.get('title', 'Clinical Study Abstract')
        title_box = slide.shapes.add_textbox(Inches(2.2), Inches(2.2), prs.slide_width - Inches(4.4), Inches(2))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.alignment = PP_ALIGN.CENTER
        p.font.name = 'Segoe UI'
        p.font.size = Pt(40)
        p.font.bold = True
        p.font.color.rgb = self.colors['navy']
        
        # Subtitle
        subtitle = f"{summaries.get('population', '')} • {summaries.get('setting', '')}"
        if subtitle.strip() != '•':
            sub_box = slide.shapes.add_textbox(Inches(2.2), Inches(4.4), prs.slide_width - Inches(4.4), Inches(0.8))
            stf = sub_box.text_frame
            sp = stf.paragraphs[0]
            sp.text = subtitle
            sp.alignment = PP_ALIGN.CENTER
            sp.font.name = 'Segoe UI'
            sp.font.size = Pt(16)
            sp.font.color.rgb = self.colors['gray']
        
        # Footer with date
        self._add_modern_footer(slide, prs.slide_width, prs.slide_height)
    
    def _add_modern_overview_slide(self, prs, summaries):
        """Modern overview with cards."""
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        
        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = self.colors['light']
        bg.line.fill.background()
        
        # Title
        title = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(6), Inches(0.6))
        tp = title.text_frame.paragraphs[0]
        tp.text = 'Study Overview'
        tp.font.name = 'Segoe UI'
        tp.font.size = Pt(32)
        tp.font.bold = True
        tp.font.color.rgb = self.colors['navy']
        
        # Info cards
        cards = [
            ('Population', summaries.get('population', 'N/A')),
            ('Intervention', summaries.get('intervention', 'N/A')),
            ('Setting', summaries.get('setting', 'N/A')),
            ('Primary Outcome', summaries.get('primary_outcome', 'N/A')),
        ]
        
        card_width = (prs.slide_width - Inches(2.4)) / 2
        card_height = Inches(1.8)
        
        for i, (label, text) in enumerate(cards):
            row = i // 2
            col = i % 2
            left = Inches(0.8) + col * (card_width + Inches(0.4))
            top = Inches(1.4) + row * (card_height + Inches(0.3))
            
            # Card background with shadow
            shadow = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, 
                                           left + Pt(4), top + Pt(4), card_width, card_height)
            shadow.fill.solid()
            shadow.fill.fore_color.rgb = RGBColor(200, 200, 200)
            shadow.line.fill.background()
            
            card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, card_width, card_height)
            card.fill.solid()
            card.fill.fore_color.rgb = self.colors['white']
            card.line.color.rgb = self.colors['accent']
            card.line.width = Pt(1.5)
            
            # Card content
            tf = card.text_frame
            tf.margin_left = Inches(0.25)
            tf.margin_top = Inches(0.2)
            tf.word_wrap = True
            
            # Label
            lp = tf.paragraphs[0]
            lp.text = label.upper()
            lp.font.name = 'Segoe UI Semibold'
            lp.font.size = Pt(14)
            lp.font.bold = True
            lp.font.color.rgb = self.colors['accent']
            
            # Text
            tp = tf.add_paragraph()
            tp.text = text[:150]  # Truncate if too long
            tp.font.name = 'Segoe UI'
            tp.font.size = Pt(11)
            tp.font.color.rgb = self.colors['gray']
            tp.space_after = Pt(0)
        
        self._add_modern_footer(slide, prs.slide_width, prs.slide_height)
    
    def _add_modern_findings_slide(self, prs, summaries):
        """Modern findings with bullet points and KPI boxes."""
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        
        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = self.colors['light']
        bg.line.fill.background()
        
        # Title
        title = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(6), Inches(0.6))
        tp = title.text_frame.paragraphs[0]
        tp.text = 'Key Findings'
        tp.font.name = 'Segoe UI'
        tp.font.size = Pt(32)
        tp.font.bold = True
        tp.font.color.rgb = self.colors['navy']
        
        # Main findings box
        findings_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                             Inches(0.8), Inches(1.3),
                                             prs.slide_width - Inches(1.6), Inches(4.2))
        findings_box.fill.solid()
        findings_box.fill.fore_color.rgb = self.colors['white']
        findings_box.line.color.rgb = self.colors['accent']
        findings_box.line.width = Pt(2)
        
        # Findings content
        tf = findings_box.text_frame
        tf.margin_left = Inches(0.4)
        tf.margin_right = Inches(0.4)
        tf.margin_top = Inches(0.3)
        tf.word_wrap = True
        
        findings_text = summaries.get('findings', 'No findings available.')
        bullets = [s.strip() + '.' for s in findings_text.split('.') if s.strip()][:5]
        
        for i, bullet in enumerate(bullets):
            p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
            p.text = f'• {bullet}'
            p.font.name = 'Segoe UI'
            p.font.size = Pt(14)
            p.font.color.rgb = self.colors['gray']
            p.space_after = Pt(12)
        
        self._add_modern_footer(slide, prs.slide_width, prs.slide_height)
    
    def _add_modern_conclusion_slide(self, prs, summaries):
        """Modern conclusion slide."""
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        
        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = self.colors['light']
        bg.line.fill.background()
        
        # Title
        title = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(8), Inches(0.6))
        tp = title.text_frame.paragraphs[0]
        tp.text = 'Clinical Implications'
        tp.font.name = 'Segoe UI'
        tp.font.size = Pt(32)
        tp.font.bold = True
        tp.font.color.rgb = self.colors['navy']
        
        # Conclusion box
        conclusion_text = summaries.get('va_summary') or summaries.get('conclusion', 'No conclusion provided.')
        
        conclusion_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                               Inches(0.8), Inches(1.5),
                                               prs.slide_width - Inches(1.6), Inches(4.5))
        conclusion_box.fill.solid()
        conclusion_box.fill.fore_color.rgb = self.colors['white']
        conclusion_box.line.color.rgb = self.colors['success']
        conclusion_box.line.width = Pt(3)
        
        tf = conclusion_box.text_frame
        tf.margin_left = Inches(0.5)
        tf.margin_right = Inches(0.5)
        tf.margin_top = Inches(0.4)
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = conclusion_text
        p.font.name = 'Segoe UI'
        p.font.size = Pt(18)
        p.font.color.rgb = self.colors['gray']
        p.space_after = Pt(16)
        
        self._add_modern_footer(slide, prs.slide_width, prs.slide_height)
    
    def _add_modern_footer(self, slide, width, height):
        """Modern minimalist footer."""
        footer_y = height - Inches(0.4)
        
        footer = slide.shapes.add_textbox(Inches(0.8), footer_y, width - Inches(1.6), Inches(0.3))
        fp = footer.text_frame.paragraphs[0]
        fp.text = f"JAMA VA Abstractor  •  {datetime.now().strftime('%B %Y')}"
        fp.alignment = PP_ALIGN.CENTER
        fp.font.name = 'Segoe UI'
        fp.font.size = Pt(10)
        fp.font.color.rgb = self.colors['gray']
    
    def _detect_specialty(self, summaries):
        """Detect specialty from text."""
        text = ' '.join([
            str(summaries.get(k, '')).lower() 
            for k in ('title', 'findings', 'intervention', 'population')
        ])
        
        for specialty, keywords in self.specialty_keywords.items():
            if any(kw in text for kw in keywords):
                return specialty
        
        return 'general_medicine'

# Test
if __name__ == '__main__':
    test_summaries = {
        'title': 'Digital Health Interventions for Cardiovascular Risk Reduction',
        'population': '500 veterans aged 50-75 with hypertension',
        'intervention': 'Mobile app with daily BP monitoring',
        'setting': 'VA community health centers nationwide',
        'primary_outcome': 'Systolic BP reduction at 12 weeks',
        'findings': 'Mean 8.5 mmHg reduction (95% CI: 6.2-10.8, p<0.001). Significant improvement in BP control. High user engagement (85% daily use). Reduced cardiovascular risk markers.',
        'va_summary': 'Mobile health intervention significantly reduces blood pressure in veteran population with excellent user engagement and clinical benefit.'
    }
    
    gen = VAPowerPointGenerator()
    result = gen.generate_presentation(test_summaries, '', 'modern_demo')
    print(f"{'✓' if result['success'] else '✗'} {result.get('file_path', result.get('message'))}")
