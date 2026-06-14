// ============================================================
// userProfile.js — иконка пользователя, профиль, выход, сброс настроек
//
// ЧТО ДЕЛАЕТ:
//   1. Иконку пользователя — клик открывает модалку профиля
//   2. Модалку профиля с данными из регистрации
//   3. Кнопку "Выйти" — появляется после авторизации
//   4. Кнопку сброса настроек пользователя

// ============================================================

const PROFILE_API = 'http://localhost:8000';


// ============================================================
// 1. ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ИЗ LOCALSTORAGE
// ============================================================
// Это ЕДИНАЯ функция, которую используют ВСЕ страницы для получения
// данных пользователя.

function getCurrentUser() {
    // JSON.parse(null) выбросит ошибку, поэтому передаём строку null по умолчанию
    //Браузер ищет в своём запись с именем currentUser
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Сохраняет обновлённые данные пользователя обратно в localStorage
//Превращает объект JavaScript в текст
function setCurrentUser(userObj) {
    localStorage.setItem('currentUser', JSON.stringify(userObj));
}

// Делаем функции глобальными — их используют другие файлы (cart, favorites)
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;


// ============================================================
// 2. ОБНОВЛЕНИЕ ИКОНКИ ПОЛЬЗОВАТЕЛЯ В ШАПКЕ
// ============================================================
// В зависимости от того, залогинен пользователь или нет,
// иконка либо ведёт на register.html (вход)
// либо открывает модалку профиля + появляется кнопка Выйти

function updateUserIcon() {
    const user = getCurrentUser(); // получает данные из localStorage

    // Находим ВСЕ иконки пользователя на странице
    //На странице может быть несколько иконок пользователя (например, в мобильной версии), нужно обновить их все
    document.querySelectorAll('.user-icon').forEach(icon => {
        if (user) {
            // --- Пользователь залогинен ---
            //Добавляет к иконке CSS-класс user-icon-active
            icon.classList.add('user-icon-active');
            // Устанавливает всплывающую подсказку при наведении мыши
            icon.title = `${user.firstName} ${user.lastName} (${user.nickname})`;
            // Убираем переход на register.html, вместо этого — открываем профиль
            icon.onclick = openProfileModal;
        } else {
            // --- Пользователь НЕ залогинен ---
            icon.classList.remove('user-icon-active');
            //Устанавливает подсказку: Войти / Зарегистрироваться
            icon.title = 'Sign In / Register';
            //Гость попадает на страницу регистрации/входа
            icon.onclick = () => window.location.href = 'register.html';
        }
    });

    // --- Кнопка Выйти ---
    // Показываем её только если пользователь залогинен
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.style.display = user ? 'inline' : 'none';
    });
}

// ============================================================
// 3. МОДАЛЬНОЕ ОКНО ПРОФИЛЯ
// ============================================================
// Это модальное окно, которое открывается при клике на иконку пользователя.
// В нём можно посмотреть и изменить свои данные (имя, телефон, email и т.д.).
// Создаётся один раз при первом открытии, потом просто показывается/скрывается.

// Функция создаёт HTML-структуру модального окна профиля
function createProfileModal() {
    // Если модалка уже есть на странице — выходим из функции,
    // чтобы не создавать дубликат (проверка по id)
    if (document.getElementById('profileModal')) return;

    // Создаём тёмный фон (затемнение) — модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';  // CSS-класс для затемнения
    modal.id = 'profileModal';           // Уникальный идентификатор
    modal.style.display = 'none';        // Изначально скрыто

    // Внутренность модалки — форма с полями для редактирования профиля
    modal.innerHTML = `
        <!-- Белый блок с содержимым модального окна -->
        <div class="modal-box profile-modal-box">
            <!-- Кнопка закрытия (крестик в правом верхнем углу) -->
            <button class="modal-close" id="closeProfileModal">✕</button>
            
            <!-- Заголовок окна "Мой профиль" (переводится на другие языки) -->
            <h2 data-i18n="profile-title">My Profile</h2>

            <!-- Форма с данными пользователя -->
            <form id="profileForm" class="auth-form" novalidate style="margin-top:16px;">

                <!-- Строка с двумя полями: Имя и Фамилия (рядом на одной строке) -->
                <div class="profile-field-row">
                    <div class="form-group">
                        <label class="form-label">First Name</label>
                        <input type="text" id="profFirstName" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name</label>
                        <input type="text" id="profLastName" class="form-input">
                    </div>
                </div>

                <!-- Поле Отчество (на всю ширину) -->
                <div class="form-group">
                    <label class="form-label">Patronymic</label>
                    <input type="text" id="profPatronymic" class="form-input">
                </div>

                <!-- Строка с Телефоном и Email (рядом) -->
                <div class="profile-field-row">
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <!-- oninput="formatPhone" — автоматически форматирует номер при вводе -->
                        <input type="tel" id="profPhone" class="form-input"
                               oninput="formatPhone && formatPhone(this)">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" id="profEmail" class="form-input">
                    </div>
                </div>

                <!-- Строка с Никнеймом и Датой рождения (рядом) -->
                <div class="profile-field-row">
                    <div class="form-group">
                        <label class="form-label">Nickname</label>
                        <input type="text" id="profNickname" class="form-input">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" id="profBirthDate" class="form-input">
                    </div>
                </div>

                <!-- Место для показа ошибки при сохранении (например, "Email уже занят") -->
                <span class="field-error" id="profileSaveError"></span>

                <!-- Кнопка сохранения изменений -->
                <button type="submit" class="btn-primary btn-full" data-i18n="profile-edit-btn">
                    Save Changes
                </button>
            </form>

            <!-- Кнопка сброса настроек интерфейса (тема/язык) -->
            <button class="reset-settings-btn" id="resetSettingsBtn" data-i18n="profile-reset">
                Reset My Settings
            </button>
        </div>
    `;
 // Добавляем модальное окно на страницу
document.body.appendChild(modal);

// --- Закрытие модалки ---
// При клике на крестик вызывается функция закрытия
document.getElementById('closeProfileModal').addEventListener('click', closeProfileModal);

// Клик по затемнённому фону тоже закрывает модалку
// Проверяем, что кликнули именно по фону (e.target === modal), а не по содержимому
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProfileModal();
});

// --- Сохранение изменений профиля ---
// При отправке формы вызывается функция saveProfileChanges
document.getElementById('profileForm').addEventListener('submit', saveProfileChanges);

// --- Сброс настроек ---
// При клике на кнопку сброса вызывается функция resetUserSettings
document.getElementById('resetSettingsBtn').addEventListener('click', resetUserSettings);

}
  

// ============================================================
// ФУНКЦИЯ ОТКРЫТИЯ МОДАЛЬНОГО ОКНА
// ============================================================
// Открывает модалку и заполняет её текущими данными пользователя
function openProfileModal() {
    // Получаем текущего пользователя из localStorage
    const user = getCurrentUser();
    
    // Если пользователь не залогинен (нет данных) — отправляем на страницу регистрации
    if (!user) {
        window.location.href = 'register.html';
        return;
    }

    // Создаём модалку если её ещё нет на странице (проверка внутри функции)
    createProfileModal();

    // --- Заполняем поля формы данными пользователя ---
    // Если поля пустые — ставим пустую строку, чтобы избежать ошибки undefined
    document.getElementById('profFirstName').value  = user.firstName  || '';
    document.getElementById('profLastName').value   = user.lastName   || '';
    document.getElementById('profPatronymic').value = user.patronymic || '';
    document.getElementById('profPhone').value      = user.phone      || '';
    document.getElementById('profEmail').value      = user.email      || '';
    document.getElementById('profNickname').value   = user.nickname   || '';
    document.getElementById('profBirthDate').value  = user.birthDate  || '';

    // Очищаем сообщение об ошибке с прошлого открытия (если было)
    document.getElementById('profileSaveError').textContent = '';

    // Показываем модальное окно (делаем его видимым)
    document.getElementById('profileModal').style.display = 'flex';
    
    // Блокируем прокрутку основной страницы пока открыта модалка
    document.body.style.overflow = 'hidden';

    // Применяем перевод к только что созданным элементам (data-i18n)
    // Проверяем, что функции перевода существуют
    if (window.getTranslate && window.lang) {
        window.getTranslate(window.lang);
    }
}

// ============================================================
// ФУНКЦИЯ ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА
// ============================================================
function closeProfileModal() {
    // Находим модальное окно по id
    const modal = document.getElementById('profileModal');
    
    // Если модалка существует — скрываем её
    if (modal) modal.style.display = 'none';
    
    // Возвращаем прокрутку страницы обратно
    document.body.style.overflow = '';
}
// ============================================================
// 4. СОХРАНЕНИЕ ИЗМЕНЁННЫХ ДАННЫХ ПРОФИЛЯ
// ============================================================
// Обновляем И localStorage (немедленно для интерфейса),
// И запись на json-server (PATCH-запрос), чтобы данные не потерялись.

// Функция сохраняет изменения профиля на сервер и в localStorage
// async — функция асинхронная, использует await для ожидания ответа сервера
//Асинхронная функция — это функция, которая может ждать ответ от сервера, не блокируя работу страницы.
async function saveProfileChanges(e) {
    e.preventDefault(); // отменяем перезагрузку страницы (стандартное поведение формы)

    // Получаем текущего пользователя из localStorage
    const user = getCurrentUser();
    // Если пользователь не залогинен — выходим из функции
    if (!user) return;

    // Находим элемент для отображения ошибок
    const errorEl = document.getElementById('profileSaveError');
    // Очищаем предыдущее сообщение об ошибке
    errorEl.textContent = '';

    // Собираем новые значения из полей формы
    const updated = {
        ...user, // Оператор spread (...) — копируем все старые поля пользователя (id, role, password, createdAt)
        // А ниже перезаписываем те поля, которые могли измениться в форме
        firstName:  document.getElementById('profFirstName').value.trim(),  // Имя (trim() удаляет пробелы по краям)
        lastName:   document.getElementById('profLastName').value.trim(),   // Фамилия
        patronymic: document.getElementById('profPatronymic').value.trim(), // Отчество
        phone:      document.getElementById('profPhone').value.trim(),      // Телефон
        email:      document.getElementById('profEmail').value.trim(),      // Email
        nickname:   document.getElementById('profNickname').value.trim(),   // Никнейм
        birthDate:  document.getElementById('profBirthDate').value          // Дата рождения
    };

    // Простая проверка — обязательные поля не должны быть пустыми
    if (!updated.firstName || !updated.lastName || !updated.email || !updated.nickname) {
        errorEl.textContent = 'Please fill in all required fields'; // Показываем ошибку
        return; // Выходим из функции, не отправляем на сервер
    }

    try {
        // PATCH — метод HTTP, который обновляет только указанные поля записи на сервере
        // В отличие от PUT, который заменяет весь объект целиком
        const res = await fetch(`${PROFILE_API}/users/${user.id}`, {
            method:  'PATCH',                         // Метод частичного обновления
            headers: { 'Content-Type': 'application/json' }, // Говорим серверу, что отправляем JSON
            body:    JSON.stringify(updated)          // Превращаем объект в JSON-строку
        });

        // Если ответ не OK (например, 404 или 500) — выбрасываем ошибку
        if (!res.ok) throw new Error('Server error');

        // Получаем обновлённого пользователя с сервера (с теми же id)
        const savedUser = await res.json();

        // --- Обновляем localStorage — это и есть хранение настроек пользователя ---
        setCurrentUser(savedUser);

        // Обновляем иконку пользователя в шапке (могло поменяться имя в подсказке)
        updateUserIcon();

        // Показываем уведомление об успехе
        showNotification('Profile updated successfully!', 'success');
        
        // Закрываем модальное окно профиля
        closeProfileModal();

    } catch (err) {
        // В случае ошибки (например, сервер не запущен) — показываем сообщение пользователю
        errorEl.textContent = 'Failed to save. Is json-server running?';
    }
}
// ============================================================
// 5. КНОПКА "ВЫЙТИ"
// ============================================================
// Удаляет currentUser из localStorage.
// ВАЖНО: настройки темы/языка НЕ удаляются.

// Функция выхода пользователя из аккаунта
function logoutUser() {
    // Удаляем данные текущего пользователя из localStorage
    // После этого getCurrentUser() будет возвращать null
    localStorage.removeItem('currentUser');

    // Обновляем интерфейс — иконка профиля, кнопка Выйти скрывается
    // Иконка снова будет вести на страницу регистрации
    updateUserIcon();

    // Показываем уведомление, что выход выполнен
    // 'info' — тип уведомления (информационное, не ошибка)
    showNotification('You have been logged out', 'info');

    // Перенаправляем на главную через небольшую паузу (1 секунда) —
    // чтобы пользователь успел увидеть уведомление
    setTimeout(() => {
        window.location.href = 'index.html';  // Переход на главную страницу
    }, 1000);
}


// ============================================================
// 6. СБРОС НАСТРОЕК ПОЛЬЗОВАТЕЛЯ
// ============================================================
// Сбрасываем тему и язык на значения по умолчанию
// и применяем их сразу же.

// Функция сброса настроек интерфейса (тема и язык)
function resetUserSettings() {
    // Удаляем сохранённые настройки интерфейса из localStorage
    localStorage.removeItem('theme');  // Удаляем сохранённую тему 
    localStorage.removeItem('lang');   // Удаляем сохранённый язык 

    // Возвращаем глобальные переменные к значениям по умолчанию
    // (переменные theme и lang объявлены в themeManager.js через window)
    // Проверяем, что переменные существуют (не undefined), чтобы избежать ошибки
    if (window.theme !== undefined) window.theme = 'light';  // Тема по умолчанию: светлая
    if (window.lang  !== undefined) window.lang  = 'en';     // Язык по умолчанию: английский

    // Применяем светлую тему сразу
    // setAttribute меняет атрибут data-theme на корневом элементе html
    // CSS подхватывает это значение и меняет цвета
    document.documentElement.setAttribute('data-theme', 'light');

    // Применяем английский язык сразу
    // window.getTranslate — функция из i18n.js, которая переводит все элементы на странице
    if (window.getTranslate) window.getTranslate('en');

    // Обновляем иконку переключения темы в шапке
    if (window.updateThemeToggleIcon) window.updateThemeToggleIcon();
    
    // Обновляем изображения, которые зависят от темы
    if (window.updateThemedImages)    window.updateThemedImages();

    // Подсвечиваем кнопку EN как активную в переключателе языков
    document.querySelectorAll('.lang-btn').forEach(btn => {
        // btn.dataset.lang — значение атрибута data-lang у кнопки
        // Если data-lang = 'en' — добавляем класс active, иначе убираем
        btn.classList.toggle('active', btn.dataset.lang === 'en');
    });

    // Показываем уведомление, что настройки сброшены
    showNotification('Settings reset to default', 'info');
}
// ============================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ============================================================

// Ждём, пока весь HTML документа загрузится и будет готов к работе
// DOMContentLoaded — событие, которое срабатывает, когда DOM построен
document.addEventListener('DOMContentLoaded', function() {

    // --- Превращаем существующую иконку в управляемую через JS ---
    // Ищем иконку пользователя в навигации по её содержимому (👤)
    // Находим все элементы <li> внутри блока с классом .nav-right
    document.querySelectorAll('.nav-right li').forEach(li => {
        // Проверяем, начинается ли текст внутри <li> с эмодзи 
        // trim() удаляет пробелы в начале и конце
        // startsWith('👤') проверяет, что первый символ — это 👤
        if (li.textContent.trim().startsWith('👤')) {
            // Добавляем CSS-класс user-icon для стилизации и идентификации
            li.classList.add('user-icon');
            // Убираем старый атрибут onclick (который вёл на register.html напрямую)
            li.removeAttribute('onclick');
            // Меняем курсор на указатель (рука), чтобы было понятно, что элемент кликабельный
            li.style.cursor = 'pointer';
        }
    });

    // --- Добавляем кнопку "Выйти" в навигацию (изначально скрыта) ---
    // Находим блок .nav-right в шапке сайта
    const navRight = document.querySelector('.nav-right');
    // Проверяем, что такой блок существует на странице
    if (navRight) {
        // Создаём новый элемент <li> для кнопки выхода
        const logoutLi = document.createElement('li');
        // Присваиваем ему CSS-класс logout-btn (для стилизации и идентификации)
        logoutLi.className = 'logout-btn';
        // Изначально скрываем кнопку (будет показана только если пользователь залогинен)
        logoutLi.style.display = 'none';
        // Добавляем атрибут data-i18n для перевода текста на другие языки
        logoutLi.setAttribute('data-i18n', 'profile-logout');
        // Устанавливаем текст кнопки (по умолчанию на английском)
        logoutLi.textContent = 'Log Out';
        // Навешиваем обработчик клика — при нажатии вызывается функция logoutUser()
        logoutLi.addEventListener('click', logoutUser);
        // Добавляем кнопку в конец списка .nav-right
        navRight.appendChild(logoutLi);
    }

    
    // Вызываем функцию updateUserIcon(), которая:
    // 1. Проверяет, залогинен ли пользователь (есть ли данные в localStorage)
    // 2. Если залогинен: активирует иконку, показывает кнопку "Выйти"
    // 3. Если не залогинен: деактивирует иконку, скрывает кнопку "Выйти"
    updateUserIcon();
});