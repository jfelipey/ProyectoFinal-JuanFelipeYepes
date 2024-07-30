let productos = [];
let carritoComp = [];

const menuElement = document.getElementById("menu");
document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    async function fetchData() {
        try {
            const response = await fetch('./products.json');
            productos = await response.json();
            displayProducts(productos);
            carritoLocalStorage();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function displayProducts(products) {
        products.forEach(product => {
    
            const nuevoElemento = document.createElement('div');
            nuevoElemento.id = 'product' + product.id;
            const imagenElemento = document.createElement('img');
            imagenElemento.src = product.imagen;
            imagenElemento.alt = product.nombre;
            nuevoElemento.appendChild(imagenElemento);
            const textoElemento = document.createElement('p');
            textoElemento.textContent = product.nombre;
            nuevoElemento.appendChild(textoElemento);
            const precioElemento = document.createElement('strong');
            precioElemento.textContent = " " + product.precioUnitario + " " + product.moneda + "   ";
            nuevoElemento.appendChild(precioElemento);
            const botonAgreProd = document.createElement('button');
            botonAgreProd.textContent = 'Comprar';
            botonAgreProd.type = 'button';
            botonAgreProd.id = 'product-button-' + product.id;
            nuevoElemento.appendChild(botonAgreProd);
            nuevoElemento.productAdded = false;
            let formElement = document.createElement('form');
            formElement.id = 'form' + product.id;
            const quantityLabel = document.createElement('label');
            quantityLabel.textContent = 'Cantidad';
            formElement.appendChild(quantityLabel);
            let quantityInput = document.createElement('input');
            quantityInput.setAttribute("type", "number");
            quantityInput.setAttribute("value", 0);
            quantityInput.setAttribute("min", 0);
            quantityInput.id = product.id;

            botonAgreProd.addEventListener('click', () => {
                if (!nuevoElemento.productAdded) {
                    formElement.appendChild(quantityInput);
                    nuevoElemento.appendChild(formElement);
                    nuevoElemento.productAdded = true;
                    const productoAnadir = {
                        id: product.id,
                        quantity: +quantityInput.value
                    };
                    actualizarCarrito(productoAnadir);
                }
            });
        
            quantityInput.onchange = () => {
                const productoAnadir = {
                    id: product.id,
                    quantity: +quantityInput.value
                };
                actualizarCarrito(productoAnadir);
            };
            
            const carritoCompLocalStorage = localStorage.getItem('carritoComp');
            if (carritoCompLocalStorage) {
                const carritoJson = JSON.parse(carritoCompLocalStorage);
                const productoCarrito = carritoJson.find(itemCarrito =>  'product' + itemCarrito.id === nuevoElemento.id);
                    
                if (productoCarrito && productoCarrito.quantity !== 0) {
                    console.log(productoCarrito);
                    if (!nuevoElemento.productAdded) {
                        quantityInput.setAttribute('value', productoCarrito.quantity)
                        formElement.appendChild(quantityInput);
                        nuevoElemento.appendChild(formElement);
                        nuevoElemento.productAdded = true;
                    }
                    nuevoElemento.productAdded = true;
                    renderizarCarrito(productoCarrito);
                }
            }
            
            menuElement.appendChild(nuevoElemento);
        });
    }
});

const carritoElement = document.getElementById("carrito");
const confirmButton = document.getElementById("pagar");
confirmButton.disabled = true;
const payButton = document.createElement('button');
const checkoutElement = document.getElementById('checkout');

confirmButton.addEventListener('click', () => {
    const carrito = localStorage.getItem('carritoComp');
    let carritoJson = JSON.parse(carrito);
    let sumaTotal = 0;
    carritoJson.forEach(itemCarrito => {
        const producto = productos.find(item => item.id === itemCarrito.id);
        sumaTotal += producto.precioUnitario * itemCarrito.quantity;
    });
    const nuevoElemento = document.createElement('div');
    const checkout = document.createElement('strong');
    checkout.textContent = "Valor total a pagar: " + sumaTotal + " USD";
    checkout.id = 'checkout-text';
    payButton.textContent = 'Pagar';
    const oldCheckout = document.getElementById(checkout.id);
    if (!oldCheckout) {
        nuevoElemento.appendChild(checkout);
    } else {
        oldCheckout.replaceWith(checkout);
    }
    nuevoElemento.appendChild(payButton);
    checkoutElement.appendChild(nuevoElemento);
});

payButton.addEventListener('click', () => {
    Swal.fire({
        title: '¡Compra realizada!',
        text: 'Tu pedido llegará pronto.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.reload();
        }
    });
});

function actualizarCarrito(productoAnadido) {
    const carrito = localStorage.getItem('carritoComp');
    let carritoJson = JSON.parse(carrito);
    const item = carritoJson.find(p => p.id === productoAnadido.id);
    if (!item) {
        carritoJson.push(productoAnadido);
    } else {
        item.quantity = productoAnadido.quantity;
        const itemIndex = carritoJson.findIndex(p => p.id === item.id);
        carritoJson[itemIndex] = item;
    }
    localStorage.setItem('carritoComp', JSON.stringify(carritoJson));
    confirmButton.disabled = true;
    carritoJson.forEach(p => {
        if (p.quantity !== 0) {
            confirmButton.disabled = false;
        }
    });
    
    renderizarCarrito(productoAnadido);
}

function renderizarCarrito(productoAnadido) {
    const item = productos.find(p => p.id === productoAnadido.id);
    const nuevoElemento = document.createElement('div');
    nuevoElemento.id = 'producto-carrito-' + item.id;
    const textoElemento = document.createElement('p');
    textoElemento.textContent = "Cantidad de " + item.plural + " comprados: ";
    nuevoElemento.appendChild(textoElemento);
    const productQuantity = document.createElement('strong');
    productQuantity.textContent = productoAnadido.quantity + " / " + "Precio total del producto: " + item.precioUnitario * productoAnadido.quantity + " USD";
    nuevoElemento.appendChild(productQuantity);
    const oldElement = document.getElementById(nuevoElemento.id);
    if (!oldElement) {
        carritoElement.appendChild(nuevoElemento);
    } else {
        carritoElement.replaceChild(nuevoElemento, oldElement);
    }
}

function carritoLocalStorage() {
    const carritoCompLocalStorage = localStorage.getItem('carritoComp');
    const carritoCompLocalStorageJson = JSON.parse(carritoCompLocalStorage);
    if (!carritoCompLocalStorage) {
        return localStorage.setItem('carritoComp', '[]');
    } else {
        carritoCompLocalStorageJson.forEach(item => {
            if (item.quantity !== 0) {
                confirmButton.disabled = false;
            }
        });
        return carritoCompLocalStorage;
    }
}