from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Task(models.Model):
    STATUS_CHOICES = [
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Overdue', 'Overdue'),
    ]

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    CATEGORY_CHOICES = [
    ('UX Design', 'UX Design'),
    ('Front-End Development', 'Front-End Development'),
    ('HTML/CSS Development', 'HTML/CSS Development'),
    ('JavaScript Development', 'JavaScript Development'),
    ('Front-End Frameworks', 'Front-End Frameworks'),
    ('Back-End Development', 'Back-End Development'),
    ('API Development', 'API Development'),
    ('Database Management', 'Database Management'),
    ('Server-Side Scripting', 'Server-Side Scripting'),
    ('Data Science', 'Data Science'),
    ('Data Analysis', 'Data Analysis'),
    ('Machine Learning', 'Machine Learning'),
    ('Data Engineering', 'Data Engineering'),
    ('DevOps', 'DevOps'),
    ('Continuous Integration/Continuous Deployment (CI/CD)', 'Continuous Integration/Continuous Deployment (CI/CD)'),
    ('Infrastructure as Code', 'Infrastructure as Code'),
    ('Monitoring and Logging', 'Monitoring and Logging'),
    ('Quality Assurance (QA)', 'Quality Assurance (QA)'),
    ('Project Management', 'Project Management'),
    ('Cybersecurity', 'Cybersecurity'),
    ('Mobile Development', 'Mobile Development'),
    ('iOS Development', 'iOS Development'),
    ('Android Development', 'Android Development'),
    ('Cross-Platform Development', 'Cross-Platform Development'),
    ('Technical Support', 'Technical Support'),
    ('Documentation', 'Documentation'),
    ('Testing', 'Testing'),
    ('Unit Testing', 'Unit Testing'),
    ('Integration Testing', 'Integration Testing'),
    ('End-to-End Testing', 'End-to-End Testing'),
]


    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES)
    due_date = models.DateTimeField()
    category = models.CharField(max_length=100, choices = CATEGORY_CHOICES)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
