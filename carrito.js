// Refactorización a clase ES6 para mejor organización
class Carrito {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('natureCBDCart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
        this.checkCartItems();
    }

    updateCartCount() {
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        });
        localStorage.setItem('natureCBDCart', JSON.stringify(this.cart));
    }

    setupEventListeners() {
        // Delegación de eventos para mejor performance
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-comprar')) {
                this.addToCart(e.target.closest('.btn-comprar'));
            }
            
            if (e.target.closest('.btn-filtro')) {
                this.filterProducts(e.target.closest('.btn-filtro'));
            }
        });

        const sortSelect = document.getElementById('ordenar');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.sortProducts());
        }
    }

    addToCart(button) {
        const productCard = button.closest('.producto-card');
        const productId = productCard.dataset.id || this.generateId();
        
        const product = {
            id: productId,
            name: productCard.querySelector('h3').textContent,
            price: this.parsePrice(productCard.querySelector('.precio').textContent),
            image: productCard.querySelector('.producto-img').src,
            category: productCard.dataset.categoria,
            quantity: 1
        };
        
        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(product);
        }
        
        this.updateCartCount();
        this.showFeedback(button, '¡Añadido!', 'var(--success-color)');
    }

    filterProducts(button) {
        const category = button.dataset.categoria;
        
        document.querySelectorAll('.btn-filtro').forEach(btn => 
            btn.classList.remove('active'));
        button.classList.add('active');
        
        document.querySelectorAll('.producto-card').forEach(card => {
            card.style.display = category === 'todos' || card.dataset.categoria === category ? 
                'block' : 'none';
        });
    }

    sortProducts() {
        const value = document.getElementById('ordenar').value;
        const container = document.querySelector('.productos-grid');
        const products = Array.from(document.querySelectorAll('.producto-card'));
        
        products.sort((a, b) => {
            if (value === 'precio-asc') {
                return this.parsePrice(a.querySelector('.precio').textContent) - 
                       this.parsePrice(b.querySelector('.precio').textContent);
            } else if (value === 'precio-desc') {
                return this.parsePrice(b.querySelector('.precio').textContent) - 
                       this.parsePrice(a.querySelector('.precio').textContent);
            } else if (value === 'valoracion') {
                return this.parseRating(b) - this.parseRating(a);
            }
            return 0;
        });
        
        products.forEach(product => container.appendChild(product));
    }

    // Helper methods
    parsePrice(priceText) {
        return parseFloat(priceText.replace('€', '').trim().replace('.', '').replace(',', '.'));
    }

    parseRating(card) {
        const ratingText = card.querySelector('.rating span').textContent;
        return parseInt(ratingText.replace(/[()]/g, ''));
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    showFeedback(element, message, bgColor) {
        const originalHTML = element.innerHTML;
        const originalBg = element.style.backgroundColor;
        
        element.innerHTML = `${message} <i class="fas fa-check"></i>`;
        element.style.backgroundColor = bgColor;
        
        setTimeout(() => {
            element.innerHTML = originalHTML;
            element.style.backgroundColor = originalBg;
        }, 2000);
    }

    checkCartItems() {
        // Verificar si productos en carrito aún existen en la página
        this.cart = this.cart.filter(cartItem => 
            document.querySelector(`.producto-card[data-id="${cartItem.id}"]`));
        this.updateCartCount();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const carrito = new Carrito();
    
    // Scroll suave mejorado
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Actualizar URL sin recargar
                if (history.pushState) {
                    history.pushState(null, null, this.getAttribute('href'));
                }
            }
        });
    });
    
    // Botón "volver arriba"
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('active', window.pageYOffset > 300);
    });
    
    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registrado:', reg.scope))
                .catch(err => console.log('Error SW:', err));
        });
    }
});