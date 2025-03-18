#!/usr/bin/env python3
"""
Generate favicons and app icons from an SVG source file.
This script creates all necessary icon files for a React app based on the manifest.json requirements.
"""

import os
import sys
import subprocess
import tempfile
from PIL import Image
import io

def convert_svg_to_png(svg_path, output_size):
    """
    Convert SVG to PNG using Inkscape command line, which handles SVGs better than cairosvg
    
    Args:
        svg_path: Path to SVG file
        output_size: Size of the output image (width and height will be equal)
    """
    try:
        # Try using rsvg-convert first (comes with librsvg)
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_png = temp_file.name
        
        # Use rsvg-convert to convert SVG to PNG
        subprocess.run([
            'rsvg-convert',
            '-w', str(output_size),
            '-h', str(output_size),
            '-o', temp_png,
            svg_path
        ], check=True)
        
        # Open the PNG with PIL
        img = Image.open(temp_png)
        
        # Convert to RGBA if not already to ensure transparency is preserved
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        # Remove the temporary file
        os.unlink(temp_png)
        
        return img
    except (subprocess.SubprocessError, FileNotFoundError):
        print("rsvg-convert not available, falling back to alternative method...")
        # Alternative method if first one fails
        try:
            # Try with Inkscape
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                temp_png = temp_file.name
            
            subprocess.run([
                'inkscape',
                '--export-filename=' + temp_png,
                f'--export-width={output_size}',
                f'--export-height={output_size}',
                svg_path
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            img = Image.open(temp_png)
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
                
            os.unlink(temp_png)
            return img
        except (subprocess.SubprocessError, FileNotFoundError):
            print("Inkscape not available, falling back to ImageMagick...")
            # Final fallback to ImageMagick
            try:
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                    temp_png = temp_file.name
                
                subprocess.run([
                    'convert',
                    '-background', 'none',  # Ensures transparent background
                    '-density', '300',      # High resolution for better quality
                    '-resize', f'{output_size}x{output_size}',
                    svg_path,
                    temp_png
                ], check=True)
                
                img = Image.open(temp_png)
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                    
                os.unlink(temp_png)
                return img
            except (subprocess.SubprocessError, FileNotFoundError):
                # No suitable converters found, let the user know
                print("Error: Could not find rsvg-convert, Inkscape, or ImageMagick for SVG conversion.")
                print("Please install one of these tools:")
                print("  - librsvg (for rsvg-convert)")
                print("  - Inkscape")
                print("  - ImageMagick")
                sys.exit(1)

def create_favicon_ico(svg_path, output_path):
    """Create multi-size favicon.ico file"""
    # Create images at all required sizes
    sizes = [16, 24, 32, 64]
    images = []
    
    for size in sizes:
        img = convert_svg_to_png(svg_path, size)
        images.append(img)
    
    # Save as ICO with multiple sizes
    images[0].save(
        output_path,
        format='ICO', 
        sizes=[(size, size) for size in sizes],
        append_images=images[1:]
    )
    print(f"Created favicon.ico with sizes {sizes}")

def create_app_icons(svg_path, public_dir):
    """Create app icons for manifest.json"""
    # Create 192x192 PNG
    img_192 = convert_svg_to_png(svg_path, 192)
    img_192.save(os.path.join(public_dir, 'logo192.png'), 'PNG')
    print("Created logo192.png")
    
    # Create 512x512 PNG
    img_512 = convert_svg_to_png(svg_path, 512)
    img_512.save(os.path.join(public_dir, 'logo512.png'), 'PNG')
    print("Created logo512.png")

def main():
    """Main function to generate all favicon assets"""
    # Get paths
    script_dir = os.path.dirname(os.path.realpath(__file__))
    project_dir = script_dir  # Assuming script is in project root
    
    svg_path = os.path.join(project_dir, 'src', 'logo.svg')
    public_dir = os.path.join(project_dir, 'public')
    
    # Check if source SVG exists
    if not os.path.exists(svg_path):
        print(f"Error: Source SVG not found at {svg_path}")
        sys.exit(1)
    
    # Generate favicon.ico
    create_favicon_ico(svg_path, os.path.join(public_dir, 'favicon.ico'))
    
    # Generate app icons
    create_app_icons(svg_path, public_dir)
    
    print("Successfully generated all favicon and app icons!")
    print("You can customize the manifest.json file if needed.")

if __name__ == "__main__":
    main()
