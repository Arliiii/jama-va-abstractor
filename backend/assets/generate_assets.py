"""Generate modern icons and VA logo for PowerPoint presentations."""
from PIL import Image, ImageDraw, ImageFont
import os

def create_modern_icon(specialty, symbol, color_bg, color_fg, size=512):
    """Create a modern circular icon with gradient-like effect."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw circle with shadow effect
    shadow_offset = int(size * 0.02)
    draw.ellipse((shadow_offset, shadow_offset, size-shadow_offset, size-shadow_offset), 
                 fill=(0, 0, 0, 50))
    
    # Main circle
    draw.ellipse((0, 0, size, size), fill=color_bg)
    
    # Add subtle gradient effect with inner circle
    inner_size = int(size * 0.85)
    inner_offset = (size - inner_size) // 2
    lighter = tuple(min(255, c + 20) for c in color_bg[:3]) + (255,)
    draw.ellipse((inner_offset, inner_offset, size-inner_offset, size-inner_offset), 
                 fill=lighter)
    
    # Draw symbol
    try:
        font = ImageFont.truetype('arial.ttf', int(size * 0.45))
    except:
        font = ImageFont.load_default()
    
    # Center the symbol
    try:
        bbox = draw.textbbox((0, 0), symbol, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = (size - text_w) // 2 - bbox[0]
        y = (size - text_h) // 2 - bbox[1]
    except:
        # Fallback for older Pillow
        w, h = draw.textsize(symbol, font=font)
        x = (size - w) // 2
        y = (size - h) // 2
    
    draw.text((x, y), symbol, font=font, fill=color_fg)
    
    return img

def create_va_logo(size=512):
    """Create a modern VA logo."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # VA navy background
    bg_color = (0, 32, 96, 255)
    draw.ellipse((0, 0, size, size), fill=bg_color)
    
    # Draw "VA" text
    try:
        font = ImageFont.truetype('arialbd.ttf', int(size * 0.4))
    except:
        try:
            font = ImageFont.truetype('arial.ttf', int(size * 0.4))
        except:
            font = ImageFont.load_default()
    
    text = "VA"
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = (size - text_w) // 2 - bbox[0]
        y = (size - text_h) // 2 - bbox[1]
    except:
        w, h = draw.textsize(text, font=font)
        x = (size - w) // 2
        y = (size - h) // 2
    
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    
    # Add "Veterans Affairs" text below
    try:
        small_font = ImageFont.truetype('arial.ttf', int(size * 0.08))
    except:
        small_font = ImageFont.load_default()
    
    subtitle = "VETERANS AFFAIRS"
    try:
        bbox2 = draw.textbbox((0, 0), subtitle, font=small_font)
        sub_w = bbox2[2] - bbox2[0]
        sub_x = (size - sub_w) // 2 - bbox2[0]
        sub_y = y + text_h + int(size * 0.05)
    except:
        sub_w, sub_h = draw.textsize(subtitle, font=small_font)
        sub_x = (size - sub_w) // 2
        sub_y = y + text_h + int(size * 0.05)
    
    draw.text((sub_x, sub_y), subtitle, font=small_font, fill=(255, 255, 255, 200))
    
    return img

# Icon definitions: specialty -> (symbol, bg_color, fg_color)
icons = {
    'cardiology': ('♥', (220, 53, 69, 255), (255, 255, 255, 255)),
    'neurology': ('N', (111, 66, 193, 255), (255, 255, 255, 255)),
    'oncology': ('O', (253, 126, 20, 255), (255, 255, 255, 255)),
    'infectious_disease': ('⚡', (255, 193, 7, 255), (33, 37, 41, 255)),
    'surgery': ('✚', (13, 110, 253, 255), (255, 255, 255, 255)),
    'pharmacy': ('⚕', (25, 135, 84, 255), (255, 255, 255, 255)),
    'pulmonology': ('P', (13, 202, 240, 255), (255, 255, 255, 255)),
    'psychiatry': ('Ψ', (214, 51, 132, 255), (255, 255, 255, 255)),
    'orthopedics': ('B', (108, 117, 125, 255), (255, 255, 255, 255)),
    'dermatology': ('D', (255, 99, 132, 255), (255, 255, 255, 255)),
    'gastroenterology': ('G', (153, 102, 255, 255), (255, 255, 255, 255)),
    'general_medicine': ('⚕', (14, 78, 128, 255), (255, 255, 255, 255)),
}

if __name__ == '__main__':
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        icons_dir = os.path.join(script_dir, 'icons')
        logos_dir = os.path.join(script_dir, 'logos')
        
        print(f'Icons directory: {icons_dir}')
        print(f'Logos directory: {logos_dir}')
        
        os.makedirs(icons_dir, exist_ok=True)
        os.makedirs(logos_dir, exist_ok=True)
        
        # Generate specialty icons
        print('\nGenerating icons...')
        for specialty, (symbol, bg_color, fg_color) in icons.items():
            try:
                icon = create_modern_icon(specialty, symbol, bg_color, fg_color)
                icon_path = os.path.join(icons_dir, f'{specialty}.png')
                icon.save(icon_path, 'PNG')
                print(f'✓ Created: {specialty}.png')
            except Exception as e:
                print(f'✗ Error creating {specialty}: {e}')
        
        # Generate VA logo
        print('\nGenerating VA logo...')
        logo = create_va_logo()
        logo_path = os.path.join(logos_dir, 'va_logo.png')
        logo.save(logo_path, 'PNG')
        print(f'✓ Created: va_logo.png')
        
        print('\n✅ All assets generated successfully!')
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
