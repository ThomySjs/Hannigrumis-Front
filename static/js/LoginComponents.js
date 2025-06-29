export class LoginComponents {
    init() {
        this.loginForm("form-container");
    }

    loginForm(containerId) {
        const container = document.getElementById(containerId);

        const form = `
            <form class="form" onsubmit="return Login.login(event, this)">
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
            <form class="form recovery" onsubmit="return Login.getRecoveryCode(this, event)">
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
            <form class="form recovery" onsubmit="return Login.sendRecoveryCode(this, event)">
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
            <form class="form recovery" onsubmit="return Login.recoverPassword(this, event)">
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
        let existingMessage = document.getElementById("message");
        if (!existingMessage) {
            let messageHTML = `
            <h4 id="message" style="color: #FF677D;">${message}</h4>
            `;
            form.insertAdjacentHTML("afterbegin", messageHTML);
        }
        else {
            existingMessage.innerText = message;
        }
    }
}