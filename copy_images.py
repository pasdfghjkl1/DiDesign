# -*- coding: utf-8 -*-
import os
import shutil
import sys

# Исправление кодировки для Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

print("=" * 70)
print("КОПИРОВАНИЕ ИЗОБРАЖЕНИЙ ПОРТФОЛИО")
print("=" * 70)

portfolio_source = r"C:\Users\pa8hka\Desktop\site\Портфолио"
portfolio_dest = r"C:\Users\pa8hka\Desktop\site\images\portfolio"

os.makedirs(portfolio_dest, exist_ok=True)

folder_mapping = {
    "Терраса загородного дома в скандинавском стиле": "terrace-scandinavian",
    "Спальня классическая в современности": "bedroom-classic-modern",
    "Классическая розовая спальня": "pink-classic-bedroom",
    "Детская мальчика современная классика": "boy-room-modern-classic",
    "Детская девочки в современном стиле (13 кв.м)": "girl-room-modern",
    "Спальня девочки в лофт стиле": "girl-loft-bedroom",
    "Дом в классическом стиле": "classic-house",
    "Квартира в современном лофт стиле": "loft-apartment",
    "Квартира в современном стиле (70 кв )": "apartment-70sqm",
    "Квартира в современном стиле с японской спальней (36кв. М)": "apartment-japanese-bedroom",
    "Квартира в бежево-оливковом цвете": "apartment-beige-olive",
    "Квартира в современнм стиле": "modern-apartment-extended",
    "Квартира современная": "modern-apartment-compact",
    "Современная кухня": "modern-kitchen",
    "Санузел необычный": "unusual-bathroom",
    "Ресторан": "restaurant",
    "Салон красоты": "beauty-salon",
    "Спортивный зал": "gym",
    "Компьютерный клуб": "computer-club",
    "Магазин в тц": "retail-store",
    "Концепции для бизнес центров": "business-center-concepts"
}

copied_count = 0
total_files = 0

for old_folder_name, new_folder_name in folder_mapping.items():
    source_folder = os.path.join(portfolio_source, old_folder_name)
    dest_folder = os.path.join(portfolio_dest, new_folder_name)
    
    if not os.path.exists(source_folder):
        print(f"Папка не найдена: {old_folder_name}")
        continue
    
    os.makedirs(dest_folder, exist_ok=True)
    
    files = [f for f in os.listdir(source_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif'))]
    total_files += len(files)
    
    print(f"\n{old_folder_name}")
    print(f"  -> {new_folder_name} ({len(files)} файлов)")
    
    for file_name in files:
        source_file = os.path.join(source_folder, file_name)
        dest_file = os.path.join(dest_folder, file_name)
        
        try:
            shutil.copy2(source_file, dest_file)
            copied_count += 1
            print(f"  OK {file_name}")
        except Exception as e:
            print(f"  Ошибка {file_name}: {e}")

print("\n" + "=" * 70)
print(f"ГОТОВО! Скопировано {copied_count} из {total_files} файлов")
print(f"Папка: {portfolio_dest}")
print("=" * 70)
