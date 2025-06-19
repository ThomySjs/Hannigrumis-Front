export class loginComponents {
    constructor () {
    }

    loginForm(containerId) {
        const container = document.getElementById(containerId);

        const form = `
            <form class="form" onsubmit="app.login(event, this)">
                <label>
                    Correo
                </label>
                <input type="email" name="email" class="user-input"/>
                <label>
                    Contraseña
                </label>
                <input type="password" name="password" class="user-input"/>
                <a onclick="components.recoveryEmailForm('${containerId}')" id="reset-password">¿Olvidaste tu contraseña?</a>
                <button type="submit">Ingresar</button>
            </form>
        `;
        container.innerHTML = form;
    }

    recoveryEmailForm(containerId) {
        const container = document.getElementById(containerId);

        const form = `
            <form class="form recovery" onsubmit="return app.getRecoveryCode(this)">
                <label>
                    Correo
                </label>
                <input type="email" name="email" class="user-input"/>
                <button type="submit">Enviar código</button>
            </form>
        `;
        container.innerHTML = form;
    }

    recoveryCodeForm(containerId) {
        const container = document.getElementById(containerId);

        const form = `
            <form class="form recovery" onsubmit="return app.sendRecoveryCode(this)">
                <label>
                    Código
                </label>
                <input type="text" name="code" class="user-input"/>
                <button type="submit">Enviar código</button>
            </form>
        `;
        container.innerHTML = form;
    }

    passwordForm(containerId) {
        const container = document.getElementById(containerId);

        const form = `
            <form class="form recovery" onsubmit="return app.changePassword(this)">
                <label>
                    Contraseña
                </label>
                <input type="password" name="password1" id="password1" class="user-input"/>
                <label>
                    Repetir contraseña
                </label>
                <input type="password" name="password2" id="password2" class="user-input"/>
                <button type="submit">Cambiar contraseña</button>
            </form>
        `;
        container.innerHTML = form;
    }

    displayMessage(target, message) {
        let form = document.getElementById(target);

        let messageHTML = `
            <h4 style="color: #FF677D;">${message}</h4>
        `;
        form.insertAdjacentHTML("afterbegin", messageHTML);
    }
}