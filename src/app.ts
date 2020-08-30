class ProjectInput {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement

        const content = document.importNode(this.templateElement.content, true)

        this.element = content.firstElementChild as HTMLFormElement
        this.element.id = 'user-input'

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

        this.configure()
        this.attach()
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    private submitHandler = (event: Event) => {
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if(Array.isArray(userInput)) {
            const [title, description, people] = userInput
            console.log(title, description, people);
            this.clearInput()
            
        }
    }

    private gatherUserInput():[string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredTDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        if(enteredTitle.trim().length === 0 || enteredTDescription.trim().length === 0 || enteredPeople.trim().length === 0) {
            alert('Invalid input!')
            return
        } else {
            return [enteredTitle, enteredTDescription, +enteredPeople]
        }
    }

    private clearInput() {
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }
}


const project = new ProjectInput