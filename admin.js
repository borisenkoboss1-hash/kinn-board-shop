// ============================================================
// admin.js — логика админ-панели
// ============================================================

const API = 'http://localhost:8000';

// id товара который сейчас редактируется (null = режим добавления)
let editingProductId = null;

// Кэш данных — чтобы не перезагружать при каждом действии
let allProducts = [];
let allUsers    = [];
let allReviews  = [];

// ============================================================
// ПРОВЕРКА ДОСТУПА: ТОЛЬКО АДМИНИСТРАТОР
// ============================================================

window.addEventListener('load', async function() {
    // Берём текущего пользователя из localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Если не залогинен ИЛИ роль не admin — показываем "Access Denied"
    if (!currentUser || currentUser.role !== 'admin') {
        document.getElementById('accessDenied').style.display = 'block';
        document.getElementById('adminContent').style.display = 'none';
        return; // дальше не идём — загружать данные нет смысла
    }

    // Пользователь — администратор: показываем панель
    document.getElementById('adminContent').style.display = 'block';

    // Загружаем все данные параллельно для быстроты
    await Promise.all([
        loadProducts(),
        loadUsers(),
        loadReviews()
    ]);

    // Отрисовываем все таблицы
    renderProductsTable();
    renderUsersTable();
    fillReviewFilters();
    renderReviewsTable();
});

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК АДМИНКИ
// ============================================================

// tab: 'products' | 'reviews' | 'users'
function showAdminTab(tab) {
    // Скрываем все секции
    document.getElementById('sectionProducts').style.display = 'none';
    document.getElementById('sectionReviews').style.display  = 'none';
    document.getElementById('sectionUsers').style.display    = 'none';

    // Убираем активный класс со всех вкладок
    document.getElementById('tabProducts').classList.remove('active');
    document.getElementById('tabReviews').classList.remove('active');
    document.getElementById('tabUsers').classList.remove('active');

    // Показываем нужную секцию и подсвечиваем вкладку
    if (tab === 'products') {
        document.getElementById('sectionProducts').style.display = 'block';
        document.getElementById('tabProducts').classList.add('active');
    } else if (tab === 'reviews') {
        document.getElementById('sectionReviews').style.display = 'block';
        document.getElementById('tabReviews').classList.add('active');
    } else {
        document.getElementById('sectionUsers').style.display = 'block';
        document.getElementById('tabUsers').classList.add('active');
    }
}

// ============================================================
// ============  РАЗДЕЛ: ТОВАРЫ (CRUD)  ======================
// ============================================================

// --- ЗАГРУЗКА (READ) ---

// Загружает список всех товаров с сервера
async function loadProducts() {
    try {
        const res = await fetch(`${API}/products`);
        allProducts = await res.json();
    } catch (err) {
        showToast('Failed to load products', 'error');
    }
}

// Отображает таблицу товаров
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');

    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No products found.</td></tr>';
        return;
    }

    // Для каждого товара создаём строку таблицы с кнопками Edit/Delete
    tbody.innerHTML = allProducts.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>$${Number(p.price).toFixed(2)}</td>
            <td>${p.rating}</td>
            <td>${p.inStock ? '✅' : '❌'}</td>
            <td>${p.isNew ? '🆕' : '—'}</td>
            <td>
                <!-- Кнопка редактирования — заполняет форму данными товара -->
                <button class="btn-small btn-edit" onclick="editProduct('${p.id}')">Edit</button>
                <!-- Кнопка удаления — спрашивает подтверждение -->
                <button class="btn-small btn-delete" onclick="deleteProduct('${p.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// --- ВАЛИДАЦИЯ ФОРМЫ ТОВАРА ---

// Проверяет все поля формы товара
// Кнопка "Save" активна только если всё заполнено правильно
function validateProductForm() {
    const name        = document.getElementById('pName').value.trim();
    const category    = document.getElementById('pCategory').value;
    const price       = document.getElementById('pPrice').value;
    const rating      = document.getElementById('pRating').value;
    const photo       = document.getElementById('pPhoto').value.trim();
    const description = document.getElementById('pDescription').value.trim();

    let isValid = true;

    // Название: обязательно, минимум 3 символа
    if (!name || name.length < 3) {
        showFieldError('pName', 'Minimum 3 characters');
        isValid = false;
    } else {
        clearFieldError('pName');
    }

    // Категория: должна быть выбрана
    if (!category) {
        showFieldError('pCategory', 'Please select a category');
        isValid = false;
    } else {
        clearFieldError('pCategory');
    }

    // Цена: должна быть положительным числом
    if (!price || Number(price) <= 0) {
        showFieldError('pPrice', 'Price must be greater than 0');
        isValid = false;
    } else {
        clearFieldError('pPrice');
    }

    // Рейтинг: от 0 до 5
    if (rating === '' || Number(rating) < 0 || Number(rating) > 5) {
        showFieldError('pRating', 'Rating must be between 0 and 5');
        isValid = false;
    } else {
        clearFieldError('pRating');
    }

    // Путь к фото: не пустой
    if (!photo) {
        showFieldError('pPhoto', 'Photo path is required');
        isValid = false;
    } else {
        clearFieldError('pPhoto');
    }

    // Описание: минимум 10 символов
    if (!description || description.length < 10) {
        showFieldError('pDescription', 'Minimum 10 characters');
        isValid = false;
    } else {
        clearFieldError('pDescription');
    }

    // Включаем/выключаем кнопку сохранения
    document.getElementById('btnSaveProduct').disabled = !isValid;
    return isValid;
}

// --- ДОБАВЛЕНИЕ / ОБНОВЛЕНИЕ (CREATE / UPDATE) ---

// Обработчик отправки формы товара
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // отменяем перезагрузку страницы

    // Финальная проверка перед отправкой
    if (!validateProductForm()) return;

    // Собираем объект товара из полей формы
    const productData = {
        name:        document.getElementById('pName').value.trim(),
        category:    document.getElementById('pCategory').value,
        price:       Number(document.getElementById('pPrice').value),
        rating:      Number(document.getElementById('pRating').value),
        photo:       document.getElementById('pPhoto').value.trim(),
        inStock:     document.getElementById('pInStock').checked,
        isNew:       document.getElementById('pIsNew').checked,
        description: document.getElementById('pDescription').value.trim()
    };

    const btn = document.getElementById('btnSaveProduct');
    btn.disabled = true;

    try {
        if (editingProductId) {
            // --- РЕЖИМ РЕДАКТИРОВАНИЯ: PUT-запрос ---
            // PUT обновляет товар с указанным id целиком
            const res = await fetch(`${API}/products/${editingProductId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Передаём id вместе с остальными данными — PUT требует полный объект
                body: JSON.stringify({ id: editingProductId, ...productData })
            });
            if (!res.ok) throw new Error('Update failed');

            showToast('Product updated successfully', 'success');

        } else {
            // --- РЕЖИМ ДОБАВЛЕНИЯ: POST-запрос ---
            // POST создаёт новый товар, json-server сам сгенерирует id
            const res = await fetch(`${API}/products`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(productData)
            });
            if (!res.ok) throw new Error('Create failed');

            showToast('Product added successfully', 'success');
        }

        // Перезагружаем список товаров и обновляем таблицу
        await loadProducts();
        renderProductsTable();

        // Сбрасываем форму обратно в режим "Добавить"
        cancelEdit();

    } catch (err) {
        showToast('Error: ' + err.message + '. Is json-server running?', 'error');
        btn.disabled = false;
    }
});

// --- РЕДАКТИРОВАНИЕ (заполняем форму данными товара) ---

// Вызывается при нажатии кнопки "Edit" в таблице
function editProduct(id) {
    // Находим товар в кэше по id
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    // Запоминаем какой товар редактируем
    editingProductId = id;

    // Заполняем поля формы данными товара
    document.getElementById('pName').value        = product.name;
    document.getElementById('pCategory').value    = product.category;
    document.getElementById('pPrice').value       = product.price;
    document.getElementById('pRating').value      = product.rating;
    document.getElementById('pPhoto').value       = product.photo;
    document.getElementById('pInStock').checked   = product.inStock;
    document.getElementById('pIsNew').checked     = product.isNew;
    document.getElementById('pDescription').value = product.description;

    // Меняем заголовок формы и текст кнопки
    document.getElementById('productFormTitle').textContent = 'Edit Product: ' + product.name;
    document.getElementById('btnSaveProduct').textContent   = 'Save Changes';

    // Показываем кнопку "Cancel"
    document.getElementById('btnCancelEdit').style.display = 'inline-block';

    // Прокручиваем страницу к форме чтобы пользователь её увидел
    document.querySelector('.admin-form-card').scrollIntoView({ behavior: 'smooth' });

    // Перепроверяем валидность (форма уже заполнена корректными данными)
    validateProductForm();
}

// Отменяет редактирование — возвращает форму в режим "Добавить новый товар"
function cancelEdit() {
    editingProductId = null;

    // Очищаем все поля формы
    document.getElementById('productForm').reset();

    // Возвращаем заголовок и текст кнопки
    document.getElementById('productFormTitle').textContent = 'Add New Product';
    document.getElementById('btnSaveProduct').textContent   = 'Add Product';
    document.getElementById('btnSaveProduct').disabled      = true;

    // Скрываем кнопку Cancel
    document.getElementById('btnCancelEdit').style.display = 'none';

    // Очищаем все ошибки валидации
    ['pName','pCategory','pPrice','pRating','pPhoto','pDescription'].forEach(clearFieldError);
}

// --- УДАЛЕНИЕ (DELETE) ---

// Вызывается при нажатии кнопки "Delete"
async function deleteProduct(id) {
    // Спрашиваем подтверждение — удаление необратимо
    const product = allProducts.find(p => p.id === id);
    if (!confirm(`Delete "${product ? product.name : id}"? This cannot be undone.`)) {
        return; // пользователь нажал "Отмена"
    }

    try {
        // DELETE-запрос — удаляет товар с указанным id
        const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        showToast('Product deleted', 'success');

        // Перезагружаем список и таблицу
        await loadProducts();
        renderProductsTable();

        // Если удалили товар который редактировали — сбрасываем форму
        if (editingProductId === id) cancelEdit();

    } catch (err) {
        showToast('Error deleting product. Is json-server running?', 'error');
    }
}

// ============================================================
// ============  РАЗДЕЛ: ОТЗЫВЫ  =============================
// ============================================================

// Загружает все отзывы
async function loadReviews() {
    try {
        const res = await fetch(`${API}/feedback`);
        allReviews = await res.json();
    } catch (err) {
        showToast('Failed to load reviews', 'error');
    }
}

// Заполняет фильтры по товару и пользователю
function fillReviewFilters() {
    const productSelect = document.getElementById('reviewFilterProduct');
    const userSelect    = document.getElementById('reviewFilterUser');

    // Заполняем список товаров
    allProducts.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        productSelect.appendChild(option);
    });

    // Заполняем список пользователей (только покупатели — у них есть отзывы)
    allUsers.filter(u => u.role !== 'admin').forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = `${u.firstName} ${u.lastName} (${u.nickname})`;
        userSelect.appendChild(option);
    });
}

// Отображает таблицу отзывов с учётом фильтров
function loadAdminReviews() {
    const productFilter = document.getElementById('reviewFilterProduct').value;
    const userFilter    = document.getElementById('reviewFilterUser').value;

    // Применяем оба фильтра одновременно (если выбраны)
    let filtered = allReviews;
    if (productFilter) {
        filtered = filtered.filter(r => r.productId === productFilter);
    }
    if (userFilter) {
        filtered = filtered.filter(r => r.userId === userFilter);
    }

    renderReviewsTable(filtered);
}

// Отрисовывает таблицу отзывов
// reviews — если не передан, используется полный список
function renderReviewsTable(reviews = allReviews) {
    const tbody = document.getElementById('reviewsTableBody');

    if (reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No reviews found.</td></tr>';
        return;
    }

    tbody.innerHTML = reviews.map(r => `
        <tr>
            <td>${r.nickname}</td>
            <td>${r.productName}</td>
            <td>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
            <td style="max-width:250px;">${escapeHtml(r.text)}</td>
            <td>${r.createdAt}</td>
            <td>
                <!-- Удаление отзыва -->
                <button class="btn-small btn-delete" onclick="deleteReview('${r.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Удаляет отзыв по id
async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;

    try {
        const res = await fetch(`${API}/feedback/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        showToast('Review deleted', 'success');

        // Перезагружаем отзывы и обновляем таблицу с учётом текущих фильтров
        await loadReviews();
        loadAdminReviews();

    } catch (err) {
        showToast('Error deleting review. Is json-server running?', 'error');
    }
}

// ============================================================
// ============  РАЗДЕЛ: ПОЛЬЗОВАТЕЛИ (только просмотр)  =====
// ============================================================

// Загружает список всех пользователей
async function loadUsers() {
    try {
        const res = await fetch(`${API}/users`);
        allUsers = await res.json();
    } catch (err) {
        showToast('Failed to load users', 'error');
    }
}

// Отображает таблицу пользователей
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');

    tbody.innerHTML = allUsers.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.firstName} ${u.lastName} ${u.patronymic || ''}</td>
            <td>${u.nickname}</td>
            <td>${u.email}</td>
            <td>${u.phone}</td>
            <td>${u.role === 'admin' ? '👑 Admin' : 'Buyer'}</td>
            <td>${u.createdAt}</td>
        </tr>
    `).join('');
}

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (общие со страницами регистрации/отзывов)
// ============================================================

// Показывает сообщение об ошибке под полем
function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('input-error');
}

// Очищает сообщение об ошибке
function clearFieldError(fieldId) {
    const errorEl = document.getElementById(fieldId + 'Error');
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = '';
    if (inputEl) inputEl.classList.remove('input-error');
}

// Защита от XSS в тексте отзывов
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показывает всплывающее уведомление
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent      = message;
    toast.style.display    = 'block';
    toast.style.background = type === 'success' ? '#27ae60' : '#e74c3c';
    toast.style.color      = 'white';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
