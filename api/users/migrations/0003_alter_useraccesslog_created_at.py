# Generated by Django 4.2 on 2023-08-21 15:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_useraccesslog_created_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useraccesslog',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
