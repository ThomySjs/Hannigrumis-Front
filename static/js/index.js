import { App } from "./App.js";

async function main() {
    const app = new App();
    window.app = app;
    await window.app.init();
}

main();