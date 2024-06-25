$(document).ready(function () {

    //getting our csrf token for our crud apis
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {

            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // jwt tokens for the crud APIs
    const jwtAccessToken = window.jwt_access_token;
    const jwtRefreshToken = window.jwt_refresh_token;

    // Function to check if the JWT token is expired
    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp < Date.now() / 1000;
        } catch (e) {
            alert('Failed to parse token: ' + e.message);
            return true;
        }
    }

    // Function to refresh the JWT access token using the refresh token
    function refreshToken() {
        return $.ajax({
            url: 'api/token/refresh/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                'refresh': jwtRefreshToken
            })
        }).then((data) => {
            window.jwt_access_token = data.access;
        }).catch((error) => {
            alert('Error refreshing token: ' + error.message);
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
                alert('Session expired. Please log in again.');
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

    function loadTasks(searchTerm = '') {
        const priority = $('#filter-priority').val();
        const category = $('#filter-category').val();
        const sortDueDate = $('#sort-due-date').val();

        $.ajax({
            url: 'api/tasks/',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccessToken}`,
                'Content-Type': 'application/json'
            },
            success: function (data) {
                $('#in-progress-container').empty();
                $('#completed-container').empty();
                $('#overdue-container').empty();

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

                    // Handle sorting for 'In Progress' and 'Completed' statuses
                    if ((a.status.toLowerCase() === 'in progress' || a.status.toLowerCase() === 'completed') &&
                        (b.status.toLowerCase() === 'in progress' || b.status.toLowerCase() === 'completed')) {
                        if (sortDueDate === 'asc') {
                            return dateA - dateB; // Ascending order
                        } else if (sortDueDate === 'desc') {
                            return dateB - dateA; // Descending order
                        }
                    }

                    // Handle sorting for 'Overdue' status
                    if (a.status.toLowerCase() === 'overdue' && b.status.toLowerCase() === 'overdue') {
                        if (sortDueDate === 'asc') {
                            return dateB - dateA; // Descending order for overdue tasks
                        } else if (sortDueDate === 'desc') {
                            return dateA - dateB; // Ascending order for overdue tasks
                        }
                    }

                    // Handle cases where one task is 'In Progress'/'Completed' and the other is 'Overdue'
                    if ((a.status.toLowerCase() === 'in progress' || a.status.toLowerCase() === 'completed') &&
                        b.status.toLowerCase() === 'overdue') {
                        if (sortDueDate === 'asc') {
                            return -1; // 'In Progress'/'Completed' before 'Overdue'
                        } else if (sortDueDate === 'desc') {
                            return 1; // 'Overdue' before 'In Progress'/'Completed'
                        }
                    }

                    if (a.status.toLowerCase() === 'overdue' &&
                        (b.status.toLowerCase() === 'in progress' || b.status.toLowerCase() === 'completed')) {
                        if (sortDueDate === 'asc') {
                            return 1; // 'Overdue' after 'In Progress'/'Completed'
                        } else if (sortDueDate === 'desc') {
                            return -1; // 'In Progress'/'Completed' after 'Overdue'
                        }
                    }

                    return 0; // Default case
                });

                // Render tasks
                filteredTasks.forEach(task => {
                    const humanizedDate = moment(task.due_date).fromNow();
                    const formattedDate = moment(task.due_date).format('DD/MM/YYYY');

                    const taskHtml = `
                                    <div id="task" class="task p-4 rounded w-49 divide-y-4">
                                    <div class="flex space-x-2">
                                        <button class="priority bg-blue-500 text-white px-2 py-1 rounded shadow-sm">
                                        ${task.priority}
                                        </button>
                                        <button class="due_date bg-blue-500 text-white px-2 py-1 rounded shadow-sm" data-due-dat="${task.due_date}">
                                        ${task.status.toLowerCase() === 'completed' ? formattedDate : humanizedDate}
                                        </button>
                                        <button class="category bg-blue-500 text-white px-2 py-1 rounded shadow-sm">
                                        ${task.category}
                                        </button>
                                    </div>
                                    <div class=" bg-white shadow-md p-2">
                                    <h2 class="text-xl font-semibold text-balance">${task.title}</h2>
                                    <h6 class="description text-pretty">${task.description}</h6>
                                    <div class="title flex justify-end space-x-2">
                                        <button class="get-task-button" data-task-id="${task.id}">Get Task</button>
                                        <button class="bg-green-500 text-white px-4 py-2 rounded edit-button" data-task-id="${task.id}">Edit</button>
                                        <button class="bg-red-500 delete-button text-white px-4 py-2 rounded" data-task-id="${task.id}">Delete</button>
                                    </div>
                                    </div>
                                    
                                    </div>
                    `;
                    switch (task.status.toLowerCase()) {
                        case 'in progress':
                            $('#in-progress-container').append(taskHtml);
                            break;
                        case 'completed':
                            $('#completed-container').append(taskHtml);
                            break;
                        case 'overdue':
                            $('#overdue-container').append(taskHtml);
                            break;
                        default:
                            break;
                    }
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                const errorMessage = xhr.responseText;
                alert('Error deleting task: ' + errorMessage);

            }
        });
    }

    // Initial load of tasks
    loadTasks('');


    // this will reload the dom without page refresh every five minues
    setInterval(loadTasks, 300000);





    //GETTING A SINGLE TASK

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
    $('.container').on('click', '.get-task-button', function () {
        const taskId = $(this).data('task-id');
        getTaskById(taskId);
    });

    // Function to fetch task details by ID
    function getTaskById(taskId) {
        const url = `/api/tasks/${taskId}/`;
        $.ajax({
            url: url,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccessToken}`,
                'Content-Type': 'application/json'
            },
            success: function (task) {
                // Populate task details
                $('#task-title').text(task.title);
                $('#task-description').text(task.description);
                $('#task-due-date').text(task.due_date);
                $('#task-status').text(task.status);
                $('#task-priority').text(task.priority);
                $('#task-category').text(task.category);
                $('#task-assigned-to').text(task.assigned_to);

                // Open modal to display task details
                $("#task-modal").dialog("open");
            },
            error: function (xhr, status, error) {
                const errorMessage = xhr.responseText;
                alert('Error deleting task: ' + errorMessage);
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
            !$('#title').val().trim() ||
            !$('#description').val().trim() ||
            !$('.datetimepicker').val().trim() ||
            !$('#status').val().trim() ||
            !$('#priority').val().trim() ||
            !$('#category').val().trim() ||
            !$('#assigned_to').val().trim()
        ) {
            alert("All fields are required");
            return; // Stop further execution if validation fails
        }
        const rawDueDate = $('.datetimepicker').val();
        const formattedDueDate = new Date(rawDueDate).toISOString();

        const formData = {
            title: $('#title').val(),
            description: $('#description').val(),
            due_date: formattedDueDate,
            status: $('#status').val(),
            priority: $('#priority').val(),
            category: $('#category').val(),
            assigned_to: $('#assigned_to').val(),
        };



        // AJAX POST request for creating a new task
        $.ajax({
            url: 'api/tasks/',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtAccessToken}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            data: formData,
            success: function (response) {
                $("#create-task-modal").dialog("close");
                alert("Task created successfully");
                loadTasks();
            },
            error: function (xhr, status, error) {
                const errorMessage = xhr.responseText;
                alert('Error submitting task: ' + errorMessage);
            }
        });
    });

    // EDITING A TASK


    // Handle edit button click
    $('.container').on('click', '.edit-button', function () {
        const taskId = $(this).data('task-id');
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
        $.ajax({
            url: `/api/tasks/${taskId}/`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccessToken}`,
                'Content-Type': 'application/json',
            },
            success: function (task) {
                // Populate form fields with task details
                $('#EditTaskForm #title').val(task.title);
                $('#EditTaskForm #description').val(task.description);
                $('#EditTaskForm .datetimepicker').val(moment(task.due_date).format('YYYY/MM/DD HH:mm'));
                $('#EditTaskForm #status').val(task.status);
                $('#EditTaskForm #priority').val(task.priority);
                $('#EditTaskForm #category').val(task.category);
                $('#EditTaskForm #assigned_to').val(task.assigned_to);

                // Set hidden field value to "edit" and task ID
                $("#EditTaskForm #task_action").val(taskId);

                // Open modal for editing
                $("#edit-task-modal").dialog("open");
            },
            error: function (xhr, status, error) {
                const errorMessage = xhr.responseText;
                alert('Error deleting task: ' + errorMessage);
            }
        });
    }

    // Handle form submission for editing a task
    $("#EditTaskForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        // Validation check
        if (
            !$('#EditTaskForm #title').val().trim() ||
            !$('#EditTaskForm #description').val().trim() ||
            !$('#EditTaskForm .datetimepicker').val().trim() ||
            !$('#EditTaskForm #status').val().trim() ||
            !$('#EditTaskForm #priority').val().trim() ||
            !$('#EditTaskForm #category').val().trim() ||
            !$('#EditTaskForm #assigned_to').val().trim()
        ) {
            alert("All fields are required");
            return; // Stop further execution if validation fails
        }

        const taskId = $("#EditTaskForm #task_action").val();
        const rawDueDate = $('#EditTaskForm .datetimepicker').val();

        // Validate and parse the date
        const momentDate = moment(rawDueDate, 'YYYY/MM/DD HH:mm', true);
        if (!momentDate.isValid()) {
            alert('Invalid date format. Please enter a valid date.');
            return;
        }

        const formattedDueDate = new Date(rawDueDate).toISOString();

        const formData = {
            title: $('#EditTaskForm #title').val(),
            description: $('#EditTaskForm #description').val(),
            due_date: formattedDueDate,
            status: $('#EditTaskForm #status').val(),
            priority: $('#EditTaskForm #priority').val(),
            category: $('#EditTaskForm #category').val(),
            assigned_to: $('#EditTaskForm #assigned_to').val(),
        };



        // AJAX PUT request for updating a task
        $.ajax({
            url: `api/tasks/${taskId}/`,

            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtAccessToken}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            data: formData,
            success: function (response) {
                $("#edit-task-modal").dialog("close");
                alert("Task updated successfully");
                loadTasks(); // Assume there's a function to reload tasks
            },
            error: function (xhr, status, error) {
                const errorMessage = xhr.responseText;
                alert('Error updating task: ' + errorMessage);
            }
        });
    });







    // DELETING A TASK


    // Handle delete button click
    $('.container').on('click', '.delete-button', function () {
        const taskId = $(this).data('task-id');
        ConfirmDialog('Are you sure you want to delete this task?', function () {
            deleteTask(taskId);
        });
    });

    function ConfirmDialog(message, onConfirm) {
        $('<div></div>').appendTo('body')
            .html('<div><h6>' + message + '</h6></div>')
            .dialog({
                modal: true,
                title: 'Delete Task',
                zIndex: 10000,
                autoOpen: true,
                width: 'auto',
                resizable: false,
                buttons: {
                    Yes: function () {
                        onConfirm();
                        $(this).dialog("close");
                    },
                    No: function () {
                        $(this).dialog("close");
                    }
                },
                close: function (event, ui) {
                    $(this).remove();
                }
            });
    }

    function deleteTask(taskId) {

        // AJAX DELETE request
        $.ajax({
            url: `api/tasks/${taskId}/`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtAccessToken}`,
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            success: function (response) {
                alert("Task deleted successfully");
                loadTasks(); // Refresh task list after deletion
            },
            error: function (xhr, status, error) {
                const errorMessage = xhr.responseText;
                alert('Error deleting task: ' + errorMessage);
            }
        });
    }




    // Make tasks draggable
    $('#in-progress-container, #completed-container, #overdue-container').sortable({
        connectWith: '#in-progress-container, #completed-container, #overdue-container',
        placeholder: "ui-state-highlight",
        opacity: 0.6,
        revert: true,
        stop: function (event, ui) {
            const taskId = ui.item.data('task-id');
            let newStatus = ui.item.parent().attr('id').replace('-container', '');

            // Capitalize first letter for consistency
            newStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

            if (newStatus === 'In-progress') {
                newStatus = 'In Progress'; // Correct assignment if the status is 'In-progress'
            }

            updateTaskStatus(taskId, newStatus);
        }


    }).disableSelection();





    function updateTaskStatus(taskId, newStatus) {
        const url = `/api/tasks/${taskId}/`;

        $.ajax({
            url: url,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtAccessToken}`,
                'Content-Type': 'application/json',
            },
            success: function (task) {

                // Populate form fields with task details
                $('#EditTaskForm #title').val(task.title);
                $('#EditTaskForm #description').val(task.description);
                $('#EditTaskForm .datetimepicker').val(moment(task.due_date).format('YYYY/MM/DD HH:mm'));
                $('#EditTaskForm #status').val(newStatus);
                $('#EditTaskForm #priority').val(task.priority);
                $('#EditTaskForm #category').val(task.category);
                $('#EditTaskForm #assigned_to').val(task.assigned_to);

                // Set hidden field value to "edit" and task ID
                $("#EditTaskForm #task_action").val(taskId);


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

                const csrftoken = $('input[name="csrfmiddlewaretoken"]').val();

                $.ajax({
                    url: url,
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${jwtAccessToken}`,
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    data: formData,
                    success: function (response) {
                        alert('Task status updated successfully. Please endeavour to edit the task due date immediately');
                        loadTasks(); // Reload tasks after update
                    },
                    error: function (xhr, status, error) {
                        const errorMessage = xhr.responseText;
                        alert('Error deleting task: ' + errorMessage);
                    }
                });

            },
            error: function (xhr, status, error) {
                const errorMessage = xhr.responseText;
                alert('Error deleting task: ' + errorMessage);
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

    // Variable to store the currently highlighted element
    let highlightedElement;

    // Handle task click to highlight
    $('.container').on('click', '#task', function () {
        if (highlightedElement) {
            highlightedElement.removeAttr('style'); // Remove previous styles
        }

        // Add inline styles for highlighting
        $(this).attr('style', 'background-color: lightblue; border: 1px solid blue; font-weight: bold;');

        highlightedElement = $(this);
    });

    // Handle get highlighted task button click
    $('#get-highlighted-task-button').on('click', function () {
        if (highlightedElement) {
            const taskId = highlightedElement.data('task-id');
            getTaskById(taskId);
        } else {
            alert('No task is highlighted.');
        }
    });


    // Initialize datetimepicker for due_date field
    $('.datetimepicker').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm',
        changeMonth: true,
        changeYear: true,
        controlType: 'select',
        oneLine: true
    });


    // Implement search functionality
    $('#search').on('input', function () {
        loadTasks($(this).val());
    });


    // Function to handle toggling sort options visibility

    // Hide filter and sort-container by default
    $('#sort-container').hide();
    $('#filter-container').hide();


    function toggleSort() {
        $('#sort-container').toggle();
    }

    // Function to handle toggling filter options visibility
    function toggleFilter() {
        $('#filter-container').toggle();
    }

    // Event listener for the sort button
    $('#toggle-sort-button').click(function () {
        toggleSort();
    });

    // Event listener for the filter button
    $('#toggle-filter-button').click(function () {
        toggleFilter();
    });

    // Event listener for changes in filters or sort options
    $('#filter-priority, #filter-category, #sort-due-date').change(function () {
        loadTasks(); // Reload tasks when any filter or sort option changes
    });

























});
