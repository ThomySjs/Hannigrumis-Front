export class Product {
    constructor(anID ,aName, aCategory, anImagePath) {
        this.id = anID;
        this.name = aName;
        this.category = aCategory;
        this.imagePath = anImagePath;
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getCategory() {
        return this.category;
    }

    getImagePath() {
        return this.imagePath;
    }

    setID(anID) {
        this.id = anID;
    } 

    setName(aName) {
        this.name = aName;
    }

    setCategory(aCategory) {
        this.category= aCategory;
    }

    setImagePath(anImagePath) {
        this.image_path = anImagePath;
    }

    fromJson(json) {
        console.log(json);
        this.id = json.id;
        this.name = json.name;
        this.category = json.categoryId.name;
        this.imagePath = json.imagePath;
    }

}