import { CrudApp } from "./CrudApp.js";
import { loginComponents } from "./LoginComponents.js";

async function main() {
    const newApp = new CrudApp();
    window.app = newApp;
    window.components = new loginComponents();
    components.loginForm("form-container");
    const isValid = await app.checkAuthorization();

    if (isValid) {
        window.location.href = "crud.html"
    }
}
main();