from apscheduler.schedulers.background import BackgroundScheduler
from .tasks_status_update import update_task_status



def start():
    scheduler = BackgroundScheduler()
    scheduler.add_job(update_task_status, 'interval', seconds=300)
    scheduler.start()