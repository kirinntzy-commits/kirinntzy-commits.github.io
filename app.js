// ============================================
// ДАННЫЕ О МЕСТАХ ВКО
// ФОТОГРАФИИ БЕРУТСЯ ИЗ ПАПКИ images/
// ============================================
const places = [
    {
        id: 1,
        name: "Катон-Карагайский национальный парк",
        lat: 49.1800,
        lng: 85.6000,
        description: "Жемчужина Алтая, уникальная природа, горные озера и реликтовые леса. Здесь можно увидеть маралов, медведей и редкие виды птиц.",
        image: "images/katon.jpg",
        bestSeason: "Июнь-сентябрь",
        travelTips: "Возьмите теплую одежду, даже летом прохладно"
    },
    {
        id: 2,
        name: "Озеро Алакөль",
        lat: 46.3500,
        lng: 81.5800,
        description: "Знаменитое целебное озеро с песчаными пляжами и чистейшей водой. Помогает при заболеваниях кожи.",
        image: "images/alakol.jpg",
        bestSeason: "Июль-август",
        travelTips: "Бронируйте жилье заранее, возьмите средства от комаров"
    },
    {
        id: 3,
        name: "Маркакольский заповедник",
        lat: 48.7500,
        lng: 85.8000,
        description: "Высокогорное озеро Маркаколь на высоте 1447 м. Редкие виды птиц, нетронутая природа.",
        image: "images/markakol.jpg",
        bestSeason: "Июнь-август",
        travelTips: "Нужен пропуск для въезда, дорога грунтовая"
    },
    {
        id: 4,
        name: "Рахмановские ключи",
        lat: 49.5500,
        lng: 86.4500,
        description: "Горячие источники с целебной водой до +45°C. Живописное ущелье, отличное место для оздоровления.",
        image: "images/rahmanov.jpg",
        bestSeason: "Круглый год",
        travelTips: "Нужен внедорожник, есть санаторий для проживания"
    },
    {
        id: 5,
        name: "Киин-Кериш",
        lat: 48.3000,
        lng: 84.5000,
        description: "Уникальный каньон с разноцветными скалами. Напоминает марсианский пейзаж. Любимое место фотографов.",
        image: "images/kiin.jpg",
        bestSeason: "Май-сентябрь",
        travelTips: "Берите много воды, рядом нет источников"
    },
    {
        id: 6,
        name: "Бухтарминское водохранилище",
        lat: 49.6500,
        lng: 84.3000,
        description: "Крупнейшее водохранилище Казахстана, 'Казахстанское море'. Отличная рыбалка и отдых на природе.",
        image: "images/bukhtarma.jpg",
        bestSeason: "Июнь-сентябрь",
        travelTips: "Берите рыболовные снаряжения, можно арендовать лодку"
    },
    {
        id: 7,
        name: "Усть-Каменогорск",
        lat: 49.9500,
        lng: 82.6200,
        description: "Областной центр Восточного Казахстана. Парки, набережная Иртыша, краеведческий музей.",
        image: "images/ust.jpg",
        bestSeason: "Круглый год",
        travelTips: "Хорошая инфраструктура, много гостиниц"
    }
];

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let map;
let markers = [];
let currentRouteLayer = null;
let userLocation = null;

// ============================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ============================================
function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [82.62, 49.95],
        zoom: 7
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-right');

    map.on('load', () => {
        console.log('Карта загружена');
        addMarkers();
        renderPlacesList();
        renderSelect();
        getUserLocation();
    });
}

// ============================================
// ДОБАВЛЕНИЕ МАРКЕРОВ
// ============================================
function addMarkers() {
    places.forEach(place => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = '📍';

        const marker = new maplibregl.Marker(el)
            .setLngLat([place.lng, place.lat])
            .addTo(map);

        marker.getElement().addEventListener('click', () => {
            showPopup(place);
            showPreview(place);
            flyToPlace(place);
        });

        markers.push({ marker, place });
    });
}

// ============================================
// ОТОБРАЖЕНИЕ СПИСКА МЕСТ
// ============================================
function renderPlacesList() {
    const container = document.getElementById('placesList');
    container.innerHTML = '';

    places.forEach(place => {
        const li = document.createElement('li');
        li.className = 'place-card';
        li.innerHTML = `
            <img class="place-img" src="${place.image}" alt="${place.name}" onerror="this.src='https://via.placeholder.com/60x60?text=🏔️'">
            <div class="place-info">
                <div class="place-name">${place.name}</div>
                <div class="place-desc">${place.description.substring(0, 65)}...</div>
            </div>
        `;
        li.addEventListener('click', () => {
            showPopup(place);
            showPreview(place);
            flyToPlace(place);
        });
        container.appendChild(li);
    });
}

// ============================================
// ЗАПОЛНЕНИЕ ВЫПАДАЮЩЕГО СПИСКА
// ============================================
function renderSelect() {
    const select = document.getElementById('destinationSelect');
    select.innerHTML = '<option value="">Выберите место...</option>';
    places.forEach(place => {
        const option = document.createElement('option');
        option.value = place.id;
        option.textContent = place.name;
        select.appendChild(option);
    });
}

// ============================================
// ПОПАП НА КАРТЕ
// ============================================
function showPopup(place) {
    const html = `
        <div style="max-width: 260px;">
            <img src="${place.image}" style="width:100%; height:140px; object-fit:cover; border-radius:12px 12px 0 0;" onerror="this.src='https://via.placeholder.com/260x140?text=🏔️'">
            <div style="padding:12px;">
                <h4 style="margin:0 0 6px 0; color:#2d6a4f;">${place.name}</h4>
                <p style="font-size:12px; margin:0 0 8px 0;">${place.description.substring(0, 100)}...</p>
                <div style="font-size:11px; color:#666;">📅 ${place.bestSeason}</div>
                <div style="font-size:11px; color:#666;">💡 ${place.travelTips}</div>
            </div>
        </div>
    `;
    new maplibregl.Popup({ maxWidth: '280px' })
        .setLngLat([place.lng, place.lat])
        .setHTML(html)
        .addTo(map);
}

// ============================================
// ПРЕВЬЮ В БОКОВОЙ ПАНЕЛИ
// ============================================
function showPreview(place) {
    const card = document.getElementById('previewCard');
    const img = document.getElementById('previewImg');
    const name = document.getElementById('previewName');
    const desc = document.getElementById('previewDesc');
    const meta = document.getElementById('previewMeta');

    img.src = place.image;
    name.textContent = place.name;
    desc.textContent = place.description;
    meta.innerHTML = `📅 ${place.bestSeason} &nbsp;|&nbsp; 💡 ${place.travelTips}`;

    card.style.display = 'block';

    const btn = document.getElementById('previewRouteBtn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => buildRoute(place));

    document.getElementById('destinationSelect').value = place.id;
}

// ============================================
// ПЕРЕЛЕТ К МЕСТУ
// ============================================
function flyToPlace(place) {
    map.flyTo({
        center: [place.lng, place.lat],
        zoom: 10,
        duration: 1200
    });
}

// ============================================
// ОПРЕДЕЛЕНИЕ МЕСТОПОЛОЖЕНИЯ
// ============================================
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const el = document.createElement('div');
                el.innerHTML = '📍';
                el.style.fontSize = '28px';
                el.style.background = 'white';
                el.style.borderRadius = '50%';
                el.style.padding = '6px';
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                new maplibregl.Marker(el)
                    .setLngLat([userLocation.lng, userLocation.lat])
                    .setPopup(new maplibregl.Popup().setHTML('<strong>Вы здесь</strong>'))
                    .addTo(map);
            },
            () => {
                userLocation = { lat: 49.95, lng: 82.62 };
            }
        );
    } else {
        userLocation = { lat: 49.95, lng: 82.62 };
    }
}

// ============================================
// ПОСТРОЕНИЕ МАРШРУТА
// ============================================
async function buildRoute(place) {
    if (!userLocation) {
        alert('Определяется ваше местоположение...');
        return;
    }

    const start = `${userLocation.lng},${userLocation.lat}`;
    const end = `${place.lng},${place.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

    const resultDiv = document.getElementById('routeResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p>⏳ Загрузка маршрута...</p>';

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 'Ok' || !data.routes?.length) throw new Error();

        const route = data.routes[0];
        const km = (route.distance / 1000).toFixed(1);
        const minutes = Math.round(route.duration / 60);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        resultDiv.innerHTML = `
            <p>🚗 <strong>${place.name}</strong></p>
            <p>📏 Расстояние: ${km} км</p>
            <p>⏱️ Время: ${hours} ч ${mins} мин</p>
            <hr style="margin:8px 0;">
            <p>💡 ${place.travelTips}</p>
        `;

        drawRoute(route.geometry);
        fitBounds(route.geometry.coordinates);

    } catch (error) {
        resultDiv.innerHTML = '<p>❌ Не удалось построить маршрут</p><p>Проверьте интернет</p>';
    }
}

// ============================================
// ОТРИСОВКА МАРШРУТА
// ============================================
function drawRoute(geometry) {
    if (currentRouteLayer) {
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getSource('route')) map.removeSource('route');
    }

    map.addSource('route', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: geometry
        }
    });

    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
            'line-color': '#2d6a4f',
            'line-width': 5
        }
    });

    currentRouteLayer = 'route';
}

// ============================================
// МАСШТАБИРОВАНИЕ ПОД МАРШРУТ
// ============================================
function fitBounds(coordinates) {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    coordinates.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
    });

    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 50, duration: 1000 });
}

// ============================================
// ЗАПУСК
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMap();

    document.getElementById('buildRouteBtn').addEventListener('click', () => {
        const id = parseInt(document.getElementById('destinationSelect').value);
        if (!id) {
            alert('Выберите место');
            return;
        }
        const place = places.find(p => p.id === id);
        if (place) buildRoute(place);
    });
});

console.log('✅ Приложение запущено');