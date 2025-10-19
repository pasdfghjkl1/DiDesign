import json

with open('data/portfolio.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Всего проектов: {len(data['projects'])}")
print("\nПроверка наличия проектов для главной:")

target_projects = [
    "Квартира 70 кв.м",
    "Спальня лофт", 
    "Современная квартира"
]

for project in data['projects']:
    title = project['title']
    if any(target in title for target in target_projects):
        print(f"✓ Найден: {title} (ID: {project['id']})")
