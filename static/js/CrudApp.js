import { Category } from "./model/Category.js";
import { Product } from "./model/Product.js"
import { ApiRequest } from "./ApiRequest.js";


export class CrudApp {
    categoryRoute = window.env.CATEGORY_ROUTE;
    productRoute = window.env.PRODUCT_ROUTE;
    async initCrud() {
        const Authorized = await Login.checkAuthorization();

        if (!Authorized) {
            window.location.href = "login.html"
        }
        else {
            await components.init();
        }
    }

    async initLogin() {
        const LoggedIn = await Login.checkAuthorization();
    
        if (LoggedIn) {
            window.location.href = "admin-panel.html"
        }
        components.init();
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

        await ApiRequest.apiRequest("post", this.productRoute + "add", Login.getAuthHeader(), newForm, async (stat, data) => {
            form.reset();
            if (stat != 200) {
                alert("Hubo un error al agregar el producto.")
            }
            else {
                components.reloadTable("product")
            }
        });

        return false;
    }

    async deleteProduct(productId) {
        await ApiRequest.apiRequest("delete", this.productRoute + "delete/" + productId, Login.getAuthHeader(), null, async (stat, data)  => {
            if (stat != 200) {
                alert("Hubo un error al eliminar el producto.")
            }
            else {
                await components.reloadTable("product");
            }
        });
        
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

        await ApiRequest.apiRequest("put", this.productRoute  + "edit", Login.getAuthHeader(), form, async (stat, data) => {
            if (stat != 200) {
                alert("Error al editar el producto.")
            }
            else {
                await components.reloadTable("product");
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

        await ApiRequest.apiRequest("post", this.categoryRoute + "add", Login.getAuthHeader(), newForm, async (stat, data) => {
            form.reset();
            if (stat != 200) {
                alert("Error al agregar la categoría.")
            }
            else {
                await components.reloadTable("category")
            }
        });

        return false;
    }

    async deleteCategory(categoryId) {
        await ApiRequest.apiRequest("delete", this.categoryRoute + "delete/" + categoryId, Login.getAuthHeader(), null, async (stat, data)  => {
            if (stat != 200) {
                alert("Hubo un error al eliminar la categoría.")
            }
            else {
                await components.reloadTable("category");
            }
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

        await ApiRequest.apiRequest("put", this.categoryRoute + "edit", Login.getAuthHeader(), form, async (stat, data) => {
            if (stat != 200) {
                alert("Error al editar la categoría.");
            }
            else {
                await components.reloadTable("category");
            }
        });

        return false;
    }
}