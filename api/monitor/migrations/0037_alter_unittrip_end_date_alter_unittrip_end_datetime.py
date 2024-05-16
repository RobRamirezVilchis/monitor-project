# Generated by Django 4.2 on 2024-05-16 17:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0036_unittrip_connection'),
    ]

    operations = [
        migrations.AlterField(
            model_name='unittrip',
            name='end_date',
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
        migrations.AlterField(
            model_name='unittrip',
            name='end_datetime',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]