export class User {
    constructor (anId, aName, anEmail, verified) {
        this.id = anId;
        this.name = aName;
        this.email = anEmail;
        this.verified = verified;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getEmail() {
        return this.email;
    }

    isVerified() {
        return this.verified;
    }
}