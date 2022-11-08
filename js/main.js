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
var completeItemList = [];
var incompleteItemList = [];
var completeLegendCount = 0;
var incompleteLegendCount = 0;
window.onload = function () {
    var addBtn = getByID("addButton");
    var updateBtn = getByID("updateButton");
    var clearBtn = getByID("clearButton");
    addBtn.addEventListener("click", clearErrMsg);
    addBtn.addEventListener("click", main);
    updateBtn.addEventListener("click", itemToggle);
    clearBtn.addEventListener("click", clearLists);
    specialKeyEventListener("title");
    specialKeyEventListener("due-date");
};
function main() {
    addToDoItem();
    displayToDoItems();
}
function setCookies(cTitle, cDueDate, cIsComplete) {
}
function clearLists() {
    allToDoItemList = [];
    displayToDoItems();
    clearErrMsg();
    getByID("todoForm").reset();
}
function itemToggle() {
    var itemDiv = this;
    var index = itemDiv.getAttribute("data-index");
    allToDoItemList[index].isComplete = !allToDoItemList[index].isComplete;
    displayToDoItems();
}
function displayToDoItems() {
    getByID("display-div").innerHTML = "";
    allToDoItemList.sort(function (a, b) { return (a.dueDate >= b.dueDate) ? 1 : -1; });
    for (var index in allToDoItemList) {
        if (!allToDoItemList[index].isComplete) {
            displayItem("incomplete", allToDoItemList, index);
        }
    }
    for (var index in allToDoItemList) {
        if (allToDoItemList[index].isComplete) {
            displayItem("complete", allToDoItemList, index);
        }
    }
}
function separateItems(list) {
    list.sort(function (a, b) { return (a.dueDate >= b.dueDate) ? 1 : -1; });
    completeItemList = [];
    incompleteItemList = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i].isComplete) {
            completeItemList.push(list[i]);
        }
        else {
            incompleteItemList.push(list[i]);
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
    var itemTitle = document.createElement("h3");
    if (list[index].isComplete) {
        itemTitle.setAttribute("style", "text-decoration: line-through;");
    }
    itemTitle.innerText = list[index].title;
    var itemDueDate = document.createElement("p");
    itemDueDate.innerText = list[index].dueDate.toDateString();
    displayDiv.appendChild(itemDiv);
    itemDiv.appendChild(itemTitle);
    itemDiv.appendChild(itemDueDate);
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
    if (isValid()) {
        var item = getToDoItem();
        allToDoItemList.push(item);
        getByID("todoForm").reset();
    }
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
