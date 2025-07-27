import { Category } from "./model/Category.js";
import { Product } from "./model/Product.js"
import { ApiRequest } from "./ApiRequest.js";


export class App {
    backendUrl = window.env.API_URL;
    categoryRoute = window.env.CATEGORY_ROUTE;
    imageRoute = window.env.IMAGE_ROUTE;
    productRoute = window.env.PRODUCT_ROUTE;

    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.createCategoryCards();
    }

    async loadCategories() {
        this.categories = []
        await ApiRequest.apiRequest("get", this.categoryRoute + "all", {},  null, (stat, data) => {
            data.forEach((category) => {
            const newCategory = new Category(category.id, category.name, category.description, category.imagePath);
            this.categories.push(newCategory);
        })});
    }

    async loadProducts() {
        this.products = [];
        await ApiRequest.apiRequest("get", this.productRoute + "all", {}, null, (stat, data) => {
            data.forEach((product) => {
            const newProduct = new Product(product.id ,product.name, product.categoryId.name, product.imagePath);
            this.products.push(newProduct);
        })});
    }

    getProductsByCategory(categoryName) {
        return this.products.filter((product) => product.getCategory() === categoryName);
    }

    createCategoryCards() {
        const container = document.getElementById("cards-container");
        container.innerHTML = "";

        this.categories.forEach((category) => {
            let categoryComponent =  `
                <div class="card" id="${category.getName()}" onclick="app.createProductCards('${category.getName()}')">
                    <img src="${this.backendUrl + this.imageRoute + category.getImagePath()}" alt="Amigurumis" />
                    <h3>${category.getName()}</h3>
                    <div class="overlay">
                        <p>${category.getDescription()}</p>
                    </div>
                </div>
            `;

            container.innerHTML += categoryComponent;
        });
    }

    createProductCards(categoryName) {
        const container = document.getElementById("cards-container");
        container.innerHTML = "";

        const products = this.getProductsByCategory(categoryName);

        if (products.length < 1) {
            const errorMessage =  `
                <h3> Por el momento no hay productos para esta categoria :( </h3>
            `;
            container.insertAdjacentHTML("beforeend", errorMessage);
        }
        else {
            products.forEach((product) => {
                const message = 'Hola! me interesa el amigurumi ' + product.getName() + ' ¿Podrías enviarme más información?'
                const productCard =  `
                    <div class="card product-card">
                        <img src="${this.backendUrl + this.imageRoute + product.getImagePath()}" alt="${product.getName()}" />
                        <h3>${product.getName()}</h3>
                        <a class="buy-button" href='https://wa.me/${window.env.WHATSAPP}?text=${message}' target='_blank'>Hacer pedido</a>
                    </div>
                `;

                container.insertAdjacentHTML("beforeend", productCard);
            });
        }
    }

    ///////////////////////
    /// Functionalities ///
    ///////////////////////


    showNavbarLinks() {
        const navbarLinks = document.getElementById("navbar-links");

        if (navbarLinks.style.display === "flex") {
            navbarLinks.style.display = "none";
        } else {
            navbarLinks.style.display = "flex"
        }

    }
}