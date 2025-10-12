# Скрипт для добавления hero-баннеров на все страницы

import re

# CSS для hero-баннера
hero_css = '''        /* Hero-баннер */
        .page-hero {
            padding-top: 150px;
            padding-bottom: 100px;
            background: var(--gradient);
            color: white;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .page-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".1" fill="%23ffffff"/></svg>') no-repeat bottom;
            background-size: cover;
            opacity: 0.1;
        }
        
        .page-hero h1 {
            font-size: 3.5rem;
            margin-bottom: 20px;
            font-weight: 700;
            position: relative;
        }
        
        .page-hero p {
            max-width: 800px;
            margin: 0 auto;
            font-size: 1.2rem;
            opacity: 0.95;
            position: relative;
        }'''

# Файлы для обновления
files = {
    'drawings-page.html': {
        'title': 'Чертежи и проектирование',
        'description': 'Профессиональные чертежи и техническая документация для реализации вашего дизайн-проекта'
    },
    'about-page.html': {
        'title': 'О нас',
        'description': 'Студия дизайна интерьера с многолетним опытом создания уникальных пространств'
    }
}

def add_gradient_var(content):
    """Добавляет переменную gradient, если её нет"""
    if '--gradient:' not in content:
        # Найдём :root и добавим gradient
        pattern = r'(:root\s*\{[^}]+)'
        replacement = r'\1\n            --gradient: linear-gradient(135deg, #2c5530 0%, #6c9c84 100%);'
        content = re.sub(pattern, replacement, content, count=1)
    return content

def update_file(filename, title, description):
    """Обновляет файл: добавляет hero-баннер"""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Добавляем gradient, если нет
    content = add_gradient_var(content)
    
    # Заменяем CSS для .page-header на .page-hero
    old_css_pattern = r'/\* Заголовок страницы \*/\s*\.page-header\s*\{[^}]+\}\s*\.page-title\s*\{[^}]+\}\s*\.page-description\s*\{[^}]+\}'
    if re.search(old_css_pattern, content, re.DOTALL):
        content = re.sub(old_css_pattern, hero_css, content, flags=re.DOTALL)
    
    # Заменяем HTML
    old_html = r'<header class="page-header">.*?</header>'
    new_html = f'''<section class="page-hero">
        <div class="container" data-aos="fade-up">
            <h1>{title}</h1>
            <p>{description}</p>
        </div>
    </section>'''
    
    content = re.sub(old_html, new_html, content, flags=re.DOTALL)
    
    # Добавляем AOS CSS, если нет
    if 'aos@2.3.1/dist/aos.css' not in content:
        content = content.replace('</head>', '''    
    <!-- AOS Animation Library -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
</head>''')
    
    # Добавляем AOS JS, если нет
    if 'aos@2.3.1/dist/aos.js' not in content:
        content = content.replace('</body>', '''    
    <!-- AOS Library -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        // Initialize AOS
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    </script>
</body>''')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'OK: Обновлён {filename}')

# Обновляем все файлы
for filename, data in files.items():
    try:
        update_file(filename, data['title'], data['description'])
    except Exception as e:
        print(f'ERROR в {filename}: {e}')

print('\nВсе файлы обновлены!')
