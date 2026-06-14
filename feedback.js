// ============================================================
// feedback.js — логика страницы отзывов
// ============================================================

// Адрес json-server
const API = 'http://localhost:8000';

// Текущий выбранный рейтинг (0 — пока не выбран)
let currentRating = 0;

// Текущий пользователь — берём из localStorage (записан при входе)
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Список товаров — заполнится после загрузки с сервера
let allProducts = [];

// Список заказов текущего пользователя — нужно знать что он покупал
let userOrders = [];

// ============================================================
// ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ 
// ============================================================

// Запускается сразу после полной загрузки всей страницы (картинки, стили, всё)
window.addEventListener('load', async function() {

    // --- ПРОВЕРКА АВТОРИЗАЦИИ ---
    // currentUser — залогиненный пользователь (из localStorage)

    // СЛУЧАЙ 1: ПОЛЬЗОВАТЕЛЬ НЕ ЗАЛОГИНЕН
    if (!currentUser) {
        // Показываем сообщение "Вы не авторизованы"
        document.getElementById('notLoggedIn').style.display = 'block';
        // Скрываем форму отправки отзыва
        document.getElementById('feedbackForm').style.display = 'none';
        // Но список отзывов всё равно загружаем — его может смотреть любой посетитель
        await loadProductsForFilter();  // Загружаем товары для фильтрации
        await loadReviews();            // Загружаем и показываем отзывы
        return; // Выходим из функции, дальше не идём
    }

    // СЛУЧАЙ 2: ПОЛЬЗОВАТЕЛЬ — АДМИНИСТРАТОР
    if (currentUser.role === 'admin') {
        // Показываем сообщение "Администраторы не могут оставлять отзывы"
        document.getElementById('adminBlock').style.display = 'block';
        // Скрываем форму отправки отзыва
        document.getElementById('feedbackForm').style.display = 'none';
        // Показываем кнопку перехода в админ-панель (в шапке)
        document.getElementById('adminLink').style.display = 'inline';
        // Загружаем товары и отзывы для просмотра
        await loadProductsForFilter();
        await loadReviews();
        return;
    }

    // СЛУЧАЙ 3: ОБЫЧНЫЙ ЗАЛОГИНЕННЫЙ ПОЛЬЗОВАТЕЛЬ
    // Показываем форму отправки отзыва
    document.getElementById('feedbackForm').style.display = 'block';

    // Показываем имя пользователя в баннере наверху формы
    document.getElementById('userInfoBanner').textContent =
        `Вы оставляете отзыв как: ${currentUser.nickname} (${currentUser.firstName} ${currentUser.lastName})`;

    // Загружаем все товары (для названий и информации)
    await loadAllProducts();
    // Загружаем заказы пользователя (чтобы знать, какие товары он купил)
    await loadUserOrders();
    // Заполняем выпадающий список ТОЛЬКО купленными товарами
    fillProductSelect();
    // Загружаем товары для фильтра (чтобы можно было фильтровать отзывы по товарам)
    await loadProductsForFilter();
    // Загружаем и показываем существующие отзывы
    await loadReviews();
});

// ============================================================
// ЗАГРУЗКА ДАННЫХ С СЕРВЕРА
// ============================================================

// Загружает полный список товаров (нужны названия для отображения)
async function loadAllProducts() {
    try {
        // GET-запрос на сервер к коллекции products
        const res = await fetch(`${API}/products`);
        // Превращаем ответ в массив объектов и сохраняем в глобальную переменную allProducts
        allProducts = await res.json();
    } catch (err) {
        // Если сервер не запущен — показываем ошибку
        showToast('Не удалось загрузить товары. Запущен ли json-server?', 'error');
    }
}

// Загружает заказы текущего пользователя
// (чтобы знать, какие товары он реально КУПИЛ, а не просто смотрел)
async function loadUserOrders() {
    try {
        // GET-запрос с фильтром: только заказы этого userId
        // Пример: /orders?userId=123
        const res = await fetch(`${API}/orders?userId=${currentUser.id}`);
        // Сохраняем заказы в глобальную переменную userOrders
        userOrders = await res.json();
    } catch (err) {
        showToast('Не удалось загрузить ваши заказы.', 'error');
    }
}

// ============================================================
// ЗАПОЛНЕНИЕ ВЫПАДАЮЩЕГО СПИСКА ТОВАРОВ
// ============================================================

// Заполняет <select> (выпадающий список) ТОЛЬКО теми товарами, которые пользователь купил
// Нельзя оставить отзыв на товар, который ты не покупал!
function fillProductSelect() {
    const select = document.getElementById('productSelect');

    // Очищаем select от старых опций (оставляем только первый пустой пункт)
    select.innerHTML = '<option value="">-- Выберите товар --</option>';

    // Set — коллекция, которая хранит ТОЛЬКО уникальные значения
    // Собираем уникальные ID товаров из всех заказов пользователя
    const purchasedIds = new Set();
    
    // Перебираем все заказы пользователя
    userOrders.forEach(order => {
        // В каждом заказе есть массив items (товары)
        order.items.forEach(item => {
            purchasedIds.add(item.productId); // Добавляем ID товара в Set
        });
    });

    // Если пользователь ничего не покупал
    if (purchasedIds.size === 0) {
        // Показываем подсказку с ошибкой
        document.getElementById('productHint').textContent =
            'Вы ещё не покупали товары. Сначала что-нибудь купите!';
        document.getElementById('productHint').style.color = '#e74c3c';
        return;
    }

    // Для каждого купленного товара добавляем option (пункт) в выпадающий список
    purchasedIds.forEach(id => {
        // Ищем полную информацию о товаре по его ID
        const product = allProducts.find(p => p.id === id);
        if (!product) return; // Если товар не найден — пропускаем

        // Создаём элемент <option>
        const option = document.createElement('option');
        option.value = product.id;       // Значение (ID товара)
        option.textContent = product.name; // Отображаемый текст (название товара)
        select.appendChild(option);      // Добавляем в select
    });
}

// Вызывается, когда пользователь выбирает товар из списка
// Убирает подсветку ошибки и проверяет форму
function onProductChange() {
    clearFieldError('productSelect');  // Убираем сообщение об ошибке
    validateFeedbackForm();            // Проверяем, можно ли активировать кнопку отправки
}

// ============================================================
// ЗВЁЗДОЧНЫЙ РЕЙТИНГ (UI компонент)
// ============================================================

// Устанавливает рейтинг при клике на звезду
// value — число от 1 до 5 (количество звёзд)
function setRating(value) {
    currentRating = value;  // Сохраняем в глобальную переменную
    
    // Обновляем скрытое поле формы (для отправки на сервер)
    document.getElementById('ratingValue').value = value;

    // Перекрашиваем звёзды в зависимости от выбранного рейтинга
    const stars = document.querySelectorAll('#starsInput .star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add('star-active');   // Закрашенная звезда 
        } else {
            star.classList.remove('star-active'); // Пустая звезда 
        }
    });

    // Убираем ошибку (если была)
    clearFieldError('rating');
    // Проверяем, можно ли отправить форму
    validateFeedbackForm();
}

//======================================================
// СЧЁТЧИК СИМВОЛОВ ОТЗЫВА
// ============================================================

const MIN_FEEDBACK_LENGTH = 20; // минимальная длина отзыва

// Вызывается при каждом вводе текста в textarea
function onTextInput() {
    const text = document.getElementById('feedbackText').value;
    const counter = document.getElementById('charCount');

    // Обновляем счётчик символов
    counter.textContent = text.length;

    // Подсвечиваем счётчик зелёным если достаточно символов
    if (text.length >= MIN_FEEDBACK_LENGTH) {
        counter.style.color = '#27ae60';
    } else {
        counter.style.color = '#e74c3c';
    }

    clearFieldError('feedbackText');
    validateFeedbackForm();
}

// ============================================================
// ВАЛИДАЦИЯ ФОРМЫ ОТЗЫВА
// ============================================================

// Проверяет все поля формы и включает/выключает кнопку отправки
function validateFeedbackForm() {
    const product = document.getElementById('productSelect').value;
    const rating  = currentRating;
    const text    = document.getElementById('feedbackText').value.trim();

    // Форма валидна только если:
    // 1) товар выбран, 2) рейтинг поставлен, 3) текст >= 20 символов
    const isValid = product !== '' && rating > 0 && text.length >= MIN_FEEDBACK_LENGTH;

    document.getElementById('btnSubmitFeedback').disabled = !isValid;
}

// ============================================================
// ОТПРАВКА ОТЗЫВА
// ============================================================

// Находим форму отзыва и добавляем обработчик отправки
document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Отменяем перезагрузку страницы (стандартное поведение формы)

    // --- ПОЛУЧАЕМ ДАННЫЕ ИЗ ФОРМЫ ---
    const productId = document.getElementById('productSelect').value;  // ID выбранного товара
    const text      = document.getElementById('feedbackText').value.trim(); // Текст отзыва (без пробелов по краям)
    const btn       = document.getElementById('btnSubmitFeedback');    // Кнопка отправки

    // --- ПРОВЕРКИ (валидация) ---
    // Проверяем, выбран ли товар
    if (!productId) {
        showFieldError('productSelect', 'Пожалуйста, выберите товар');
        return; // Останавливаем отправку
    }
    
    // Проверяем, выбран ли рейтинг
    if (currentRating === 0) {
        showFieldError('rating', 'Пожалуйста, выберите оценку');
        return;
    }
    
    // Проверяем минимальную длину текста отзыва
    if (text.length < MIN_FEEDBACK_LENGTH) {
        showFieldError('feedbackText', `Минимум ${MIN_FEEDBACK_LENGTH} символов`);
        return;
    }

    // --- БЛОКИРУЕМ КНОПКУ (чтобы не отправили дважды) ---
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    // --- НАХОДИМ НАЗВАНИЕ ТОВАРА (для отображения в отзыве) ---
    const product = allProducts.find(p => p.id === productId);

    // --- СОЗДАЁМ ОБЪЕКТ ОТЗЫВА ДЛЯ ОТПРАВКИ НА СЕРВЕР ---
    const newFeedback = {
        userId:      currentUser.id,                    // ID пользователя (кто оставил)
        productId:   productId,                         // ID товара
        productName: product ? product.name : 'Unknown', // Название товара
        nickname:    currentUser.nickname,              // Никнейм пользователя
        rating:      currentRating,                     // Оценка (1-5)
        text:        text,                              // Текст отзыва
        createdAt:   new Date().toISOString().split('T')[0] // Дата 
    };

    try {
        // --- ОТПРАВЛЯЕМ ЗАПРОС НА СЕРВЕР ---
        // POST-запрос — добавляем новый отзыв в коллекцию feedback
        const res = await fetch(`${API}/feedback`, {
            method:  'POST',                            // Метод создания
            headers: { 'Content-Type': 'application/json' }, // Отправляем JSON
            body:    JSON.stringify(newFeedback)        // Превращаем объект в строку
        });

        // Если сервер вернул ошибку — выбрасываем исключение
        if (!res.ok) throw new Error('Server error');

        
        showToast('Спасибо за ваш отзыв!', 'success');

        // --- ОЧИЩАЕМ ФОРМУ ---
        document.getElementById('feedbackForm').reset();  // Сбрасываем все поля
        setRating(0);          // Сбрасываем звёздочки
        document.getElementById('charCount').textContent = '0'; // Сбрасываем счётчик символов

        // --- ПЕРЕЗАГРУЖАЕМ СПИСОК ОТЗЫВОВ ---
        // Чтобы новый отзыв сразу появился на странице
        await loadReviews();

    } catch (err) {
       
        showToast('Ошибка при отправке отзыва. Запущен ли json-server?', 'error');
    } finally {
        // --- В ЛЮБОМ СЛУЧАЕ (успех или ошибка) РАЗБЛОКИРУЕМ КНОПКУ ---
        btn.disabled = false;
        btn.textContent = 'Отправить отзыв';
        validateFeedbackForm(); // Возвращаем правильное состояние кнопки
    }
});

// ============================================================
// ФИЛЬТР ПО ТОВАРУ (для списка всех отзывов)
// ============================================================

// Заполняет выпадающий список фильтра ВСЕМИ товарами
// Пользователь может выбрать товар - увидят только отзывы о нём
async function loadProductsForFilter() {
    try {
        // Если товары ещё не загружены — загружаем
        if (allProducts.length === 0) {
            const res = await fetch(`${API}/products`);
            allProducts = await res.json();
        }
        
        // Находим выпадающий список фильтра
        const select = document.getElementById('filterProduct');
        
        // Для каждого товара добавляем пункт в список
        allProducts.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;           // Значение = ID товара
            option.textContent = p.name;   // Текст = название товара
            select.appendChild(option);
        });
    } catch (err) {
        // Если ошибка — молча игнорируем 
    }
}

// ============================================================
// ЗАГРУЗКА И ОТОБРАЖЕНИЕ СПИСКА ОТЗЫВОВ
// ============================================================

// Загружает отзывы с сервера и отображает их карточками
// Учитывает выбранный фильтр по товару
async function loadReviews() {
    // Контейнер, куда будем вставлять отзывы
    const container = document.getElementById('reviewsContainer');
    // Выбранный товар в фильтре (может быть пустым)
    const filterId = document.getElementById('filterProduct').value;

    try {
        // Если выбран фильтр — добавляем параметр запроса productId
        // Пример: /feedback?productId=1
        const url = filterId
            ? `${API}/feedback?productId=${filterId}`
            : `${API}/feedback`;

        const res = await fetch(url);
        const reviews = await res.json();

        // Если отзывов нет — показываем сообщение
        if (reviews.length === 0) {
            container.innerHTML = '<p style="color:#888; text-align:center;">Пока нет отзывов.</p>';
            return;
        }

        // СОРТИРУЕМ от новых к старым (чем новее дата — тем выше)
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // ГЕНЕРИРУЕМ HTML ДЛЯ КАЖДОГО ОТЗЫВА
        container.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="review-header">
                    <strong>${r.nickname}</strong>  <!-- Имя пользователя -->
                    <span class="review-stars">
                        ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}  <!-- Звёзды -->
                    </span>
                </div>
                <div class="review-product">на товар <em>${r.productName}</em></div>
                <p class="review-text">${escapeHtml(r.text)}</p>  <!-- Текст отзыва (безопасный) -->
                <div class="review-date">${r.createdAt}</div>     <!-- Дата -->
            </div>
        `).join('');

    } catch (err) {
        // Если сервер не запущен — показываем ошибку
        container.innerHTML = '<p style="color:#e74c3c; text-align:center;">Не удалось загрузить отзывы. Запущен ли json-server?</p>';
    }
}

// ============================================================
// ЗАЩИТА ОТ XSS-АТАК (Cross-Site Scripting)
// ============================================================
// Что такое XSS? Это когда злоумышленник вставляет в текст отзыва
// HTML-теги или JavaScript-код. Например: <script>alert('взлом')</script>
// Функция escapeHtml заменяет опасные символы на безопасные:
//   < → &lt;
//   > → &gt;
//   & → &amp;
//   " → &quot;
//   ' → &#39;

function escapeHtml(text) {
    // Создаём временный элемент div
    const div = document.createElement('div');
    // textContent — безопасно устанавливает ТОЛЬКО текст (не HTML)
    div.textContent = text;
    // innerHTML — возвращает текст с заменёнными опасными символами
    return div.innerHTML;
}

// ============================================================
// ОШИБКИ ПОЛЕЙ (одинаковое оформление с register.js)
// ============================================================

// Показывает сообщение об ошибке под полем
function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) errorEl.textContent = message;  // Устанавливаем текст ошибки
}

// Очищает сообщение об ошибке под полем
function clearFieldError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) errorEl.textContent = '';       // Удаляем текст
}

// ============================================================
// УВЕДОМЛЕНИЯ (TOAST)
// ============================================================

// Показывает всплывающее уведомление в углу экрана
// message — текст уведомления
// type — 'success' (зелёное) или 'error' (красное)
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;                    // Устанавливаем текст
    toast.style.display = 'block';                  // Показываем уведомление
    toast.style.background = type === 'success' ? '#27ae60' : '#e74c3c'; // Зелёный/красный
    toast.style.color = 'white';
    
    // Через 3 секунды скрываем уведомление
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}