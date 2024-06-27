# Tasky Project README
### Overview

Tasky is a Django-based web application designed to streamline task and user management. It offers functionalities for user registration, login, logout, password changes, and task management, with corresponding API endpoints for seamless integration.

### Technologies Used

* Django 
* Django Rest Framework
* SimpleJWT
* jQuery 
* ReDoc 
* Django Templates (for frontend rendering)


### Setup

1. Clone the repository: `git clone https://github.com/Oghenekevbe/tasky.git`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate` (on Linux/Mac) or `venv\Scripts\activate` (on Windows)
4. Install requirements: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Create a superuser if you want to access the backend: `python manage.py createsuperuser`
7. Register and log in once the developement server is up and running

### Running the Project

1. Run the development server: `python manage.py runserver`
2. Access the web interface at `http://localhost:8000`
3. Access the complete API documentation at  `http://localhost:8000/api/redoc` (ReDoc) 

### API Endpoints

#### Tasks

* `GET /api/tasks`: List all tasks
* `POST /api/tasks`: Create a new task
* `GET /api/tasks/:id`: Retrieve a task by ID
* `PUT /api/tasks/:id`: Update a task by ID
* `PATCH /api/tasks/:id`: Partially update a task by ID
* `DELETE /api/tasks/:id`: Delete a task by ID

### Web Interface

#### Dashboard

* ` /`: Dashboard

#### Members

* ` /members/`: List all members

#### Tasks

* ` /tasks/`: List all tasks
* ` /task_detail/:id`: Retrieve a task by ID

#### Welcome

* ` /welcome/`: Welcome screen

#### Authentication

* ` /register/`: Register a new member
* ` /login/`: Log in
* ` /change_password/`: Change password
* ` /logout/`: Log out


