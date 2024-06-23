$(document).ready(function () {



    // CRUD METHODS FOR APIS GOTTEN FROM THE BACKEND

    //GET TASKS

    function loadTasks(searchTerm) {
        const priority = $('#filter-priority').val();
        const category = $('#filter-category').val();
        const sortDueDate = $('#sort-due-date').val();

        $.ajax({
            url: 'api/tasks/',
            method: 'GET',
            success: function (data) {
                $('#in-progress-container').empty();
                $('#completed-container').empty();
                $('#overdue-container').empty();

                // Filter tasks
                let filteredTasks = data.filter(task => {
                    return (priority === "" || task.priority === priority) &&
                        (category === "" || task.category === category) &&
                        (searchTerm === "" || task.title.toLowerCase().includes(searchTerm.toLowerCase()));
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
                        <div id="task" class="task p-4 mb-2 bg-white shadow-md rounded" data-task-id="${task.id}" style="cursor: pointer;">
                            <div class="flex space-x-2">
                                <button class="priority bg-blue-500 text-white px-4 py-2 rounded">${task.priority}</button>
                                <button class="due_date bg-blue-500 text-white px-4 py-2 rounded" data-due-dat="${task.status.toLowerCase() === 'completed' ? formattedDate : humanizedDate}">${task.status.toLowerCase() === 'completed' ? formattedDate : humanizedDate}</button>
                                <button class="category bg-blue-500 text-white px-4 py-2 rounded">${task.category}</button>
                            </div>
                            <h2 class=" text-xl font-semibold">${task.title}</h2>
                            <h6 class="description">${task.description}</h6>
                        </div>
                        <div class="title flex justify-end space-x-2">
                        <button class="get-task-button" data-task-id="${task.id}">Get Task</button>
                            <button class="bg-green-500 text-white px-4 py-2 rounded edit-button" data-task-id="${task.id}">Edit</button>
                            <button class="bg-red-500 delete-button text-white px-4 py-2 rounded" data-task-id="${task.id}">Delete</button>
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
                console.error('Error loading tasks:', textStatus, errorThrown);
                alert('Failed to load tasks. Please try again later.');
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
                console.error('Error:', error);
                alert('Error fetching task details');
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


        const csrftoken = $('input[name="csrfmiddlewaretoken"]').val();

        // AJAX POST request for creating a new task
        $.ajax({
            url: 'api/tasks/',
            method: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            data: formData,
            success: function (response) {
                $("#create-task-modal").dialog("close");
                alert("Task created successfully");
                loadTasks();
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                const errorMessage = xhr.responseText;
                alert('Error submitting task: ' + errorMessage);
            }
        });
    });

    // EDITING A TASK


    // Handle edit button click
    $('.container').on('click', '.edit-button', function () {
        const taskId = $(this).data('task-id');
        console.log('Task ID is =', taskId);
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
        console.log('now in edit task oo for', taskId);
        console.log('Now in editTask function for Task ID:', taskId);
        const url = `/api/tasks/${taskId}/`;
        console.log('Constructed URL:', url);
        $.ajax({
            url: `/api/tasks/${taskId}/`,
            method: 'GET',
            success: function (task) {
                console.log('task is = ', task);
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
                console.log('the task id set in hidden is ', taskId);

                // Open modal for editing
                $("#edit-task-modal").dialog("open");
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                alert('Error fetching task details');
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
        console.log('checking if we received the taskid ', taskId);
        const rawDueDate = $('#EditTaskForm .datetimepicker').val();
        console.log('rawDueDate', rawDueDate);

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

        const csrftoken = $('input[name="csrfmiddlewaretoken"]').val();


        // AJAX PUT request for updating a task
        $.ajax({
            url: `api/tasks/${taskId}/`,

            method: 'PUT',
            headers: { 'X-CSRFToken': csrftoken },
            data: formData,
            success: function (response) {
                $("#edit-task-modal").dialog("close");
                alert("Task updated successfully");
                loadTasks(); // Assume there's a function to reload tasks
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
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
        const csrftoken = $('input[name="csrfmiddlewaretoken"]').val();

        // AJAX DELETE request
        $.ajax({
            url: `api/tasks/${taskId}/`,
            method: 'DELETE',
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                alert("Task deleted successfully");
                loadTasks(); // Refresh task list after deletion
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
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
            var taskId = ui.item.data('task-id');
            var newStatus = ui.item.parent().attr('id').replace('-container', '');

            // Get the entire task element
            const taskElement = ui.item;

            const taskData = {
                title: taskElement.find('.text-xl.font-semibold').text(),
                status: newStatus,
                due_date: taskElement.find('.due_date').data('due-date'),
                description: taskElement.find('.description').text(), // Assuming description is within a class 'description'
                priority: taskElement.find('.priority').text(), // Assuming priority is in button with class 'priority'
                category: taskElement.find('.category').text(), // Assuming category is in button with class 'category'
                // ... extract due date based on your logic (see below)
            };

            updateTaskStatus(taskId, newStatus, taskData);
        }


    }).disableSelection();


    function updateTaskStatus(taskId, newStatus, taskData) {
        console.log('this is the taskdata ooo', taskData);
        taskData.status = newStatus.charAt(0).toUpperCase() + newStatus.slice(1); // Capitalize first letter

        // AJAX PUT request to update task status
        $.ajax({
            url: `api/tasks/${taskId}/`,
            method: 'PUT',
            headers: { 'X-CSRFToken': csrftoken },
            data: { status: newStatus }, // Only update status field
            success: function (response) {
                console.log("data being uploaded", data);
                console.log(`Task ${taskId} status updated to ${newStatus}`);
                // Optionally, perform any UI update after successful status change
                loadTasks(); // Reload tasks after status change
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                console.log('xhr', xhr);
                console.log('status', status);
                // Optionally handle error scenario
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

    // Hide filter-sort-container by default
    $('.filter-sort-container').hide();

    // Function to handle sorting and toggling visibility
    function SortingFunction() {
        $('.filter-sort-container').toggle(); // Toggle visibility                  

        // Event listener for changes in filters or sort options
        $('#filter-priority, #filter-category, #sort-due-date').change(function () {
            loadTasks(); // Reload tasks when any filter or sort option changes
        });
    }

    // Click handler for the Sort button
    $('button[type="button"]').click(function () {
        SortingFunction(); // Call SortingFunction when Sort button is clicked
    });


























});
