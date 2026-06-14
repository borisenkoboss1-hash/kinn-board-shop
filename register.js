// ============================================================
// register.js — логика регистрации и входа
// ============================================================

// Адрес json-server — все запросы идут сюда
const API = 'http://localhost:8000';

// Счётчик попыток генерации никнейма (максимум 5 автоматических)
let nicknameAttempts = 0;
const MAX_NICKNAME_ATTEMPTS = 5; // после 5 попыток поле становится редактируемым

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК: РЕГИСТРАЦИЯ - ВХОД
// ============================================================

// Функция переключает видимость двух форм: регистрации и входа
// tabName — название вкладки, которую нужно показать:
//   - 'register' - показываем форму регистрации
//   - 'login'    - показываем форму входа
function showTab(tabName) {
    
    // Находим элементы на странице по их id:
    const registerForm = document.getElementById('registerForm');  // Форма регистрации
    const loginForm    = document.getElementById('loginForm');     // Форма входа
    const tabRegister  = document.getElementById('tabRegister');   // Вкладка "Register"
    const tabLogin     = document.getElementById('tabLogin');      // Вкладка "Login"

    // Проверяем, какую вкладку нужно показать
    if (tabName === 'register') {
        
        // --- ПОКАЗЫВАЕМ РЕГИСТРАЦИЮ, СКРЫВАЕМ ВХОД ---
        
        // Делаем форму регистрации видимой (display: block)
        registerForm.style.display = 'block';
        
        // Скрываем форму входа (display: none)
        loginForm.style.display = 'none';
        
        // Делаем вкладку "Register" активной (подсвечиваем её)
        tabRegister.classList.add('active');
        
        // Убираем активный класс с вкладки "Login" (она перестаёт быть подсвеченной)
        tabLogin.classList.remove('active');
        
    } else {
        
        // --- ПОКАЗЫВАЕМ ВХОД, СКРЫВАЕМ РЕГИСТРАЦИЮ ---
        
        // Делаем форму входа видимой (display: block)
        loginForm.style.display = 'block';
        
        // Скрываем форму регистрации (display: none)
        registerForm.style.display = 'none';
        
        // Делаем вкладку "Login" активной (подсвечиваем её)
        tabLogin.classList.add('active');
        
        // Убираем активный класс с вкладки "Register"
        tabRegister.classList.remove('active');
    }
}
// ============================================================
// ФОРМАТИРОВАНИЕ НОМЕРА ТЕЛЕФОНА 
// ============================================================

// Функция автоматически форматирует введённый номер телефона
// input — это поле ввода, в котором пользователь печатает номер
// Результат: номер красиво форматируется как +375 (XX) XXX-XX-XX
// Пример: пользователь ввел 291234567 - превращается в +375 (29) 123-45-67
function formatPhone(input) {
    
    // --- ШАГ 1: ОСТАВЛЯЕМ ТОЛЬКО ЦИФРЫ ---
    // /\D/g — это регулярное выражение, которое находит ВСЕ не-цифры
    // g — означает "глобально" (ищет все совпадения, не только первое)
    // replace(/\D/g, '') — заменяет все НЕцифры на пустую строку (удаляет их)
    // Пример: "+375 (29) 123-45-67" - "375291234567"
    let digits = input.value.replace(/\D/g, '');
    // Обычные символы: 0-9 — цифры
    // Символы \D: всё кроме цифр (пробелы, скобки, тире, плюс, буквы)


    // --- ШАГ 2: УБИРАЕМ КОД СТРАНЫ, ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЕГО ВВЁЛ ---
    if (digits.startsWith('375')) {
        digits = digits.slice(3);   // .slice(3) — отрезаем первые 3 символа (375)
        // Пример: "375291234567" - "291234567"
    } 
    // Если пользователь начал вводить с 8
    else if (digits.startsWith('8')) {
        digits = digits.slice(1);   // .slice(1) — отрезаем первый символ (8)
        // Пример: "8291234567" - "291234567"
    }
    // Если пользователь вводит просто 291234567 — ничего не отрезаем


    // --- ШАГ 3: ОГРАНИЧИВАЕМ ДЛИНУ ДО 9 ЦИФР ---
    // В номере после +375 должно быть ровно 9 цифр 
    // .slice(0, 9) — берём только первые 9 цифр, остальное отбрасываем
    digits = digits.slice(0, 9);


    // --- ШАГ 4: СОБИРАЕМ КРАСИВЫЙ ФОРМАТИРОВАННЫЙ НОМЕР ---
    // Начинаем с +375
    let formatted = '+375';
    
    // Добавляем код оператора в скобках 
    // Если есть хотя бы 1 цифра — начинаем собирать
    if (digits.length > 0) formatted += ' (' + digits.slice(0, 2);
    // digits.slice(0, 2) — берёт первые 2 цифры (код оператора: 29, 33, 44, 25)
    
    // Если есть хотя бы 2 цифры — закрываем скобку и добавляем следующие 3 цифры
    if (digits.length >= 2) formatted += ') ' + digits.slice(2, 5);
    // digits.slice(2, 5) — берёт цифры с 3-й по 5-ю (первые 3 цифры номера)
    
    // Если есть хотя бы 5 цифр — добавляем тире и следующие 2 цифры
    if (digits.length >= 5) formatted += '-' + digits.slice(5, 7);
    // digits.slice(5, 7) — берёт 6-ю и 7-ю цифры
    
    // Если есть хотя бы 7 цифр — добавляем тире и последние 2 цифры
    if (digits.length >= 7) formatted += '-' + digits.slice(7, 9);
    // digits.slice(7, 9) — берёт 8-ю и 9-ю цифры


    // --- ШАГ 5: ЗАПИСЫВАЕМ РЕЗУЛЬТАТ ОБРАТНО В ПОЛЕ ---
    // Обновляем значение поля ввода отформатированным номером
    input.value = formatted;
}

// ============================================================
// ГЕНЕРАЦИЯ НИКНЕЙМА
// ============================================================

// Алгоритм генерации никнейма:
// 1. Берём первые 1-3 буквы имени
// 2. Берём первые 1-3 буквы фамилии
// 3. Добавляем случайное число 10-999
// Пример: Иван Петров → IvaPet123

// Функция создаёт автоматический никнейм из имени, фамилии и случайного числа
function generateNickname() {
    // Получаем значение поля Имя, убираем лишние пробелы по краям
    const firstName = document.getElementById('firstName').value.trim();
    // Получаем значение поля Фамилия, убираем лишние пробелы по краям
    const lastName  = document.getElementById('lastName').value.trim();

    // --- ПРОВЕРКА: ЗАПОЛНЕНЫ ЛИ ИМЯ И ФАМИЛИЯ ---
    // Если имя или фамилия пустые — показываем ошибку и выходим из функции
    if (!firstName || !lastName) {
        showError('nickname', 'Please fill in First and Last Name first');
        return;  // Останавливаем выполнение, никнейм не генерируем
    }

    // --- ПРОВЕРКА: НЕ ПРЕВЫШЕНО ЛИ КОЛИЧЕСТВО ПОПЫТОК? ---
    // Если пользователь уже нажал кнопку "Generate" 5 раз
    if (nicknameAttempts >= MAX_NICKNAME_ATTEMPTS) {
        // Находим поле ввода никнейма
        const field = document.getElementById('nickname');
        
        // Делаем поле доступным для ручного редактирования 
        field.readOnly = false;
        
        // Меняем подсказку внутри поля
        field.placeholder = 'Enter your nickname manually';
        
        // Меняем текст подсказки под полем
        document.getElementById('nicknameHint').textContent =
            'Max attempts reached. Enter manually.';
        
        // Делаем кнопку "Generate" неактивной (серой), чтобы нельзя было нажать ещё раз
        document.getElementById('btnGenerate').disabled = true;
        
        return;  // Выходим, никнейм не генерируем
    }

    // --- ГЕНЕРАЦИЯ СЛУЧАЙНОГО КОЛИЧЕСТВА БУКВ ---
    // Math.random() → число от 0 до 0.999
    // Math.random() * 3 → число от 0 до 2.999
    // Math.floor(...) → округляем вниз 
    // + 1 → получаем 1, 2 или 3 (сколько букв взять из имени)
    const nameLen = Math.floor(Math.random() * 3) + 1;
    // То же самое для фамилии: берём 1, 2 или 3 буквы
    const surLen  = Math.floor(Math.random() * 3) + 1;

    // Берём нужное количество букв из имени и фамилии
    // slice(0, nameLen) — берёт буквы с начала строки до nameLen
    const namePart = firstName.slice(0, nameLen);  // Пример: "Иван" + 3 буквы → "Ива"
    const surPart  = lastName.slice(0, surLen);    // Пример: "Петров" + 3 буквы → "Пет"

    // --- ГЕНЕРАЦИЯ СЛУЧАЙНОГО ЧИСЛА ---
    // Math.random() * 990 → число от 0 до 989.999
    // Math.floor(...) → округляем → 0-989
    // + 10 → получаем число от 10 до 999
    const num = Math.floor(Math.random() * 990) + 10;  // Пример: 123

    // --- СОБИРАЕМ НИКНЕЙМ ИЗ ЧАСТЕЙ ---
    // capitalize() — делает первую букву заглавной, остальные строчными
    // namePart → "Ива" → "Iva" (или "Ива" если русские буквы)
    // surPart  → "Пет" → "Pet"
    // num      → 123
    // Результат: "IvaPet123"
    const nick = capitalize(namePart) + capitalize(surPart) + num;

    // --- ЗАПИСЫВАЕМ НИКНЕЙМ В ПОЛЕ ---
    document.getElementById('nickname').value = nick;

    // --- УВЕЛИЧИВАЕМ СЧЁТЧИК ПОПЫТОК ---
    nicknameAttempts++;  // Например: было 2 попытки, стало 3

    // --- ПОКАЗЫВАЕМ, СКОЛЬКО ПОПЫТОК ОСТАЛОСЬ ---
    const remaining = MAX_NICKNAME_ATTEMPTS - nicknameAttempts;  // 5 - 3 = 2
    // Обновляем текст подсказки под полем никнейма
    document.getElementById('nicknameHint').textContent =
        remaining > 0  // Если ещё есть попытки
            ? `${remaining} generation(s) left`      // "2 generation(s) left"
            : 'Last generation used. You can now enter manually.';  // Сообщение о последней попытке

    // --- ПОСЛЕ ПОСЛЕДНЕЙ ПОПЫТКИ: ДЕЛАЕМ ПОЛЕ РЕДАКТИРУЕМЫМ ---
    if (nicknameAttempts >= MAX_NICKNAME_ATTEMPTS) {
        document.getElementById('nickname').readOnly = false;  // Теперь можно редактировать вручную
    }

    // --- ОЧИЩАЕМ СООБЩЕНИЕ ОБ ОШИБКЕ (если оно было) ---
    clearError('nickname');

    // --- ПЕРЕПРОВЕРЯЕМ ФОРМУ ---
    // Вдруг теперь все поля заполнены правильно и можно разблокировать кнопку регистрации
    validateForm();
}

// ============================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: ДЕЛАЕТ ПЕРВУЮ БУКВУ ЗАГЛАВНОЙ
// ============================================================

// Функция капитализирует строку: первая буква большая, остальные маленькие
// Пример: 'anna' → 'Anna'
// Пример: 'iVAN' → 'Ivan'
function capitalize(str) {
    // Если строка пустая — возвращаем пустую строку (чтобы не было ошибки)
    if (!str) return '';
    
    // str.charAt(0) — берём первый символ строки (например 'a' из "anna")
    // .toUpperCase() — делаем его заглавным (большим) → 'A'
    // str.slice(1) — берём все символы начиная со второго (второй, третий и т.д.) → "nna"
    // .toLowerCase() — делаем их строчными (маленькими) → "nna"
    // Склеиваем: 'A' + 'nna' = 'Anna'
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ РЕЖИМА ПАРОЛЯ: ВРУЧНУЮ - АВТОМАТИЧЕСКИЙ
// ============================================================

// mode: 'manual' (ручной ввод) или 'auto' (автоматическая генерация)
// Эта функция вызывается, когда пользователь выбирает способ ввода пароля
function switchPasswordMode(mode) {
    // Находим блок с полями для ручного ввода пароля (скрыт/показан)
    const manualBlock = document.getElementById('manualPasswordBlock');
    // Находим блок с полем для автоматического пароля
    const autoBlock   = document.getElementById('autoPasswordBlock');

    // Проверяем, какой режим выбрал пользователь
    if (mode === 'manual') {
        // --- РЕЖИМ "РУЧНОЙ ВВОД" ---
        // Показываем поля для ручного ввода (пароль и подтверждение)
        manualBlock.style.display = 'block';
        // Скрываем поле с автоматическим паролем
        autoBlock.style.display   = 'none';
        // Очищаем поле автопароля (на случай, если там что-то было)
        document.getElementById('autoPassword').value = '';
    } else {
        // --- РЕЖИМ "АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ" ---
        // Скрываем поля для ручного ввода
        manualBlock.style.display = 'none';
        // Показываем поле с автоматическим паролем
        autoBlock.style.display   = 'block';
        // Сразу генерируем новый пароль (чтобы пользователь его видел)
        generateAutoPassword();
    }

    // Перепроверяем форму после смены режима (обновляем активность кнопки регистрации)
    validateForm();
}

// ============================================================
// ГЕНЕРАЦИЯ БЕЗОПАСНОГО ПАРОЛЯ АВТОМАТИЧЕСКИ
// ============================================================
// Гарантирует наличие:
//   - 1 заглавной буквы (A-Z)
//   - 1 строчной буквы (a-z)
//   - 1 цифры (0-9)
//   - 1 спецсимвола (!@#$%^&*)
// Длина пароля: 12 символов

function generateAutoPassword() {
    // --- НАБОРЫ СИМВОЛОВ ДЛЯ КАЖДОЙ КАТЕГОРИИ ---
    const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';  // Заглавные буквы (26 штук)
    const lower   = 'abcdefghijklmnopqrstuvwxyz';  // Строчные буквы (26 штук)
    const digits  = '0123456789';                   // Цифры (10 штук)
    const special = '!@#$%^&*';                     // Специальные символы (8 штук)
    
    // ВСЕ символы вместе (для добора случайных символов)
    const all = upper + lower + digits + special;   // Всего 26+26+10+8 = 70 символов

    // --- ШАГ 1: БЕРЁМ ПО ОДНОМУ СИМВОЛУ КАЖДОГО ТИПА ---
    // Это гарантирует, что в пароле будет хотя бы одна заглавная, одна строчная, одна цифра и один спецсимвол
    let pwd = '';
    
    // Берём случайную заглавную букву
    // Math.random() * upper.length - случайное число от 0 до 25.999
    // Math.floor(...) → округляем вниз - 0-25
    // upper[...] - берём символ по этому индексу из строки upper
    pwd += upper[Math.floor(Math.random() * upper.length)];   
    
    // Берём случайную строчную букву
    pwd += lower[Math.floor(Math.random() * lower.length)];   
    
    // Берём случайную цифру
    pwd += digits[Math.floor(Math.random() * digits.length)]; 
    
    // Берём случайный спецсимвол
    pwd += special[Math.floor(Math.random() * special.length)]; 
    
    // После этих 4 шагов имеем пароль из 4 символов

    // --- ШАГ 2: ДОБАВЛЯЕМ ЕЩЁ 8 СЛУЧАЙНЫХ СИМВОЛОВ (ВСЕГО 12) ---
    // Цикл от 4 до 11 (всего 8 итераций)
    for (let i = 4; i < 12; i++) {
        // Добавляем случайный символ из общего набора (из всех 70 символов)
        pwd += all[Math.floor(Math.random() * all.length)];
        // Пример на каждой итерации: добавляем случайную букву или цифру или спецсимвол
    }
    // Теперь пароль состоит из 12 символов, но имеет предсказуемый порядок:
    // сначала заглавная, потом строчная, потом цифра, потом спецсимвол, потом 8 случайных

    // --- ШАГ 3: ПЕРЕМЕШИВАЕМ СИМВОЛЫ СЛУЧАЙНЫМ ОБРАЗОМ ---
    // Превращаем строку в массив символов: pwd.split('') → ['T','g','7','!',...]
    // Сортируем массив случайным образом:
    //   .sort(() => Math.random() - 0.5) - случайно возвращает положительное или отрицательное число
    //   Это перемешивает элементы массива в случайном порядке
    // .join('') - склеиваем массив обратно в строку
    pwd = pwd.split('').sort(() => Math.random() - 0.5).join('');
    // Теперь порядок символов случайный

    // --- ШАГ 4: ЗАПИСЫВАЕМ СГЕНЕРИРОВАННЫЙ ПАРОЛЬ В ПОЛЕ ---
    document.getElementById('autoPassword').value = pwd;

    // --- ШАГ 5: ПЕРЕПРОВЕРЯЕМ ФОРМУ ---
    // Пароль сгенерирован, значит можно разблокировать кнопку регистрации
    validateForm();
}

// ============================================================
// ПОКАЗАТЬ / СКРЫТЬ ПАРОЛЬ (кнопка глаза)
// ============================================================

// fieldId — id поля, btn — кнопка которую нажали
function toggleEye(fieldId, btn) {
    const field = document.getElementById(fieldId);
    // Переключаем тип поля между 'password' и 'text'
    if (field.type === 'password') {
        field.type = 'text';
        btn.textContent = '🙈'; // закрытый глаз
    } else {
        field.type = 'password';
        btn.textContent = '👁'; // открытый глаз
    }
}

// ============================================================
// ИНДИКАТОР СИЛЫ ПАРОЛЯ
// ============================================================

// Список самых популярных паролей (которые ЗАПРЕЩЕНЫ к использованию)
// Если пользователь введёт такой пароль — регистрация не пройдёт
// Это защита от слишком простых и распространённых паролей
const TOP100_PASSWORDS = [
    '12345678', '123456789', '1234567890', 'password', 'password1', 'password123',
    'qwerty123', 'qwerty', 'abc123', 'iloveyou', 'admin123', 'letmein', 'monkey',
    'dragon', 'master', 'sunshine', 'princess', 'welcome', 'shadow', 'superman',
    'michael', 'football', 'baseball', 'soccer', 'hockey', 'batman', 'trustno1',
    'hello123', 'charlie', 'donald', 'aa123456', 'pass@123', '1q2w3e4r',
    'qwertyuiop', 'zxcvbnm', '1qaz2wsx', 'q1w2e3r4', 'passw0rd', 'starwars',
    'p@ssword', 'passw@rd', 'p@55word', 'pa$$word', 'p@55w0rd', 'pa$$w0rd'
];

// Функция проверяет сложность пароля и обновляет индикатор силы
// Вызывается каждый раз, когда пользователь печатает что-то в поле пароля
function checkPasswordStrength() {
    // Получаем значение поля пароля (то, что ввёл пользователь)
    const pwd = document.getElementById('password').value;
    
    // Находим элемент — полоску индикатора (заливка)
    const fill = document.getElementById('strengthFill');
    
    // Находим элемент — текст рядом с полоской ("Weak", "Medium", "Strong")
    const label = document.getElementById('strengthLabel');

    // --- ЕСЛИ ПОЛЕ ПАРОЛЯ ПУСТОЕ ---
    if (!pwd) {
        // Скрываем индикатор: ширина = 0
        fill.style.width = '0';
        // Убираем цвет фона
        fill.style.background = '';
        // Убираем текст
        label.textContent = '';
        // Выходим из функции, возвращаем 0 баллов
        return 0;
    }

    // --- ПОДСЧЁТ БАЛЛОВ СЛОЖНОСТИ ПАРОЛЯ ---
    let score = 0;  // Начинаем с 0 баллов
    
    
    if (pwd.length >= 8) score++;   // +1 балл за достаточную длину
   
    if (pwd.length >= 12) score++;  // +1 балл за хорошую длину

    if (/[A-Z]/.test(pwd)) score++;  // +1 балл за заглавные буквы
   
    if (/[a-z]/.test(pwd)) score++;  // +1 балл за строчные буквы
    
    if (/\d/.test(pwd)) score++;      // +1 балл за цифры
    
    if (/[!@#$%^&*()_+\-=\[\]{}|;':",.<>?]/.test(pwd)) score++;  // +1 балл за спецсимволы
    // Максимальный балл = 6 (если выполнены все условия)

    // --- ОПРЕДЕЛЯЕМ УРОВЕНЬ СИЛЫ ПО КОЛИЧЕСТВУ БАЛЛОВ ---
    let width, color, text;
    
    if (score <= 2) {
        // Слабый пароль (0-2 балла) — красный, полоска на 33%
        width = '33%';          // Ширина полоски
        color = '#e74c3c';      // Красный цвет (опасно)
        text = 'Weak';          // Текст "Слабый"
    } else if (score <= 4) {
        // Средний пароль (3-4 балла) — оранжевый, полоска на 66%
        width = '66%';
        color = '#f39c12';      // Оранжевый цвет (средне)
        text = 'Medium';        // Текст "Средний"
    } else {
        // Сильный пароль (5-6 баллов) — зелёный, полоска на 100%
        width = '100%';
        color = '#27ae60';      // Зелёный цвет (хорошо)
        text = 'Strong';        // Текст "Сильный"
    }

    // --- ОБНОВЛЯЕМ ИНДИКАТОР НА СТРАНИЦЕ ---
    fill.style.width = width;           // Устанавливаем ширину полоски (33%, 66% или 100%)
    fill.style.background = color;      // Устанавливаем цвет полоски
    label.textContent = text;           // Устанавливаем текст "Weak/Medium/Strong"
    label.style.color = color;          // Красим текст в тот же цвет

    // --- ПЕРЕПРОВЕРЯЕМ ФОРМУ ---
    // После обновления силы пароля проверяем, можно ли разблокировать кнопку регистрации
    validateForm();
    
    // Возвращаем количество баллов (может пригодиться для других проверок)
    return score;
}

// ============================================================
// ВАЛИДАЦИЯ ВСЕЙ ФОРМЫ
// ============================================================

// Правила для каждого поля: возвращает строку ошибки или ''
const RULES = {

    // Имя: только буквы, минимум 2 символа
    firstName(v) {
        if (!v) return 'First name is required';
        if (v.length < 2) return 'Minimum 2 characters';
        if (!/^[a-zA-Zа-яёА-ЯЁ\s-]+$/.test(v)) return 'Letters only';
        return '';
    },

    // Фамилия: те же правила
    lastName(v) {
        if (!v) return 'Last name is required';
        if (v.length < 2) return 'Minimum 2 characters';
        if (!/^[a-zA-Zа-яёА-ЯЁ\s-]+$/.test(v)) return 'Letters only';
        return '';
    },

    // Телефон: обязательно номер Беларуси +375XX
    phone(v) {
        if (!v) return 'Phone is required';
        // Убираем форматирование и проверяем
        const clean = v.replace(/[\s\-()]/g, '');
        if (!/^\+375(25|29|33|44)\d{7}$/.test(clean))
            return 'Valid Belarus number required (+375 29/33/44/25)';
        return '';
    },

    // Email: стандартная проверка формата
    email(v) {
        if (!v) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Invalid email format';
        return '';
    },

    // Дата рождения: пользователю должно быть 16+ лет
    birthDate(v) {
        if (!v) return 'Date of birth is required';
        const birth = new Date(v);
        const today = new Date();
        // Вычитаем 16 лет из текущей даты
        const min16 = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        if (birth > min16) return 'You must be at least 16 years old';
        return '';
    },

    // Никнейм: минимум 3 символа, только буквы/цифры/_
    nickname(v) {
        if (!v) return 'Nickname is required';
        if (v.length < 3) return 'Minimum 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Letters, numbers and _ only';
        return '';
    },

    // Пароль: минимум 8 и максимум 20 символов, заглавная+строчная+цифра+спецсимвол
    // Не должен быть из топ-100 популярных
    password(v) {
        if (!v) return 'Password is required';
        if (v.length < 8)  return 'Minimum 8 characters';
        if (v.length > 20) return 'Maximum 20 characters';
        if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter';
        if (!/[a-z]/.test(v)) return 'Must contain at least one lowercase letter';
        if (!/\d/.test(v))    return 'Must contain at least one digit';
        if (!/[!@#$%^&*()_+\-=\[\]{}|;':",.<>?]/.test(v))
            return 'Must contain at least one special character (!@#$ etc.)';
        if (TOP100_PASSWORDS.includes(v.toLowerCase()))
            return 'This password is too common. Please choose a stronger one';
        return '';
    },

    // Подтверждение пароля: должно совпадать с основным
    confirmPassword(v) {
        if (!v) return 'Please confirm your password';
        const pwd = document.getElementById('password').value;
        if (v !== pwd) return 'Passwords do not match';
        return '';
    }
};

// Главная функция валидации (проверка верно ли ввел) — вызывается при каждом изменении любого поля
// Проверяет все поля и активирует/деактивирует кнопку отправки
function validateForm() {
    // Собираем значения всех полей
    const values = {
        firstName:  document.getElementById('firstName').value.trim(),
        lastName:   document.getElementById('lastName').value.trim(),
        phone:      document.getElementById('phone').value.trim(),
        email:      document.getElementById('email').value.trim(),
        birthDate:  document.getElementById('birthDate').value,
        nickname:   document.getElementById('nickname').value.trim(),
    };

    // Проверяем каждое поле по правилу
    let allValid = true;
    for (const [field, value] of Object.entries(values)) {
        const error = RULES[field] ? RULES[field](value) : '';
        if (error) allValid = false;
    }

    // Проверяем пароль в зависимости от выбранного режима
    const isAuto = document.querySelector('input[name="passwordMode"]:checked').value === 'auto';
    if (isAuto) {
        // Авторежим — проверяем что пароль сгенерирован
        if (!document.getElementById('autoPassword').value) allValid = false;
    } else {
        // Ручной — проверяем оба поля пароля
        const pwdErr  = RULES.password(document.getElementById('password').value);
        const confErr = RULES.confirmPassword(document.getElementById('confirmPassword').value);
        if (pwdErr || confErr) allValid = false;
    }

    // Проверяем что согласие отмечено
    if (!document.getElementById('agreement').checked) allValid = false;

    // Активируем или деактивируем кнопку регистрации
    document.getElementById('btnRegister').disabled = !allValid;
}

// ============================================================
// ПОКАЗ / ОЧИСТКА ОШИБОК ПОД ПОЛЯМИ
// ============================================================

// Показывает сообщение об ошибке под полем fieldId
function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message; // пишем текст ошибки
    if (inputEl) inputEl.classList.add('input-error'); // красная рамка на поле
}

// Убирает сообщение об ошибке когда пользователь исправляет поле
function clearError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = ''; // очищаем текст ошибки
    if (inputEl) inputEl.classList.remove('input-error'); // убираем красную рамку
    // Перепроверяем всю форму — вдруг теперь можно активировать кнопку
    validateForm();
}

// ============================================================
// ОТПРАВКА ФОРМЫ РЕГИСТРАЦИИ
// ============================================================

// Обработчик отправки формы регистрации
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Отменяем стандартную отправку формы (перезагрузку страницы)

    const btnRegister = document.getElementById('btnRegister');

    // Блокируем кнопку чтобы не нажали дважды
    btnRegister.disabled = true;
    btnRegister.textContent = 'Creating account...';

    // Определяем какой режим пароля выбран
    const isAuto = document.querySelector('input[name="passwordMode"]:checked').value === 'auto';
    const finalPassword = isAuto
        ? document.getElementById('autoPassword').value      // автопароль
        : document.getElementById('password').value;         // ручной пароль

    // Получаем никнейм из поля
    const nickname = document.getElementById('nickname').value.trim();

    try {
        // Загружаем список существующих пользователей для проверки уникальности
        const res = await fetch(`${API}/users`);
        const users = await res.json();

        // Проверяем что email уже не зарегистрирован
        const emailExists = users.some(u => u.email === document.getElementById('email').value.trim());
        if (emailExists) {
            showError('email', 'This email is already registered');
            btnRegister.disabled    = false;
            btnRegister.textContent = 'Create Account';
            return; // Прерываем отправку
        }

        // Проверяем что никнейм уникален
        const nickExists = users.some(u => u.nickname === nickname);
        if (nickExists) {
            showError('nickname', 'This nickname is already taken');
            btnRegister.disabled    = false;
            btnRegister.textContent = 'Create Account';
            return;
        }

        // Формируем объект нового пользователя
        const newUser = {
            firstName:  document.getElementById('firstName').value.trim(),
            lastName:   document.getElementById('lastName').value.trim(),
            patronymic: document.getElementById('patronymic').value.trim(),
            phone:      document.getElementById('phone').value.trim(),
            email:      document.getElementById('email').value.trim(),
            password:   finalPassword,
            nickname:   nickname,
            birthDate:  document.getElementById('birthDate').value,
            role:       'buyer', // новые пользователи всегда получают роль buyer
            createdAt:  new Date().toISOString().split('T')[0] // дата в формате YYYY-MM-DD
        };

        // Отправляем POST-запрос на json-server — добавляем пользователя в коллекцию users
        const postRes = await fetch(`${API}/users`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(newUser)
        });

        if (!postRes.ok) throw new Error('Server error'); // json-server вернул ошибку

        const savedUser = await postRes.json(); // получаем сохранённого пользователя с id

        // Сохраняем пользователя в localStorage — он теперь "залогинен"
        localStorage.setItem('currentUser', JSON.stringify(savedUser));

        // Показываем сообщение об успехе
        showToast('Account created successfully! Welcome, ' + savedUser.firstName + '!', 'success');

        // Через 1.5 секунды перенаправляем на каталог
        setTimeout(() => { window.location.href = 'catalog.html'; }, 1500);

    } catch (err) {
        // Показываем ошибку если что-то пошло не так
        showToast('Error: ' + err.message + '. Make sure json-server is running.', 'error');
        btnRegister.disabled    = false;
        btnRegister.textContent = 'Create Account';
    }
});

// ============================================================
// ОТПРАВКА ФОРМЫ ВХОДА
// ============================================================

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Отменяем стандартную отправку

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Простая проверка — поля не пустые
    if (!email) { showError('loginEmail', 'Email is required'); return; }
    if (!password) { showError('loginPassword', 'Password is required'); return; }

    const btn = document.getElementById('btnLogin');
    btn.disabled    = true;
    btn.textContent = 'Signing in...';

    try {
        // Ищем пользователя по email и паролю в json-server
        const res   = await fetch(`${API}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
        const users = await res.json();

        if (users.length === 0) {
            // Пользователь не найден — показываем ошибку
            showError('loginEmail', 'Invalid email or password');
            btn.disabled    = false;
            btn.textContent = 'Sign In';
            return;
        }

        const user = users[0]; // берём первого найденного пользователя

        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));

        showToast('Welcome back, ' + user.firstName + '!', 'success');

        // Администратора перенаправляем на панель, остальных — в каталог
        setTimeout(() => {
            window.location.href = user.role === 'admin' ? 'admin.html' : 'catalog.html';
        }, 1000);

    } catch (err) {
        showToast('Connection error. Is json-server running?', 'error');
        btn.disabled    = false;
        btn.textContent = 'Sign In';
    }
});

// ============================================================
// МОДАЛЬНОЕ ОКНО ПОЛЬЗОВАТЕЛЬСКОГО СОГЛАШЕНИЯ
// ============================================================

// Открывает модалку с текстом соглашения
function showAgreement(e) {
    e.preventDefault(); // Отменяем переход по ссылке #
    document.getElementById('agreementModal').style.display = 'flex';
}

// Закрывает модалку при клике на затемнённый фон
function closeAgreement(e) {
    if (e.target === document.getElementById('agreementModal')) {
        document.getElementById('agreementModal').style.display = 'none';
    }
}

// Закрывает модалку по кнопке ✕
function closeAgreementBtn() {
    document.getElementById('agreementModal').style.display = 'none';
}

// Принять соглашение — ставит галочку и закрывает модалку
function acceptAgreement() {
    document.getElementById('agreement').checked = true; // ставим галочку
    document.getElementById('agreementModal').style.display = 'none';
    clearError('agreement');
    validateForm(); // перепроверяем форму — кнопка может стать активной
}

// ============================================================
// УВЕДОМЛЕНИЯ (TOAST)
// ============================================================

// Показывает всплывающее уведомление внизу экрана
// message — текст, type — 'success' (зелёный) или 'error' (красный)
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent       = message;
    toast.style.display     = 'block';
    toast.style.background  = type === 'success' ? '#27ae60' : '#e74c3c';
    toast.style.color       = 'white';
    // Скрываем уведомление через 3 секунды
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ============================================================
// ОТОБРАЖЕНИЕ КНОПКИ АДМИНКИ
// ============================================================

// При загрузке страницы проверяем роль текущего пользователя
// Если роль = admin — показываем кнопку Admin Panel в навигации
window.addEventListener('load', function() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user && user.role === 'admin') {
        // Показываем ссылку на админку только администраторам
        const adminLink = document.getElementById('adminLink');
        if (adminLink) adminLink.style.display = 'inline';
    }
});
