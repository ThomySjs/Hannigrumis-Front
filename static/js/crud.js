import { CrudApp } from "./CrudApp.js";

async function main() {
    const app = new CrudApp();
    window.app = app;
    await window.app.init();
}

main();