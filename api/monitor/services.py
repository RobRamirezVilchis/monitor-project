from config.env import env
from .models import *
from cryptography.fernet import Fernet, MultiFernet

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


def device_create_or_update(*args, **kwargs):
    device, created = UnitStatus.objects.update_or_create(
        unit=kwargs["unidad"],
        defaults={
            'total': kwargs["total"],
            'restarts': kwargs["restarts"],
            'reboots': kwargs["reboots"],
            'validations': kwargs["validations"],
            'source_id': kwargs["source_id"],
            'connection': kwargs["connection"],
            'memory': kwargs["memory"],
            'forced': kwargs["forced"],
            'read_only': kwargs["read_only"],
            'others': kwargs["others"]
        }
    )
    return created


def update_or_create_devicestatus(args, retries=3, delay=1):
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
            return update_or_create_devicestatus(args, retries - 1, delay)
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


def create_alert(args):
    alert = Alert.objects.create(**args)

    return alert


def create_severity_count(args):
    severity_count = SeverityCount.objects.create(**args)
    return severity_count


def get_or_create_client(name, keyname, deployment_name, defaults):
    deployment = Deployment.objects.get(name=deployment_name)
    client = Client.objects.get_or_create(
        name=name, keyname=keyname, deployment=deployment, defaults={**defaults, "active": True})

    return client
