from .models import *

def unitstatus_list():
    return UnitStatus.objects.all()

def devicestatus_list():
    return DeviceStatus.objects.all()

def camerastatus_list():
    return CameraStatus.objects.all()

def unitstatus(unit):
    return UnitStatus.objects.get(
        unit__name = unit
    )

def get_deployment(name):
    deployment = Deployment.objects.get(
        name=name,
    )

def get_client(args):
    client = Client.objects.get(
        name=args['name'],
    )
    return client

def get_or_create_gxstatus(args):
    status_obj, created = GxStatus.objects.get_or_create(
        name = args['name'],
        severity = args['severity']
    )
    return status_obj

def get_or_create_unit(args):
    unit_obj, created = Unit.objects.get_or_create(
        name=args['name'],
        client=args['client']
    )
    return unit_obj

def get_or_create_camera(args):
    camera_obj, created = Camera.objects.get_or_create(
        name = args['name'],
        gx = args['gx']
    )
    return camera_obj

def get_or_create_device(args):
    device, created = Device.objects.get_or_create(
        client_id = args["client"].id,
        name = args["name"]
    )
    return device



def get_unithistory(args):
    import datetime
    import pytz

    date_now = datetime.datetime.now()
    end_date = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(tzinfo=pytz.utc)
    start_date = end_date - timedelta(hours=24)
 
    #print(start_date, end_date)
    logs = UnitHistory.objects.filter(
        unit__name=args['unit'],
        register_datetime__range = (start_date + timedelta(hours=6), end_date + timedelta(hours=6))
    )

    return logs
