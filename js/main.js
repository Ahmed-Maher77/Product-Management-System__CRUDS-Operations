const title = document.getElementById('title');
const price = document.getElementById('price');
const taxes = document.getElementById('taxes');
const ads = document.getElementById('ads');
const discount = document.getElementById('discount');
const total = document.querySelector('.total b');
const count = document.getElementById('count');
const category = document.getElementById('category');
const createBtn = document.querySelector('.create button');
const tbody = document.querySelector('table tbody');
const removeAllBtn = document.querySelector('table + button');
const search = document.getElementById('search');
const serachedProduct = document.getElementById('serached-product');
const changeModeBtn = document.querySelector('header button');

// Initialize tooltips (Bootstrap)
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// Variables
let titleValue, priceValue, taxesValue, adsValue, discountValue, countValue, categoryValue;

// Dummy data and products initialization
const dummyData = [{ title: 'Dummy Product', price: 500, taxes: 20, ads: 0, discount: 0, category: 'Test' }];
let products = JSON.parse(localStorage.getItem('products')) || dummyData;

// Event Listeners
createBtn.addEventListener('click', createProduct);
search.oninput = searchProducts;
serachedProduct.onchange = searchProducts;
changeModeBtn.onclick = toggleDarkMode;
document.addEventListener('DOMContentLoaded', copyrightsYear);

// Create or edit a product
function createProduct() {
    // Collect input values
    titleValue = title.value.trim();
    priceValue = price.value.trim();
    taxesValue = taxes.value.trim();
    adsValue = ads.value.trim();
    discountValue = discount.value.trim();
    countValue = count.value.trim();
    categoryValue = category.value.trim();
    // Reactivate the count input
    count.removeAttribute('disabled');
    if (titleValue && priceValue && categoryValue) {    // how to ignore count here
        // Create new product or edit existing one
        createBtn.innerText === 'Create' ? createNewProduct() : editExistingProduct();
        // Remove modal attributes if valid
        createBtn.removeAttribute('data-bs-toggle');
        createBtn.removeAttribute('data-bs-target');
    } else {
        showModal();
        resetModal()
    }
}

// Show modal if inputs are invalid
function showModal() {
    createBtn.setAttribute('data-bs-toggle', "modal");
    createBtn.setAttribute('data-bs-target', "#staticBackdrop");
    createBtn.click();
}

// Remove modal attributes
function resetModal() {
    createBtn.removeAttribute('data-bs-toggle');
    createBtn.removeAttribute('data-bs-target');
}

// Create new products
function createNewProduct() {
    if (!countValue) {
        showModal();
    } else {
        // Enforce count boundaries
        countValue = Math.max(1, Math.min(countValue, 100));
        for (let i = 0; i < countValue; i++) {
            const product = {
                id: null, // Will be set in showProducts function
                title: titleValue,
                price: priceValue,
                taxes: taxesValue,
                ads: adsValue,
                discount: discountValue,
                category: categoryValue
            };
            products.push(product);
            localStorage.setItem('products', JSON.stringify(products));
        }
        showProducts(products);
        clearInputs();
    }
}

// Edit an existing product
function editExistingProduct() {
    console.log('editExistingProduct');
    
    products.forEach(product => {
        if (product.id == currentEditedId) {
            // Update product details
            product.title = titleValue;
            product.price = priceValue;
            product.taxes = taxesValue;
            product.ads = adsValue;
            product.discount = discountValue;
            product.category = categoryValue;
        }
    });
    showProducts(products);
    clearInputs();
    resetCreateBtn();
}

// Calculate and display total price
const inputs = document.querySelectorAll('.create [type="number"]');
inputs.forEach(input => input.oninput = calcTotal);
function calcTotal() {
    const calculatedTotal = price.value - taxes.value - ads.value - discount.value;
    total.innerText = calculatedTotal;
    total.parentElement.classList.toggle('active-field', calculatedTotal > 0);
}


// (total.innerText > 0 && total.innerText.length > 0)

// Display products in the table
function showProducts(data) {
    // Clear existing content
    tbody.innerHTML = ''; 
    data.forEach((product, index) => {
        // Set product ID
        product.id = index + 1;
        tbody.innerHTML += `
            <tr class="align-middle">
                <td>${product.id}</td>      
                <td>${product.title}</td>
                <td>${product.price}</td>
                <td>${product.taxes}</td>
                <td>${product.category}</td>
                <td>${product.price - product.taxes - product.ads - product.discount}</td>
                <td>
                    <button class="btn btn-success rounded-pill px-4" onClick="updateProduct(this)">Update</button>
                </td>
                <td>
                    <button class="btn btn-danger rounded-pill px-4" onClick="deleteProduct(this)">Delete</button>
                </td>
            </tr>
        `;
    });
    // Update the removeAll button text
    removeAllBtn.innerText = `Remove All Products [${data.length}]`;
}
// Display products initially
showProducts(products);

// Clear all input fields
function clearInputs() {
    title.value = '';
    price.value = '';
    taxes.value = '';
    ads.value = '';
    discount.value = '';
    calcTotal();
    total.innerText = '';
    count.value = '';
    category.value = '';
}

// Update create button for editing
function changeCreateBtn() {
    createBtn.innerText = 'Update';
    createBtn.classList.add('update-btn');
}

// Reset create button to initial state
function resetCreateBtn() {
    createBtn.innerText = 'Create';
    createBtn.classList.remove('update-btn');
}

// Update product details
let currentEditedId;
function updateProduct(ele) {
    const productId = ele.parentElement.parentElement.querySelector('td').innerText;
    products.forEach(product => {
        if (product.id == productId) {
            // Populate form with product data
            title.value = product.title;
            price.value = product.price;
            taxes.value = product.taxes;
            ads.value = product.ads;
            discount.value = product.discount;
            count.setAttribute('disabled', 'true');
            category.value = product.category;
            currentEditedId = product.id;
            changeCreateBtn();
        }
    });
    window.scrollTo({ top: 130, behavior: "smooth" });
    ele.parentElement.parentElement.classList.add('being-edited');
    calcTotal();
}

// Delete a product
function deleteProduct(ele) {
    const productId = ele.parentElement.parentElement.querySelector('td').innerText;
    products = products.filter(product => product.id != productId);
    localStorage.setItem('products', JSON.stringify(products));
    showProducts(products);
}

// Remove all products
function removeAll() {
    products = [];
    localStorage.setItem('products', JSON.stringify(products));
    showProducts(products);
}

// Search products
function searchProducts() {
    const searchBy = serachedProduct.value;
    const searchFor = search.value.trim();
    const filteredProducts = products.filter(ele => ele[searchBy].includes(searchFor));
    showProducts(filteredProducts);
    removeAllBtn.disabled = searchFor.length > 0;
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let lightIcon = changeModeBtn.querySelector('svg');
    if (lightIcon.classList.contains('fa-sun')) {
        lightIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        lightIcon.classList.replace('fa-moon', 'fa-sun');
    }
}

// Set copyright year
function copyrightsYear() {
    const copyrightSpan = document.getElementById('copyright-year');
    copyrightSpan.innerHTML = new Date().getFullYear();
}