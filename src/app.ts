///<reference path="dragDrop-interfaces.ts"/>

namespace App {
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
            isValid = isValid && validatableInput.value >= validatableInput.min
        }
        if (validatableInput.max != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value <= validatableInput.max
        }
    
        return isValid
    }
    
    type Listener<T> = (items: T[]) => void
    
    class State<T> {
        protected listeners: Listener<T>[] = []
    
        addListener(listenerFn: Listener<T>) {
            this.listeners.push(listenerFn)
        }
    }
    
    class ProjectState extends State<Project> {
        private projects: Project[] = []
        private static instance: ProjectState
    
        private constructor() {
            super()
        }
    
        static getInstance() {
            if (this.instance) {
                return this.instance
            }
            this.instance = new ProjectState()
            return this.instance
        }
    
        addProject(title: string, description: string, numOfPeople: number) {
            const newProject = new Project (Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active)
            this.projects.push(newProject)
            this.updateListeners()
        }
    
        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find(p => p.id === projectId)
            console.log('check id', project);
            
    
            if(project && project.status !== newStatus) {
                project.status = newStatus
                this.updateListeners()
            }
        }
    
        private updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice())
            }
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
    
    abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        templateElement: HTMLTemplateElement
        hostElement: T
        element: U
    
        constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
            this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
            this.hostElement = document.getElementById(hostElementId)! as T
    
            const content = document.importNode(this.templateElement.content, true)
    
            this.element = content.firstElementChild as U
            if(newElementId) {
                this.element.id = newElementId
            }
            this.attach(insertAtStart)
        }
    
        private attach(insertAtStart: boolean) {
            this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element)
        }
    
        abstract configure(): void
        abstract renderContent(): void
    }
    
    class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
        private project: Project
    
        get persons() {
            if (this.project.people === 1) {
                return '1 person assigned.'
            } else {
                return `${this.project.people} people assigned.`
            }
        }
    
        constructor(hostId: string, project: Project) {
            super('single-project', hostId, false, project.id)
            this.project = project
    
            this.configure()
            this.renderContent()
        }
    
        configure = () => {
            this.element.addEventListener('dragstart', this.dragStarthandler)
            this.element.addEventListener('dragend', this.dragEndHandler)
        }
    
        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title
            this.element.querySelector('h3')!.textContent = this.persons
            this.element.querySelector('p')!.textContent = this.project.description
        }
    
        dragStarthandler = (event: DragEvent) => {
            event.dataTransfer!.setData('text/plain', this.project.id)
            event.dataTransfer!.effectAllowed = 'move'        
        }
        dragEndHandler(event: DragEvent) {
            console.log('Drag ended');
            
        }
    }
    
    class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
        assignedProjects: any[]
    
        constructor(private type: 'active' | 'finished') {
            super('project-list', 'app', false, `${type}-projects`, )
    
            this.assignedProjects = []
    
            this.configure()
            this.renderContent()
        }
    
        dragOverHandler = (event: DragEvent) => {
            if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault()
                const list = this.element.querySelector('ul')!
                list.classList.add('droppable')
            }
        }
        dropHandler = (event: DragEvent) => {
            const id = event.dataTransfer!.getData('text/plain')
            projectState.moveProject(id, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
            this.dragLeaveHandler(event)
        }
        dragLeaveHandler = (event: DragEvent) => {
            const list = this.element.querySelector('ul')!
            list.classList.remove('droppable')
        }
    
        renderContent() {
            const listId = `${this.type}-projects-list`
            this.element.querySelector('ul')!.id = listId
            this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
        }
    
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler)
            this.element.addEventListener('dragleave', this.dragLeaveHandler)
            this.element.addEventListener('drop', this.dropHandler)
    
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
            console.log('assigned projects', this.assignedProjects);
            
        }
    
        private renderProjects() {
            const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLElement
            listEl.innerHTML = ''
            for (const item of this.assignedProjects) {
                console.log('item', item);
                
                new ProjectItem(this.element.querySelector('ul')!.id, item)
            }
        }
    }
    
    class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
        titleInputElement: HTMLInputElement
        descriptionInputElement: HTMLInputElement
        peopleInputElement: HTMLInputElement
    
        constructor() {
            super('project-input', 'app', true, 'user-input')
            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement
    
            this.configure()
        }
    
    
        configure() {
            this.element.addEventListener('submit', this.submitHandler)
        }
    
        renderContent() {
    
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
}

