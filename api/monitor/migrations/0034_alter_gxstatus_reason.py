# Generated by Django 4.2 on 2024-05-14 21:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0033_alter_retaildevicestatus_last_connection_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gxstatus',
            name='reason',
            field=models.IntegerField(blank=True, null=True, verbose_name='Razón'),
        ),
    ]