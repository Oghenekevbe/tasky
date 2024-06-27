
$(document).ready(function () {

    //getting our csrf token for our crud apis
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {

            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie("csrftoken");

    // jwt tokens for the crud APIs
    const jwtAccessToken = window.jwt_access_token;
    const jwtRefreshToken = window.jwt_refresh_token;

    // Function to check if the JWT token is expired
    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp < Date.now() / 1000;
        } catch (e) {
            alert("Failed to parse token: ");
            return true;
        }
    }

    // Function to refresh the JWT access token using the refresh token
    function refreshToken() {
        return $.ajax({
            url: "api/token/refresh/",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                "refresh": jwtRefreshToken
            })
        }).then((data) => {
            window.jwt_access_token = data.access;
        }).catch((error) => {
            alert("Error refreshing token ");
            throw error;
        });
    }

    // Function to fetch tasks, with token expiry check and refresh logic
    function fetchTasks() {
        if (isTokenExpired(window.jwt_access_token)) {
            refreshToken().then(() => {
                // Token is refreshed, proceed to load tasks
                loadTasks();
            }).catch(() => {
                alert("Session expired. Please log in again.");
            });
        } else {
            // Token is still valid, load tasks
            loadTasks();
        }
    }


    // Call fetchTasks to initiate the process
    fetchTasks();



    // CRUD METHODS FOR APIS GOTTEN FROM THE BACKEND

    //GET TASKS

    function loadTasks(searchTerm = "") {
        const priority = $("#filter-priority").val();
        const category = $("#filter-category").val();
        const sortDueDate = $("#sort-due-date").val();

        // Reset counters
        let inProgressCount = 0;
        let completedCount = 0;
        let overdueCount = 0;

        $.ajax({
            url: "api/tasks/",
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtAccessToken}`,
                "Content-Type": "application/json"
            },
            success: function (data) {
                $("#in-progress-container").empty();
                $("#completed-container").empty();
                $("#overdue-container").empty();

                // Filter tasks
                let filteredTasks = data.filter(task => {
                    return (priority === "" || task.priority === priority) &&
                        (category === "" || task.category === category) &&
                        (searchTerm === "" || (task && task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())));
                });

                // Sort tasks by due date
                filteredTasks.sort((a, b) => {
                    const dateA = new Date(a.due_date);
                    const dateB = new Date(b.due_date);

                    // Handle sorting for "In Progress" and "Completed" statuses
                    if ((a.status.toLowerCase() === "in progress" || a.status.toLowerCase() === "completed") &&
                        (b.status.toLowerCase() === "in progress" || b.status.toLowerCase() === "completed")) {
                        if (sortDueDate === "asc") {
                            return dateA - dateB; // Ascending order
                        } else if (sortDueDate === "desc") {
                            return dateB - dateA; // Descending order
                        }
                    }

                    // Handle sorting for "Overdue" status
                    if (a.status.toLowerCase() === "overdue" && b.status.toLowerCase() === "overdue") {
                        if (sortDueDate === "asc") {
                            return dateB - dateA; // Descending order for overdue tasks
                        } else if (sortDueDate === "desc") {
                            return dateA - dateB; // Ascending order for overdue tasks
                        }
                    }

                    // Handle cases where one task is "In Progress"/"Completed" and the other is "Overdue"
                    if ((a.status.toLowerCase() === "in progress" || a.status.toLowerCase() === "completed") &&
                        b.status.toLowerCase() === "overdue") {
                        if (sortDueDate === "asc") {
                            return -1; // "In Progress"/"Completed" before "Overdue"
                        } else if (sortDueDate === "desc") {
                            return 1; // "Overdue" before "In Progress"/"Completed"
                        }
                    }

                    if (a.status.toLowerCase() === "overdue" &&
                        (b.status.toLowerCase() === "in progress" || b.status.toLowerCase() === "completed")) {
                        if (sortDueDate === "asc") {
                            return 1; // "Overdue" after "In Progress"/"Completed"
                        } else if (sortDueDate === "desc") {
                            return -1; // "In Progress"/"Completed" after "Overdue"
                        }
                    }

                    return 0; // Default case
                });

                // Count tasks and render
                filteredTasks.forEach(task => {
                    const humanizedDate = moment(task.due_date).fromNow();
                    const formattedDate = moment(task.due_date).format("DD/MM/YYYY");

                    //get priority for styling
                    const getPriorityStyles = (priority) => {
                        switch (priority.toLowerCase()) {
                            case 'high':
                                return {
                                    priorityClass: 'bg-red-200 text-red-800',
                                    buttonClass: 'text-red-600',
                                };
                            case 'medium':
                                return {
                                    priorityClass: 'bg-orange-200 text-orange-800',
                                    buttonClass: 'text-orange-600',
                                };
                            case 'low':
                                return {
                                    priorityClass: 'bg-gray-200 text-green-800',
                                    buttonClass: 'text-green-600',
                                };
                            default:
                                return {
                                    priorityClass: 'bg-gray-200 text-gray-800',
                                    buttonClass: 'text-gray-600',
                                };
                        }
                    };

                    const priorityStyles = getPriorityStyles(task.priority);

                    const taskHtml = `
                        <div id="task" class="container task  rounded-md space-y-4" data-task-id="${task.id}">
                            <div class="flex space-x-2">
                                <button class="priority px-2 py-1 font-semibold  rounded-sm shadow-md text-xs ${priorityStyles.priorityClass}">
                                    ${task.priority}
                                </button>
                                <button class="due_date bg-white font-semibold text-violet-500 px-2 py-1 rounded-md shadow-md text-xs" data-due-date="${task.due_date}">
                                    ${task.status.toLowerCase() === "completed" ? formattedDate : humanizedDate}
                                </button>
                                <button class="category bg-gray-200 font-semibold text-blue-500 px-2 py-0.5 rounded-md shadow-md text-xs">
                                    ${task.category}
                                </button>
                            </div>
                            <div class="container rounded-lg bg-gray-100 p-2 h-28">
                                <div class="flex flex-row-reverse">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical text-gray-500" viewBox="0 0 16 16">
                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                    </svg>
                                </div>
                                <h6 class="font-semibold text-balance text-gray-900">${task.title}</h6>
                                <h6 class="description text-sm text-gray-500 truncate max-h-72">${task.description}</h6>
                                <ul class="title flex justify-end">
                                    <li class="get-task-button text-xs text-blue-400 cursor-pointer" data-task-id="${task.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye mt-1" viewBox="0 0 16 16">
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                                        </svg>
                                    </li>
                                    <li class="text-xs text-blue-400 px-3 py-1 edit-button cursor-pointer" data-task-id="${task.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                                        </svg>
                                    </li>
                                    <li class="text-blue-400 text-xs px-3 py-1 delete-button -ml-4  cursor-pointer" data-task-id="${task.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                        </svg>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;

                    // Increment counters based on task status
                    switch (task.status.toLowerCase()) {
                        case "in progress":
                            $("#in-progress-container").append(taskHtml);
                            inProgressCount++;
                            break;
                        case "completed":
                            $("#completed-container").append(taskHtml);
                            completedCount++;
                            break;
                        case "overdue":
                            $("#overdue-container").append(taskHtml);
                            overdueCount++;
                            break;
                        default:
                            break;
                    }
                });

                // Update counters in UI
                $("#in-progress-count").text(` (${inProgressCount})`);
                $("#completed-count").text(` (${completedCount})`);
                $("#overdue-count").text(` (${overdueCount})`);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error loading tasks");
            }
        });
    }

    // Initial load of tasks
    loadTasks("");


    // this will reload the dom without page refresh every five minues
    setInterval(loadTasks, 300000);





    //GETTING A SINGLE TASK / GET TASK BY ID

    // Initialize modal dialog
    $("#task-modal").dialog({
        autoOpen: false,
        modal: true,
        width: 500,
        buttons: {
            "Close": function () {
                $(this).dialog("close");
            }
        }
    });

    // Handle get task button click
    $(".container").on("click", ".get-task-button", function () {
        const taskId = $(this).data("task-id");
        getTaskById(taskId);
    });

    // Function to fetch task details by ID
    function getTaskById(taskId) {
        const url = `/api/tasks/${taskId}/`;

        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtAccessToken}`,
                "Content-Type": "application/json"
            },
            success: function (task) {
                // Populate task details
                $("#task-title").text(task.title);
                $("#task-description").text(task.description);
                $("#task-due-date").text(task.due_date);
                $("#task-status").text(task.status);
                $("#task-priority").text(task.priority);
                $("#task-category").text(task.category);
                $("#task-assigned-to").text(task.assigned_to);

                // Open modal to display task details
                $("#task-modal").dialog("open");
            },
            error: function (xhr, status, error) {

                alert("Error deleting task");
            }
        });
    }




    //CREATING A TASK

    // Initialize the modals
    $("#create-task-modal").dialog({
        autoOpen: false,
        modal: true,
        width: 500,
        buttons: {
            "Submit": function () {
                $("#CreateTaskForm").submit(); // Trigger form submission for create
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });


    // Add Task button click event
    $("#addTaskButton").click(function () {
        // Clear the form and set action to "create"
        $("#CreateTaskForm")[0].reset();
        $("#create-task-modal").dialog("open");
    });


    // Handle form submission for creating a new task
    $("#CreateTaskForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        // Validation check
        if (
            !$("#title").val().trim() ||
            !$("#description").val().trim() ||
            !$(".datetimepicker").val().trim() ||
            !$("#status").val().trim() ||
            !$("#priority").val().trim() ||
            !$("#category").val().trim() ||
            !$("#assigned_to").val().trim()
        ) {
            alert("All fields are required");
            return; // Stop further execution if validation fails
        }
        const rawDueDate = $(".datetimepicker").val();
        const formattedDueDate = new Date(rawDueDate).toISOString();

        const formData = {
            title: $("#title").val(),
            description: $("#description").val(),
            due_date: formattedDueDate,
            status: $("#status").val(),
            priority: $("#priority").val(),
            category: $("#category").val(),
            assigned_to: $("#assigned_to").val(),
        };
        const data = JSON.stringify(formData);



        // AJAX POST request for creating a new task
        $.ajax({
            url: "api/tasks/",
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwtAccessToken}`,
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            data: data,
            success: function (response) {
                $("#create-task-modal").dialog("close");
                alert("Task created successfully");
                loadTasks();
            },
            error: function (xhr, status, error) {
                alert("Error submitting task");
            }
        });
    });

    // EDITING A TASK


    // Handle edit button click
    $(".container").on("click", ".edit-button", function () {
        const taskId = $(this).data("task-id");
        editTask(taskId);
    });

    // Initialize edit task modal
    $("#edit-task-modal").dialog({
        autoOpen: false,
        modal: true,
        width: 500,
        buttons: {
            "Submit": function () {
                $("#EditTaskForm").submit(); // Trigger form submission for edit
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });

    // Function to fetch and populate task details for editing
    function editTask(taskId) {
        const url = `/api/tasks/${taskId}/`;

        // Fetch task details
        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtAccessToken}`,
                "Content-Type": "application/json",
            },
            success: function (task) {
                // Populate form fields with task details
                $("#EditTaskForm #title").val(task.title);
                $("#EditTaskForm #description").val(task.description);
                $("#EditTaskForm .datetimepicker").val(moment(task.due_date).format("YYYY/MM/DD HH:mm"));
                $("#EditTaskForm #status").val(task.status);
                $("#EditTaskForm #priority").val(task.priority);
                $("#EditTaskForm #category").val(task.category);
                $("#EditTaskForm #assigned_to").val(task.assigned_to);

                // Set hidden field value to "edit" and task ID
                $("#EditTaskForm #task_action").val(taskId);

                // Open modal for editing
                $("#edit-task-modal").dialog("open");

                // Handle form submission for editing a task
                $("#EditTaskForm").off('submit').on('submit', function (event) {
                    event.preventDefault(); // Prevent default form submission

                    // Validation check
                    if (
                        !$("#EditTaskForm #title").val().trim() ||
                        !$("#EditTaskForm #description").val().trim() ||
                        !$("#EditTaskForm .datetimepicker").val().trim() ||
                        !$("#EditTaskForm #status").val().trim() ||
                        !$("#EditTaskForm #priority").val().trim() ||
                        !$("#EditTaskForm #category").val().trim() ||
                        !$("#EditTaskForm #assigned_to").val().trim()
                    ) {
                        alert("All fields are required");
                        return; // Stop further execution if validation fails
                    }

                    const taskId = $("#EditTaskForm #task_action").val();
                    const rawDueDate = $("#EditTaskForm .datetimepicker").val();

                    // Validate and parse the date
                    const momentDate = moment(rawDueDate, "YYYY/MM/DD HH:mm", true);
                    if (!momentDate.isValid()) {
                        alert("Invalid date format. Please enter a valid date.");
                        return;
                    }

                    const formattedDueDate = new Date(rawDueDate).toISOString();

                    const formData = {
                        title: $("#EditTaskForm #title").val(),
                        description: $("#EditTaskForm #description").val(),
                        due_date: formattedDueDate,
                        status: $("#EditTaskForm #status").val(),
                        priority: $("#EditTaskForm #priority").val(),
                        category: $("#EditTaskForm #category").val(),
                        assigned_to: $("#EditTaskForm #assigned_to").val(),
                    };

                    // AJAX PUT request for updating a task
                    $.ajax({
                        url: `api/tasks/${taskId}/`,
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${jwtAccessToken}`,
                            "Content-Type": "application/json",
                            "X-CSRFToken": csrftoken
                        },
                        data: JSON.stringify(formData), // Stringify the form data
                        success: function (response) {
                            $("#edit-task-modal").dialog("close");
                            alert("Task updated successfully");
                            loadTasks(); // Reload tasks after update
                        },
                        error: function (xhr, status, error) {

                            alert("Error updating task");
                        }
                    });
                });
            },
            error: function (xhr, status, error) {

                alert("Error retrieving task");
            }
        });
    }





    // DELETING A TASK


    // Attach click event listener to delete buttons
    $(".container").on("click", ".delete-button", function () {
        const taskId = $(this).data("task-id");

        // Open confirmation dialog
        $("#delete-task-dialog").dialog({
            modal: true,
            resizable: false,
            buttons: {
                Yes: function () {
                    $(this).dialog("close"); // Close the dialog on Yes
                    deleteTask(taskId); // Call delete function
                },
                No: function () {
                    $(this).dialog("close"); // Close the dialog on No
                }
            }
        });
    });

    // Function to handle task deletion
    function deleteTask(taskId) {
        // AJAX DELETE request
        $.ajax({
            url: `api/tasks/${taskId}/`,
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${jwtAccessToken}`,
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            success: function (response) {
                alert("Task deleted successfully");
                loadTasks(); // Refresh task list after deletion
            },
            error: function (xhr, status, error) {

                alert("Error deleting task");
            }
        });
    }

    // Make tasks draggable
    $("#in-progress-container, #completed-container, #overdue-container").sortable({
        connectWith: "#in-progress-container, #completed-container, #overdue-container",
        placeholder: "ui-state-highlight",
        opacity: 0.6,
        revert: true,
        stop: function (event, ui) {
            const taskId = ui.item.data("task-id");
            let newStatus = ui.item.parent().attr("id").replace("-container", "");

            // Capitalize first letter for consistency
            newStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

            if (newStatus === "In-progress") {
                newStatus = "In Progress"; // Correct assignment if the status is "In-progress"
            }

            updateTaskStatus(taskId, newStatus);
        }
    }).disableSelection();

    function updateTaskStatus(taskId, newStatus) {
        const url = `/api/tasks/${taskId}/`;

        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtAccessToken}`,
                "Content-Type": "application/json",
            },
            success: function (task) {
                // AJAX PUT request to update task
                const formData = {
                    title: task.title,
                    description: task.description,
                    due_date: task.due_date,
                    status: newStatus,
                    priority: task.priority,
                    category: task.category,
                    assigned_to: task.assigned_to,
                };

                const data = JSON.stringify(formData);

                $.ajax({
                    url: url,
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${jwtAccessToken}`,
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrftoken,
                    },
                    data: data,
                    success: function (response) {
                        alert("Task status updated successfully. Please endeavor to edit the task due date immediately");
                        loadTasks(); // Reload tasks after update
                    },
                    error: function (xhr, status, error) {

                        alert("Error updating task");
                    }
                });
            },
            error: function (xhr, status, error) {

                alert("Error retrieving task");
            }
        });
    }


    // Initialize modal dialog for highlighted elements
    $("#task-modal").dialog({
        autoOpen: false,
        modal: true,
        width: 500,
        buttons: {
            "Close": function () {
                $(this).dialog("close");
            }
        }
    });



    // Handle task click to highlight
    let highlightedElement = null;

    $(".container").on("click", "#task", function () {
        if ($(this).is(highlightedElement)) {
            // If already highlighted, remove styles
            $(this).find("*").removeAttr("style");
            highlightedElement = null;
        } else {
            // Remove styles from previously highlighted element, if any
            if (highlightedElement) {
                highlightedElement.find("*").removeAttr("style");
            }

            // Add inline styles for highlighting
            $(this).find("*").attr("style", "color: #2563eb; border: 0.5px lightblue;");
            highlightedElement = $(this);
        }
    });


    // Handle get highlighted task button click
    $("#get-highlighted-task-button").on("click", function () {
        if (highlightedElement) {
            const taskId = highlightedElement.data("task-id");
            getTaskById(taskId);

        } else {
            alert("No task is highlighted.");
        }
    });


    // Initialize datetimepicker for due_date field
    $(".datetimepicker").datetimepicker({
        dateFormat: "yy-mm-dd",
        timeFormat: "HH:mm",
        changeMonth: true,
        changeYear: true,
        controlType: "select",
        oneLine: true
    });


    // Implement search functionality
    $("#search").on("input", function () {
        loadTasks($(this).val());
    });


    // Function to handle toggling sort options visibility

    // Hide filter and sort-container by default
    $("#sort-container").hide();
    $("#filter-container").hide();


    function toggleSort() {
        $("#sort-container").toggle();
    }

    // Function to handle toggling filter options visibility
    function toggleFilter() {
        $("#filter-container").toggle();
    }

    // Event listener for the sort button
    $("#toggle-sort-button").click(function () {
        toggleSort();
    });

    // Event listener for the filter button
    $("#toggle-filter-button").click(function () {
        toggleFilter();
    });

    // Event listener for changes in filters or sort options
    $("#filter-priority, #filter-category, #sort-due-date").change(function () {
        loadTasks(); // Reload tasks when any filter or sort option changes
    });


    //event listener for hiding profile details
    // Hide the change password and logout initially
    $('#change-password, #logout').hide();

    // Add click event handler to profile-click
    $('#profile-click').click(function () {
        $('#change-password, #logout').toggle();
    });




});

