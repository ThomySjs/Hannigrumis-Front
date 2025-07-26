import { CrudApp } from "./CrudApp.js";
import { Login } from "./Login.js";
import { LoginComponents } from "./LoginComponents.js";
import { CrudComponents } from "./CrudComponents.js";

async function main() {
    window.Login = Login;
    const newApp = new CrudApp();
    window.app = newApp;
    const currentLocation = window.location.href.split("/").pop();
    switch(currentLocation) {
        case "panel":
        case "admin-panel.html":
            window.components = new CrudComponents();
            await window.app.initCrud();
            break;
        case "login":
        case "login.html":
            window.components = new LoginComponents();
            await window.app.initLogin();
            break;
    }
}

main();