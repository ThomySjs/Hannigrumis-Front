import { ApiRequest } from "./ApiRequest.js";
import { Category } from "./model/Category.js";
import { Product } from "./model/Product.js";

export class CrudComponents {
    backendUrl = window.env.API_URL;
    categoryRoute = window.env.CATEGORY_ROUTE;
    imageRoute = window.env.IMAGE_ROUTE;
    productRoute = window.env.PRODUCT_ROUTE;

    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.createSelectButtons();
        this.createAddProductForm();
        this.createProductList();
        if (Login.isAdmin()) {
            this.showRegisterUserButton();
        }
    }
     
    async loadCategories(order = "id") {
        this.categories = []
        await ApiRequest.apiRequest("get", this.categoryRoute + "all?order=" + order, {},  null, (stat, data) => {
            data.forEach((category) => {
            const newCategory = new Category(category.id, category.name, category.description, category.imagePath);
            this.categories.push(newCategory);
        })});
    }

    async loadProducts(order = "id") {
        this.products = [];
        await ApiRequest.apiRequest("get", this.productRoute + "all?order=" + order, {}, null, (stat, data) => {
            data.forEach((product) => {
            const newProduct = new Product(product.id ,product.name, product.categoryId.name, product.imagePath);
            this.products.push(newProduct);
        })});
    }
    
    getCategoryByName(categoryName) {
       return this.categories.filter((category) => category.getName() == categoryName)
    }

    async reloadTable(type, order = "id") {
        const container = document.getElementById("listContainer");
        container.innerHTML = "";
        if (type === "product") {
            await this.loadProducts(order);
            this.createProductList();
        }
        if (type === "category") {
            await this.loadCategories(order);
            this.createCategoryList();
        }
    }

    showForm() {
        const container = document.getElementById("formContainer");
        const overlay = document.getElementById("overlay");
        overlay.style.display = "block";
        container.style.display = "block";
    }

    closeForm() {
        const container = document.getElementById("formContainer");
        const overlay = document.getElementById("overlay");
        overlay.style.display = "none";
        container.style.display = "none";
    }

    createSelectButtons() {
        const container = document.getElementById("formButtons");
        const elements = `
            <select id="crudSelection">
                <option value="product" selected>Productos</option>
                <option value="category">Categorias</option>
            </select>
            <div class="crud-buttons">
                <button id="sortButton" onclick="components.mobileSortOptions('product')"><i class="fa-solid fa-arrow-up-z-a"></i></button>
                <button id="addButton" ><i class="fa-solid fa-plus"></i></button>
            </div>
        `;
        container.innerHTML = elements;

        const button = document.getElementById("addButton")
        const sortButton = document.getElementById("sortButton");

        button.addEventListener("click", (e) => {
            this.createAddProductForm();
            this.showForm();
        });

        document.getElementById("crudSelection").addEventListener("change", (event) => {
            if (event.target.value === "product") {
                button.addEventListener("click", (e) => {
                    this.createAddProductForm();
                    this.showForm();
                });
                this.reloadTable(event.target.value)
            }
            if (event.target.value === "category") {
                button.addEventListener("click", (e) => {
                    this.createAddCategoryForm();
                    this.showForm();
                });
                this.reloadTable(event.target.value);
            }
            sortButton.addEventListener("click", () => {
                this.mobileSortOptions(event.target.value);
            })
        });
    }

    createAddProductForm() {
        const container = document.getElementById("formContainer");
        const selection = document.createElement("select");
        selection.name = "categoryId";


        this.categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.getId();
            option.innerText = category.getName();
            selection.appendChild(option);
        });

        let form = `
            <h2>Agregar producto</h2>
            <button id="closeButton" onclick="components.closeForm()"><i class="fa-solid fa-circle-xmark" style="color: #FF677D;"></i></button>
            <form id="addForm" class="crudForm" onsubmit="return app.createProduct(this, event)">
                <label>
                    Nombre
                </label>
                <input type="text" name="name" required/>
                <label id="categorySelector">
                    Categoria
                </label>
                <label class="custom-upload-button">
                    <input type="file" name="file"/>
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    Subir imagen
                </label>
                <input type="submit"/ value="Agregar producto">
            </form>
        `;

        container.innerHTML = form;
        const categorySelector = document.getElementById("categorySelector");
        categorySelector.insertAdjacentElement("afterend", selection);
    }

    createProductList() {
        const container = document.getElementById("listContainer");
        const table = document.createElement("table");
        const tableBody = document.createElement("tbody");
        table.id = "list"
        const tableHeaders = `
            <tr id="headers">
                <th><a class="sort" onclick="components.reloadTable('product','id')">ID</a></th>
                <th><a class="sort" onclick="components.reloadTable('product','name')">Nombre</a></th>
                <th><a class="sort" onclick="components.reloadTable('product','category')">Categoría</a></th>
                <th style="text-align:center;">Foto</th>
                <th style="text-align:center;">Acción</th>
            </tr>
        `;

        tableBody.insertAdjacentHTML("beforeend", tableHeaders);

        this.products.forEach((product) => {
            const category = this.getCategoryByName(product.getCategory())[0];
            const tableRows =`
                <tr id="${product.getID()}"> 
                    <td id="idContainer">${product.getID()}</td>
                    <td>${product.getName()}</td>
                    <td>${product.getCategory()}</td>
                    <td id="listImage"><img src="${this.backendUrl + this.imageRoute + product.getImagePath()}"/></td>
                    <td id="actionButtons"> 
                        <button id="deleteButton" onclick="app.deleteProduct(${product.id})"><i class="fa-solid fa-trash" style="color: #fef3f1;font-size:1.5rem;"></i></i></button>
                        <button id="editButton" onclick='components.createEditProductForm(${product.getID()},"${product.getName()}","${category.getId()}")'><i class="fa-solid fa-pen-to-square" style="color: #fef3f1;font-size:1.5rem;"></i></button>
                    </td>
                </tr>
            `;

            tableBody.insertAdjacentHTML("beforeend", tableRows);
        });

        table.appendChild(tableBody);

        container.innerHTML = "";
        container.appendChild(table);
    }

    createEditProductForm(productId, productName, productCategory) {
        const editingRow = document.querySelector(".editingField");
        if (editingRow) {
            return false;
        }
        const rowElement = document.getElementById(productId);
        const selectElement = document.createElement("select");
        selectElement.id = "editCategory";

        this.categories.forEach((category) => {
            const optionElement = document.createElement("option")
            optionElement.value = category.getId();
            optionElement.innerText = category.getName();
            if (category.getId() == productCategory) {
                optionElement.selected = true;
            }
            selectElement.appendChild(optionElement);
        })

        const tableRow =`
            <td>${productId}</td>
            <td><input type="text" class="editProductName" value="${productName}"/></td>
            <td id="categorySelectorEdit"></td>
            <td class="upload-td">
                <label class="custom-upload-button">
                    <input type="file" name="file"/>
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    Subir imagen
                </label>
            </td>
            <td id="actionButtons"> 
                <button type="button" id="sendEdit" onclick="app.editProduct(this, ${productId}, event)">
                    <i class="fa-solid fa-check" style="color: #ffffff;font-size:1.5rem;"></i>
                </button>
                <button id="cancelEditButton" onclick="components.reloadTable('product')">
                    <i class="fa-solid fa-xmark" style="color: #ffffff;font-size:1.5rem;"></i>
                </button>
            </td>
        `;

        rowElement.innerHTML = tableRow;
        document.getElementById("categorySelectorEdit").insertAdjacentElement("beforeend", selectElement);
        rowElement.classList.add("editingField");
    }

    createAddCategoryForm() {
        const container = document.getElementById("formContainer");

        let form = `
            <h2>Agregar categoría</h2>
            <button id="closeButton" onclick="components.closeForm()"><i class="fa-solid fa-circle-xmark" style="color: #FF677D;"></i></button>
            <form id="addForm" onsubmit="return app.createCategory(this, event)" class="crudForm">
                <label>
                    Nombre
                </label>
                <input type="text" name="name" required/>
                <label>
                    Descripción
                </label>
                <input type="text" name="description" required/>
                <label class="custom-upload-button">
                    <input type="file" name="file"/>
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    Subir imagen
                </label>
                <input type="submit" value="Agregar categoría"/>
            </form>
        `;

        container.innerHTML = form;
    }

    createCategoryList() {
        const container = document.getElementById("listContainer");
        const table = document.createElement("table");
        const tableBody = document.createElement("tbody");
        table.id = "list"
        const tableHeaders = `
            <tr id="headers">
                <th><a class="sort" onclick="components.reloadTable('category','id')">ID</a></th>
                <th><a class="sort" onclick="components.reloadTable('category','name')">Nombre</a></th>
                <th><a class="sort" onclick="components.reloadTable('category','description')">Descripción</a></th>
                <th style="text-align:center;">Foto</th>
                <th style="text-align:center;">Acción</th>
            </tr>
        `;

        tableBody.insertAdjacentHTML("beforeend", tableHeaders);

        this.categories.forEach((category) => {
            const tableRows =`
                <tr id="${category.getId()}"> 
                    <td id="idContainer">${category.getId()}</td>
                    <td>${category.getName()}</td>
                    <td>${category.getDescription()}</td>
                    <td id="listImage"><img src="${this.backendUrl + this.imageRoute + category.getImagePath()}"/></td>
                    <td id="actionButtons">
                        <button id="deleteButton" onclick="app.deleteCategory('${category.getId()}')"><i class="fa-solid fa-trash" style="color: #fef3f1;font-size:1.5rem;"></i></i></button>
                        <button id="editButton" onclick='components.createEditCategoryForm("${category.getId()}", "${category.getName()}","${category.getDescription()}")'><i class="fa-solid fa-pen-to-square" style="color: #fef3f1;font-size:1.5rem;"></i></button>
                    </td>
                </tr>
            `;

            tableBody.insertAdjacentHTML("beforeend", tableRows);
        });

        table.appendChild(tableBody);
        container.appendChild(table);
    }

    createEditCategoryForm(categoryId, categoryName, categoryDescription) {
        const editingRow = document.querySelector(".editingField");
        if (editingRow) {
            return false;
        }

        const rowElement = document.getElementById(categoryId);
        
        const tableRow =`
            <td>${categoryId}</td>
            <td><input type="text" class="editCategoryName"  value="${categoryName}"></td>
            <td><textarea class="editCategoryDescription" >${categoryDescription}</textarea></td>
            <td class="upload-td">
                <label class="custom-upload-button">
                    <input type="file" name="file"/>
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    Subir imagen
                </label>
            </td>
            <td id="actionButtons"> 
                <button type="button" id="sendEdit" onclick="app.editCategory(this, ${categoryId}, event)">
                    <i class="fa-solid fa-check" style="color: #ffffff;font-size:1.5rem;"></i>
                </button>
                <button id="cancelEditButton" onclick="components.reloadTable('category')">
                    <i class="fa-solid fa-xmark" style="color: #ffffff;font-size:1.5rem;"></i>
                </button>
            </td>
        `

        rowElement.innerHTML = tableRow;
        rowElement.classList.add("editingField");
    }

    registerUserForm() {
        const container = document.getElementById("formContainer");
        let form = `
            <h2>Registrar usuario</h2>
            <button id="closeButton" onclick="components.closeForm()"><i class="fa-solid fa-circle-xmark" style="color: #FF677D;"></i></button>
            <form id="userForm" class="crudForm" onsubmit="return Login.register(this, event)">
                <label>
                    Nombre
                </label>
                <input type="text" name="name" required/>
                <label>
                    Correo
                </label>
                <input type="email" name="email" required/>
                <label>
                    Contraseña
                </label>
                <input type="password" name="password" required/>
                <input type="submit"/>
            </form>           
        `;
        container.innerHTML = form;
        this.showForm();
    }

    mobileSortOptions(type) {
        const container = document.getElementById("formContainer");
        let options;
        if (type === "product") {
            options = `
                <div class="sort-options-container">
                    <a onclick="components.reloadTable('${type}', 'id')">ID</a>
                    <a onclick="components.reloadTable('${type}', 'name')">Nombre</a>
                    <a onclick="components.reloadTable('${type}', 'category')">Categoría</a>
                </div>
            `;
        }
        else if (type === "category") {
            options = `
                <div class="sort-options-container">
                    <a onclick="components.reloadTable('${type}', 'id')">ID</a>
                    <a onclick="components.reloadTable('${type}', 'name')">Nombre</a>
                    <a onclick="components.reloadTable('${type}', 'description')">Descripción</a>
                </div>
            `;
        }
        container.innerHTML = options;
        this.showForm();
    }

    async changeProductOrder(order) {
        await this.loadProducts(order);
        this.createAddProductForm();
    }

    showRegisterUserButton() {
        const container  = document.getElementById("userButtons");
        const button = document.createElement("a");
        button.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #FF677D; font-size: 2rem;"></i>'
        button.addEventListener("click", () => {
            this.showUserButtons();
            this.registerUserForm();
        })

        container.insertAdjacentElement("afterbegin", button);
    }

    showUserButtons() {
        const userButtons = document.getElementById("userButtons");

        if (userButtons.style.display === "none") {
            userButtons.style.display = "flex";
        }
        else {
            userButtons.style.display = "none";
        }
    }

    displayMessage(target, message) {
        let form = document.getElementById(target);

        let messageHTML = `
            <h4 style="color: #FF677D;">${message}</h4>
        `;
        form.insertAdjacentHTML("afterbegin", messageHTML);
    }
}