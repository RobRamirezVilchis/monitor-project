# Generated by Django 4.2 on 2024-05-02 19:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('monitor', '0018_alter_client_api_password'),
    ]

    operations = [
        migrations.CreateModel(
            name='Server',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('server_type', models.CharField(max_length=50)),
                ('sever_id', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='SeverMetrics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('key', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='ServerStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_launch', models.DateTimeField()),
                ('last_activity', models.DateTimeField()),
                ('state', models.CharField(max_length=50)),
                ('activity_data', models.JSONField(blank=True, null=True)),
                ('server', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='monitor.server')),
            ],
        ),
        migrations.CreateModel(
            name='ServerHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_launch', models.DateTimeField()),
                ('register_datetime', models.DateTimeField()),
                ('register_date', models.DateField(db_index=True)),
                ('state', models.CharField(max_length=50)),
                ('metric_value', models.FloatField()),
                ('metric_type', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='monitor.severmetrics')),
                ('server', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='monitor.server')),
            ],
        ),
    ]
