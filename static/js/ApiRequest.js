export class ApiRequest {
    static backendUrl = window.env.API_URL;
    static async apiRequest(method, route, header, content, responseFunction) {
        try {
            const response = await fetch(this.backendUrl + route, {
                method: method,
                headers: header,
                body: content
            });

            if (!responseFunction) {
                return false;
            }
            try{
                const data = await response.clone().json();
                return responseFunction(response.status, data);
            }
            catch {
                const errorMessage = await response.text();
                return responseFunction(response.status, errorMessage);
            }
        }
        catch (e) {
            console.error(e);
        }
    }

}