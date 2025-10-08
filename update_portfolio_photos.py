# -*- coding: utf-8 -*-
import os
import json
import shutil
from pathlib import Path

# Переход в рабочую директорию
os.chdir(r'C:\Users\pa8hka\Desktop\site')

# Загрузка portfolio.json
with open('data/portfolio.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Загружено проектов: {len(data['projects'])}\n")

# Словарь соответствия ID проектов и названий папок
folder_mapping = {
    'terrace-scandinavian': 'Терраса загородного дома в скандинавском стиле',
    'bedroom-classic-modern': 'Спальня классическая в современности',
    'pink-classic-bedroom': 'Классическая розовая спальня',
    'boy-room-modern-classic': 'Детская мальчика современная классика',
    'girl-room-modern': 'Детская девочки в современном стиле (13 кв.м)',
    'girl-loft-bedroom': 'Спальня девочки в лофт стиле',
    'loft-apartment': 'Квартира в современном лофт стиле',
    'apartment-70sqm': 'Квартира в современном стиле (70 кв )',
    'apartment-japanese-bedroom': 'Квартира в современном стиле с японской спальней (36кв. М)',
    'apartment-beige-olive': 'Квартира в бежево-оливковом цвете',
    'modern-apartment-extended': 'Квартира современная',
    'modern-apartment-compact': 'Квартира в современнм стиле',
    'modern-kitchen': 'Современная кухня',
    'unusual-bathroom': 'Санузел необычный',
    'restaurant': 'Ресторан',
    'gym': 'Спортивный зал',
    'computer-club': 'Компьютерный клуб',
    'business-center-concepts': 'Концепции для бизнес центров'
}

def find_main_photo(folder_path):
    """Ищет главное фото в папке"""
    possible_names = [
        'главное.jpg', 'главное.JPG', 'Главное.jpg', 'Главное.JPG',
        'главная.jpg', 'главная.JPG', 'Главная.jpg', 'Главная.JPG',
        'главное фото.jpg', 'Главное фото.jpg'
    ]
    
    try:
        files = os.listdir(folder_path)
        for name in possible_names:
            if name in files:
                return name
        for f in files:
            if f.lower().startswith('главн') and f.lower().endswith(('.jpg', '.jpeg')):
                return f
        return None
    except Exception as e:
        print(f"Ошибка при чтении папки {folder_path}: {e}")
        return None

def get_all_photos(folder_path):
    """Получает список всех фото в папке"""
    try:
        files = os.listdir(folder_path)
        photos = [f for f in files if f.lower().endswith(('.jpg', '.jpeg'))]
        return sorted(photos)
    except Exception as e:
        print(f"Ошибка при чтении папки {folder_path}: {e}")
        return []

updated_count = 0
errors = []

for project in data['projects']:
    project_id = project['id']
    project_title = project['title']
    
    print(f"\n{'='*60}")
    print(f"Обработка: {project_title}")
    print(f"ID: {project_id}")
    
    if project_id not in folder_mapping:
        error_msg = f"[!] Папка для проекта '{project_title}' (ID: {project_id}) не найдена"
        print(error_msg)
        errors.append(error_msg)
        continue
    
    source_folder_name = folder_mapping[project_id]
    source_folder = os.path.join('Портфолио', source_folder_name)
    
    if not os.path.exists(source_folder):
        error_msg = f"[X] Исходная папка не существует: {source_folder}"
        print(error_msg)
        errors.append(error_msg)
        continue
    
    target_folder = os.path.join('images', 'portfolio', project_id)
    os.makedirs(target_folder, exist_ok=True)
    
    main_photo = find_main_photo(source_folder)
    if not main_photo:
        error_msg = f"[!] Главное фото не найдено: {source_folder_name}"
        print(error_msg)
        errors.append(error_msg)
        continue
    
    print(f"[OK] Найдено главное фото: {main_photo}")
    
    all_photos = get_all_photos(source_folder)
    if not all_photos:
        error_msg = f"[!] Фото не найдены в папке: {source_folder_name}"
        print(error_msg)
        errors.append(error_msg)
        continue
    
    print(f"[*] Найдено фото: {len(all_photos)}")
    
    for old_file in os.listdir(target_folder):
        old_file_path = os.path.join(target_folder, old_file)
        if os.path.isfile(old_file_path):
            os.remove(old_file_path)
            print(f"  [-] Удален: {old_file}")
    
    copied_files = []
    for photo in all_photos:
        source_path = os.path.join(source_folder, photo)
        if photo == main_photo:
            target_filename = 'главное.jpg'
        else:
            target_filename = photo
        
        target_path = os.path.join(target_folder, target_filename)
        
        try:
            shutil.copy2(source_path, target_path)
            copied_files.append(target_filename)
            print(f"  [+] Скопирован: {photo} -> {target_filename}")
        except Exception as e:
            error_msg = f"  [X] Ошибка копирования {photo}: {e}"
            print(error_msg)
            errors.append(error_msg)
    
    main_image_path = f"images/portfolio/{project_id}/главное.jpg"
    project['mainImage'] = main_image_path
    
    gallery = []
    gallery.append({
        "url": main_image_path,
        "alt": "Общий вид",
        "large": True
    })
    
    for photo in copied_files:
        if photo != 'главное.jpg':
            photo_path = f"images/portfolio/{project_id}/{photo}"
            alt_text = photo.replace('.jpg', '').replace('.JPG', '').replace('_', ' ').replace('photo', 'Фото').strip()
            gallery.append({
                "url": photo_path,
                "alt": alt_text
            })
    
    project['gallery'] = gallery
    
    print(f"[OK] Проект обновлен!")
    print(f"   Главное фото: {main_image_path}")
    print(f"   Всего фото: {len(gallery)}")
    updated_count += 1

print(f"\n{'='*70}")
print(f"ИТОГИ:")
print(f"   Обновлено: {updated_count} из {len(data['projects'])}")
print(f"   Ошибок: {len(errors)}")

if errors:
    print(f"\nСписок ошибок:")
    for error in errors:
        print(f"   - {error}")

print(f"\nСохранение portfolio.json...")
with open('data/portfolio.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"[OK] Файл portfolio.json обновлен!")
print(f"[OK] Готово! Можно проверять сайт.")
