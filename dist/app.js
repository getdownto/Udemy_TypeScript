"use strict";
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const content = document.importNode(this.templateElement.content, true);
        this.element = content.firstElementChild;
        this.element.id = 'user-input';
        this.attach();
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
const project = new ProjectInput;
