import { ApiRequest } from "./ApiRequest.js";

export class Login {
    static checkTokenRoute = window.env.CHECK_TOKEN_ROUTE;
    static loginRoute = window.env.LOGIN_ROUTE;
    static passwordRecoveryRoute = window.env.RECOVERY_ROUTE;
    static registerRoute = window.env.REGISTER_ROUTE;

    static getAuthToken() {
        return sessionStorage.getItem("AuthorizationToken");
    }
    
    static getAuthHeader() {
        return {'Authorization' : 'Bearer ' + this.getAuthToken()}
    }
    
    static async checkAuthorization() {
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
    
    static getPayloadFromToken() {
        const payload = this.getAuthToken().split(".")[1];
        return JSON.parse(atob(payload));
    }

    static isAdmin() {
        const role = this.getPayloadFromToken().role;
        return role === "ADMIN"
    }

    static async register(form, event) {
        event.preventDefault();
        const payload = JSON.stringify({
            name : form.name.value,
            email : form.email.value,
            password : form.password.value
        });

        let header = this.getAuthHeader();
        header["Content-Type"] = "application/json"

        await ApiRequest.apiRequest("post", this.registerRoute, header, payload, (stat, response) => {
            let message;
            if (stat != 200) {
                message = response;
            }
            else {
                message = "Usuario creado correctamente.";
            }
            form.reset();
            components.displayMessage("userForm", message);
        })
        return false;
    }

    static async login(event, form) {
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
                alert("Usuario o contraseña incorrectos.")
                form.reset();
            }
            else if (stat == 401) {
                alert("El email no está verificado.")
                form.reset();
            }
            else {
                sessionStorage.setItem("AuthorizationToken", data["token"]);
                window.location.href = "crud.html"
            }
        });
        return false;
    }
    
    static logout() {
        sessionStorage.removeItem("AuthorizationToken");

        window.location.href = "login.html";
    }

    static checkPasswordMatch(password1, password2) {
        return password1 == password2;
    }

    static getRecoveryCode(target) {
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

    static sendRecoveryCode(target) {
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

    static changePassword(target) {
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
}