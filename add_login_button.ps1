# Скрипт для добавления кнопки "Войти" на все страницы

$pages = @("portfolio.html", "services-page.html", "drawings-page.html", "about-page.html")
$buttonHTML = '<li class="nav-item"><a href="client-login.html" class="nav-link client-login-link"><i class="fas fa-user"></i> Войти</a></li>'

foreach ($page in $pages) {
    $filePath = "C:\Users\pa8hka\Desktop\site\$page"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Проверяем, есть ли уже кнопка
        if ($content -notmatch 'client-login\.html') {
            # Ищем закрывающий тег </ul> в навигации и добавляем кнопку перед ним
            $pattern = '(<li class="nav-item"><a href="about-page\.html".*?</a></li>)(\s*</ul>)'
            if ($content -match $pattern) {
                $content = $content -replace $pattern, "`$1`n                $buttonHTML`$2"
                Set-Content -Path $filePath -Value $content -Encoding UTF8
                Write-Host "✅ Добавлена кнопка в $page" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Не найден шаблон навигации в $page" -ForegroundColor Yellow
            }
        } else {
            Write-Host "ℹ️  Кнопка уже есть в $page" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Файл не найден: $page" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Готово!" -ForegroundColor Green
