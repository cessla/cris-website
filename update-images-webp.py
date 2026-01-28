#!/usr/bin/env python3
"""
Convert img tags to picture elements with WebP and JPEG fallback
Converts all portfolio image tags to use modern responsive picture elements
"""

import re
from pathlib import Path

def update_images_to_picture(html_content):
    """Replace img tags with picture elements supporting WebP and JPEG"""
    
    # Pattern to match img tags in project-image divs
    # Matches: <div class="project-image"><img src="./images/project-X-name-sm.jpg" ...
    pattern = r'<div class="project-image"><img src="(\.\/images\/(project-\d+-[\w-]+)-sm\.jpg)"([^>]*)srcset="([^"]+)"([^>]*)>'
    
    def replacement(match):
        original_src = match.group(1)
        project_name = match.group(2)
        attr_start = match.group(3)
        srcset_content = match.group(4)
        attr_end = match.group(5)
        
        # Extract the project base name (project-X-name)
        # Convert srcset paths from jpg to webp
        webp_srcset = srcset_content.replace('.jpg ', '.webp ').rstrip('w')
        
        # Build picture element
        picture_html = f'''<div class="project-image"><picture><source srcset="{webp_srcset} 400w, ./images/{project_name}-md.webp 800w, ./images/{project_name}-lg.webp 1200w" sizes="(max-width: 768px) 100vw, 50vw" type="image/webp"><img src="{original_src}"{attr_start}srcset="{srcset_content}"{attr_end}></picture></div>'''
        
        return picture_html
    
    # Replace all matches
    updated = re.sub(pattern, replacement, html_content, flags=re.DOTALL)
    
    return updated

def main():
    file_path = Path("C:\\Users\\Slawek\\p\\cr-website\\index.html")
    
    print("Reading HTML file...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Converting images to picture elements...")
    updated_content = update_images_to_picture(content)
    
    # Count changes
    original_img_count = content.count('<div class="project-image"><img')
    updated_picture_count = updated_content.count('<picture>')
    
    print(f"  Original img tags: {original_img_count}")
    print(f"  Updated to picture tags: {updated_picture_count}")
    
    print("Writing updated HTML...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("✓ Successfully converted all images to picture elements with WebP support!")

if __name__ == "__main__":
    main()
