from config.env import env
from .models import *
from cryptography.fernet import Fernet, MultiFernet
from datetime import datetime

from django.db import OperationalError, transaction
import time


class EncryptionService:

    def __init__(self):
        keys = env.list("ENCRYPT_KEYS")
        keys = [Fernet(key) for key in keys]
        self.f = MultiFernet(keys)

    def encrypt(self, data: bytes) -> bytes:
        return self.f.encrypt(data)

    def decrypt(self, data: bytes) -> bytes:
        return self.f.decrypt(data)

    def generate_new_key(self) -> bytes:
        return Fernet.generate_key()


def set_api_credentials_in_db():

    def get_credentials_from_file(client):
        from dotenv import load_dotenv
        import os

        load_dotenv()
        credentials = {
            "username": os.environ.get(f'{client.upper()}_USERNAME'),
            "password": os.environ.get(f'{client.upper()}_PASSWORD')
        }

        return credentials

    encryption = EncryptionService()

    sd_credentials = get_credentials_from_file("sd")
    sd_clients = Client.objects.filter(deployment__name="Safe Driving")
    for client in sd_clients:
        key = client.keyname
        credentials = get_credentials_from_file(key)

        client.api_username = sd_credentials["username"]
        client.api_password = encryption.encrypt(
            bytes(sd_credentials["password"], 'utf-16'))

        client.save()

    ind_clients = Client.objects.filter(deployment__name="Industry")
    for client in ind_clients:
        key = client.keyname
        credentials = get_credentials_from_file(key)

        client.api_username = credentials["username"]
        client.api_password = encryption.encrypt(
            bytes(credentials["password"], 'utf-16'))

        client.save()


def set_client_credentials_in_db(keyname, username, password):
    client = Client.objects.get(keyname=keyname)

    client.api_username = username

    encryption = EncryptionService()
    client.api_password = encryption.encrypt(bytes(password, 'utf-16'))

    client.save()


# Devices

def update_or_create_device_status(args, retries=3, delay=1):
    try:
        with transaction.atomic():
            obj, created = DeviceStatus.objects.update_or_create(
                device_id=args['device'].id,
                defaults=args['defaults']
            )
        return obj
    except OperationalError as e:
        if retries > 0:
            time.sleep(delay)  # Wait for a moment before retrying
            return update_or_create_device_status(args, retries - 1, delay)
        else:
            raise e


def create_device_history(args):
    DeviceHistory.objects.create(
        device=args['device'],
        register_date=args['register_date'],
        register_datetime=args['register_datetime'],
        delayed=args['delayed'],
        delay_time=args['delay_time'],
        batch_dropping=args['batch_dropping'],
        camera_connection=args['camera_connection'],
        restart=args['restart'],
        license=args['license'],
        shift_change=args['shift_change'],
        others=args['others'],
        last_connection=args['last_connection'],
        status=args['status']
    )

# Cameras


def bulk_update_camerastatus(status_list):

    current_cameras = CameraStatus.objects.all()
    current_camera_ids = {
        c_status.camera_id: c_status for c_status in current_cameras}

    to_create = []
    to_update = []
    for status in status_list:
        if status["camera"].id in current_camera_ids:
            current_camera = current_camera_ids[status["camera"].id]
            current_camera.last_update = status['last_update']
            current_camera.connected = status['connected']
            current_camera.disconnection_time = status['disconnection_time']
            to_update.append(current_camera)
        else:
            to_create.append(CameraStatus(
                camera=status["camera"],
                last_update=status['last_update'],
                connected=status['connected'],
                disconnection_time=status['disconnection_time'],
            ))

    CameraStatus.objects.bulk_update(
        to_update,
        fields=['last_update', 'connected', 'disconnection_time']
    )
    CameraStatus.objects.bulk_create(
        to_create,
    )


def bulk_create_camerahistory(history_list):
    camera_logs = []
    for status in history_list:
        camera_logs.append(CameraHistory(
            camera=status['camera'],
            register_date=status['register_date'],
            register_datetime=status['register_datetime'],
            connected=status['connected'],
            disconnection_time=status['disconnection_time'],
        ))

    CameraHistory.objects.bulk_create(
        camera_logs,
        batch_size=1000
    )


def update_or_create_camerastatus(args, retries=3, delay=1):
    try:
        with transaction.atomic():
            camera_status, created = CameraStatus.objects.update_or_create(
                camera_id=args['camera_id'],
                defaults=args['defaults']

            )

        return camera_status
    except OperationalError as e:
        if retries > 0:
            time.sleep(delay)  # Wait for a moment before retrying
            return update_or_create_camerastatus(args, retries - 1, delay)
        else:
            raise e


def create_camerahistory(args):
    camera_history = CameraHistory.objects.create(
        camera=args['camera'],
        register_datetime=args['register_datetime'],
        register_date=args['register_date'],
        connected=args['connected'],
        disconnection_time=args['disconnection_time'],
    )
    return camera_history

# Units


def update_or_create_unitstatus(args):
    unit_status, created = UnitStatus.objects.update_or_create(
        unit_id=args['unit_id'],
        defaults=args['defaults']
    )
    return unit_status


def bulk_create_unithistory(units):
    history_objs = []
    for unit_data in units:
        history_objs.append(UnitHistory(
            **unit_data
        ))
    UnitHistory.objects.bulk_create(history_objs, batch_size=1000)


# Retail Devices -------------------------------------
def update_or_create_retail_device_status(device, defaults):
    retail_device_status, created = RetailDeviceStatus.objects.update_or_create(
        device=device,
        defaults={**defaults}
    )
    return retail_device_status


def create_retail_device_history(args):
    retail_device_history = RetailDeviceHistory.objects.create(
        **args
    )


def create_alert(args):
    alert = Alert.objects.create(**args)

    return alert


def create_severity_count(args):
    severity_count = SeverityCount.objects.create(**args)
    return severity_count


def get_or_create_client(name, keyname, deployment_name, api_username, defaults):
    deployment = Deployment.objects.get(name=deployment_name)
    client = Client.objects.get_or_create(
        name=name, keyname=keyname, api_username=api_username, deployment=deployment, defaults={**defaults, "active": True})

    return client


def create_unit_trip(unit: Unit, start_datetime: datetime, success: bool = False):
    unit_trip = UnitTrip.objects.create(
        unit=unit,
        start_datetime=start_datetime,
        start_date=start_datetime.date(),
        success=success
    )
    return unit_trip


# Projects --------------------------------------------------------
def create_project(name: str, server_aws_ids: list, deployment_name: str, database_id: str = None):
    servers = [Server.objects.get(aws_id=aws_id) for aws_id in server_aws_ids]
    deployment = Deployment.objects.get(name=deployment_name)

    project = Project(
        name=name, deployment=deployment)

    if database_id:
        project.database = RDS.objects.get(id=database_id)

    project.save()
    project.servers.set(servers)
    project.save()


def edit_project(project_id, name: str, server_aws_ids: list, deployment_name: str, database_id: str):
    servers = [Server.objects.get(aws_id=aws_id) for aws_id in server_aws_ids]
    deployment = Deployment.objects.get(name=deployment_name)

    project = Project.objects.get(id=project_id)
    project.name = name
    project.servers.set(servers)
    project.deployment = deployment
    if database_id:
        project.database = RDS.objects.get(id=database_id)
    else:
        project.database = None

    project.save()


def delete_project(id):
    project = Project.objects.get(id=id)
    project.delete()


def assign_project_to_server(project_id, server_id):
    try:
        project = Project.objects.get(id=project_id)
        server = Server.objects.get(id=server_id)

        project.servers.add(server)

        return True
    except Project.DoesNotExist:
        return False
