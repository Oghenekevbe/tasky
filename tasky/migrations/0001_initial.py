# Generated by Django 5.0.6 on 2024-06-24 04:23

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("In Progress", "In Progress"),
                            ("Completed", "Completed"),
                            ("Overdue", "Overdue"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "priority",
                    models.CharField(
                        choices=[
                            ("Low", "Low"),
                            ("Medium", "Medium"),
                            ("High", "High"),
                        ],
                        max_length=10,
                    ),
                ),
                ("due_date", models.DateTimeField()),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("UX Design", "UX Design"),
                            ("Front-End Development", "Front-End Development"),
                            ("HTML/CSS Development", "HTML/CSS Development"),
                            ("JavaScript Development", "JavaScript Development"),
                            ("Front-End Frameworks", "Front-End Frameworks"),
                            ("Back-End Development", "Back-End Development"),
                            ("API Development", "API Development"),
                            ("Database Management", "Database Management"),
                            ("Server-Side Scripting", "Server-Side Scripting"),
                            ("Data Science", "Data Science"),
                            ("Data Analysis", "Data Analysis"),
                            ("Machine Learning", "Machine Learning"),
                            ("Data Engineering", "Data Engineering"),
                            ("DevOps", "DevOps"),
                            (
                                "Continuous Integration/Continuous Deployment (CI/CD)",
                                "Continuous Integration/Continuous Deployment (CI/CD)",
                            ),
                            ("Infrastructure as Code", "Infrastructure as Code"),
                            ("Monitoring and Logging", "Monitoring and Logging"),
                            ("Quality Assurance (QA)", "Quality Assurance (QA)"),
                            ("Project Management", "Project Management"),
                            ("Cybersecurity", "Cybersecurity"),
                            ("Mobile Development", "Mobile Development"),
                            ("iOS Development", "iOS Development"),
                            ("Android Development", "Android Development"),
                            (
                                "Cross-Platform Development",
                                "Cross-Platform Development",
                            ),
                            ("Technical Support", "Technical Support"),
                            ("Documentation", "Documentation"),
                            ("Testing", "Testing"),
                            ("Unit Testing", "Unit Testing"),
                            ("Integration Testing", "Integration Testing"),
                            ("End-to-End Testing", "End-to-End Testing"),
                        ],
                        max_length=100,
                    ),
                ),
                (
                    "assigned_to",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
