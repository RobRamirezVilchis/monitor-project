# Generated by Django 4.2 on 2024-08-01 22:57

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0063_rename_server_project_servers'),
    ]

    operations = [
        migrations.CreateModel(
            name='GxMetric',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('metric_name', models.CharField(max_length=50)),
                ('key', models.CharField(max_length=50)),
                ('statistic', models.CharField(default='Average', max_length=50)),
                ('threshold', models.IntegerField(blank=True, null=True)),
                ('to_exceed', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='RombergDevice',
            fields=[
                ('gx_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='monitor.gx')),
            ],
            bases=('monitor.gx',),
        ),
        migrations.AlterField(
            model_name='project',
            name='database',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='projects', to='monitor.rds'),
        ),
        migrations.AlterField(
            model_name='project',
            name='deployment',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.deployment'),
        ),
        migrations.CreateModel(
            name='RombergDeviceStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_update', models.DateTimeField()),
                ('last_detection', models.DateTimeField()),
                ('last_activity', models.DateTimeField()),
                ('delayed', models.BooleanField(default=False)),
                ('delay_time', models.DurationField(default=datetime.timedelta(0))),
                ('records', models.JSONField()),
                ('log_counts', models.JSONField()),
                ('active', models.BooleanField(default=True)),
                ('device', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.rombergdevice')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.gxstatus')),
            ],
        ),
        migrations.CreateModel(
            name='RombergDeviceHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('register_datetime', models.DateTimeField()),
                ('last_detection', models.DateTimeField()),
                ('last_activity', models.DateTimeField()),
                ('log_counts', models.JSONField()),
                ('delayed', models.BooleanField(default=False)),
                ('delay_time', models.DurationField(default=datetime.timedelta(0))),
                ('device', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.rombergdevice')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.gxstatus')),
            ],
        ),
        migrations.CreateModel(
            name='GxRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('register_datetime', models.DateTimeField()),
                ('average', models.FloatField()),
                ('maximum', models.IntegerField()),
                ('minimum', models.IntegerField()),
                ('critical', models.BooleanField(default=False)),
                ('gx', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.gx')),
                ('metric', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.gxmetric')),
            ],
        ),
    ]
