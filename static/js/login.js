import { ApiRequest } from "./ApiRequest.js";

export class Login {
    static checkTokenRoute = window.env.CHECK_TOKEN_ROUTE;
    static loginRoute = window.env.LOGIN_ROUTE;
    static passwordRecoveryRoute = window.env.RECOVERY_ROUTE;
    static registerRoute = window.env.REGISTER_ROUTE;
    static passwordChangeRoute = window.env.CHANGE_PASSWORD_ROUTE;
    static editUserRoute = window.env.EDIT_USER_ROUTE;
    static deleteUserRoute = window.env.DELETE_USER_ROUTE;

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

        await ApiRequest.apiRequest("post", this.registerRoute, header, payload, async (stat, response) => {
            let message;
            if (stat != 200) {
                message = response;
            }
            else {
                message = "Usuario creado correctamente.";
                await components.reloadTable("user");
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
        const container = form.closest("div").id;
        await ApiRequest.apiRequest("post", this.loginRoute, {"Content-Type" : "application/json"}, payload, (stat, data) => {
            console.log(stat)
            if (stat == 400) {
                components.displayMessage(container, "Usuario o contraseña incorrectos.");
                form.reset();
            }
            else if (stat == 401) {
                components.displayMessage(container, "El email no está verificado.");
                form.reset();
            }
            else {
                sessionStorage.setItem("AuthorizationToken", data["token"]);
                window.location.href = "admin-panel.html"
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

    static async getRecoveryCode(target, event) {
        event.preventDefault();
        await ApiRequest.apiRequest("get", this.passwordRecoveryRoute + "?email=" + target.email.value, {}, null, (stat, response) => {
            if (stat == 200) {
                window.components.recoveryCodeForm(target.closest("div").id);
            }
            else {
                window.components.displayMessage(target.closest("div").id, response);
            }
        });
        return false;
    }

    static async sendRecoveryCode(target, event) {
        event.preventDefault();
        const payload = JSON.stringify({"code" : parseInt(target.code.value)});
        await ApiRequest.apiRequest("post", this.passwordRecoveryRoute, {"Content-Type" : "application/json"}, payload, (stat, response) => {
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

    static async recoverPassword(target, event) {
        event.preventDefault();
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
            await ApiRequest.apiRequest("put", this.passwordRecoveryRoute, {"Content-Type" : "application/json"}, payload, (stat, response) => {
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

    static async changePassword(target, event) {
        event.preventDefault()
        const oldPassword = target.oldPassword.value;
        const newPassword = target.newPassword.value;
        const container = target.closest("div").id;
        if (oldPassword === newPassword) {
            components.displayMessage(container, "Las contraseñas no pueden ser iguales.");
        }
        else {
            const payload = JSON.stringify({
                oldPassword : oldPassword,
                newPassword : newPassword
            })

            let headers = this.getAuthHeader();
            headers["Content-Type"] = "application/json"

            await ApiRequest.apiRequest("put", this.passwordChangeRoute, headers, payload, (stat, response) => {
                alert(response);
                components.closeForm();
            })
        }
        return false;
    }

    static async editUser(userId) {
        const name =document.getElementById("editUserName").value;
        const email =document.getElementById("editUserEmail").value;

        const payload = JSON.stringify({
            id : userId,
            name : name,
            email : email
        })

        let headers = this.getAuthHeader();
        headers["Content-Type"] = "application/json"

        await ApiRequest.apiRequest("put", this.editUserRoute, headers, payload, (stat, response) => {
            if (response != 200) {
                console.log(response);
            }
            components.reloadTable("user");
        })
    }

    static async deleteUser(userId) {
        await ApiRequest.apiRequest("delete", this.deleteUserRoute + "/" + userId, this.getAuthHeader(), null, (stat, response) => {
            components.reloadTable("user");
        })
    }
}