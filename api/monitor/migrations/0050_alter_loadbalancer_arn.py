# Generated by Django 4.2 on 2024-05-29 19:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0049_loadbalancer_region'),
    ]

    operations = [
        migrations.AlterField(
            model_name='loadbalancer',
            name='arn',
            field=models.TextField(max_length=50),
        ),
    ]