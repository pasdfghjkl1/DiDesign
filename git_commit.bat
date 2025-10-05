@echo off
cd /d C:\Users\pa8hka\Desktop\site
git add data/portfolio.json portfolio.html
git commit -m "Обновление портфолио: удалены проекты (магазин, салон красоты, дом в классике), обновлены главные фото, убрано расположение из информации"
git push origin main
pause
