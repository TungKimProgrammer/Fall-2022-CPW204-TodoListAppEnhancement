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
var completeItemList: ToDoItem[] = [];
var incompleteItemList: ToDoItem[] = [];
var completeLegendCount = 0;
var incompleteLegendCount = 0;

window.onload = function () {
    let addBtn = <HTMLElement>getByID("addButton");
    let updateBtn = <HTMLElement>getByID("updateButton");
    let clearBtn = <HTMLElement>getByID("clearButton");
    //addBtn.onclick = addToDoItem;

    addBtn.addEventListener("click", clearErrMsg);
    addBtn.addEventListener("click", main);
    updateBtn.addEventListener("click", itemToggle);
    clearBtn.addEventListener("click", clearLists);

    //let grabChkBoxes = document.querySelectorAll("input[name=checkbox]");
    //grabChkBoxes.addEventListener("click", main);

    // button clicked when 'Enter' key pressed
    // form reset and err msg cleared when 'ESC' key pressed
    specialKeyEventListener("title");
    specialKeyEventListener("due-date");

    /* 
        addBtn.onclick = () => {
            clearErrMsg();
            addToDoItem();
        }
    */
}

function main(): void {
    addToDoItem();
    displayToDoItems();
}

// Stores ToDoItems in cookies or web storage
function setCookies(cTitle, cDueDate, cIsComplete): void {

}

function clearLists(): void {
    allToDoItemList = [];
    displayToDoItems();
    clearErrMsg();
    (<HTMLFormElement>getByID("todoForm")).reset();
}

// Allows user to mark a ToDoItem as complete or incomplete
// moves complete and non-complete item between two lists
function itemToggle(): void {

    //mixedItemList = [];
    var itemDiv = <HTMLElement>this;
    let index = itemDiv.getAttribute("data-index");
    allToDoItemList[index].isComplete = !allToDoItemList[index].isComplete;
    displayToDoItems();
}

// display list of added ToDoItem
function displayToDoItems(): void {
    getByID("display-div").innerHTML = "";

    // sort ToDoItems list by due date, most recent due date on top
    allToDoItemList.sort((a, b) => (a.dueDate >= b.dueDate) ? 1 : -1);
    //completeItemList.sort((a,b) => (a.dueDate > b.dueDate) ? 1 : ((b.dueDate > a.dueDate) ? -1 : 0));

    for (let index in allToDoItemList) {
        if (!allToDoItemList[index].isComplete) {
            displayItem("incomplete", allToDoItemList, index);
        }
    }

    for (let index in allToDoItemList) {
        if (allToDoItemList[index].isComplete) {
            displayItem("complete", allToDoItemList, index);
        }
    }
}

function separateItems(list: ToDoItem[]): void {
    // sort ToDoItems list by due date, most recent due date on top
    list.sort((a, b) => (a.dueDate >= b.dueDate) ? 1 : -1);
    //completeItemList.sort((a,b) => (a.dueDate > b.dueDate) ? 1 : ((b.dueDate > a.dueDate) ? -1 : 0));

    completeItemList = [];
    incompleteItemList = [];

    // separate complete and incomplete items to two lists
    for (let i = 0; i < list.length; i++) {
        if (list[i].isComplete) {
            completeItemList.push(list[i]);
        }
        else {
            incompleteItemList.push(list[i]);
        }
    }
}

/**
 * 
 * @param s "complete" or "incomplete"
 * @param list completeItemList or incompleteItemList
 * @param index 
 */
function displayItem(s: string, list: ToDoItem[], index: string) {
    let displayDiv = getByID("display-div");

    let itemDiv = document.createElement("DIV");
    itemDiv.ondblclick = itemToggle;
    itemDiv.setAttribute("id", "todo-" + s + "-" + index);
    itemDiv.setAttribute("data-index", index);
    itemDiv.setAttribute("data-status", s);
    itemDiv.classList.add("todo-" + s + "-" + index);

    let itemTitle = document.createElement("h3");
    if (list[index].isComplete) {
        itemTitle.setAttribute("style", "text-decoration: line-through;");
    }
    itemTitle.innerText = list[index].title;

    let itemDueDate = document.createElement("p");
    itemDueDate.innerText = list[index].dueDate.toDateString();

    displayDiv.appendChild(itemDiv);
    itemDiv.appendChild(itemTitle);
    itemDiv.appendChild(itemDueDate);

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
    if (isValid()) {
        let item = getToDoItem();
        allToDoItemList.push(item);
        (<HTMLFormElement>getByID("todoForm")).reset();
    }
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



