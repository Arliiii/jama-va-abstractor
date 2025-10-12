"""Simple icon generator for PowerPoint presentations."""
from PIL import Image, ImageDraw, ImageFont
import os

def create_simple_icon(letter, bg_color, size=512):
    """Create a simple circular icon with a letter."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw main circle
    draw.ellipse((0, 0, size, size), fill=bg_color)
    
    # Draw letter
    try:
        font = ImageFont.truetype('arialbd.ttf', int(size * 0.5))
    except:
        font = ImageFont.truetype('arial.ttf', int(size * 0.5))
    
    # Simple center calculation
    draw.text((size//3, size//4), letter, font=font, fill=(255, 255, 255, 255))
    
    return img

# Define icons
icons_data = {
    'cardiology': ('C', (220, 53, 69, 255)),
    'neurology': ('N', (111, 66, 193, 255)),
    'oncology': ('O', (253, 126, 20, 255)),
    'infectious_disease': ('I', (255, 193, 7, 255)),
    'surgery': ('S', (13, 110, 253, 255)),
    'pharmacy': ('P', (25, 135, 84, 255)),
    'pulmonology': ('L', (13, 202, 240, 255)),
    'psychiatry': ('M', (214, 51, 132, 255)),
    'orthopedics': ('B', (108, 117, 125, 255)),
    'dermatology': ('D', (255, 99, 132, 255)),
    'gastroenterology': ('G', (153, 102, 255, 255)),
    'general_medicine': ('M', (14, 78, 128, 255)),
}

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')
    logos_dir = os.path.join(script_dir, 'logos')
    
    os.makedirs(icons_dir, exist_ok=True)
    os.makedirs(logos_dir, exist_ok=True)
    
    print('Generating icons...')
    for specialty, (letter, bg_color) in icons_data.items():
        icon = create_simple_icon(letter, bg_color)
        icon_path = os.path.join(icons_dir, f'{specialty}.png')
        icon.save(icon_path, 'PNG')
        print(f'✓ {specialty}.png')
    
    # VA Logo
    print('\nGenerating VA logo...')
    va_logo = create_simple_icon('VA', (0, 32, 96, 255))
    va_logo.save(os.path.join(logos_dir, 'va_logo.png'), 'PNG')
    print('✓ va_logo.png')
    
    print('\n✅ Done!')
