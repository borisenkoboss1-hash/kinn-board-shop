// ============================================================
// index.js — логика главной страницы 
// ============================================================

const API = 'http://localhost:8000';

// ============================================================
// 1. ИНИЦИАЛИЗАЦИЯ SWIPER-СЛАЙДЕРА
// ============================================================
// Swiper подключён через CDN в index.html.
// new Swiper(selector, options) — создаёт слайдер на элементе .hero-swiper

const heroSwiper = new Swiper('.hero-swiper', {
    loop: true, // бесконечная карусель — после последнего слайда снова первый

    // Автоматическое переключение слайдов 
    autoplay: {
        delay: 5000,                 // 5 секунд на каждом слайде
        disableOnInteraction: false  // автопрокрутка не останавливается после клика пользователя
    },

    // Плавный эффект перехода между слайдами
    speed: 800, // 800мс на анимацию смены слайда

    // Точки-индикаторы (пагинация-разбиение информации на страницы и кнопки для переключения между ними)
    pagination: {
        el: '.swiper-pagination',
        clickable: true // можно кликнуть на точку чтобы перейти к слайду
    },

    // Стрелки "вперёд"/"назад" — ручное управление пользователем
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    }
});


// ============================================================
// 2. ИНТЕРАКТИВНАЯ МЕДИАГАЛЕРЕЯ СО ЗВУКОМ
// ============================================================

// КОЛЛЕКЦИЯ ИЗОБРАЖЕНИЙ ДЛЯ ГАЛЕРЕИ
// Здесь хранятся пути ко всем картинкам, которые могут показываться в галерее
const GALLERY_IMAGES = [
    'images/gallery-1.jpg',      // Изображение 1
    'images/gallery-2.jpg',      // Изображение 2
    'images/gallery-3.jpg',      // Изображение 3
    'images/gallery-4.jpg',      // Изображение 4
    'images/hero.jpg',           // Изображение 5
    'images/table-time.jpg',     // Изображение 6
    'images/essentials.jpg',     // Изображение 7
    'images/board-short.jpg',    // Изображение 8
    'images/board-long.jpg',     // Изображение 9
    'images/board-wide.jpg',     // Изображение 10
    'images/design-story.jpg'    // Изображение 11 
];

// Переменная для хранения текущего играющего звука
// Нужна, чтобы регулятор громкости знал, громкость какого звука менять
// Возможные значения: 'saw' (пила), 'wood' (дерево), 'kitchen' (кухня) или null (ничего не играет)
let currentSoundKey = null;

// ОБЪЕКТ-СООТВЕТСТВИЕ: кнопка - аудиоэлемент
// Ключ объекта (saw/wood/kitchen) соответствует значению data-sound у кнопки
// Значение — это HTML-элемент <audio> с нужным звуком
const soundElements = {
    saw:     document.getElementById('soundSaw'),     // Звук пилы
    wood:    document.getElementById('soundWood'),    // Звук дерева
    kitchen: document.getElementById('soundKitchen')  // Звук кухни
};

// ЭЛЕМЕНТЫ СТРАНИЦЫ (для удобства сохраняем их в переменные)
const galleryImage    = document.getElementById('galleryImage');    // Большая картинка в центре
const galleryStatus   = document.getElementById('galleryStatus');   // Блок с индикатором (играет/пауза)
const galleryIcon     = document.getElementById('galleryStatusIcon'); // Иконка играть или пауза
const galleryText     = document.getElementById('galleryStatusText'); // Текст "Playing" или "Paused"
const volumeSlider    = document.getElementById('volumeSlider');     // Ползунок громкости

// ============================================================
// ФУНКЦИЯ: ПОКАЗАТЬ СЛУЧАЙНОЕ ИЗОБРАЖЕНИЕ
// ============================================================
// Выбирает случайную картинку из коллекции GALLERY_IMAGES
// При этом следит, чтобы новая картинка не совпадала с текущей

function showRandomImage() {
    let newSrc;  // Переменная для пути к новой картинке
    
    // Цикл do...while — выполняется хотя бы один раз
    do {
        // Выбираем случайный индекс от 0 до длины массива (минус 1)
        const randomIndex = Math.floor(Math.random() * GALLERY_IMAGES.length);
        // Получаем путь к картинке по случайному индексу
        newSrc = GALLERY_IMAGES[randomIndex];
    } 
    // Повторяем, если новая картинка совпадает с текущей И в коллекции больше 1 картинки
    while (newSrc === galleryImage.getAttribute('src') && GALLERY_IMAGES.length > 1);

    // --- ПЛАВНЫЙ ПЕРЕХОД (smooth transition) ---
    // Добавляем класс fading — картинка становится полупрозрачной (opacity: 0.2)
    galleryImage.classList.add('fading');

    // Через 400 миллисекунд (когда анимация затухания закончилась):
    setTimeout(() => {
        galleryImage.src = newSrc;              // Меняем картинку на новую
        galleryImage.classList.remove('fading'); // Убираем класс — картинка становится видимой
    }, 400);
}

// ============================================================
// ФУНКЦИЯ: ВОСПРОИЗВЕСТИ ЗВУК ГАЛЕРЕИ
// ============================================================
// soundKey — какой звук играть: 'saw', 'wood' или 'kitchen'

function playGallerySound(soundKey) {
    // --- ОСТАНАВЛИВАЕМ ВСЕ ЗВУКИ ПЕРЕД ЗАПУСКОМ НОВОГО ---
    // Object.values(soundElements) — берёт все аудиоэлементы из объекта
    // .forEach — для каждого аудиоэлемента:
    Object.values(soundElements).forEach(audio => {
        audio.pause();         // Останавливаем воспроизведение
        audio.currentTime = 0; // Перематываем в начало (чтобы при следующем запуске играло с начала)
    });

    // Берём нужный аудиоэлемент по ключу
    const audio = soundElements[soundKey];
    if (!audio) return;  // Если звука нет — выходим из функции

    // Устанавливаем громкость из ползунка (значение 0-100 → преобразуем в 0-1)
    audio.volume = volumeSlider.value / 100;

    // Запоминаем, какой звук сейчас играет (для регулятора громкости)
    currentSoundKey = soundKey;

    // --- ЗАПУСКАЕМ ВОСПРОИЗВЕДЕНИЕ ---
    // .play() возвращает Promise (обещание), которое может выполниться или выдать ошибку
    audio.play().then(() => {
        // --- ЕСЛИ ВОСПРОИЗВЕДЕНИЕ УСПЕШНО ---
        // Добавляем класс playing — меняем цвет индикатора на оранжевый
        galleryStatus.classList.add('playing');
        // Меняем иконку 
        galleryIcon.textContent = '▶';
        
        // Берём текущий язык страницы 
        const currentLang = (window.lang || 'en');
        // Устанавливаем текст из словаря переводов i18Obj
        galleryText.textContent = i18Obj[currentLang]['gallery-status-playing'];
        // Сохраняем ключ перевода в data-атрибут (для автоматического перевода при смене языка)
        galleryText.dataset.i18n = 'gallery-status-playing';
        
    }).catch(err => {
        // --- ЕСЛИ БРАУЗЕР ЗАБЛОКИРОВАЛ ВОСПРОИЗВЕДЕНИЕ ---
        console.warn('Audio playback blocked:', err);
        // Показываем уведомление: "Кликни где-нибудь на странице, чтобы включить звук"
        showNotification('Click anywhere on the page first to enable sound', 'info');
    });

    // --- КОГДА ЗВУК ЗАКОНЧИТСЯ ---
    audio.onended = function() {
        // Убираем класс playing — индикатор становится обычным
        galleryStatus.classList.remove('playing');
        // Меняем иконку 
        galleryIcon.textContent = '⏸';
        
        const currentLang = (window.lang || 'en');
        // Устанавливаем текст "Paused"
        galleryText.textContent = i18Obj[currentLang]['gallery-status-paused'];
        galleryText.dataset.i18n = 'gallery-status-paused';
        
        // Снимаем подсветку со всех кнопок галереи
        document.querySelectorAll('.gallery-btn').forEach(b => b.classList.remove('active'));
    };
}

// ============================================================
// НАСТРОЙКА КНОПОК ГАЛЕРЕИ
// ============================================================
// Находим все кнопки с классом .gallery-btn и добавляем обработчик клика

document.querySelectorAll('.gallery-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Получаем значение атрибута data-sound (saw, wood или kitchen)
        const soundKey = this.getAttribute('data-sound');

        // Убираем подсветку со всех кнопок
        document.querySelectorAll('.gallery-btn').forEach(b => b.classList.remove('active'));
        // Подсвечиваем текущую кнопку
        this.classList.add('active');

        // 1) Меняем картинку на случайную
        showRandomImage();

        // 2) Проигрываем соответствующий звук
        playGallerySound(soundKey);
    });
});

// ============================================================
// РЕГУЛЯТОР ГРОМКОСТИ
// ============================================================
// Когда пользователь двигает ползунок — меняем громкость текущего звука

volumeSlider.addEventListener('input', function() {
    // Если никакой звук сейчас не играет — ничего не делаем
    if (!currentSoundKey) return;
    
    // Находим аудиоэлемент текущего играющего звука
    const audio = soundElements[currentSoundKey];
    if (audio) {
        // Меняем громкость (значение 0-100 → преобразуем в 0-1)
        audio.volume = this.value / 100;
    }
});


// ============================================================
// 3. ВИДЕО — КЛИК ПО ИЗОБРАЖЕНИЮ ЗАПУСКАЕТ ВИДЕО
// ============================================================

// Находим элемент с картинкой-превью (заставкой видео)
const videoPoster = document.getElementById('videoPoster');
// Находим сам видеоплеер
const storyVideo  = document.getElementById('storyVideo');

// Добавляем обработчик клика на картинку-превью
videoPoster.addEventListener('click', function() {
    // Скрываем картинку-превью (делаем невидимой)
    videoPoster.style.display = 'none';
    
    // Показываем видеоплеер (делаем видимым)
    storyVideo.style.display = 'block';
    
    // Запускаем воспроизведение видео программно
    storyVideo.play().catch(err => {
        // Если браузер заблокировал автовоспроизведение — пишем предупреждение в консоль
        console.warn('Video play blocked:', err);
    });
});
// ============================================================
// 4. PARALLAX-ЭФФЕКТ (Эффект глубины при прокрутке)
// ============================================================

// Что такое параллакс?
// Это эффект, когда при прокрутке страницы разные слои двигаются с разной скоростью.
// Ближние слои двигаются быстрее, дальние - медленнее.
// Создаётся ощущение глубины и объёма (как в 3D).

// Скорость задаётся атрибутом data-speed:
// - Положительная скорость (0.3, 0.6) — слой двигается В ТУ ЖЕ СТОРОНУ, что и скролл
// - Отрицательная скорость (-0.4) — слой двигается В ПРОТИВОПОЛОЖНУЮ сторону (эффект "выныривания")

// ============================================================

// Находим секцию с эффектом параллакса по её id
const parallaxSection = document.getElementById('parallax-section');

// Находим ВСЕ слои внутри этой секции (с классом .parallax-layer)
const parallaxLayers = document.querySelectorAll('.parallax-layer');

// ============================================================
// ФУНКЦИЯ ПЕРЕСЧЁТА ПОЛОЖЕНИЯ СЛОЁВ
// ============================================================
// Вызывается при прокрутке страницы
// Пересчитывает, на сколько пикселей сдвинуть каждый слой

function updateParallax() {
    // Если секция параллакса не найдена на странице — выходим из функции
    if (!parallaxSection) return;

    // getBoundingClientRect() — получает координаты секции относительно окна браузера
    // rect.top — расстояние от верха секции до верха окна
    // rect.bottom — расстояние от низа секции до верха окна
    const rect = parallaxSection.getBoundingClientRect();

    // ОПТИМИЗАЦИЯ: если секция полностью вне зоны видимости — не тратим ресурсы
    // rect.bottom < 0 → секция выше окна (уже проскроллили)
    // rect.top > window.innerHeight → секция ниже окна (ещё не доскроллили)
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    // offset — смещение верхней границы секции относительно окна
    // Когда секция вверху окна: offset = 0 или положительное число
    // Когда секция уходит вверх: offset становится отрицательным
    const offset = rect.top;

    // Перебираем все слои внутри секции
    parallaxLayers.forEach(layer => {
        // Считываем скорость слоя из атрибута data-speed
        // parseFloat — превращает строку "0.3" в число 0.3
        const speed = parseFloat(layer.getAttribute('data-speed'));

        // ВЫЧИСЛЯЕМ СМЕЩЕНИЕ СЛОЯ:
        // offset * speed — умножаем смещение секции на скорость слоя
        // * -1 — умножаем на минус 1, чтобы направление было правильным
        // 
        // Математика: при скролле вниз offset уменьшается, 
        // умножение на -1 заставляет слой двигаться вверх
        const yPos = offset * speed * -1;

        // ПРИМЕНЯЕМ СМЕЩЕНИЕ К СЛОЮ:
        // translate3d(x, y, z) — сдвигает элемент по оси X и Y
        // translate3d использует GPU-ускорение — анимация более плавная
        // (0, ${yPos}px, 0) — сдвиг по вертикали на yPos пикселей
        layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
}

// ============================================================
// ОБРАБОТЧИК ПРОКРУТКИ (с оптимизацией)
// ============================================================

// Флаг (переключатель), чтобы не запускать много обновлений одновременно
// requestAnimationFrame — это специальная функция браузера для плавной анимации
let parallaxTicking = false;

// Слушаем событие прокрутки страницы (scroll)
window.addEventListener('scroll', function() {
    // Если обновление уже запланировано — ничего не делаем
    if (!parallaxTicking) {
        // requestAnimationFrame — говорит браузеру: "выполни функцию ПЕРЕД следующим перерисовыванием экрана"
        // Это оптимизация: анимация будет плавной, а не дёрганной
        requestAnimationFrame(() => {
            updateParallax();        // Пересчитываем положения слоёв
            parallaxTicking = false; // Сбрасываем флаг (обновление завершено)
        });
        parallaxTicking = true;      // Устанавливаем флаг (обновление запланировано)
    }
});

// Вызываем функцию один раз при загрузке страницы
// На случай, если секция уже видна (чтобы слои встали на правильные места)
updateParallax();

// ============================================================
// 5. АНИМИРОВАННЫЕ СЧЁТЧИКИ СТАТИСТИКИ в пралаксе
// ============================================================
// Эти счётчики показывают цифры (например, "1500 досок сделано")
// Когда пользователь прокручивает до этой секции, цифры плавно нарастают от 0 до нужного числа

// Находим все элементы с классом .stat-number (цифры статистики)
const statNumbers = document.querySelectorAll('.stat-number');

// ============================================================
// ФУНКЦИЯ АНИМАЦИИ ОДНОГО СЧЁТЧИКА
// ============================================================
// el — HTML элемент, который содержит число (например <div class="stat-number">0</div>)
function animateStatCounter(el) {
    // Получаем конечное значение из атрибута data-target
    // parseInt — превращает строку "1500" в число 1500
    // 10 — это система счисления (десятичная)
    const target = parseInt(el.getAttribute('data-target'), 10);
    
    // Длительность анимации в миллисекундах (1.5 секунды)
    const duration = 1500;
    
    // Запоминаем время начала анимации
    // performance.now() — точное время в миллисекундах (с точностью до микросекунд)
    const startTime = performance.now();

    // ВНУТРЕННЯЯ ФУНКЦИЯ: вызывается на каждом кадре анимации
    function step(currentTime) {
        // Вычисляем прогресс (от 0 до 1)
        // (currentTime - startTime) — сколько времени прошло с начала
        // / duration — делим на общую длительность
        // Math.min(..., 1) — не даём прогрессу стать больше 1
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        // Текущее значение = прогресс × конечное значение
        // Math.floor — округляем вниз (чтобы цифры были целыми)
        const currentValue = Math.floor(progress * target);
        
        // Вставляем текущее число в HTML элемент
        el.textContent = currentValue;

        // Если анимация ещё не закончилась (прогресс < 1)
        if (progress < 1) {
            // Запрашиваем следующий кадр анимации (≈ 60 раз в секунду)
            requestAnimationFrame(step);
        } else {
            // Анимация закончена — гарантируем, что стоит точное конечное значение
            // (на случай, если из-за округления не совпало)
            el.textContent = target;
        }
    }
    
    // Запускаем анимацию (первый кадр)
    requestAnimationFrame(step);
}

// ============================================================
// НАБЛЮДАТЕЛЬ ЗА ПОЯВЛЕНИЕМ СЕКЦИИ (Intersection Observer)
// ============================================================
// Этот наблюдатель следит, когда секция статистики появляется на экране
// И только тогда запускает анимацию счётчиков (а не сразу при загрузке)

// Создаём наблюдатель
// entries — массив элементов, за которыми наблюдаем
// threshold: 0.3 — сработает, когда 30% элемента станут видны
const statsObserver = new IntersectionObserver((entries) => {
    // Перебираем все элементы, которые попали в зону видимости
    entries.forEach(entry => {
        // Проверяем, что элемент виден на экране (isIntersecting = true)
        if (entry.isIntersecting) {
            // Находим ВСЕ числа внутри этой секции (через parentElement)
            // parentElement — родительский элемент (вся секция статистики)
            // .querySelectorAll('.stat-number') — находим все цифры в секции
            // .forEach(animateStatCounter) — запускаем анимацию для каждой цифры
            entry.target.parentElement.querySelectorAll('.stat-number').forEach(animateStatCounter);
            
            // Отключаем наблюдение за этим элементом (анимация запущена, больше не нужно)
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });  // 30% элемента должно быть видно, чтобы сработало

// Запускаем наблюдение за первым числом статистики
// Когда оно появится на экране — анимация запустится для ВСЕХ чисел
if (statNumbers.length > 0) {
    statsObserver.observe(statNumbers[0]);
}
// ============================================================
// 6. FEATURED PRODUCTS + МОДАЛЬНОЕ ОКНО ТОВАРА
// ============================================================
// Это блок "Рекомендуемые товары" на главной странице
// Показывает первые 4 товара из каталога
// При клике на товар открывается модальное окно с подробностями

// ============================================================
// ЗАГРУЗКА И ОТОБРАЖЕНИЕ РЕКОМЕНДУЕМЫХ ТОВАРОВ
// ============================================================
// async — функция асинхронная (ждёт ответ от сервера)
async function loadFeaturedProducts() {
    try {
        // 1. ЗАГРУЖАЕМ ТОВАРЫ С СЕРВЕРА
        // fetch — отправляем GET-запрос к серверу
        const res = await fetch(`${API}/products`);
        // Превращаем ответ в массив объектов (товары)
        const products = await res.json();

        // 2. НАХОДИМ КОНТЕЙНЕР ДЛЯ КАРТОЧЕК
        const grid = document.getElementById('featuredGrid');

        // 3. БЕРЁМ ПЕРВЫЕ 4 ТОВАРА (для главной страницы)
        // slice(0, 4) — берёт элементы массива с 0 по 3 индекс
        const featured = products.slice(0, 4);

        // 4. ГЕНЕРИРУЕМ HTML КАРТОЧЕК
        // featured.map() — преобразует массив товаров в массив HTML-строк
        // .join('') — склеивает все строки в одну
        grid.innerHTML = featured.map(p => `
            <div class="featured-card" data-id="${p.id}">
                <img src="${p.photo}" alt="${p.name}">
                <div class="featured-card-body">
                    <p>${p.name}</p>
                    <p class="price">$${Number(p.price).toFixed(2)}</p>
                </div>
            </div>
        `).join('');

        // 5. НАВЕШИВАЕМ ОБРАБОТЧИК КЛИКА НА КАЖДУЮ КАРТОЧКУ
        // Когда пользователь кликает на товар — открывается модальное окно
        document.querySelectorAll('.featured-card').forEach(card => {
            card.addEventListener('click', function() {
                // Получаем id товара из атрибута data-id
                const id = this.getAttribute('data-id');
                // Находим полный объект товара в массиве products
                const product = products.find(p => p.id === id);
                // Если товар найден — открываем модальное окно
                if (product) openProductModal(product);
            });
        });

    } catch (err) {
        // Если ошибка (например, сервер не запущен) — пишем в консоль
        console.error('Failed to load featured products:', err);
    }
}

// ============================================================
// ОТКРЫТИЕ МОДАЛЬНОГО ОКНА С ДЕТАЛЯМИ ТОВАРА
// ============================================================
// product — объект товара (с полями name, price, photo, rating и т.д.)
function openProductModal(product) {
    // Находим контейнер модального окна
    const modal = document.getElementById('productModal');
    // Находим контейнер для содержимого модалки
    const content = document.getElementById('productModalContent');

    // Заполняем содержимое модалки данными товара
    // Используем обратные кавычки ` (template literals) для многострочного HTML
    content.innerHTML = `
        <!-- Левая колонка: картинка товара -->
        <div class="pm-image">
            <img src="${product.photo}" alt="${product.name}">
        </div>
        
        <!-- Правая колонка: информация о товаре -->
        <div class="pm-body">
            <!-- Название товара -->
            <h2>${product.name}</h2>
            
            <!-- Категория (маленькими серыми буквами) -->
            <p style="color:#999; text-transform:uppercase; font-size:0.8rem;">${product.category}</p>
            
            <!-- Цена -->
            <p class="pm-price">$${Number(product.price).toFixed(2)}</p>
            
            <!-- Описание -->
            <p class="pm-desc">${product.description}</p>
            
            <!-- Рейтинг (звёздочки) -->
            <p style="margin-bottom:12px;">
                Rating: 
                ${'★'.repeat(Math.round(product.rating))}  <!-- Заполненные звёзды -->
                ${'☆'.repeat(5 - Math.round(product.rating))}  <!-- Пустые звёзды -->
                (${product.rating})
            </p>
            
            <!-- Статус "В наличии" или "Нет в наличии" -->
            <p style="margin-bottom:16px; color:${product.inStock ? '#27ae60' : '#e74c3c'}; font-weight:600;">
                ${product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </p>
            
            <!-- Кнопка добавления в корзину -->
            <button class="btn-primary" id="modalAddToCart" ${product.inStock ? '' : 'disabled'}>
                Add to Cart
            </button>
        </div>
    `;

    // Показываем модальное окно (делаем видимым)
    modal.style.display = 'flex';
    
    // Блокируем прокрутку основной страницы (фон не скроллится)
    document.body.style.overflow = 'hidden';

    // Навешиваем обработчик на кнопку "Add to Cart" внутри модалки
    document.getElementById('modalAddToCart').addEventListener('click', async function() {
        await addProductToCart(product);  // Добавляем товар в корзину
        closeProductModal();               // Закрываем модальное окно
    });
}

// ============================================================
// ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА
// ============================================================
function closeProductModal() {
    // Находим модальное окно
    const modal = document.getElementById('productModal');
    // Скрываем его (делаем невидимым)
    modal.style.display = 'none';
    // Возвращаем прокрутку страницы (разблокируем)
    document.body.style.overflow = '';
}

// ============================================================
// НАСТРОЙКА КНОПКИ ЗАКРЫТИЯ (крестик ✕)
// ============================================================
// Находим кнопку с крестиком и вешаем обработчик
document.getElementById('closeProductModal').addEventListener('click', closeProductModal);

// ============================================================
// ЗАКРЫТИЕ ПРИ КЛИКЕ НА ТЁМНЫЙ ФОН
// ============================================================
// Когда пользователь кликает на затемнённую область (не на белую модалку)
// проверяем: e.target === this — кликнули ли именно по фону?
document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
});

// ============================================================
// ДОБАВЛЕНИЕ ТОВАРА В КОРЗИНУ
// ============================================================
async function addProductToCart(product) {
     const user = getCurrentUser();
    if (!user) {
        showNotification('Please login first', 'error');
        return;
    }
    try {
        // Формируем объект товара для корзины
        const cartItem = {
             userId: user.id, 
            productId: product.id,   // ID товара
            name:      product.name, // Название
            price:     product.price, // Цена
            photo:     product.photo, // Картинка
            quantity:  1              // Количество (1 штука)
        };

        // Отправляем POST-запрос на сервер (добавляем товар в корзину)
        const res = await fetch(`${API}/cart`, {
            method:  'POST',                         // Метод создания
            headers: { 'Content-Type': 'application/json' }, // Отправляем JSON
            body:    JSON.stringify(cartItem)        // Превращаем объект в строку
        });

        // Если ответ не OK — выбрасываем ошибку
        if (!res.ok) throw new Error('Failed to add to cart');

        // --- УВЕДОМЛЕНИЕ ОБ УСПЕХЕ ---
        showNotification(`"${product.name}" added to cart!`, 'success');

        // --- ОБНОВЛЯЕМ СЧЁТЧИК В ШАПКЕ ---
        // (чтобы рядом с иконкой корзины обновилось число)
        updateNavCounters();

    } catch (err) {
        // Если ошибка (сервер не запущен) — показываем уведомление об ошибке
        showNotification('Error adding to cart. Is json-server running?', 'error');
    }
}
// ============================================================
// 7. АНИМИРОВАННЫЕ СЧЁТЧИКИ В ШАПКЕ (корзина / избранное)
// ============================================================
// Использует animateCounter() из common.js

async function updateNavCounters() {
    const user = getCurrentUser();
    if (!user) return;
    
    try {
        // Параллельно запрашиваем корзину и избранное
        const [cartRes, favRes] = await Promise.all([
            fetch(`${API}/cart`),
            fetch(`${API}/favorites`)
        ]);
        
        const allCart = await cartRes.json();
        const allFav = await favRes.json();

        // ФИЛЬТРУЕМ ТОЛЬКО СВОИ ТОВАРЫ
        const myCart = allCart.filter(item => item.userId === user.id);
        const myFav = allFav.filter(item => item.userId === user.id);
        
        const cartCount = myCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const favCount = myFav.length;

        // Анимируем изменение чисел в шапке
        window.animateCounter(document.getElementById('cartCounterNav'), cartCount);
        window.animateCounter(document.getElementById('favCounterNav'), favCount);

    } catch (err) {
        console.warn('Could not update nav counters:', err);
    }
}


// ============================================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedProducts(); // загружаем товары для секции Featured
    updateNavCounters();    // выставляем актуальные счётчики корзины/избранного
});
