# Generated by Django 4.2 on 2024-04-11 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0007_severitycount'),
    ]

    operations = [
        migrations.AlterField(
            model_name='severitycount',
            name='status_fields',
            field=models.JSONField(null=True),
        ),
    ]