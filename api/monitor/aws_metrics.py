import os
import json
from typing import List, Dict

import boto3
import logging
import datetime

import pytz


class AWSUtils:
    def __init__(self, region_name):
        self.logger = logging.getLogger(__name__)
        # self.logger.debug('Creating AWSUtils object')
        self.session = boto3.Session(
            region_name=region_name,
        )
        self.ec2_client = self.session.client('ec2')
        self.cloudwatch_client = self.session.client('cloudwatch')

    def list_instances(self):
        response = self.ec2_client.describe_instances()
        instances = []
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                instances.append({
                    'id': instance['InstanceId'],
                    'name': instance.get('KeyName', ''),
                    'type': instance['InstanceType'],
                    'state': instance['State']['Name'],
                    'launch_time': instance['LaunchTime'],
                })
                # instances.append(instance)
        return instances

    def get_metrics(self, instances: List[Dict], metric_name='CPUUtilization'):
        # Establece el intervalo de tiempo para las estadísticas
        end_time = datetime.datetime.now(tz=pytz.timezone('UTC'))
        start_time = end_time - datetime.timedelta(minutes=10)
        metric_query = []

        for instance in instances:
            metric_id = f'cpuUsage_{instance["id"]}'
            metric_id = metric_id.replace('-', '_')
            metric_query.append({
                'Id': metric_id,
                'MetricStat': {
                    'Metric': {
                        'Namespace': 'AWS/EC2',
                        'MetricName': metric_name,
                        'Dimensions': [
                            {'Name': 'InstanceId', 'Value': instance["id"]}
                        ]
                    },
                    'Period': 300,  # Periodo en segundos (1 hora)
                    # Puedes cambiarlo por 'Minimum', 'Maximum', 'Sum', etc.
                    'Stat': 'Average',
                },
                'ReturnData': True,
            })

        # self.logger.debug(f"Query: {json.dumps(metric_query, indent=2)}")

        # Obtiene estadísticas de CPU
        metric_data = self.cloudwatch_client.get_metric_data(
            MetricDataQueries=metric_query,
            StartTime=start_time,
            EndTime=end_time
        )
        for metric in metric_data['MetricDataResults']:
            self.logger.info(f"Metric {metric['Id']}: {metric['Values']}")
        return metric_data


'''
import boto3
from datetime import datetime, timedelta

# Crea una sesión de boto3 (asegúrate de tener tus credenciales configuradas)
session = boto3.Session(region_name='us-west-2')  # Cambia a tu región

# Cliente de EC2 para obtener la lista de instancias
ec2_client = session.client('ec2')

# Cliente de CloudWatch para obtener métricas
cloudwatch_client = session.client('cloudwatch')

def list_ec2_instances():
    """ Retorna una lista de instancias de EC2 """
    response = ec2_client.describe_instances()
    instances = []
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instances.append(instance['InstanceId'])
    return instances

def get_cpu_metrics(instance_id):
    """ Obtiene la métrica de uso de CPU para una instancia específica """
    now = datetime.utcnow()
    start_time = now - timedelta(days=1)  # Últimas 24 horas

    metrics = cloudwatch_client.get_metric_data(
        MetricDataQueries=[
            {
                'Id': 'cpuUsage',
                'MetricStat': {
                    'Metric': {
                        'Namespace': 'AWS/EC2',
                        'MetricName': 'CPUUtilization',
                        'Dimensions': [
                            {'Name': 'InstanceId', 'Value': instance_id}
                        ]
                    },
                    'Period': 3600,  # Periodo en segundos (1 hora)
                    'Stat': 'Average',  # Puedes cambiarlo por 'Minimum', 'Maximum', 'Sum', etc.
                },
                'ReturnData': True,
            },
        ],
        StartTime=start_time,
        EndTime=now
    )
    return metrics

def main():
    instances = list_ec2_instances()
    print("Instancias EC2:")
    for instance in instances:
        print(instance)
        metrics = get_cpu_metrics(instance)
        print(f"Métricas de CPU para {instance}: {metrics['MetricDataResults']}")

if __name__ == '__main__':
    main()
'''
