import { CrudApp } from "./CrudApp.js";

async function main() {
    const newApp = new CrudApp();
    window.app = newApp;
    const isValid = await app.checkAuthorization();

    if (isValid) {
        window.location.href = "crud.html"
    }
}
main();