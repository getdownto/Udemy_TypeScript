"use strict";
class ProjectInput {
    constructor() {
        this.submitHandler = (event) => {
            event.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, description, people] = userInput;
                console.log(title, description, people);
                this.clearInput();
            }
        };
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const content = document.importNode(this.templateElement.content, true);
        this.element = content.firstElementChild;
        this.element.id = 'user-input';
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.attach();
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredTDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        if (enteredTitle.trim().length === 0 || enteredTDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
            alert('Invalid input!');
            return;
        }
        else {
            return [enteredTitle, enteredTDescription, +enteredPeople];
        }
    }
    clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
}
const project = new ProjectInput;
