# Generated by Django 4.2 on 2024-04-09 19:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0005_alter_alerttype_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='devicestatus',
            name='last_alert',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='unitstatus',
            name='last_alert',
            field=models.DateTimeField(null=True),
        ),
    ]
