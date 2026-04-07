/**
 * Dune Tourist Camp - Core Logic
 */

class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('dune_cart')) || [];
        this.initElements();
        this.initEvents();
        this.render();
    }

    initElements() {
        this.cartDrawer = document.getElementById('cart-drawer');
        this.cartOverlay = document.getElementById('cart-overlay');
        this.cartToggle = document.getElementById('cart-toggle');
        this.closeCartBtn = document.getElementById('close-cart');
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartTotalElement = document.getElementById('cart-total');
        this.cartBadge = document.querySelector('.cart-badge');

        // Checkout page elements
        this.checkoutItemsList = document.getElementById('checkout-items-list');
        this.summarySubtotal = document.getElementById('summary-subtotal');
        this.summaryTotal = document.getElementById('summary-total');
    }

    initEvents() {
        if (this.cartToggle) this.cartToggle.addEventListener('click', (e) => { e.preventDefault(); this.openCart(); });
        if (this.closeCartBtn) this.closeCartBtn.addEventListener('click', () => this.closeCart());
        if (this.cartOverlay) this.cartOverlay.addEventListener('click', () => this.closeCart());

        // Checkout Button in Drawer
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = 'checkout.html';
            });
        }
    }

    save() {
        localStorage.setItem('dune_cart', JSON.stringify(this.items));
        this.render();
    }

    openCart() {
        if (this.cartDrawer) {
            this.cartDrawer.classList.add('open');
            this.cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        if (this.cartDrawer) {
            this.cartDrawer.classList.remove('open');
            this.cartOverlay.classList.remove('open');
            document.body.style.overflow = 'auto';
        }
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.items.push({ ...product, quantity: product.quantity || 1 });
        }
        this.save();
        this.openCart();
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    }

    render() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (this.cartBadge) this.cartBadge.textContent = totalItems;

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update Drawer
        if (this.cartItemsContainer) {
            if (this.items.length === 0) {
                this.cartItemsContainer.innerHTML = `<div class="empty-cart"><p>Your cart is empty</p></div>`;
                this.cartTotalElement.textContent = '₮0';
            } else {
                this.cartItemsContainer.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <p>₮${item.price.toLocaleString()} x ${item.quantity}</p>
                            <button class="remove-item" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                `).join('');
                this.cartTotalElement.textContent = `₮${total.toLocaleString()}`;
                
                this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', () => this.removeItem(parseInt(btn.dataset.id)));
                });
            }
        }

        // Update Checkout Page if exists
        if (this.checkoutItemsList) {
            this.checkoutItemsList.innerHTML = this.items.map(item => `
                <div class="summary-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="summary-item-info">
                        <h4>${item.title}</h4>
                        <p>Qty: ${item.quantity}</p>
                        <span class="summary-item-price">₮${item.price.toLocaleString()}</span>
                    </div>
                </div>
            `).join('');

            this.summarySubtotal.textContent = `₮${total.toLocaleString()}`;
            this.summaryTotal.textContent = `₮${total.toLocaleString()}`;
        }
    }
}

const cart = new Cart();

// Home Page Loading
async function initHome() {
    const container = document.getElementById('activities-container');
    if (!container) return;
    try {
        const res = await fetch('activities.json');
        const data = await res.json();
        container.innerHTML = data.map(item => `
            <article class="activity-card">
                <img src="${item.image}" alt="${item.title}" />
                <div class="activity-info">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <a href="${item.link}" class="btn-gold">Discover more ></a>
                </div>
            </article>
        `).join('');
    } catch (e) { console.log(e); }

    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const checkin = document.getElementById('check-in-date').value;
            const checkout = document.getElementById('check-out-date').value;
            if (checkin && checkout) {
                window.location.href = `room.html?checkin=${checkin}&checkout=${checkout}`;
            } else {
                alert('Please select dates');
            }
        });
    }
}

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
                const perNightPrice = parseInt(card.querySelector('.add-to-cart-btn-global').dataset.price);
                card.querySelector('.total-price').textContent = `₮${(perNightPrice * nights).toLocaleString()}`;
                card.querySelector('.stay-duration').textContent = `for ${nights} nights`;
                card.querySelector('.add-to-cart-btn-global').dataset.finalPrice = perNightPrice * nights;
                card.querySelector('.add-to-cart-btn-global').dataset.nights = nights;
                card.querySelector('.add-to-cart-btn-global').dataset.dates = `${checkin} to ${checkout}`;
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initHome();
    initRoomPage();

    const bookRideBtn = document.getElementById('book-ride-btn');
    if (bookRideBtn) {
        bookRideBtn.addEventListener('click', () => {
            const activeCard = document.querySelector('.exp-card.active');
            const peopleCount = parseInt(document.getElementById('people-count').value);
            cart.addItem({
                id: parseInt(activeCard.dataset.id),
                title: activeCard.dataset.title,
                price: parseInt(activeCard.dataset.price),
                image: "img/Horse Ride.jpg",
                quantity: peopleCount
            });
        });
    }

    document.querySelectorAll('.add-to-cart-btn-overlay').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            cart.addItem({ id: parseInt(btn.dataset.id), title: btn.dataset.title, price: parseInt(btn.dataset.price), image: btn.dataset.image, quantity: 1 });
        });
    });

    document.querySelectorAll('.add-to-cart-btn-global').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const roomCard = btn.closest('.room-card');
            const adults = parseInt(roomCard.querySelectorAll('.count')[0].textContent);
            const children = parseInt(roomCard.querySelectorAll('.count')[1].textContent);
            const nights = btn.dataset.nights || 1;
            const dates = btn.dataset.dates || "";
            const finalPrice = btn.dataset.finalPrice || btn.dataset.price;
            cart.addItem({
                id: parseInt(btn.dataset.id) + (new Date().getTime() % 1000),
                title: `${btn.dataset.title} (${adults+children} guests)`,
                price: parseInt(finalPrice),
                image: btn.dataset.image,
                quantity: 1
            });
        });
    });
});
