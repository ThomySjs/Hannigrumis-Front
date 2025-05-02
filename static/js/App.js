import { Category } from "./Category.js";


export class App {
    categoriesRoute = "category/all"
    imageRoute = "images/"
    productRoute = "product/"

    constructor() {
        this._categories = [];
        this.backendUrl = "http://127.0.0.1:8080/";
    }

    async init() {
        
        await this.getData("get", this.categoriesRoute, {},  null, (data) => {
            data.forEach((category) => {
                const newCategory = new Category(category.name, category.description, category.imagePath);
                this.addCategory(newCategory);
            })
        });

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

    /* Index Components */

    createCategoryCards() {
        const container = document.getElementById("categories");

        this._categories.forEach((category) => {
            let categoryComponent =  `
                <div class="category" id="${category.getName()}">
                    <img src="${this.backendUrl + this.imageRoute + category.getImagePath()}" alt="Amigurumis" />
                    <h3>${category.getName()}</h3>
                </div>
            `

            container.innerHTML += categoryComponent;
        })
    }

    /* CRUD components */

    loadForm(operation) {

        if (operation === "add") {
            this.createAddForm();
        }
        if (operation === "delete") {
            this.createDeleteForm();
        }
    }

    createAddForm() {
        const container = document.getElementById("formContainer");
        const selection = document.createElement("select");
        selection.name = "categoryName";


        this._categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.getName();
            option.innerText = category.getName();
            selection.appendChild(option);
        });

        let form = `
            <form id="addForm" class="crudForm" method="post" enctype="multipart/form-data">
                <label>
                    Nombre
                    <input type="text" name="name" required/>
                </label>
                <label id="categorySelector">
                    Categoria
                </label>
                <label>
                    Foto de producto
                    <input type="file" name="file"/>
                </label>
                <input type="submit"/>
            </form>
        `;

        container.innerHTML = form;
        const categorySelector = document.getElementById("categorySelector");
        categorySelector.insertAdjacentElement("beforeend", selection);

        document.getElementById("addForm").addEventListener("submit", (event) => {
            event.preventDefault();
            this.addProduct(event.target); // ahora sí el form se pasa correctamente
        });
    }

    createDeleteForm() {
        const container = document.getElementById("formContainer");

        let form = `
            <form id="deleteForm" class="crudForm" method="post" enctype="multipart/form-data">
                <label>
                    ID de producto
                    <input type="text" name="productID" required/>
                </label>
                <input type="submit"/>
            </form>
        `;

        container.innerHTML = form;

        document.getElementById("deleteForm").addEventListener("submit", (event) => {
            event.preventDefault();
            this.deleteProduct(event.target); // ahora sí el form se pasa correctamente
        });
    }

  

    /* CRUD functionalities */
    addProduct(form) {
        const newForm = new FormData(form);

        if (form.name.value.trim() == "") {
            return false;
        }
        if (form.categoryName.value.trim() == "") {
            return false;
        }

        this.getData("post",
                    this.productRoute + "add",
                    {},
                    newForm,
                    (data) => {form.reset()}
        )
        return false;
    }

    deleteProduct(form) {
        console.log("deleted");
    }
}