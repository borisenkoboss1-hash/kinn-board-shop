// ============================================================
// common.js — общие интерактивные элементы для ВСЕХ СТРАНИЦ
// ============================================================
// Этот файл подключается на КАЖДОЙ странице сайта.
// Он отвечает за: прелоадер, бургер-меню, плавную прокрутку,
// анимацию появления, счётчики, уведомления.

// ============================================================
// 1. ПРЕЛОАДЕР (экран загрузки)
// ============================================================
// Прелоадер — это полноэкранный оверлей с анимацией,
// который показывается, пока страница загружается,
// и плавно исчезает, когда всё готово.

// Немедленное выполнение (сразу при загрузке скрипта)
// Добавляет прелоадер в самое начало страницы
(function createPreloader() {
    // Создаём контейнер для прелоадера
    const preloader = document.createElement('div');
    preloader.id = 'preloader';  // Уникальный идентификатор для CSS и JS
    
    // Наполняем прелоадер: крутящийся спиннер + текст
    preloader.innerHTML = `
        <div class="preloader-spinner"></div>  <!-- Вращающийся круг -->
        <div class="preloader-text">KINN</div> <!-- Название бренда -->
    `;
    
    // Вставляем прелоадер самым первым элементом внутрь <body>
    document.body.insertBefore(preloader, document.body.firstChild);
})();  // Скобки () вызывают функцию немедленно

// Когда ВСЯ страница (включая картинки, шрифты, стили) полностью загрузилась
// Событие 'load' срабатывает ПОЗЖЕ, чем DOMContentLoaded
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;  // Если прелоадера нет — выходим

    // Добавляем класс 'hidden' — CSS делает его прозрачным
    preloader.classList.add('hidden');

    // Ждём 0.5 секунды (пока анимация исчезновения завершится)
    setTimeout(() => {
        preloader.remove();  // Полностью удаляем прелоадер из DOM
    }, 500);
});


// ============================================================
// 2. BURGER MENU (адаптивное меню для мобильных устройств)
// ============================================================
// фон затемняется, страница блокируется от прокрутки.
// При повторном клике, клике на затемнение или на ссылку — меню закрывается.

// Ждём, пока весь HTML загрузится (DOM готов)
document.addEventListener('DOMContentLoaded', function() {

    // Находим главный контейнер навигации
    const nav = document.querySelector('.nav');
    if (!nav) return; // Если на странице нет навигации — выходим

    // --- ШАГ 1: СОЗДАЁМ КНОПКУ-БУРГЕР (три полоски) ---
    const burger = document.createElement('button');
    burger.className = 'burger-btn';                // Класс для CSS
    burger.setAttribute('aria-label', 'Открыть меню'); // Для доступности (скринридеры)
    burger.innerHTML = '<span></span><span></span><span></span>'; // Три полоски
    nav.appendChild(burger);  // Добавляем кнопку в навигацию

    // --- ШАГ 2: СОЗДАЁМ ЗАТЕМНЁННУЮ ОБЛАСТЬ (overlay) ---
    // Перекрывает всю страницу, когда меню открыто
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // --- ШАГ 3: НАХОДИМ ОРИГИНАЛЬНЫЕ МЕНЮ ---
    const navLeft  = nav.querySelector('.nav-left');   // Левая часть меню (ссылки SHOP, GALLERY...)
    const navRight = nav.querySelector('.nav-right');  // Правая часть меню (иконки)

    // --- ШАГ 4: СОЗДАЁМ МОБИЛЬНОЕ МЕНЮ (выезжающее) ---
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';

    // Клонируем содержимое оригинальных меню в мобильное
    // cloneNode(true) — глубокое копирование (все вложенные элементы)
    if (navLeft)  mobileMenu.appendChild(navLeft.cloneNode(true));
    if (navRight) mobileMenu.appendChild(navRight.cloneNode(true));

    document.body.appendChild(mobileMenu);

    // --- ШАГ 5: ФУНКЦИЯ ОТКРЫТИЯ/ЗАКРЫТИЯ МЕНЮ ---
    function toggleMenu() {
        // burger.classList.toggle('active') — переключает класс:
        //   если нет - добавляет, если есть - убирает
        // Возвращает true, если класс был добавлен (меню открылось)
        const isOpen = burger.classList.toggle('active');
        
        mobileMenu.classList.toggle('active');  // Меню выезжает
        overlay.classList.toggle('active');     // Затемнение появляется

        // Блокируем или разблокируем прокрутку страницы
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    // --- ШАГ 6: НАВЕШИВАЕМ ОБРАБОТЧИКИ ---
    burger.addEventListener('click', toggleMenu);   // Клик по бургеру
    overlay.addEventListener('click', toggleMenu);  // Клик по затемнению

    // Закрываем меню при клике на любую ссылку или пункт меню
    mobileMenu.addEventListener('click', function(e) {
        // Если кликнули по элементу <li> (пункт меню) или <a> (ссылка)
        if (e.target.tagName === 'LI' || e.target.tagName === 'A') {
            toggleMenu();  // Закрываем меню
        }
    });
});


// ============================================================
// 3. ПЛАВНАЯ ПРОКРУТКА К РАЗДЕЛАМ (smooth scroll)
// ============================================================
// Если ссылка ведёт на якорь вида href="#section-id" (например, #gallery-section),
// страница плавно прокручивается к этому элементу вместо мгновенного "прыжка".

document.addEventListener('DOMContentLoaded', function() {
    // Находим все ссылки, которые начинаются с символа "#" (якорные ссылки)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');  // Например: "#gallery-section"

            // Игнорируем пустую ссылку "#" (часто используется как заглушка)
            if (targetId === '#' || targetId.length < 2) return;

            // Находим элемент на странице с таким id
            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;  // Если элемент не найден — ничего не делаем

            e.preventDefault();  // Отменяем стандартный переход (мгновенный прыжок)

            // Встроенная плавная прокрутка браузера
            targetEl.scrollIntoView({
                behavior: 'smooth',  // Плавная анимация
                block: 'start'       // Привязать к верхнему краю экрана
            });
        });
    });
});


// ============================================================
// 4. АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ ПРОКРУТКЕ (reveal on scroll)
// ============================================================
// Элементы с классом "reveal-on-scroll" изначально невидимы.
// Когда они попадают в зону видимости — плавно появляются.

document.addEventListener('DOMContentLoaded', function() {
    // Находим все элементы, которые нужно анимировать
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length === 0) return;  // Если таких нет — выходим

    // Создаём наблюдателя (IntersectionObserver) — современный API,
    // который эффективно отслеживает появление элементов на экране
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Если элемент стал видимым на экране
            if (entry.isIntersecting) {
                // Добавляем класс 'revealed' — CSS запускает анимацию
                entry.target.classList.add('revealed');
                // Прекращаем наблюдение за этим элементом (анимация уже сыграла)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15  // Сработать, когда 15% элемента стали видны
    });

    // Начинаем наблюдать за каждым элементом
    revealElements.forEach(el => observer.observe(el));
});


// ============================================================
// 5. АНИМИРОВАННЫЕ СЧЁТЧИКИ (для корзины и избранного)
// ============================================================
// Когда число товаров в корзине меняется, цифра плавно "прокручивается"
// от старого значения к новому (вместо мгновенной смены).

// targetEl — DOM-элемент (например, span с числом)
// newValue — новое число, которое нужно показать
function animateCounter(targetEl, newValue) {
    if (!targetEl) return;  // Если элемента нет — выходим

    // Получаем текущее значение из элемента (если пусто — считаем 0)
    const oldValue = parseInt(targetEl.textContent) || 0;
    newValue = parseInt(newValue) || 0;

    // Если значение не изменилось — анимация не нужна
    if (oldValue === newValue) return;

    const duration = 400;                      // Длительность: 0.4 секунды
    const startTime = performance.now();       // Время начала анимации

    // Функция, которая вызывается на каждом кадре анимации (~60 раз/сек)
    function step(currentTime) {
        // Прогресс: сколько времени прошло (от 0 до 1)
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Текущее значение (пропорционально прогрессу)
        const currentValue = Math.round(oldValue + (newValue - oldValue) * progress);
        targetEl.textContent = currentValue;  // Обновляем число на странице

        // Добавляем эффект "пульсации" (увеличение и уменьшение)
        targetEl.classList.add('counter-pulse');

        if (progress < 1) {
            // Анимация не закончена → запрашиваем следующий кадр
            requestAnimationFrame(step);
        } else {
            // Анимация закончена → через 0.2 секунды убираем пульсацию
            setTimeout(() => targetEl.classList.remove('counter-pulse'), 200);
        }
    }

    // Запускаем анимацию
    requestAnimationFrame(step);
}

// Делаем функцию доступной из других файлов (cart.js, favorites.js)
window.animateCounter = animateCounter;


// ============================================================
// 6. ПОКАЗ КНОПКИ ADMIN ДЛЯ АДМИНИСТРАТОРА
// ============================================================
// Если залогиненный пользователь имеет роль 'admin' —
// показываем кнопку "ADMIN" в шапке сайта (для перехода в админ-панель)

document.addEventListener('DOMContentLoaded', function() {
    // Получаем данные пользователя из localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Если пользователь залогинен и его роль — администратор
    if (currentUser && currentUser.role === 'admin') {
        // Находим все элементы с id="adminLink" (их может быть несколько)
        // (например, в десктопном и мобильном меню)
        document.querySelectorAll('#adminLink').forEach(el => {
            el.style.display = 'inline';  // Показываем кнопку
        });
    }
});


// ============================================================
// 7. ВСЕПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ (TOAST)
// ============================================================
// Используется на всех страницах для сообщений типа:
// "Товар добавлен в корзину", "Товар удалён", "Покупка оформлена"

// Создаём контейнер для уведомлений (один раз при загрузке)
document.addEventListener('DOMContentLoaded', function() {
    // Если контейнер уже есть — не создаём повторно
    if (document.querySelector('.toast-stack')) return;
    
    const stack = document.createElement('div');
    stack.className = 'toast-stack';  // Контейнер для стопки уведомлений
    document.body.appendChild(stack);
});

// Показывает всплывающее уведомление
// message — текст уведомления
// type — тип: 'success' (зелёный), 'error' (красный), 'info' (синий)
function showNotification(message, type = 'info') {
    const stack = document.querySelector('.toast-stack');
    if (!stack) return;

    // Создаём элемент уведомления
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;  // Например: "toast-item success"
    toast.textContent = message;

    // Добавляем в контейнер
    stack.appendChild(toast);

    // Через 3 секунды удаляем уведомление из DOM
    setTimeout(() => toast.remove(), 3000);
}

// Делаем функцию доступной из других файлов (cart.js, admin.js и т.д.)
window.showNotification = showNotification;


// ============================================================
// 0. ОЧИСТКА УСТАРЕВШИХ ДАННЫХ (русские дубликаты)
// ============================================================
// Удаляем старые ключи на русском языке, чтобы не конфликтовали
(function cleanOldLocalStorage() {
    // Список устаревших ключей для удаления
    const oldKeys = ['пользователь', 'тема', 'язык', 'user', 'theme_old', 'lang_old'];
    
    oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`Удалён устаревший ключ: ${key}`);
        }
    });
})();