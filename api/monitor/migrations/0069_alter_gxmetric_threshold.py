# Generated by Django 4.2 on 2024-08-05 16:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0068_gxmodel_gxmetric_gx_model'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gxmetric',
            name='threshold',
            field=models.FloatField(blank=True, null=True),
        ),
    ]