interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}

function validateInput(validatableInput: Validatable) {
    let isValid = true
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length > validatableInput.minLength
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value > validatableInput.min
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value < validatableInput.max
    }

    return isValid
}

class ProjectState {
    private listeners: Listener[] = []
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor() {

    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState()
        return this.instance
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project (Math.random.toString(), title, description, numOfPeople, ProjectStatus.Active)
        this.projects.push(newProject)
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }
}

const projectState = ProjectState.getInstance()

enum ProjectStatus {
    Active,
    Finished
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

type Listener = (items: Project[]) => void

class ProjectList {
    templateElement: HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement
    assignedProjects: any[]

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement
        this.assignedProjects = []

        const content = document.importNode(this.templateElement.content, true)

        this.element = content.firstElementChild as HTMLFormElement
        this.element.id = `${this.type}-projects`

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(p => {
                if(this.type === 'active') {
                    return p.status === ProjectStatus.Active
                }
                return p.status === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        })

        this.attach()
        this.renderContent()
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLElement
        listEl.innerHTML = ''
        for (const item of this.assignedProjects) {
            const li = document.createElement('li')
            li.textContent = item.title
            listEl.appendChild(li)
        }
    }
}

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
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput
            projectState.addProject(title, description, people)
            this.clearInput()

        }
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredTDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true,

        }
        const descriptionValidatable: Validatable = {
            value: enteredTDescription,
            required: true,
            minLength: 10
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        }

        if (
            !validateInput(titleValidatable) ||
            !validateInput(descriptionValidatable) ||
            !validateInput(peopleValidatable)
        ) {
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
const activeProjList = new ProjectList('active')
const finishedprojLish = new ProjectList('finished')