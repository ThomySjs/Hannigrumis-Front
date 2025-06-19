import { Category } from "./model/Category.js";
import { Product } from "./model/Product.js"
import { ApiRequest } from "./ApiRequest.js";


export class App {
    constructor() {
        this.backendUrl = window.env.API_URL;
        this.categoryRoute = window.env.CATEGORY_ROUTE;
        this.imageRoute = window.env.IMAGE_ROUTE;
        this.productRoute = window.env.PRODUCT_ROUTE;
    }

    async init() {
        
        await this.requestProductsAndCategories();
        this.createCategoryCards();

    }

    ////////////////////////////
    /// Request data methods ///
    ////////////////////////////

    async requestProductsAndCategories() {
        this.products = [];
        this.categories = [];
        await ApiRequest.apiRequest("get", this.categoryRoute + "all", {},  null, this.loadCategories.bind(this));
        await ApiRequest.apiRequest("get", this.productRoute + "all", {}, null, this.loadProducts.bind(this));
    }
 
    loadCategories(stat, data) {
        data.forEach((category) => {
            const newCategory = new Category(category.id, category.name, category.description, category.imagePath);
            this.categories.push(newCategory);
        });
    }

    loadProducts(stat, data) {
        data.forEach((product) => {
            const newProduct = new Product(product.id ,product.name, product.categoryId.name, product.imagePath);
            this.products.push(newProduct);
        });

    }

    getProducts() {
        return this._products;
    }

    getProductsByCategory(categoryName) {
        return this.products.filter((product) => product.getCategory() === categoryName);
    }

    getCategories() {
        return this._categories;
    }

    getCategoryByName(categoryName) {
        this._categories.filter((category) => {
            return category.getName() === categoryName;
        })
    }

    //////////////////
    /// Components ///
    //////////////////

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
                const productCard =  `
                    <div class="card">
                        <img src="${this.backendUrl + this.imageRoute + product.getImagePath()}" alt="${product.getName()}" />
                        <h3>${product.getName()}</h3>
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