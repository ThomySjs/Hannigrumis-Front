export class Category {
    constructor(aName, aDescription, anImagePath) {
        this._name = aName;
        this._description = aDescription;
        this._imagePath = anImagePath;
        this._products = [];
    }

    getName() {
        return this._name;
    }

    getDescription() {
        return this._description;
    }

    getImagePath() {
        return this._imagePath;
    }

    setName(aName) {
        this._name = aName;
    }

    setDescription(aDescription) {
        this._description = aDescription;
    }

    setImagePath(anImagePath) {
        this._imagePath = anImagePath;
    }

    addProduct(aProduct) {
        this._products.push(aProduct);
    }

    getProducts() {
        return this._products;
    }
}