# Generated by Django 4.2 on 2024-08-02 21:29

from django.db import migrations, models
import django.db.models.deletion
import monitor.models


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0067_rename_average_gxrecord_avg_value_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='GxModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.AddField(
            model_name='gxmetric',
            name='gx_model',
            field=models.ForeignKey(default=monitor.models.GxModel.get_default_pk, on_delete=django.db.models.deletion.CASCADE, to='monitor.gxmodel'),
        ),
    ]