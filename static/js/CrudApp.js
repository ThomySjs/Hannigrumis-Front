import { Category } from "./model/Category.js";
import { Product } from "./model/Product.js"
import { ApiRequest } from "./ApiRequest.js";


export class CrudApp {

    constructor() {
        this.backendUrl = window.env.API_URL;
        this.categoryRoute = window.env.CATEGORY_ROUTE;
        this.imageRoute = window.env.IMAGE_ROUTE;
        this.productRoute = window.env.PRODUCT_ROUTE;
        this.checkTokenRoute = window.env.CHECK_TOKEN_ROUTE;
        this.loginRoute = window.env.LOGIN_ROUTE;
        this.passwordRecoveryRoute = window.env.RECOVERY_ROUTE;
    }

    async init() {
        
        const Authorized = await this.checkAuthorization();

        if (!Authorized) {
            window.location.href = "login.html"
        }

        await this.requestProductsAndCategories()

        this.createSelectButtons();
        this.createAddProductForm();
        this.createProductList();
    }

    ///////////////////////
    /// User velidation ///
    ///////////////////////

    getAuthToken() {
        return sessionStorage.getItem("AuthorizationToken");
    }

    getAuthHeader() {
        return {'Authorization' : 'Bearer ' + this.getAuthToken()}
    }

    async checkAuthorization() {
        const token = this.getAuthToken();

        if (!token) {
            return false;
        }

        return await ApiRequest.apiRequest("get", this.checkTokenRoute, {'Authorization' : 'Bearer ' + token}, null, (stat, data) => {
            if (stat == 200) {
                return true;
            }
            return false;
        });
    }

    async login(event, form) {
        event.preventDefault()

        if (form.email.value.trim() == "") {
            return false;
        }
        if (form.password.value.trim() == "") {
            return false;
        }

        let payload = JSON.stringify({
            "email" : form.email.value,
            "password" : form.password.value
        })

        await ApiRequest.apiRequest("post", this.loginRoute, {"Content-Type" : "application/json"}, payload, (stat, data) => {
            console.log(stat)
            if (stat == 400) {
                alert("Invalid credentials.")
                form.reset();
            }
            else if (stat == 401) {
                alert("Email not virified.")
                form.reset();
            }
            else {
                sessionStorage.setItem("AuthorizationToken", data["token"]);
                window.location.href = "crud.html"
            }
        });
        return false;
    }

    logout() {
        sessionStorage.removeItem("AuthorizationToken");

        window.location.href = "login.html";
    }

    checkPasswordMatch(password1, password2) {
        return password1 == password2;
    }

    getRecoveryCode(target) {
        ApiRequest.apiRequest("get", this.passwordRecoveryRoute + "?email=" + target.email.value, {}, null, (stat, response) => {
            if (stat == 200) {
                window.components.recoveryCodeForm(target.closest("div").id);
            }
            else {
                window.components.displayMessage(target.closest("div").id, response);
            }
        });
        return false;
    }

    sendRecoveryCode(target) {
        const payload = JSON.stringify({"code" : parseInt(target.code.value)});
        ApiRequest.apiRequest("post", this.passwordRecoveryRoute, {"Content-Type" : "application/json"}, payload, (stat, response) => {
            if (stat == 200) {
                window.components.passwordForm(target.closest("div").id);
                sessionStorage.setItem("recovery-token", response);
            }
            else {
                window.components.displayMessage(target.closest("div").id, response);
            }
        });
        return false;
    }

    changePassword(target) {
        const password1 = target.password1.value;
        const password2 = target.password2.value;
        const container = target.closest("div").id;
        if (!this.checkPasswordMatch(password1, password2)) {
            window.components.displayMessage(container, "Las contraseñas no coinciden.");
        }
        else {
            const payload = JSON.stringify({
                "token" : sessionStorage.getItem("recovery-token"),
                "password" : password1
            })
            ApiRequest.apiRequest("put", this.passwordRecoveryRoute, {"Content-Type" : "application/json"}, payload, (stat, response) => {
                if (stat == 200) {
                    window.components.loginForm(container)
                    window.components.displayMessage(container, response);
                }
                else {
                    window.components.displayMessage(container, response);
                }
            });
            sessionStorage.removeItem("recovery-token");
        }
        return false;
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

    ///////////////
    /// Methods ///
    ///////////////

    addProductToList(product) {
        this.products.push(product)
    }

    deleteProductFromList(id) {
        this.products = this.products.filter((product) => 
            product.getID() != id
        );
    }

    getProductById(id) {
        return this.products.filter((product) => product.getID() == id);
    }

    getProducts() {
        return this.products;
    }

    addCategoryToList(category) {
        this.categories.push(category);
    }

    getCategories() {
        return this.categories;
    }

    getCategoryByName(categoryName) {
       return this.categories.filter((category) => category.getName() == categoryName)
    }

    getCategoryById(id) {
        return this.categories.filter((category) => category.getId() == id)
    }

    deleteCategoryFromList(name) {
        this.categories = this.categories.filter((category) => 
            category.getName() != name
        );
    }

    ///////////////////////
    /// CRUD components ///
    ///////////////////////
    
    reloadTable(type) {
        const container = document.getElementById("listContainer");
        container.innerHTML = null;
        if (type === "product") {
            this.createProductList();
        }
        if (type === "category") {
            this.createCategoryList();
        }
    }

    showForm() {
        const container = document.getElementById("formContainer");
        container.style.display = "block";
    }

    closeForm() {
        const container = document.getElementById("formContainer");
        container.style.display = "none";
    }

    createSelectButtons() {
        const container = document.getElementById("formButtons");
        const elements = `
            <select id="crudSelection">
                <option value="product" selected>Productos</option>
                <option value="category">Categorias</option>
            </select>
            <button id="addButton" onclick="app.showForm()"><i class="fa-solid fa-plus" style="color: #fef3f1;"></i></button>
        `;
        container.innerHTML = elements;
        document.getElementById("crudSelection").addEventListener("change", (event) => {
            const button = document.getElementById("addButton")
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
            <button id="closeButton" onclick="app.closeForm()"><i class="fa-solid fa-circle-xmark" style="color: #FF677D;"></i></button>
            <form id="addForm" class="crudForm" onsubmit="return app.createProduct(this, event)">
                <label>
                    Nombre
                </label>
                <input type="text" name="name" required/>
                <label id="categorySelector">
                    Categoria
                </label>
                <label>
                    Foto de producto
                </label>
                <input type="file" name="file"/>
                <input type="submit"/>
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
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
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
                        <button id="editButton" onclick='app.createEditProductForm(${product.getID()},"${product.getName()}","${category.getId()}")'><i class="fa-solid fa-pen-to-square" style="color: #fef3f1;font-size:1.5rem;"></i></button>
                    </td>
                </tr>
            `;

            tableBody.insertAdjacentHTML("beforeend", tableRows);
        });

        table.appendChild(tableBody);

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
            <td><input type="file" class="editProductImage"/></td>
            <td id="actionButtons"> 
                <button type="button" id="sendEdit" onclick="app.editProduct(this, ${productId}, event)">
                    <i class="fa-solid fa-check" style="color: #ffffff;font-size:1.5rem;"></i>
                </button>
                <button id="cancelEditButton" onclick="app.reloadTable('product')">
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
            <button id="closeButton" onclick="app.closeForm()"><i class="fa-solid fa-circle-xmark" style="color: #FF677D;"></i></button>
            <form id="addForm" onsubmit="return app.createCategory(this, event)" class="crudForm">
                <label>
                    Nombre
                </label>
                <input type="text" name="name" required/>
                <label>
                    Descripción
                </label>
                <input type="text" name="description" required/>
                <label>
                    Foto de categoría
                </label>
                <input type="file" name="file"/>
                <input type="submit"/>
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
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
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
                        <button id="editButton" onclick='app.createEditCategoryForm("${category.getId()}", "${category.getName()}","${category.getDescription()}")'><i class="fa-solid fa-pen-to-square" style="color: #fef3f1;font-size:1.5rem;"></i></button>
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
            <td><input type="file" class="editCategoryImage"/></td>
            <td id="actionButtons"> 
                <button type="button" id="sendEdit" onclick="app.editCategory(this, ${categoryId}, event)">
                    <i class="fa-solid fa-check" style="color: #ffffff;font-size:1.5rem;"></i>
                </button>
                <button id="cancelEditButton" onclick="app.reloadTable('category')">
                    <i class="fa-solid fa-xmark" style="color: #ffffff;font-size:1.5rem;"></i>
                </button>
            </td>
        `

        rowElement.innerHTML = tableRow;
        rowElement.classList.add("editingField");
    }
    
    ////////////////////////////
    /// CRUD functionalities ///
    ////////////////////////////

    async createProduct(form, event) {
        event.preventDefault();
        const newForm = new FormData(form);

        if (form.name.value.trim() == "") {
            return false;
        }
        if (form.categoryId.value.trim() == "") {
            return false;
        }

        await ApiRequest.apiRequest("post", this.productRoute + "add", this.getAuthHeader(), newForm, (stat, data) => {
            form.reset();
            if (stat != 200) {
                alert("Hubo un error al agregar el producto.")
            }
            else {
                const newProduct = new Product(data.id ,data.name, data.categoryId.name, data.imagePath);
                this.addProductToList(newProduct);
                this.reloadTable("product")
            }
        });

        return false;
    }

    async deleteProduct(productId) {
        await ApiRequest.apiRequest("delete", this.productRoute + "delete/" + productId, this.getAuthHeader(), null, (stat, data)  => {
            if (stat != 200) {
                alert("Hubo un error al eliminar el producto.")
            }
            else {
                this.deleteProductFromList(productId);
                this.reloadTable("product");
            }
        });
        
        if (!requestCompleted) {
            alert("Hubo un error al eliminar el producto.")
        }

        return false;
    }

    async editProduct(button, id, event) {
        if (event) event.preventDefault();

        const row = button.closest("tr")
        const form = new FormData();

        const name = row.querySelector(".editProductName").value;
        const category = row.querySelector("#editCategory").value;
        const image = row.querySelector(".editProductImage").files[0];

        form.append("id", id);
        form.append("name", name);
        form.append("categoryId", category);
        if (image) {
            form.append("file", image);
        }

        await ApiRequest.apiRequest("put", this.productRoute  + "edit", this.getAuthHeader(), form, (stat, data) => {
            if (stat != 200) {
                alert("Error al editar el producto.")
            }
            else {
                const product = this.getProductById(data.id)[0];
                product.fromJson(data);
                this.reloadTable("product");
            }
        });

    }


    async createCategory(form, event) {
        event.preventDefault();
        const newForm = new FormData(form)

        if (form.name.value.trim() == "") {
            return false;
        }
        if (form.description.value.trim() == "") {
            return false;
        }

        await ApiRequest.apiRequest("post", this.categoryRoute + "add", this.getAuthHeader(), newForm, (stat, data) => {
            form.reset();
            if (stat != 200) {
                alert("Error al agregar la categoría.")
            }
            else {
                const newCategory = new Category(data.id, data.name, data.description, data.imagePath);
                this.addCategoryToList(newCategory);
                this.reloadTable("category")
            }
        });

        return false;
    }

    async deleteCategory(categoryId) {
        await ApiRequest.apiRequest("delete", this.categoryRoute + "delete/" + categoryId, this.getAuthHeader(), null, async (stat, data)  => {
            await this.requestProductsAndCategories();
            this.reloadTable("category");
        });
    }

    async editCategory(button, categoryId, event) {
        if (event) event.preventDefault();

        const row = button.closest("tr");
        const form = new FormData();

        const name = row.querySelector(".editCategoryName").value;
        const description = row.querySelector(".editCategoryDescription").value;
        const image = row.querySelector(".editCategoryImage").files[0];

        form.append("id", categoryId);
        form.append("name", name);
        form.append("description", description);
        if (image) {
            form.append("file", image);
        }

        await ApiRequest.apiRequest("put", this.categoryRoute + "edit", this.getAuthHeader(), form, (stat, data) => {
            if (stat != 200) {
                alert("Error al editar la categoría.");
            }
            else {
                const category = this.getCategoryById(data.id)[0];
                category.fromJson(data);
                this.reloadTable("category");
            }
        });

        return false;
    }

    ///////////////////////
    /// Event listeners ///
    ///////////////////////

    showUserButtons() {
        const userButtons = document.getElementById("userButtons");

        if (userButtons.style.display === "none") {
            userButtons.style.display = "flex";
        }
        else {
            userButtons.style.display = "none";
        }
    }

}