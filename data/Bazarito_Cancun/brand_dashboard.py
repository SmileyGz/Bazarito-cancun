import os
import glob

# Paths
base_dir = '/Users/josegonzalez/Documents/Smileys Org/02_Businesses/Bazarito_Cancun/data/Bazarito_Cancun'
html_files = glob.glob(os.path.join(base_dir, '**', 'index.html'), recursive=True)

replacements = {
    '--bg-color: #0f172a;': '--bg-color: #FFFBEE;',
    '--card-bg: rgba(30, 41, 59, 0.7);': '--card-bg: rgba(255, 255, 255, 0.85);',
    '--card-border: rgba(255, 255, 255, 0.1);': '--card-border: #F0E6B0;',
    '--text-main: #f8fafc;': '--text-main: #1A1208;',
    '--text-muted: #94a3b8;': '--text-muted: #5C5035;',
    '--accent: #3b82f6;': '--accent: #E84B09;',
    '--accent-hover: #60a5fa;': '--accent-hover: #FF6A30;',
    '--gradient-start: #3b82f6;': '--gradient-start: #E84B09;',
    '--gradient-end: #8b5cf6;': '--gradient-end: #FFD000;',
    'rgba(59, 130, 246,': 'rgba(232, 75, 9,',
    'rgba(139, 92, 246,': 'rgba(255, 208, 0,',
    'background: rgba(15, 23, 42, 0.8);': 'background: rgba(255, 251, 238, 0.85);',
    'background: rgba(30, 41, 59, 0.9);': 'background: rgba(255, 255, 255, 0.95);',
    'border-color: rgba(255, 255, 255, 0.2);': 'border-color: #FFD000;',
    'rgba(0, 0, 0, 0.5)': 'rgba(26, 18, 8, 0.12)',
    'rgba(0,0,0,0.3)': 'rgba(26, 18, 8, 0.12)'
}

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Updated {len(html_files)} files.")
