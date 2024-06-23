from django.utils import timezone
from ..models import Task


def update_task_status():
    now = timezone.now()
    tasks = Task.objects.all()
    for task in tasks:
        if task.due_date < now and task.status.lower() != 'completed':
            task.status = 'Overdue'
        elif task.status.lower() != 'completed' and task.due_date >= now:
            task.status = 'In Progress'
        task.save()