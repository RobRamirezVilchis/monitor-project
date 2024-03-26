# Generated by Django 4.2 on 2024-03-21 17:52

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Camera',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Nombre')),
            ],
        ),
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Nombre')),
            ],
        ),
        migrations.CreateModel(
            name='Deployment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Despliegue')),
            ],
        ),
        migrations.CreateModel(
            name='Gx',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Nombre')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.client')),
            ],
        ),
        migrations.CreateModel(
            name='GxStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('severity', models.IntegerField(null=True, verbose_name='Severidad')),
                ('reason', models.IntegerField(null=True, verbose_name='Razón')),
                ('deployment', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='monitor.deployment')),
            ],
            options={
                'verbose_name_plural': 'Gx Status',
            },
        ),
        migrations.CreateModel(
            name='Device',
            fields=[
                ('gx_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='monitor.gx')),
                ('license_days', models.IntegerField(null=True)),
            ],
            bases=('monitor.gx',),
        ),
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('gx_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='monitor.gx')),
            ],
            bases=('monitor.gx',),
        ),
        migrations.AddField(
            model_name='client',
            name='deployment',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='monitor.deployment'),
        ),
        migrations.CreateModel(
            name='CameraStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_update', models.DateTimeField(null=True, verbose_name='Ultima actualizacion')),
                ('connected', models.BooleanField(default=True)),
                ('disconnection_time', models.DurationField(default=datetime.timedelta(0))),
                ('camera', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.camera')),
            ],
            options={
                'verbose_name_plural': 'Camera status',
            },
        ),
        migrations.CreateModel(
            name='CameraHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('register_date', models.DateField(db_index=True, verbose_name='Dia registro')),
                ('register_datetime', models.DateTimeField(verbose_name='Fecha registro')),
                ('connected', models.BooleanField(default=True)),
                ('disconnection_time', models.DurationField(default=datetime.timedelta(0))),
                ('camera', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.camera')),
            ],
            options={
                'verbose_name_plural': 'Camera histories',
            },
        ),
        migrations.AddField(
            model_name='camera',
            name='gx',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='monitor.gx'),
        ),
        migrations.CreateModel(
            name='UnitStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_update', models.DateTimeField(null=True, verbose_name='Last update')),
                ('total', models.IntegerField(verbose_name='Total')),
                ('restart', models.IntegerField(verbose_name='Restarts')),
                ('reboot', models.IntegerField(verbose_name='Reboots')),
                ('start', models.IntegerField(verbose_name='Starts')),
                ('data_validation', models.IntegerField(verbose_name='Data validations')),
                ('source_missing', models.IntegerField(verbose_name='SourceID')),
                ('camera_connection', models.IntegerField(verbose_name='Camera')),
                ('storage_devices', models.IntegerField(verbose_name='Storage devices')),
                ('forced_reboot', models.IntegerField(verbose_name='Forced reboot')),
                ('read_only_ssd', models.IntegerField(verbose_name='Read only SSD')),
                ('ignition', models.IntegerField()),
                ('aux', models.IntegerField()),
                ('others', models.IntegerField(verbose_name='Others')),
                ('last_connection', models.DateTimeField(null=True, verbose_name='Last connection')),
                ('pending_events', models.IntegerField(null=True, verbose_name='Pending events')),
                ('pending_status', models.IntegerField(null=True, verbose_name='Pending status')),
                ('restarting_loop', models.BooleanField(default=False)),
                ('on_trip', models.BooleanField(null=True, verbose_name='On trip')),
                ('status', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='monitor.gxstatus')),
                ('unit', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='monitor.unit')),
            ],
            options={
                'verbose_name_plural': 'Unit status',
            },
        ),
        migrations.CreateModel(
            name='UnitHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('register_date', models.DateField(db_index=True, verbose_name='Dia registro')),
                ('register_datetime', models.DateTimeField(verbose_name='Fecha registro')),
                ('total', models.IntegerField(verbose_name='Total')),
                ('restart', models.IntegerField(verbose_name='Restarts')),
                ('reboot', models.IntegerField(verbose_name='Reboots')),
                ('start', models.IntegerField(verbose_name='Starts')),
                ('data_validation', models.IntegerField(verbose_name='Data validations')),
                ('source_missing', models.IntegerField(verbose_name='Source ID')),
                ('camera_connection', models.IntegerField(verbose_name='Camera')),
                ('storage_devices', models.IntegerField(verbose_name='Storage devices')),
                ('forced_reboot', models.IntegerField(verbose_name='Forced reboot')),
                ('read_only_ssd', models.IntegerField(verbose_name='Read only SSD')),
                ('ignition', models.IntegerField()),
                ('aux', models.IntegerField()),
                ('others', models.IntegerField(verbose_name='Others')),
                ('last_connection', models.DateTimeField(null=True, verbose_name='Last connection')),
                ('pending_events', models.IntegerField(null=True, verbose_name='Pending events')),
                ('pending_status', models.IntegerField(null=True, verbose_name='Pending status')),
                ('restarting_loop', models.BooleanField(default=False)),
                ('on_trip', models.BooleanField(null=True, verbose_name='On trip')),
                ('status', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='monitor.gxstatus')),
                ('unit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.unit')),
            ],
            options={
                'verbose_name_plural': 'Unit histories',
            },
        ),
        migrations.CreateModel(
            name='DeviceStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_update', models.DateTimeField(null=True, verbose_name='Last update')),
                ('last_connection', models.DateTimeField(null=True, verbose_name='Last connection')),
                ('delayed', models.BooleanField(null=True)),
                ('delay_time', models.DurationField(default=datetime.timedelta(0))),
                ('batch_dropping', models.IntegerField()),
                ('camera_connection', models.DurationField()),
                ('restart', models.IntegerField()),
                ('license', models.IntegerField()),
                ('shift_change', models.IntegerField()),
                ('others', models.IntegerField()),
                ('status', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='monitor.gxstatus')),
                ('device', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='monitor.device')),
            ],
            options={
                'verbose_name_plural': 'Device status',
            },
        ),
        migrations.CreateModel(
            name='DeviceHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('register_date', models.DateField(db_index=True, verbose_name='Dia registro')),
                ('register_datetime', models.DateTimeField(verbose_name='Fecha registro')),
                ('last_connection', models.DateTimeField(null=True, verbose_name='Last connection')),
                ('delayed', models.BooleanField(null=True)),
                ('delay_time', models.DurationField(default=datetime.timedelta(0))),
                ('batch_dropping', models.IntegerField()),
                ('camera_connection', models.DurationField()),
                ('restart', models.IntegerField()),
                ('license', models.IntegerField()),
                ('shift_change', models.IntegerField()),
                ('others', models.IntegerField()),
                ('status', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='monitor.gxstatus')),
                ('device', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='monitor.device')),
            ],
            options={
                'verbose_name_plural': 'Device histories',
            },
        ),
    ]