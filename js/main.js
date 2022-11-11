var picker = datepicker("#due-date", {
    formatter: function (input, date, instance) {
        var value = date.toLocaleDateString();
        input.value = value;
    }
});
var ToDoItem = (function () {
    function ToDoItem(desiredTitle, dueDate, isComplete) {
        this.title = desiredTitle;
        this.dueDate = dueDate;
        this.isComplete = isComplete;
    }
    return ToDoItem;
}());
var allToDoItemList = [];
window.onload = function () {
    var addBtn = getByID("addButton");
    var retrieveBtn = getByID("retrieveButton");
    var clearBtn = getByID("clearButton");
    addBtn.addEventListener("click", clearErrMsg);
    addBtn.addEventListener("click", main);
    clearBtn.addEventListener("click", clearLists);
    specialKeyEventListener("title");
    specialKeyEventListener("due-date");
    loadSavedTodoItemList();
};
function main() {
    addToDoItem();
    displayToDoItems(allToDoItemList);
}
function loadSavedTodoItemList() {
    getLocalStorage();
    displayToDoItems(allToDoItemList);
}
function setLocalStorage(list) {
    for (var index in list) {
        var itemString = JSON.stringify(list[index]);
        localStorage.setItem(index, itemString);
    }
}
function getLocalStorage() {
    allToDoItemList = [];
    for (var index in localStorage) {
        var itemFromLocalStorage = localStorage.getItem(index);
        var itemToRetrieve = JSON.parse(itemFromLocalStorage);
        allToDoItemList.push(itemToRetrieve);
    }
}
function itemToggle() {
    var itemDiv = this;
    var index = itemDiv.getAttribute("data-index");
    allToDoItemList[index].isComplete = !allToDoItemList[index].isComplete;
    displayToDoItems(allToDoItemList);
    localStorage.clear();
    setLocalStorage(allToDoItemList);
    allToDoItemList = allToDoItemList.filter(function (value) { return value !== null; });
}
function displayToDoItems(list) {
    getByID("display-div").innerHTML = "";
    list = list.filter(function (value) { return value !== null; });
    for (var index in list) {
        if (!list[index].isComplete) {
            displayItem("incomplete", list, index);
        }
    }
    for (var index in list) {
        if (list[index].isComplete) {
            displayItem("complete", list, index);
        }
    }
}
function displayItem(s, list, index) {
    var displayDiv = getByID("display-div");
    var itemDiv = document.createElement("DIV");
    itemDiv.ondblclick = itemToggle;
    itemDiv.setAttribute("id", "todo-" + s + "-" + index);
    itemDiv.setAttribute("data-index", index);
    itemDiv.setAttribute("data-status", s);
    itemDiv.classList.add("todo-" + s + "-" + index);
    var status = "";
    var itemTitle = document.createElement("h3");
    if (list[index].isComplete) {
        itemTitle.setAttribute("style", "text-decoration: line-through;");
        status += "COMPLETE";
    }
    else {
        status += "INCOMPLETE";
    }
    itemTitle.innerText = list[index].title;
    var itemDueDate = document.createElement("p");
    var dueDate = new Date(list[index].dueDate.toString());
    itemDueDate.innerText = dueDate.toDateString();
    var itemDetails = document.createElement("SPAN");
    itemDetails.classList.add("details");
    itemDetails.onclick = function () { modal.style.display = "block"; };
    itemDetails.innerText = "Details";
    displayDiv.appendChild(itemDiv);
    itemDiv.appendChild(itemTitle);
    itemDiv.appendChild(itemDueDate);
    itemDiv.appendChild(itemDetails);
    var modalDiv = document.createElement("DIV");
    modalDiv.classList.add("modal");
    modalDiv.setAttribute("id", "modal-" + s + "-" + index);
    var modalContentDiv = document.createElement("DIV");
    modalContentDiv.classList.add("modal-content-" + s);
    displayDiv.appendChild(modalDiv);
    modalDiv.appendChild(modalContentDiv);
    var modalContentSpanX = document.createElement("SPAN");
    modalContentSpanX.classList.add("close");
    modalContentSpanX.innerText = "X";
    modalContentSpanX.onclick = function () { modal.style.display = "none"; };
    modalContentDiv.appendChild(modalContentSpanX);
    var modalTitle = itemTitle.cloneNode(true);
    var modalDueDate = itemDueDate.cloneNode(true);
    var modalStatus = document.createElement("SPAN");
    modalStatus.classList.add("status");
    modalStatus.innerText = status;
    modalContentDiv.appendChild(modalTitle);
    modalContentDiv.appendChild(modalDueDate);
    modalContentDiv.appendChild(modalStatus);
    var modal = getByID("modal-" + s + "-" + index);
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}
function getToDoItem() {
    var title = getInputValueByID("title").trim();
    var dueDate = getInputValueByID("due-date");
    var isComplete = getInputByID("is-complete").checked;
    var month = parseInt(dueDate.substring(0, dueDate.indexOf("/")));
    var day = parseInt(dueDate.substring(dueDate.indexOf("/") + 1, dueDate.lastIndexOf("/")));
    var year = parseInt(dueDate.substring(dueDate.lastIndexOf("/") + 1));
    var item = new ToDoItem(title, new Date(year, month - 1, day), isComplete);
    return item;
}
function addToDoItem() {
    addInputEventToClearErrMsg();
    if (localStorage.length > 0) {
        getLocalStorage();
        allToDoItemList = allToDoItemList.filter(function (value) { return value !== null; });
    }
    if (isValid()) {
        var item = getToDoItem();
        allToDoItemList.push(item);
        getByID("todoForm").reset();
    }
    if (allToDoItemList.length > 1) {
        allToDoItemList.sort(function (a, b) { return (a.dueDate >= b.dueDate) ? 1 : -1; });
    }
    localStorage.clear();
    setLocalStorage(allToDoItemList);
}
function clearLists() {
    allToDoItemList = [];
    localStorage.clear();
    displayToDoItems(allToDoItemList);
    clearErrMsg();
    getByID("todoForm").reset();
}
function isValid() {
    addInputEventToClearErrMsg();
    var title = getInputValueByID("title").trim();
    var dueDate = getInputValueByID("due-date").trim();
    var month = parseInt(dueDate.substring(0, dueDate.indexOf("/")));
    var day = parseInt(dueDate.substring(dueDate.indexOf("/") + 1, dueDate.lastIndexOf("/")));
    var year = parseInt(dueDate.substring(dueDate.lastIndexOf("/") + 1));
    var date = new Date(year, month - 1, day + 1);
    var today = new Date();
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
function isValidDate(input) {
    var pattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/g;
    var isCorrectFormat = pattern.test(input);
    return isCorrectFormat;
}
function clearErrMsg() {
    castByID("title-err-msg").innerText = "";
    castByID("due-date-err-msg").innerText = "";
}
function addInputEventToClearErrMsg() {
    getByID("title").addEventListener("input", clearErrMsg);
    getByID("due-date").addEventListener("input", clearErrMsg);
    getByID("is-complete").addEventListener("input", clearErrMsg);
}
function specialKeyEventListener(id) {
    var input = getInputByID(id);
    var addBtn = getByID("addButton");
    input.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addBtn.click();
        }
        if (event.key === "Escape") {
            event.preventDefault();
            getByID("todoForm").reset();
            clearErrMsg();
        }
    });
}
function getByID(id) {
    return document.getElementById(id);
}
function getInputByID(id) {
    return getByID(id);
}
function getInputValueByID(id) {
    return getByID(id).value;
}
function castByID(id) {
    return getByID(id);
}
