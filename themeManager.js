// ============================================================
// themeManager.js — управление темой, языком и localStorage
//
// Этот файл подключается на КАЖДОЙ странице (как common.js)
// и отвечает за:
//   1. Переключение светлой/тёмной темы
//   2. Переключение языка 
//   3. Сохранение и восстановление настроек из localStorage
//   4. Добавление кнопок EN/RU и переключателя темы в шапку
//   5. Смену изображений при смене темы 
// ============================================================


// ============================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ НАСТРОЕК
// ============================================================
// создаём две глобальные переменные lang и theme
// со значениями по умолчанию 'en' и 'light'.
// let — потому что переменные будут меняться при переключении.

let lang  = 'en';
let theme = 'light';


// ============================================================
// 1. ВОССТАНОВЛЕНИЕ НАСТРОЕК ИЗ LOCALSTORAGE ПРИ ЗАГРУЗКЕ
// ============================================================
// Выполняем это СРАЗУ (не дожидаясь DOMContentLoaded для темы),
// чтобы пользователь не увидел "вспышку" светлой темы перед тёмной.

(function restoreSettingsEarly() {
    // --- Восстанавливаем тему ---
    // localStorage.getItem возвращает строку или null если ключа нет
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        theme = savedTheme;
    }
    // Применяем тему сразу к <html> через атрибут data-theme
    // (от него зависят CSS-переменные в theme.css)
    document.documentElement.setAttribute('data-theme', theme);

    // --- Восстанавливаем язык ---
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'en' || savedLang === 'ru') {
        lang = savedLang;
    }
    // Перевод страницы применим позже, когда DOM полностью загрузится
    // (после DOMContentLoaded) — иначе data-i18n элементы могут быть не найдены
})();


// ============================================================
// 2. ФУНКЦИИ СОХРАНЕНИЯ И ВОССТАНОВЛЕНИЯ (localStorage)
// ============================================================

// Сохраняет текущие значения lang и theme в localStorage
// ВАЖНО: localStorage хранит только строки —
// для lang/theme это не проблема, они уже строки ('en'/'ru', 'light'/'dark')
function setLocalStorage() {
    localStorage.setItem('lang', lang);
    localStorage.setItem('theme', theme);
}

// Сохраняем настройки и при каждом изменении (для надёжности),
// и перед закрытием/перезагрузкой страницы 
window.addEventListener('beforeunload', setLocalStorage);


// ============================================================
// 3. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ============================================================

function toggleTheme() {
    // Переключаем переменную: light - dark, dark - light
    theme = (theme === 'light') ? 'dark' : 'light';

    // Применяем атрибут к <html> — все CSS-переменные из theme.css
    // мгновенно пересчитываются благодаря [data-theme="dark"] правилам (стили css )
    document.documentElement.setAttribute('data-theme', theme);

    // Обновляем иконку кнопки переключения (солнце/луна)
    updateThemeToggleIcon();

    // Меняем изображения, которые отличаются для тёмной/светлой темы
    updateThemedImages();

    // Сохраняем сразу, не дожидаясь beforeunload —
    // так понятнее для пользователя что настройка применилась
    setLocalStorage();
}

// Обновляет иконку кнопки темы
// (показывает ЧТО произойдёт при следующем клике — переключение НА противоположную)
function updateThemeToggleIcon() {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    // Если сейчас light — показываем луну 
    // Если сейчас dark — показываем солнце 
    btn.textContent = (theme === 'light') ? '🌙' : '☀️';
}


// ============================================================
// 4. СМЕНА ИЗОБРАЖЕНИЙ ПРИ СМЕНЕ ТЕМЫ
// ============================================================
// Используем data-атрибуты: data-light-src и data-dark-src
// У элемента <img> указываем оба варианта, а JS подставляет нужный.
//
// Пример в HTML:
// <img src="images/hero.jpg"
//      data-light-src="images/hero.jpg"
//      data-dark-src="images/hero-dark.jpg">

function updateThemedImages() {
    // Находим все картинки у которых заданы альтернативные источники
    document.querySelectorAll('[data-light-src][data-dark-src]').forEach(img => {
        // Выбираем нужный атрибут в зависимости от текущей темы
        const newSrc = (theme === 'dark')
            ? img.dataset.darkSrc
            : img.dataset.lightSrc;

        // Меняем src только если он отличается — избегаем лишней перезагрузки картинки
        if (img.getAttribute('src') !== newSrc) {
            img.setAttribute('src', newSrc);
        }
    });

    // --- Логотип-эмодзи в шапке (буква "K" в кружке) ---
    // Можно менять цвет фона круга через CSS-переменную --accent (уже сделано в theme.css),
    // но дополнительно меняем эмодзи на иконку фонарика для тёмной темы — забавная деталь
    const logoIcon = document.querySelector('.logo-theme-icon');
    if (logoIcon) {
        logoIcon.textContent = (theme === 'dark') ? '🔥' : '🪵';
    }
}


// ============================================================
// 5. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
// ============================================================

function switchLanguage(newLang) {
    lang = newLang;

    // getTranslate() определена в i18n.js — переводит все [data-i18n] элементы
    if (window.getTranslate) {
        window.getTranslate(lang);
    }

    setLocalStorage();

    // Страницы с карточками товаров (catalog.html) генерируют HTML через JS
    // и не могут быть переведены через data-i18n. Они подписываются на это
    // событие и перерисовывают свой контент с новым языком.
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}
//1. Пользователь нажал "RU"
//2. switchLanguage('ru')  - функция смены языка
//3. dispatchEvent(...)     - "КРИКНУЛА" по радио: "ЯЗЫК ИЗМЕНИЛСЯ!"
//4. catalog.js УСЛЫШАЛ    - там есть код, который ждёт этот крик
//5. catalog.js говорит:    - "Ага! Язык сменился! Надо перерисовать товары!"


/// ============================================================
// ДЕЛАЕМ ПЕРЕМЕННЫЕ И ФУНКЦИИ ДОСТУПНЫМИ ДЛЯ ДРУГИХ ФАЙЛОВ
// ============================================================
// userProfile.js (кнопка сброса настроек) обращается к этим
// переменным и функциям через window.* — поэтому делаем их доступными.
// В JS объявление через "let" на верхнем уровне файла НЕ создаёт
// свойство window автоматически, поэтому делаем это явно.

// window — это глобальный объект браузера.
// Когда мы пишем window.theme = theme, переменная theme становится доступной
// В ЛЮБОМ другом JS файле через window.theme

window.theme = theme;           // Теперь другие файлы могут прочитать тему: window.theme
window.lang  = lang;            // Теперь другие файлы могут прочитать язык: window.lang
window.toggleTheme           = toggleTheme;      // Другие файлы могут вызвать переключение темы
window.switchLanguage         = switchLanguage;   // Другие файлы могут вызвать смену языка
window.updateThemeToggleIcon  = updateThemeToggleIcon;  // Другие файлы могут обновить иконку темы
window.updateThemedImages     = updateThemedImages;     // Другие файлы могут обновить картинки


// ============================================================
// ОБНОВЛЯЕМ window.theme КОГДА МЕНЯЕТСЯ ПЕРЕМЕННАЯ theme
// ============================================================
// Проблема: когда мы меняем переменную theme через toggleTheme(),
// window.theme остаётся старой (это просто копия).
// Решение: каждый раз при вызове toggleTheme обновляем и window.theme.

// Сохраняем ОРИГИНАЛЬНУЮ функцию toggleTheme в отдельную переменную
const _originalToggleTheme = toggleTheme;

// ПЕРЕОПРЕДЕЛЯЕМ функцию toggleTheme (заменяем её на новую)
toggleTheme = function() {
    // 1. Сначала вызываем ОРИГИНАЛЬНУЮ функцию (она меняет переменную theme)
    _originalToggleTheme();
    
    // 2. Обновляем window.theme, чтобы в других файлах было актуальное значение
    window.theme = theme;
};

// Делаем новую функцию доступной через window
window.toggleTheme = toggleTheme;


// ============================================================
// ТО ЖЕ САМОЕ ДЛЯ ФУНКЦИИ switchLanguage (смена языка)
// ============================================================

// Сохраняем оригинальную функцию
const _originalSwitchLanguage = switchLanguage;

// Переопределяем функцию — теперь она будет обновлять и window.lang
switchLanguage = function(newLang) {
    // 1. Вызываем оригинальную функцию (она меняет переменную lang)
    _originalSwitchLanguage(newLang);
    
    // 2. Обновляем window.lang для других файлов
    window.lang = lang;
};

// Делаем новую функцию доступной через window
window.switchLanguage = switchLanguage;


// ============================================================
// ДОБАВЛЯЕМ КНОПКИ В ШАПКУ САЙТА (ПРОГРАММНО)
// ============================================================
// Чтобы не добавлять кнопки EN/RU и переключатель темы вручную в каждый HTML файл,
// мы создаём их через JavaScript и вставляем в шапку автоматически.

document.addEventListener('DOMContentLoaded', function() {

    // Находим правую часть меню в шапке (там где иконка пользователя, корзина)
    const navRight = document.querySelector('.nav-right');
    
    // Если на странице нет шапки с классом .nav-right — выходим (ничего не делаем)
    if (!navRight) return;

    // Создаём новый пункт меню (<li>), который будет содержать кнопки
    const switchWrap = document.createElement('li');
    switchWrap.className = 'lang-theme-switch';  // CSS-класс для стилизации
    
    // Внутрь этого пункта добавляем кнопки:
    // - EN — английский язык
    // - RU — русский язык  
    // - кнопка переключения темы (сейчас пустая, иконку добавит функция updateThemeToggleIcon)
    switchWrap.innerHTML = `
        <button class="lang-btn" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="ru">RU</button>
        <button class="theme-toggle" title="Toggle theme"></button>
    `;

    // Вставляем созданный блок ПЕРВЫМ элементом в правую часть меню
    // (перед иконкой пользователя и корзиной)
    navRight.insertBefore(switchWrap, navRight.firstChild);

    // --- НАСТРАИВАЕМ КНОПКИ ---
    
    // Для каждой кнопки языка (EN и RU) добавляем обработчик клика
    switchWrap.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
        // btn.dataset.lang — это значение атрибута data-lang (например "en" или "ru")
    });

    // Для кнопки переключения темы добавляем обработчик клика
    switchWrap.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

    // --- ПРИМЕНЯЕМ СОХРАНЁННЫЕ НАСТРОЙКИ ---
    
    // 1) Переводим страницу на тот язык, который был сохранён в localStorage
    //    (если пользователь ранее выбрал русский — страница откроется на русском)
    if (window.getTranslate) {
        window.getTranslate(lang);  // lang — это переменная из начала файла (en или ru)
    }

    // 2) Обновляем иконку кнопки темы в зависимости от текущей темы
    updateThemeToggleIcon();

    // 3) Обновляем картинки, которые отличаются для светлой/тёмной темы
    updateThemedImages();
});