$(document).ready(function () {
    const currentPath = window.location.pathname;

    // Dashboard
    if (currentPath === "/") {
        $('#nav-dashboard').addClass('bg-blue-500');
        $('.nav-dashboard').addClass('text-white');
    }

    // Tasks
    if (currentPath === "/tasks/") {
        $('#nav-tasks').addClass('bg-blue-500');
        $('.nav-tasks').addClass('text-white');
    }

    // Calendar
    if (currentPath.includes('/calendar/')) {
        $('#nav-calendar').addClass('bg-blue-500');
        $('.nav-calendar').addClass('text-white');
    }

    // Members
    if (currentPath === "/members/") {
        $('#nav-members').addClass('bg-blue-500');
        $('.nav-members').addClass('text-white');
    }
});
