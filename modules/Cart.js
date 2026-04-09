/**
 * Cart Module
 * Manages shopping cart state, rendering, and events.
 */

export class Cart {
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
        this.clearCartBtn = document.getElementById('clear-cart');
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
        if (this.clearCartBtn) this.clearCartBtn.addEventListener('click', () => this.clearCart());

        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    alert('Your cart is empty');
                }
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

    clearCart() {
        if (this.items.length === 0) return;
        if (confirm('Are you sure you want to clear your cart?')) {
            this.items = [];
            this.save();
        }
    }

    render() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (this.cartBadge) this.cartBadge.textContent = totalItems;

        if (this.cartItemsContainer) {
            if (this.items.length === 0) {
                this.cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <div class="empty-icon">👜</div>
                        <p>Your cart is empty</p>
                        <span>Add items to get started</span>
                    </div>`;
                if (this.cartTotalElement) this.cartTotalElement.textContent = '$0';
                if (this.clearCartBtn) this.clearCartBtn.style.display = 'none';
            } else {
                if (this.clearCartBtn) this.clearCartBtn.style.display = 'block';
                this.cartItemsContainer.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <p>$${item.price.toLocaleString()} x ${item.quantity}</p>
                        </div>
                        <button class="remove-item" data-id="${item.id}" title="Remove item">🗑️</button>
                    </div>
                `).join('');
                if (this.cartTotalElement) this.cartTotalElement.textContent = `$${total.toLocaleString()}`;

                this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', () => this.removeItem(parseInt(btn.dataset.id)));
                });
            }
        }

        if (this.checkoutItemsList) {
            this.checkoutItemsList.innerHTML = this.items.map(item => `
                <div class="summary-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="summary-item-info">
                        <h4>${item.title}</h4>
                        <p>Qty: ${item.quantity}</p>
                        <span class="summary-item-price">$${item.price.toLocaleString()}</span>
                    </div>
                </div>
            `).join('');

            if (this.summarySubtotal) this.summarySubtotal.textContent = `$${total.toLocaleString()}`;
            if (this.summaryTotal) this.summaryTotal.textContent = `$${total.toLocaleString()}`;
        }
    }
}
