/**
 * Dune Tourist Camp — Main Entry Point
 */

import { Cart } from './modules/Cart.js';
import { ActivityManager } from './modules/ActivityManager.js';

// ── Глобал Cart instance ──────────────────────────────────────────────────────
const cart = new Cart();

// ── Lightbox (Зураг томруулах) функц ──────────────────────────────────────────
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.room-gallery img');

    if (!lightbox || !lightboxImg) return;

    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden'; // Scroll зогсоох
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('open');
        document.body.style.overflow = ''; // Scroll буцааж нээх
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    
    // Дэвсгэр дээр дарахад хаах
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // ESC дарахад хаах
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

// ── Home хуудас: JSON татаж, DOM-д харуулна ──────────────────────────────────
async function initHome() {
    const container = document.getElementById('activities-container');
    if (!container) return;

    try {
        const manager = new ActivityManager('activities.json');
        await manager.load();
        const featured = manager.getFeatured();
        manager.render(container, featured);
    } catch (err) {
        container.innerHTML = `<p class="error">Failed to load experiences: ${err.message}</p>`;
        console.error(err);
    }

    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const checkin = document.getElementById('check-in-date').value;
            const checkout = document.getElementById('check-out-date').value;
            if (checkin && checkout) {
                window.location.href = `room.html?checkin=${checkin}&checkout=${checkout}`;
            } else {
                alert('Please select check-in and check-out dates.');
            }
        });
    }
}

// ── Room хуудас ───────────────────────────────────────────────────────────────
function initRoomPage() {
    const summaryHeader = document.getElementById('booking-summary-header');
    if (!summaryHeader) return;

    const urlParams = new URLSearchParams(window.location.search);
    const checkin = urlParams.get('checkin');
    const checkout = urlParams.get('checkout');

    if (checkin && checkout) {
        const d1 = new Date(checkin);
        const d2 = new Date(checkout);
        const nights = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));

        if (nights > 0) {
            summaryHeader.innerHTML = `
                <span><strong>Check-in:</strong> ${checkin}</span>
                <span><strong>Check-out:</strong> ${checkout}</span>
                <span><strong>Nights:</strong> ${nights}</span>
                <span><strong>Guests:</strong> 1</span>
            `;
            document.querySelectorAll('.room-card').forEach(card => {
                const perNight = parseInt(card.querySelector('.add-to-cart-btn-global').dataset.price);
                card.querySelector('.total-price').textContent = `$${(perNight * nights).toLocaleString()}`;
                card.querySelector('.stay-duration').textContent = `for ${nights} nights`;
                card.querySelector('.add-to-cart-btn-global').dataset.finalPrice = perNight * nights;
                card.querySelector('.add-to-cart-btn-global').dataset.nights = nights;
                card.querySelector('.add-to-cart-btn-global').dataset.dates = `${checkin} to ${checkout}`;
            });
        }
    }
}

// ── Restaurant хуудас ─────────────────────────────────────────────────────────
function initRestaurantFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    if (filter) {
        const radioBtn = document.getElementById(filter);
        if (radioBtn) {
            radioBtn.checked = true;
            const menuSection = document.getElementById('menu');
            if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ── DOMContentLoaded: бүгдийг эхлүүлнэ ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initHome();
    initRoomPage();
    initRestaurantFilter();
    initLightbox();

    // Horse Ride захиалах товч
    const bookRideBtn = document.getElementById('book-ride-btn');
    if (bookRideBtn) {
        bookRideBtn.addEventListener('click', () => {
            const activeCard = document.querySelector('.exp-card.active');
            const peopleCount = parseInt(document.getElementById('people-count').value);
            cart.addItem({
                id: parseInt(activeCard.dataset.id),
                title: activeCard.dataset.title,
                price: parseInt(activeCard.dataset.price),
                image: 'img/Horse Ride.jpg',
                quantity: peopleCount
            });
        });
    }

    // Overlay болон Room Detail дахь "Add to Cart" / "Book Now" товчнууд
    document.querySelectorAll('.add-to-cart-btn-overlay, .room-book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            cart.addItem({
                id: parseInt(btn.dataset.id),
                title: btn.dataset.title,
                price: parseInt(btn.dataset.price),
                image: btn.dataset.image,
                quantity: 1
            });
        });
    });

    // Өрөөний "Book" товчнууд
    document.querySelectorAll('.add-to-cart-btn-global').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const roomCard = btn.closest('.room-card');
            const adults = parseInt(roomCard.querySelectorAll('.count')[0].textContent);
            const children = parseInt(roomCard.querySelectorAll('.count')[1].textContent);
            const finalPrice = btn.dataset.finalPrice || btn.dataset.price;
            cart.addItem({
                id: parseInt(btn.dataset.id) + (new Date().getTime() % 1000),
                title: `${btn.dataset.title} (${adults + children} guests)`,
                price: parseInt(finalPrice),
                image: btn.dataset.image,
                quantity: 1
            });
        });
    });
});
