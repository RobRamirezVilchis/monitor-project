# Generated by Django 4.2 on 2024-08-05 18:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0069_alter_gxmetric_threshold'),
    ]

    operations = [
        migrations.RenameField(
            model_name='gxrecord',
            old_name='generation_time',
            new_name='log_time',
        ),
        migrations.RenameField(
            model_name='gxrecord',
            old_name='upload_time',
            new_name='register_time',
        ),
    ]
