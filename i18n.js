// ============================================================
// i18n.js — словарь переводов и функция перевода страницы
//
// 1. В HTML у элементов с текстом стоит атрибут data-i18n="ключ"
// 2. Здесь, в i18Obj, для каждого языка (en/ru) указан текст
//    для каждого ключа
// 3. Функция getTranslate(lang) находит все [data-i18n] элементы
//    и подставляет им textContent из словаря для нужного языка
// ============================================================


// ============================================================
// СЛОВАРЬ ПЕРЕВОДОВ
// ============================================================
// Структура: i18Obj[язык][ключ] = текст
const i18Obj = {

    // ---------------- ENGLISH ----------------
    en: {
        // --- Навигация (общая для всех страниц) ---
        'nav-shop':      'SHOP',
        'nav-quiz':      'STYLE QUIZ',
        'nav-about':     'ABOUT US',
        'nav-stories':   'STORIES',
        'nav-gallery':   'GALLERY',

        // --- Главная страница (index.html) ---
        'hero1-title':  'Crafted with Care',
        'hero1-text':   'Solid maple boards made to last a lifetime in your kitchen',
        'hero1-btn':    'Shop Collection',
        'hero2-title':  'Gather Around the Table',
        'hero2-text':   'Serving boards designed for sharing good food and good company',
        'hero2-btn':    'Explore Serving',
        'hero3-title':  'Kitchen Essentials',
        'hero3-text':   'Everything you need for everyday cooking, beautifully made',
        'hero3-btn':    'View Bundles',

        'gallery-title':    'Sound of Wood',
        'gallery-subtitle': 'Click the icons to explore our workshop sounds and scenes',
        'gallery-status-playing': 'Playing',
        'gallery-status-paused':  'Paused',
        'gallery-btn-workshop': 'Workshop',
        'gallery-btn-forest':   'Forest',
        'gallery-btn-kitchen':  'Kitchen',

        'video-title': "See How It's Made",

        'parallax-title': 'Timeless Craftsmanship',
        'parallax-text':  'Every board tells a story of careful hands and quality wood',

        'stat-boards':    'Boards Made',
        'stat-customers': 'Happy Customers',
        'stat-woods':     'Wood Types',
        'stat-years':     'Years of Craft',

        'featured-title': 'Featured Products',

        'map-title': 'Visit Our Workshop',

        'footer-contact1': '© 2021  Kinn Home',
        'footer-contact2': 'Need to get in touch? Email us',
        'footer-explore':  'EXPLORE',
        'footer-help':     'HELP',
        'footer-faq':      'FAQS + SHIPPING',
        'footer-contact':  'CONTACT',
        'footer-terms':    'TERMS',
        'footer-trade':    'TRADE',

        // --- Каталог (catalog.html) ---
        'catalog-title':    'Maple Collection',
        'catalog-subtitle': 'Thoughtful objects for everyday living',
        'filter-category':  'Category',
        'filter-all':       'All',
        'filter-price-min': 'Min Price',
        'filter-price-max': 'Max Price',
        'filter-instock':   'In Stock Only',
        'filter-reset':     'Reset Filters',
        'sort-label':       'Sort by',
        'sort-default':     'Default',
        'sort-price-asc':   'Price: Low to High',
        'sort-price-desc':  'Price: High to Low',
        'sort-rating':      'Rating',
        'btn-add-cart':     'Add to Cart',
        'btn-add-fav':      'Add to Favorites',
        'btn-remove-fav':   'Remove from Favorites',
        'btn-fav-saved':    'Saved',
        'btn-fav-add':      'Favourite',

        // --- Корзина (cart.html) ---
        'cart-title':     'Shopping Cart',
        'cart-empty':     'Your cart is empty',
        'cart-total':     'Total',
        'cart-checkout':  'Checkout',
        'cart-remove':    'Remove',

        // --- Избранное (favorites.html) ---
        'fav-title': 'Your Favorites',
        'fav-empty': 'No favorites yet',

        // --- Регистрация (register.html) ---
        'auth-title-register': 'Create Account',
        'auth-title-login':    'Sign In',
        'tab-register':  'Register',
        'tab-login':     'Login',

        // --- Профиль ---
        'profile-title':     'My Profile',
        'profile-edit-btn':  'Save Changes',
        'profile-logout':    'Log Out',
        'profile-reset':     'Reset My Settings',
    },

    // ---------------- РУССКИЙ ----------------
    ru: {
        // --- Навигация ---
        'nav-shop':      'МАГАЗИН',
        'nav-quiz':      'ТЕСТ СТИЛЯ',
        'nav-about':     'О НАС',
        'nav-stories':   'ИСТОРИИ',
        'nav-gallery':   'ГАЛЕРЕЯ',

        // --- Главная страница ---
        'hero1-title':  'Сделано с заботой',
        'hero1-text':   'Цельные кленовые доски, созданные на десятилетия для вашей кухни',
        'hero1-btn':    'В каталог',
        'hero2-title':  'Соберитесь за столом',
        'hero2-text':   'Сервировочные доски для приятных моментов с близкими',
        'hero2-btn':    'Сервировка',
        'hero3-title':  'Кухонные принадлежности',
        'hero3-text':   'Всё необходимое для ежедневной готовки, сделано красиво',
        'hero3-btn':    'Наборы',

        'gallery-title':    'Звук дерева',
        'gallery-subtitle': 'Нажмите на иконки, чтобы услышать звуки нашей мастерской',
        'gallery-status-playing': 'Звучит',
        'gallery-status-paused':  'Пауза',
        'gallery-btn-workshop': 'Мастерская',
        'gallery-btn-forest':   'Лес',
        'gallery-btn-kitchen':  'Кухня',

        'video-title': 'Как это делается',

        'parallax-title': 'Вечное мастерство',
        'parallax-text':  'Каждая доска хранит историю заботливых рук и качественного дерева',

        'stat-boards':    'Досок изготовлено',
        'stat-customers': 'Довольных клиентов',
        'stat-woods':     'Видов дерева',
        'stat-years':     'Лет мастерства',

        'featured-title': 'Популярные товары',

        'map-title': 'Посетите нашу мастерскую',

        'footer-contact1': '© 2021  Kinn Home',
        'footer-contact2': 'Нужна помощь? Напишите нам',
        'footer-explore':  'РАЗДЕЛЫ',
        'footer-help':     'ПОМОЩЬ',
        'footer-faq':      'ВОПРОСЫ И ДОСТАВКА',
        'footer-contact':  'КОНТАКТЫ',
        'footer-terms':    'УСЛОВИЯ',
        'footer-trade':    'ОПТОВИКАМ',

        // --- Каталог ---
        'catalog-title':    'Кленовая коллекция',
        'catalog-subtitle': 'Продуманные вещи для повседневной жизни',
        'filter-category':  'Категория',
        'filter-all':       'Все',
        'filter-price-min': 'Цена от',
        'filter-price-max': 'Цена до',
        'filter-instock':   'Только в наличии',
        'filter-reset':     'Сбросить фильтры',
        'sort-label':       'Сортировка',
        'sort-default':     'По умолчанию',
        'sort-price-asc':   'Цена: по возрастанию',
        'sort-price-desc':  'Цена: по убыванию',
        'sort-rating':      'По рейтингу',
        'btn-add-cart':     'В корзину',
        'btn-add-fav':      'В избранное',
        'btn-remove-fav':   'Убрать из избранного',
        'btn-fav-saved':    'В избранном',
        'btn-fav-add':      'В избранное',

        // --- Корзина ---
        'cart-title':     'Корзина покупок',
        'cart-empty':     'Ваша корзина пуста',
        'cart-total':     'Итого',
        'cart-checkout':  'Оформить заказ',
        'cart-remove':    'Удалить',

        // --- Избранное ---
        'fav-title': 'Избранное',
        'fav-empty': 'Список избранного пуст',

        // --- Регистрация ---
        'auth-title-register': 'Создать аккаунт',
        'auth-title-login':    'Вход',
        'tab-register':  'Регистрация',
        'tab-login':     'Вход',

        // --- Профиль ---
        'profile-title':     'Мой профиль',
        'profile-edit-btn':  'Сохранить изменения',
        'profile-logout':    'Выйти',
        'profile-reset':     'Сбросить настройки',
    }
};


// ============================================================
// ФУНКЦИЯ ПЕРЕВОДА СТРАНИЦЫ
// ============================================================

// lang — 'en' или 'ru'
function getTranslate(lang) {
    // Если передан незнакомый язык — используем английский по умолчанию
    const dict = i18Obj[lang] || i18Obj.en;

    // Находим ВСЕ элементы у которых есть атрибут data-i18n
    const elements = document.querySelectorAll('[data-i18n]');

    // Перебираем каждый найденный элемент
    elements.forEach(el => {
        // dataset.i18n — значение атрибута data-i18n (например "hero1-title")
        const key = el.dataset.i18n;

        // Если для этого ключа есть перевод — подставляем его
        if (dict[key]) {
            // Для текстовых элементов меняем textContent
            // Если у элемента есть data-i18n-attr — переводим АТРИБУТ (например placeholder),
            // а не textContent (нужно для input полей)
            const attr = el.dataset.i18nAttr;
            if (attr) {
                el.setAttribute(attr, dict[key]);
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // --- Подсветка активной кнопки языка (требование методички) ---
    // Убираем класс .active у обеих кнопок, затем добавляем нужной
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Обновляем атрибут lang у <html> — хорошая практика для accessibility и SEO
    document.documentElement.setAttribute('lang', lang);
}

// Делаем функцию доступной глобально — её вызывает themeManager.js
window.getTranslate = getTranslate;
