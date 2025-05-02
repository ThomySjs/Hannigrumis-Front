export class Product {

    constructor(aName, aDescription, anImagePath) {
        this._name = aName;
        this._category = aDescription;
        this._image_path = anImagePath;
    }

    getName() {
        return this._name;
    }

    getDescription() {
        return this._description;
    }

    getImagePath() {
        return this._image_path;
    }

    setName(aName) {
        this._name = aName;
    }

    setCategory(aCategory) {
        this._category= aCategory;
    }

    setImagePath(anImagePath) {
        this._image_path = anImagePath;
    }

}