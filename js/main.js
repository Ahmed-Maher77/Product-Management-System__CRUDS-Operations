/* ======================== SELECTED DOM ELEMENTS ======================== */
const title = document.getElementById("title");
const price = document.getElementById("price");
const taxes = document.getElementById("taxes");
const ads = document.getElementById("ads");
const discount = document.getElementById("discount");
const total = document.querySelector(".total b");
const count = document.getElementById("count");
const category = document.getElementById("category");
const createBtn = document.querySelector(".create button");
const tbody = document.querySelector("table tbody");
const removeAllBtn = document.querySelector(".removeAll");
const search = document.getElementById("search");
const serachedProduct = document.getElementById("serached-product");
const changeModeBtn = document.querySelector("header button");
const inputs = document.querySelectorAll('.create [type="number"]');

/* ======================== GLOBAL VARIABLES ======================== */
let titleValue,
	priceValue,
	taxesValue,
	adsValue,
	discountValue,
	countValue,
	categoryValue;

let currentEditedId;

// Dummy data and products initialization
const dummyData = [
	{
		title: "Dummy Product",
		price: 500,
		taxes: 20,
		ads: 0,
		discount: 0,
		category: "Test",
	},
];
let products = JSON.parse(localStorage.getItem("products")) || dummyData;

/* ======================== INITIALIZATION ======================== */
// Initialize tooltips (Bootstrap)
const tooltipTriggerList = document.querySelectorAll(
	'[data-bs-toggle="tooltip"]'
);
[...tooltipTriggerList].map(
	(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

// Initialize input animations when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeInputAnimations);

// Set copyright year on DOM load
document.addEventListener("DOMContentLoaded", copyrightsYear);

// Handle page load and loader
window.addEventListener("load", handlePageLoad);

// Display products initially
showProducts(products);

// Scroll to top after 1 second (after hiding loader)
setTimeout(() => {
	window.scrollTo({ top: 0, behavior: "smooth" });
}, 1000);

/* ======================== EVENT LISTENERS ======================== */
// Create product - handle both click and keyboard events
createBtn.addEventListener("click", function (e) {
	createProduct(e);
});

createBtn.addEventListener("keydown", function (e) {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		createProduct(e);
	}
});

// Form submission handling
const form = document.querySelector('form[role="form"]');
if (form) {
	form.addEventListener("submit", function (e) {
		e.preventDefault();
		createProduct(e);
	});
}

// Search products
search.oninput = searchProducts;
// Search products by category
serachedProduct.onchange = searchProducts;
// Toggle dark mode
changeModeBtn.onclick = toggleDarkMode;
// Calculate total on number input changes
inputs.forEach((input) => (input.oninput = calcTotal));

/* ======================== PAGE LOAD & ANIMATION FUNCTIONS ======================== */
function handlePageLoad() {
	const loader = document.getElementById("app-loader");
	if (loader) {
		const MIN_STAY_MS = 500;
		setTimeout(() => {
			loader.classList.add("hidden");
			setTimeout(() => {
				loader.remove();
				// Mark loader as complete and activate page animations
				document.body.classList.add("loader-complete");
				activatePageAnimations();
			}, 400);
		}, MIN_STAY_MS);
	} else {
		// If no loader, mark as complete immediately
		document.body.classList.add("loader-complete");
		activatePageAnimations();
	}
}

function activatePageAnimations() {
	// Add page-loaded class to show content
	document.body.classList.add("page-loaded");

	// Wait a moment for the content to appear, then start animations
	setTimeout(() => {
		// Get all elements
		const header = document.querySelector("header");
		const mainHeading = document.querySelector("h1");
		const description = document.querySelector("header p");
		const main = document.querySelector("main");
		const table = document.querySelector("#table");
		const footer = document.querySelector("footer");

		// Reset any existing animations first
		const elements = [
			header,
			mainHeading,
			description,
			changeModeBtn,
			main,
			table,
			footer,
		];
		elements.forEach((element) => {
			if (element) {
				element.style.animation = "none";
				element.style.transition = "none";
				element.offsetHeight; // Trigger reflow
			}
		});

		// Small delay to ensure reset takes effect
		setTimeout(() => {
			// Animate header first
			if (header) header.style.animation = "fadeInUp 1.2s ease-out";

			// Then main heading
			setTimeout(() => {
				if (mainHeading)
					mainHeading.style.animation = "scaleUp 1.5s ease-out";
			}, 200);

			// Then description
			setTimeout(() => {
				if (description)
					description.style.animation = "scaleUp 1.5s ease-out";
			}, 400);

			// Then change mode button
			setTimeout(() => {
				if (changeModeBtn)
					changeModeBtn.style.animation =
						"slideDownFromTop 1.2s ease-out";
			}, 600);

			// Then main content
			setTimeout(() => {
				if (main) main.style.animation = "fadeInScale 1s ease-out";
			}, 800);

			// Then table
			setTimeout(() => {
				if (table) table.style.animation = "slideInLeft 1s ease-out";
			}, 1000);

			// Finally footer
			setTimeout(() => {
				if (footer) footer.style.animation = "fadeInUp 1.2s ease-out";
			}, 1200);
		}, 50);
	}, 200);
}

/* ======================== INPUT ANIMATION FUNCTIONS ======================== */
function initializeInputAnimations() {
	// Wait for loader to complete
	const checkLoader = setInterval(() => {
		if (document.body.classList.contains("loader-complete")) {
			clearInterval(checkLoader);
		}
	}, 100);
}

/* ======================== PRODUCT CRUD FUNCTIONS ======================== */
// Create new product
function createProduct(e) {
	if (e) {
		e.preventDefault();
	}

	// Collect input values
	titleValue = title.value.trim();
	priceValue = price.value.trim();
	taxesValue = taxes.value.trim();
	adsValue = ads.value.trim();
	discountValue = discount.value.trim();
	countValue = count.value.trim();
	categoryValue = category.value;

	// Reactivate the count input
	count.removeAttribute("disabled");

	// Check if count is required for new products
	if (createBtn.innerText === "Create" && !countValue) {
		showModal();
		resetModal();
		return;
	}

	if (titleValue && priceValue && categoryValue) {
		// Create new product or edit existing one
		createBtn.innerText === "Create"
			? createNewProduct()
			: editExistingProduct();
		// Remove modal attributes if valid
		createBtn.removeAttribute("data-bs-toggle");
		createBtn.removeAttribute("data-bs-target");
	} else {
		showModal();
		resetModal();
	}
}

function createNewProduct() {
	if (!countValue) {
		showModal();
	} else {
		// Add loading state
		createBtn.classList.add("loading");
		createBtn.disabled = true;

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
				category: categoryValue,
			};
			products.push(product);
			localStorage.setItem("products", JSON.stringify(products));
		}

		// Simulate async operation for better UX
		setTimeout(() => {
			showProducts(products);
			clearInputs();

			// Remove loading state and add success animation
			createBtn.classList.remove("loading");
			createBtn.classList.add("success");
			createBtn.disabled = false;

			// Remove success class after animation
			setTimeout(() => {
				createBtn.classList.remove("success");
			}, 600);
		}, 500);
	}
}

// Edit existing product
function editExistingProduct() {
	products.forEach((product) => {
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

function updateProduct(ele) {
	const productId =
		ele.parentElement.parentElement.querySelector("td").innerText;
	products.forEach((product) => {
		if (product.id == productId) {
			// Populate form with product data
			title.value = product.title;
			price.value = product.price;
			taxes.value = product.taxes;
			ads.value = product.ads;
			discount.value = product.discount;
			count.setAttribute("disabled", "true");
			category.value = product.category;
			currentEditedId = product.id;
			changeCreateBtn();
		}
	});
	window.scrollTo({ top: 130, behavior: "smooth" });
	ele.parentElement.parentElement.classList.add("being-edited");
	calcTotal();
}

// Delete product
function deleteProduct(ele) {
	const productId =
		ele.parentElement.parentElement.querySelector("td").innerText;

	// Add error animation to the row being deleted
	const row = ele.parentElement.parentElement;
	row.classList.add("error");

	setTimeout(() => {
		products = products.filter((product) => product.id != productId);
		localStorage.setItem("products", JSON.stringify(products));
		showProducts(products);
	}, 500);
}

// Remove all products
function removeAll() {
	products = [];
	localStorage.setItem("products", JSON.stringify(products));
	showProducts(products);
}

/* ======================== PRODUCT DISPLAY FUNCTIONS ======================== */
function showProducts(data) {
	// Clear existing content
	tbody.innerHTML = "";
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
                <td>${
					product.price -
					product.taxes -
					product.ads -
					product.discount
				}</td>
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

/* ======================== FORM UTILITY FUNCTIONS ======================== */
// Clear all input fields
function clearInputs() {
	title.value = "";
	price.value = "";
	taxes.value = "";
	ads.value = "";
	discount.value = "";
	calcTotal();
	total.innerText = "";
	count.value = "";
	category.value = "";
}

// Update create button for editing
function changeCreateBtn() {
	createBtn.innerText = "Update";
	createBtn.classList.add("update-btn");
}

// Reset create button to initial state
function resetCreateBtn() {
	createBtn.innerText = "Create";
	createBtn.classList.remove("update-btn");
}

// Calculate total
function calcTotal() {
	const calculatedTotal =
		price.value - taxes.value - ads.value - discount.value;
	total.innerText = calculatedTotal;
	total.parentElement.classList.toggle("active-field", calculatedTotal > 0);
}

/* ======================== MODAL FUNCTIONS ======================== */
function showModal() {
	// Add error animation to create button
	createBtn.classList.add("error");
	setTimeout(() => {
		createBtn.classList.remove("error");
	}, 500);

	createBtn.setAttribute("data-bs-toggle", "modal");
	createBtn.setAttribute("data-bs-target", "#staticBackdrop");
	createBtn.click();
}

function resetModal() {
	createBtn.removeAttribute("data-bs-toggle");
	createBtn.removeAttribute("data-bs-target");
}

/* ======================== SEARCH FUNCTIONS ======================== */
function searchProducts() {
	const searchBy = serachedProduct.value;
	const searchFor = search.value.trim().toLowerCase();
	const filteredProducts = products.filter((ele) =>
		ele[searchBy].toLowerCase().includes(searchFor)
	);
	showProducts(filteredProducts);
	removeAllBtn.disabled = searchFor.length > 0;
}

/* ======================== UI UTILITY FUNCTIONS ======================== */
// Toggle dark mode
function toggleDarkMode() {
	document.body.classList.toggle("dark-mode");
	let lightIcon = changeModeBtn.querySelector("svg");
	if (lightIcon.classList.contains("fa-sun")) {
		lightIcon.classList.replace("fa-sun", "fa-moon");
	} else {
		lightIcon.classList.replace("fa-moon", "fa-sun");
	}
}

// Set copyright year
function copyrightsYear() {
	const copyrightSpan = document.getElementById("copyright-year");
	copyrightSpan.innerHTML = new Date().getFullYear();
}
