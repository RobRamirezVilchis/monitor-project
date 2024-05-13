# Generated by Django 4.2 on 2024-05-13 19:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0032_retaildevicestatus_active'),
    ]

    operations = [
        migrations.AlterField(
            model_name='retaildevicestatus',
            name='last_connection',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Last connection'),
        ),
        migrations.AlterField(
            model_name='retaildevicestatus',
            name='log_counts',
            field=models.JSONField(blank=True),
        ),
    ]
