document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentUser = null;
    let cart = [];
    let products = [
        { id: 1, name: 'Laptop HP', price: 899.99, category: 'electronics', description: 'Laptop HP con 8GB RAM y 256GB SSD' },
        { id: 2, name: 'iPhone 13', price: 999.99, category: 'electronics', description: 'Smartphone Apple con 128GB de almacenamiento' },
        { id: 3, name: 'Samsung TV', price: 749.99, category: 'electronics', description: 'Televisor Samsung 55" 4K UHD' },
        { id: 4, name: 'Arroz', price: 2.99, category: 'food', description: 'Arroz blanco 5kg' },
        { id: 5, name: 'Frijoles', price: 1.99, category: 'food', description: 'Frijoles negros 1kg' },
        { id: 6, name: 'Aceite', price: 3.49, category: 'food', description: 'Aceite vegetal 1 litro' },
        { id: 7, name: 'Camiseta', price: 12.99, category: 'clothing', description: 'Camiseta de algodón unisex' },
        { id: 8, name: 'Jeans', price: 29.99, category: 'clothing', description: 'Pantalón jeans azul' },
        { id: 9, name: 'Zapatos', price: 49.99, category: 'clothing', description: 'Zapatos deportivos' }
    ];

    // Elementos del DOM
    const registrationForm = document.getElementById('registrationForm');
    const cedulaInput = document.getElementById('cedula');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const timeDisplay = document.getElementById('timeDisplay');
    const productGrid = document.getElementById('productGrid');
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userCedulaDisplay = document.getElementById('userCedulaDisplay');
    const receiptModal = document.getElementById('receiptModal');
    const closeModal = document.querySelector('.close-modal');
    const receiptUserName = document.getElementById('receiptUserName');
    const receiptUserCedula = document.getElementById('receiptUserCedula');
    const receiptRegisterTime = document.getElementById('receiptRegisterTime');
    const receiptItems = document.getElementById('receiptItems');
    const receiptTotalAmount = document.getElementById('receiptTotalAmount');
    const receiptDate = document.getElementById('receiptDate');
    const printReceiptBtn = document.getElementById('printReceiptBtn');
    const themeToggle = document.getElementById('themeToggle');

    // Inicialización
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
    renderProducts(products);
    setupEventListeners();

    // Funciones
    function updateTimeDisplay() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        timeDisplay.textContent = timeString;
    }

    function setupEventListeners() {
        // Formulario de registro
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            registerUser();
        });

        // Búsqueda y filtrado de productos
        productSearch.addEventListener('input', filterProducts);
        categoryFilter.addEventListener('change', filterProducts);

        // Botón de checkout
        checkoutBtn.addEventListener('click', openReceiptModal);

        // Modal
        closeModal.addEventListener('click', () => receiptModal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === receiptModal) {
                receiptModal.style.display = 'none';
            }
        });

        // Botón de imprimir recibo
        printReceiptBtn.addEventListener('click', printReceipt);

        // Toggle de tema
        themeToggle.addEventListener('change', toggleTheme);

        // Verificar tema guardado
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.checked = savedTheme === 'dark';
    }

    function toggleTheme() {
        if (themeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }

    function registerUser() {
        const cedula = cedulaInput.value.trim();
        const nombre = nombreInput.value.trim();
        const apellido = apellidoInput.value.trim();
        const horaRegistro = new Date();

        if (!cedula || !nombre || !apellido) {
            alert('Por favor complete todos los campos');
            return;
        }

        currentUser = {
            cedula,
            nombre,
            apellido,
            horaRegistro: horaRegistro.toLocaleString()
        };

        // Actualizar UI
        userNameDisplay.textContent = `Usuario: ${nombre} ${apellido}`;
        userCedulaDisplay.textContent = `Cédula: ${cedula}`;

        // Limpiar formulario
        registrationForm.reset();

        // Mostrar notificación
        showNotification('Usuario registrado con éxito', 'success');
    }

    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p class="empty-products">No se encontraron productos</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Agregar
                </button>
            `;
            productGrid.appendChild(productCard);
        });

        // Agregar event listeners a los botones
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                if (!currentUser) {
                    showNotification('Por favor registre un usuario primero', 'error');
                    return;
                }
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }

    function getCategoryName(categoryKey) {
        const categories = {
            electronics: 'Electrónico',
            food: 'Alimento',
            clothing: 'Ropa'
        };
        return categories[categoryKey] || categoryKey;
    }

    function filterProducts() {
        const searchTerm = productSearch.value.toLowerCase();
        const category = categoryFilter.value;

        let filteredProducts = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                                product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || product.category === category;
            return matchesSearch && matchesCategory;
        });

        renderProducts(filteredProducts);
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        updateCartDisplay();
        showNotification(`${product.name} agregado al carrito`, 'success');
    }

    function updateCartDisplay() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">No hay productos en el carrito</p>';
            totalAmount.textContent = '$0.00';
            checkoutBtn.disabled = true;
            return;
        }

        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    ${item.name} x${item.quantity}
                </div>
                <div class="cart-item-price">
                    $${itemTotal.toFixed(2)}
                </div>
                <span class="remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </span>
            `;
            cartItems.appendChild(cartItem);
        });

        // Agregar event listeners para eliminar items
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                removeFromCart(itemId);
            });
        });

        totalAmount.textContent = `$${total.toFixed(2)}`;
        checkoutBtn.disabled = false;
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartDisplay();
    }

    function openReceiptModal() {
        if (!currentUser || cart.length === 0) return;

        // Actualizar información del usuario
        receiptUserName.textContent = `${currentUser.nombre} ${currentUser.apellido}`;
        receiptUserCedula.textContent = currentUser.cedula;
        receiptRegisterTime.textContent = currentUser.horaRegistro;

        // Actualizar fecha del recibo
        const now = new Date();
        receiptDate.textContent = `Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

        // Actualizar items del recibo
        receiptItems.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const receiptItem = document.createElement('div');
            receiptItem.className = 'receipt-item';
            receiptItem.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            `;
            receiptItems.appendChild(receiptItem);
        });

        // Actualizar total
        receiptTotalAmount.textContent = `$${total.toFixed(2)}`;

        // Mostrar modal
        receiptModal.style.display = 'block';
    }

    function printReceipt() {
        const printContents = document.querySelector('.modal-content').innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        
        // Restaurar el estado después de imprimir
        openReceiptModal();
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Estilos dinámicos para notificaciones
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            background-color: var(--success-color);
        }
        
        .notification.error {
            background-color: var(--danger-color);
        }
    `;
    document.head.appendChild(notificationStyles);
});