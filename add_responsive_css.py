import os
import re

# Папка с HTML файлами
site_dir = r'C:\Users\pa8hka\Desktop\site'

# Файлы которые нужно обновить
html_files = [
    'services-page.html',
    'drawings-page.html',
    'about-page.html',
    'client-dashboard.html',
    'admin-dashboard.html'
]

# Строка для добавления
css_line = '    <link rel="stylesheet" href="css/responsive-fixes.css">\n'

for filename in html_files:
    filepath = os.path.join(site_dir, filename)
    
    if not os.path.exists(filepath):
        print(f"Not found: {filename}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Проверяем, не добавлен ли уже CSS
        if 'responsive-fixes.css' in content:
            print(f"Already added: {filename}")
            continue
        
        # Ищем место для вставки (после font-awesome или последнего link)
        pattern = r'(<link[^>]*font-awesome[^>]*>)\n'
        if re.search(pattern, content):
            # Добавляем после font-awesome
            content = re.sub(pattern, r'\1\n' + css_line, content)
        else:
            # Добавляем после последнего <link>
            pattern = r'(<link[^>]*>)(?!.*<link)'
            content = re.sub(pattern, r'\1\n' + css_line, content)
        
        # Записываем обновлённый контент
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated: {filename}")
    
    except Exception as e:
        print(f"Error: {filename} - {e}")

print("\nDone!")
