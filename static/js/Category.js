export class Category {
    constructor(anId, aName, aDescription, anImagePath) {
        this.id = anId;
        this.name = aName;
        this.description = aDescription;
        this.imagePath = anImagePath;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.description;
    }

    getImagePath() {
        return this.imagePath;
    }

    setName(aName) {
        this.name = aName;
    }

    setDescription(aDescription) {
        this.description = aDescription;
    }

    setImagePath(anImagePath) {
        this.imagePath = anImagePath;
    }

    fromJson(data) {
        this.name = data.name;
        this.description = data.description;
        this.imagePath = data.imagePath;
    }

}