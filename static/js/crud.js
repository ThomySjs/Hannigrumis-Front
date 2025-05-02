import { App } from "./App.js";

async function main() {
    const app = new App();
    window.app = app;
    await window.app.init();

    const formOperation = document.getElementById("crudOptions");

    window.app.loadForm(formOperation.value);
}

main();