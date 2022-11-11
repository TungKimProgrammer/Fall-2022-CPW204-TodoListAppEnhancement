// @ts-ignore: ignoring issue with js-datepicker lack of intellisense

// call datepicker from js library with format m/d/yyyy
const picker = datepicker("#due-date", {
    formatter: (input, date, instance) => {
        const value = date.toLocaleDateString()
        input.value = value // => '1/1/2099'
    }
});
// set minimum past date
// picker.setMin(new Date());

class ToDoItem {
    title: string;
    dueDate: Date;
    isComplete: boolean;

    constructor(desiredTitle: string, dueDate: Date, isComplete: boolean) {
        this.title = desiredTitle;
        this.dueDate = dueDate;
        this.isComplete = isComplete;
    }
}

var allToDoItemList: ToDoItem[] = [];


window.onload = function () {
    let addBtn = <HTMLElement>getByID("addButton");
    let retrieveBtn = <HTMLElement>getByID("retrieveButton");
    let clearBtn = <HTMLElement>getByID("clearButton");
    //addBtn.onclick = addToDoItem;

    addBtn.addEventListener("click", clearErrMsg);
    addBtn.addEventListener("click", main);
    // retrieveBtn.addEventListener("click", loadSavedTodoItemList);
    clearBtn.addEventListener("click", clearLists);

    //let grabChkBoxes = document.querySelectorAll("input[name=checkbox]");
    //grabChkBoxes.addEventListener("click", main);

    // button clicked when 'Enter' key pressed
    // form reset and err msg cleared when 'ESC' key pressed
    specialKeyEventListener("title");
    specialKeyEventListener("due-date");

    loadSavedTodoItemList();

    /* 
        addBtn.onclick = () => {
            clearErrMsg();
            addToDoItem();
        }
    */
}

function main(): void {
    addToDoItem();
    displayToDoItems(allToDoItemList);
}

function loadSavedTodoItemList() {
    getLocalStorage();
    displayToDoItems(allToDoItemList);
}

// Stores ToDoItems in cookies or web storage
function setLocalStorage(list: ToDoItem[]): void {
    for (let index in list) {
        // put the JSON string version of item in localStorage
        let itemString = JSON.stringify(list[index]);
        localStorage.setItem(index, itemString);
    }
}

function getLocalStorage() {
    allToDoItemList = [];
    for (let index in localStorage) {
        // put the JSON string version of item in localStorage
        let itemFromLocalStorage = localStorage.getItem(index);
        let itemToRetrieve: ToDoItem = JSON.parse(itemFromLocalStorage);
        allToDoItemList.push(itemToRetrieve);
    }
    // delete null values added to array caused by JSON
    allToDoItemList = allToDoItemList.filter(function (value) { return value !== null; });
    sortToDoItems();
}

// clear localStorage and set update list
function updateLocalStorage() {
    // clear localStorage and set update list
    localStorage.clear();
    setLocalStorage(allToDoItemList);
    getLocalStorage();
    displayToDoItems(allToDoItemList);
}

// Allows user to double click on each item
// to toggle the status between complete and incomplete
// display updated item list
function itemToggle(): void {
    var itemDiv = <HTMLElement>this;
    let index = itemDiv.getAttribute("data-index");

    // delete null values added to array caused by JSON
    allToDoItemList = allToDoItemList.filter(function (value) { return value !== null; });

    // toggle status
    allToDoItemList[index].isComplete = !allToDoItemList[index].isComplete;

    sortToDoItems();

    displayToDoItems(allToDoItemList);
    
    // clear and update localStorage after toggling
    localStorage.clear();
    setLocalStorage(allToDoItemList);

    // delete null values added to array caused by JSON
    allToDoItemList = allToDoItemList.filter(function (value) { return value !== null; });
}

// display list of ToDoItem
function displayToDoItems(list: ToDoItem[]): void {
    getByID("display-div").innerHTML = "";

    // delete null values added to array caused by JSON
    list = list.filter(function (value) { return value !== null; });
    
    for (let index in list) {
        if (!list[index].isComplete) {
            displayItem("incomplete", list, index);
        }
    }

    for (let index in list) {
        if (list[index].isComplete) {
            displayItem("complete", list, index);
        }
    }
}

function deleteItem() {
    var itemDeleteSpanX = <HTMLElement>this;
    let index = itemDeleteSpanX.getAttribute("data-delete-index");
    allToDoItemList.splice(parseInt(index), 1);
    sortToDoItems();
    updateLocalStorage();

}

/**
 * 
 * @param s "complete" or "incomplete"
 * @param list completeItemList or incompleteItemList
 * @param index 
 */
function displayItem(s: string, list: ToDoItem[], index: string) {
    let displayDiv = getByID("display-div");
    
    // create div to display each item
    let itemDiv = document.createElement("DIV");
    itemDiv.ondblclick = itemToggle;
    itemDiv.setAttribute("data-index", index);
    itemDiv.setAttribute("data-status", s);
    itemDiv.classList.add("todo-" + s + "-" + index);

    // create X to delete item
    let itemDeleteSpanX = document.createElement("SPAN");
    itemDeleteSpanX.classList.add("deleteX");
    itemDeleteSpanX.setAttribute("data-delete-index", index);
    itemDeleteSpanX.innerText = "X";
    itemDeleteSpanX.onclick = deleteItem;

    let status = "";
    let itemTitle = document.createElement("h3");
    if (list[index].isComplete) {
        itemTitle.setAttribute("style", "text-decoration: line-through;");
        status += "COMPLETE";
    } else { status += "INCOMPLETE"; }
    itemTitle.innerText = list[index].title;

    let itemDueDate = document.createElement("p");
    let dueDate = new Date(list[index].dueDate.toString());
    itemDueDate.innerText = dueDate.toDateString();

    let itemDetails = document.createElement("SPAN");
    itemDetails.classList.add("details");
    itemDetails.onclick = function () { modal.style.display = "block"; }
    itemDetails.innerText = "Details";

    displayDiv.appendChild(itemDiv);
    itemDiv.appendChild(itemDeleteSpanX);
    itemDiv.appendChild(itemTitle);
    itemDiv.appendChild(itemDueDate);
    itemDiv.appendChild(itemDetails);

    // create Pop-up Modal display
    let modalDiv = document.createElement("DIV");
    modalDiv.classList.add("modal");
    modalDiv.setAttribute("id", "modal-" + s + "-" + index);

    let modalContentDiv = document.createElement("DIV");
    modalContentDiv.classList.add("modal-content-" + s);
    displayDiv.appendChild(modalDiv);
    modalDiv.appendChild(modalContentDiv);

    let modalContentSpanX = document.createElement("SPAN");
    modalContentSpanX.classList.add("close");
    modalContentSpanX.innerText = "X";
    modalContentSpanX.onclick = function () { modal.style.display = "none"; }
    modalContentDiv.appendChild(modalContentSpanX);

    // clone h3 and p from itemDiv
    let modalTitle = itemTitle.cloneNode(true);
    let modalDueDate = itemDueDate.cloneNode(true);
    let modalStatus = document.createElement("SPAN");
    modalStatus.classList.add("status");
    modalStatus.innerText = status;
    modalContentDiv.appendChild(modalTitle);
    modalContentDiv.appendChild(modalDueDate);
    modalContentDiv.appendChild(modalStatus);

    // Get the modal
    var modal = getByID("modal-" + s + "-" + index);
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

/**
 * Get all input from the form and assign to a ToDoItem object
 */
function getToDoItem(): ToDoItem {
    // get data from the form
    let title = getInputValueByID("title").trim();
    let dueDate = getInputValueByID("due-date");
    let isComplete = getInputByID("is-complete").checked;

    // get year, month, day from input to generate a date for object ToDoItem
    let month = parseInt(dueDate.substring(0, dueDate.indexOf("/")));
    let day = parseInt(dueDate.substring(dueDate.indexOf("/") + 1, dueDate.lastIndexOf("/")));
    let year = parseInt(dueDate.substring(dueDate.lastIndexOf("/") + 1));

    // Create item from input
    let item = new ToDoItem(title, new Date(year, month - 1, day), isComplete);

    return item;
}

/**
 * add ToDoItem to database when all conditions are met
 */
function addToDoItem(): void {
    addInputEventToClearErrMsg();

    if (localStorage.length > 0) {
        getLocalStorage();
        // delete null values added to array caused by JSON
        allToDoItemList = allToDoItemList.filter(function (value) { return value !== null; });
    }

    if (isValid()) {
        let item = getToDoItem();
        allToDoItemList.push(item);
        (<HTMLFormElement>getByID("todoForm")).reset();
    }

    if (allToDoItemList.length > 1) {
        // delete null values added to array caused by JSON
        allToDoItemList = allToDoItemList.filter(function (value) { return value !== null; });
        
        sortToDoItems();
    }

    updateLocalStorage();
}

// sort ToDoItems list by due date, most recent due date on top
function sortToDoItems() {
    // sort ToDoItems list by due date, most recent due date on top
    allToDoItemList.sort((a, b) => (a.dueDate >= b.dueDate) ? 1 : -1);
    //list.sort((a,b) => (a.dueDate > b.dueDate) ? 1 : ((b.dueDate > a.dueDate) ? -1 : 0));
}

// clear ToDoItems
function clearLists(): void {
    allToDoItemList = [];
    localStorage.clear();
    displayToDoItems(allToDoItemList);
    clearErrMsg();
    (<HTMLFormElement>getByID("todoForm")).reset();
}

/**
 * Checks form data is valid
 */
function isValid(): boolean {

    addInputEventToClearErrMsg();
    let title = getInputValueByID("title").trim();
    let dueDate = getInputValueByID("due-date").trim();

    let month = parseInt(dueDate.substring(0, dueDate.indexOf("/")));
    let day = parseInt(dueDate.substring(dueDate.indexOf("/") + 1, dueDate.lastIndexOf("/")));
    let year = parseInt(dueDate.substring(dueDate.lastIndexOf("/") + 1));

    // JS counts month from 0, need to subtract 1 from month
    // day counts at 00:00:00, add 1 to day to count the whole day until mid night
    let date = new Date(year, month - 1, day + 1);
    let today = new Date();

    if (title !== "" &&
        dueDate !== "" &&
        isValidDate(dueDate) &&
        today < date) {
        return true;
    }
    else {
        if (title == "") {
            castByID("title-err-msg").innerText = "Title can't be empty!";
        }
        if (dueDate == "") {
            castByID("due-date-err-msg").innerText = "Due date can't be empty!";
        }
        if (dueDate !== "" && !isValidDate(dueDate)) {
            castByID("due-date-err-msg").innerText = "Due date is not valid!";
        }
        if (today > date) {
            castByID("due-date-err-msg").innerText = "The due date has been passed!";
        }
        return false;
    }
}

/**
 * checks valid date input
 * @param input date
 * @returns true if input date is valid
 */
function isValidDate(input: string): boolean {
    // Validating mm/dd/yyyy or m/d/yyyy
    // \d{1,2}\/d{1,2}\/d{4}
    let pattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/g;
    let isCorrectFormat = pattern.test(input);

    return isCorrectFormat;
}

/**
 * clear validation ul
 */
function clearErrMsg(): void {
    castByID("title-err-msg").innerText = "";
    castByID("due-date-err-msg").innerText = "";
}

/**
 * function that clears error messages user starts typing 
 */
function addInputEventToClearErrMsg() {
    getByID("title").addEventListener("input", clearErrMsg);
    getByID("due-date").addEventListener("input", clearErrMsg);
    getByID("is-complete").addEventListener("input", clearErrMsg);
}

/**
 * execute functions when "Enter" or "ESC" key entered
 * @param event of key pressed
 */
function specialKeyEventListener(id: string): void {
    let input = getInputByID(id);
    let addBtn = <HTMLElement>getByID("addButton");
    // Execute a function when the user presses a key on the keyboard
    input.addEventListener("keyup", function (event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            addBtn.click();
        }

        if (event.key === "Escape") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Reset the form
            (<HTMLFormElement>getByID("todoForm")).reset();
            clearErrMsg();
        }
    });
}

/**
 * short version of document.getElementById()
 * @param id of HTML element
 * @returns document.getElementById(id); 
 */
function getByID(id: string) {
    return document.getElementById(id);
}

/**
 * short version of (<HTMLInputElement>document.getElementById()).value
 * @param id of input textbox
 * @returns value of input textbox
 */
function getInputByID(id: string) {
    return <HTMLInputElement>getByID(id);
}

/**
 * short version of (<HTMLInputElement>document.getElementById()).value
 * @param id of input textbox
 * @returns value of input textbox
 */
function getInputValueByID(id: string) {
    return (<HTMLInputElement>getByID(id)).value;
}

/**
 * short version of (<HTMLElement>document.getElementById())
 * @param id of HTML element
 * @returns <HTMLElement>document.getElementById()
 */
function castByID(id: string) {
    return (<HTMLElement>getByID(id));
}



