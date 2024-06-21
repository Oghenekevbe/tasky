$(document).ready(function () {
    function loadTasks(searchTerm) {
        $.ajax({
            url: 'api/tasks/',
            method: 'GET',
            success: function (data) {
                $('#in-progress-container').empty();
                $('#completed-container').empty();
                $('#overdue-container').empty();

                data.forEach(task => {
                    const humanizedDate = moment(task.due_date).fromNow();
                    const formattedDate = moment(task.due_date).format('DD/MM/YYYY');

                    const taskHtml = `
                        <div class="task p-4 mb-2 bg-white shadow-md rounded">
                            <div class="flex space-x-2">
                                <button class="bg-blue-500 text-white px-4 py-2 rounded">${task.priority}</button>
                                <button class="bg-blue-500 text-white px-4 py-2 rounded">${task.status.toLowerCase() === 'completed' ? formattedDate : humanizedDate}</button>
                                <button class="bg-blue-500 text-white px-4 py-2 rounded">${task.category}</button>
                            </div>
                            <h2 class="text-xl font-semibold">${task.title}</h2>
                            <h6>${task.description}</h6>
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
            }
        });
    }

    // Initial load of tasks
    loadTasks();

    // Implement search functionality
    $('#search').on('input', function () {
        loadTasks($(this).val());
    });


    // Initialize the modal
    $("#form-modal").dialog({
        autoOpen: false,
        modal: true,
        width: 500,
        buttons: {
            "Submit": function () {
                // Handle form submission
                $("#TaskForm").submit(function (event) {
                    event.preventDefault(); // Prevent default form submission

                    const formData = {
                        title: $('#title').val(),
                        description: $('#description').val(),
                        due_date: $('.datetimepicker').val(),
                        priority: $('#status').val(),
                        priority: $('#priority').val(),
                        category: $('#category').val(),
                        assigned_to: $('#assigned_to').val(),
                    };

                    const csrftoken = $('input[name="csrfmiddlewaretoken"]').val();

                    // AJAX POST request
                    $.ajax({
                        url: 'api/tasks/', // Replace with your actual API endpoint
                        method: 'POST',
                        headers: { 'X-CSRFToken': csrftoken },
                        data: formData,
                        success: function (response) {
                            loadTasks();
                            // Close modal after successful submission
                            $("#form-modal").dialog("close");
                        },
                        error: function (xhr, status, error) {
                            console.error('Error:', error);
                            const errorMessage = xhr.responseText;
                            alert('Error submitting task: ' + errorMessage);
                        }
                    });
                });

                // Manually trigger the form submit
                $("#TaskForm").submit();
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });


    // Open the modal on button click
    $("#addTaskButton").click(function () {
        $("#form-modal").dialog("open");
    });

    // Initialize datetimepicker for due_date field
    $('.datetimepicker').datetimepicker({
        dateFormat: 'yy-mm-dd',  // Date format matching Django's DateTimeField
        timeFormat: 'HH:mm',     // Time format (hours and minutes)
        changeMonth: true,
        changeYear: true,
        controlType: 'select',   // Dropdown for easier time selection
        oneLine: true            // Display date and time on one line
    });























































});
