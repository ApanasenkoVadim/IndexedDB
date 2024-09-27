let db;
const dbName = 'myDatabase';
const tableName = 'myTable';

function openDB() {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains(tableName)) {
            const objectStore = db.createObjectStore(tableName, { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('name', 'name', { unique: false });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Соединение с базой данных успешно установлено");
        updateTable();
    };

    request.onerror = function(event) {
        console.error("Ошибка при открытии базы данных:", event.target.error);
    };
}

openDB();

function updateTable() {
    const transaction = db.transaction([tableName], 'readonly');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const records = event.target.result;
        const tableBody = document.querySelector('#dataTable tbody');
        tableBody.innerHTML = '';  // Очищаем таблицу перед обновлением

        records.forEach(record => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', record.id); // Присваиваем строке уникальный ключ

            row.innerHTML = `
                <td contentEditable="true">${record.name}</td>
                <td><span class="action" onclick="updateItem(${record.id})">Изменить</span></td>
                <td><span class="action" onclick="deleteItem(${record.id})">Удалить</span></td>
            `;
            tableBody.appendChild(row);
        });
    };

    request.onerror = function(event) {
        console.error("Ошибка при чтении записей:", event.target.error);
    };
}


function saveItem() {
    const nameInput = document.getElementById('nameInput').value;
    const transaction = db.transaction([tableName], 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.add({ name: nameInput });

    request.onsuccess = function() {
        alert('Запись успешно добавлена');
        updateTable();  // Обновляем таблицу после добавления
    };

    request.onerror = function(event) {
        console.error("Ошибка при добавлении записи:", event.target.error);
    };
}

function updateItem(key) {
    const transaction = db.transaction([tableName], 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.get(key);

    request.onsuccess = function(event) {
        const record = event.target.result;
        const row = document.querySelector(`tr[data-id="${key}"]`);
        const updatedName = row.querySelector('td[contentEditable="true"]').innerText;

        // Обновляем имя в записи
        record.name = updatedName;

        const updateRequest = objectStore.put(record);

        updateRequest.onsuccess = function() {
            alert('Запись успешно обновлена');
            updateTable();
        };

        updateRequest.onerror = function(event) {
            console.error("Ошибка при обновлении записи:", event.target.error);
        };
    };

    request.onerror = function(event) {
        console.error("Ошибка при получении записи:", event.target.error);
    };
}


function deleteItem(key) {
    const transaction = db.transaction([tableName], 'readwrite');
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.delete(key);

    request.onsuccess = function() {
        alert('Запись успешно удалена');
        updateTable();  // Обновляем таблицу после удаления
    };

    request.onerror = function(event) {
        console.error("Ошибка при удалении записи:", event.target.error);
    };
}
