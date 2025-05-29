import { Category } from "./Category.js";
import { Product } from "./Product.js"


export class App {
    constructor() {
        this._categories = [];
        this._products = [];
        this.backendUrl = window.env.API_URL;
        this.categoryRoute = window.env.CATEGORY_ROUTE;
        this.imageRoute = window.env.IMAGE_ROUTE;
        this.productRoute = window.env.PRODUCT_ROUTE;
    }

    async init() {
        
        await this.getData("get", this.categoryRoute + "all", {},  null, this.loadCategories.bind(this));
        this.createCategoryCards();

    }

    loadCategories(data) {
        data.forEach((category) => {
            const newCategory = new Category(category.id, category.name, category.description, category.imagePath);
            this.addCategory(newCategory);
        });
    }

    loadProducts(data) {
        data.forEach((product) => {
            const newProduct = new Product(product.name, product.description, product.imagePath);

        })
    }

    async getData(method, route, header, content, responseFunction) {
        try {
            const response = await fetch(this.backendUrl + route, {
                method : method,
                header : header,
                body : content
            });

            if(!response.ok) {
                throw new Error("Response status:" + response.status);
            }
    
            if (responseFunction != null) {
                const data = await response.json();
                responseFunction(data);
            }
        }
        catch (error) {
            console.error(error.message);
        }
    }

    addProduct(product) {
        this._products.push(product)
    }

    getProducts() {
        return this._products;
    }

    addCategory(category) {
        this._categories.push(category);
    }

    getCategories() {
        return this._categories;
    }

    getCategoryByName(categoryName) {
        this._categories.filter((category) => {
            return category.getName() === categoryName;
        })
    }

    /* Components */

    createCategoryCards() {
        const container = document.getElementById("categories");

        this._categories.forEach((category) => {
            let categoryComponent =  `
                <div class="category" id="${category.getName()}">
                    <img src="${this.backendUrl + this.imageRoute + category.getImagePath()}" alt="Amigurumis" />
                    <h3>${category.getName()}</h3>
                </div>
            `;

            container.innerHTML += categoryComponent;
        });
    }

    showNavbarLinks() {
        const navbarLinks = document.getElementById("navbar-links");

        if (navbarLinks.style.display === "flex") {
            navbarLinks.style.display = "none";
        } else {
            navbarLinks.style.display = "flex"
        }

    }
}