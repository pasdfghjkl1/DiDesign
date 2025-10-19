import os
import re

# Папка с HTML файлами
site_dir = r'C:\Users\pa8hka\Desktop\site'

# Файлы для обновления
html_files = [
    'portfolio.html',
    'services-page.html',
    'drawings-page.html',
    'about-page.html'
]

for filename in html_files:
    filepath = os.path.join(site_dir, filename)
    
    if not os.path.exists(filepath):
        print(f"Not found: {filename}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Проверяем, не добавлен ли уже Telegram
        if 'telegram' in content.lower() and 'fab fa-telegram' in content:
            print(f"Already added: {filename}")
            continue
        
        # Ищем секцию с плавающими кнопками и добавляем Telegram
        old_pattern = r'(<div class="floating-buttons">)\s*(<a href="https://wa\.me/)'
        new_code = r'\1\n        <a href="https://t.me/YOUR_TELEGRAM_USERNAME" class="floating-btn telegram" title="Telegram">\n            <i class="fab fa-telegram-plane"></i>\n        </a>\n        \2'
        
        content = re.sub(old_pattern, new_code, content)
        
        # Добавляем стиль для Telegram, если его нет
        if '.floating-btn.telegram' not in content:
            style_pattern = r'(\.floating-btn\.whatsapp \{\s*background: #25D366;\s*\})'
            style_addition = r'\1\n\n        .floating-btn.telegram {\n            background: #0088cc;\n        }'
            content = re.sub(style_pattern, style_addition, content)
        
        # Записываем обновлённый контент
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated: {filename}")
    
    except Exception as e:
        print(f"Error: {filename} - {e}")

print("\nDone!")
