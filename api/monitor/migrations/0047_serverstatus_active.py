# Generated by Django 4.2 on 2024-05-29 16:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0046_alter_project_database'),
    ]

    operations = [
        migrations.AddField(
            model_name='serverstatus',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
