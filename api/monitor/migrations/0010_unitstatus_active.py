# Generated by Django 4.2 on 2024-04-16 16:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0009_alert_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='unitstatus',
            name='active',
            field=models.BooleanField(default=True),
        ),
    ]
