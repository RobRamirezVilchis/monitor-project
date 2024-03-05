from django.db import models
from datetime import timedelta


# Create your models here.
class Deployment(models.Model):
    name = models.CharField("Despliegue", max_length=50)

    def __str__(self):
        return str(self.id) + ' - ' + str(self.name)


class Client(models.Model):
    name = models.CharField("Nombre", max_length=50)
    deployment = models.ForeignKey(Deployment, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name


class GxStatus(models.Model):
    description = models.CharField(max_length=100, null=True, blank=True)
    severity = models.IntegerField("Severidad", null=True)
    reason = models.IntegerField("Razón", null=True)
    deployment = models.ForeignKey(Deployment, on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "Gx Status"

    def __str__(self):
        return f'{str(self.severity)} - {self.description}' if self.description else '-'


class Gx(models.Model):
    name = models.CharField("Nombre", max_length=50)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Unit(Gx):

    def __str__(self):
        return str(self.name)


class Device(Gx):
    license_days = models.IntegerField(null=True)

    def __str__(self):
        return self.client.name + ' - ' + self.name
    

class Camera(models.Model):
    name = models.CharField("Nombre", max_length=50)
    gx = models.ForeignKey(Gx, on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.name


class CameraStatus(models.Model):
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    last_update = models.DateTimeField("Ultima actualizacion", null=True)
    connected = models.BooleanField(default=True)
    disconnection_time = models.DurationField(default=timedelta(0))

    class Meta:
        verbose_name_plural = "Camera status"

    def __str__(self):
        return self.camera.name


class CameraHistory(models.Model):
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE)
    register_date = models.DateField("Dia registro", db_index=True)
    register_datetime = models.DateTimeField("Fecha registro")
    connected = models.BooleanField(default=True)
    disconnection_time = models.DurationField(default=timedelta(0))

    class Meta:
        verbose_name_plural = "Camera histories"

    def __str__(self):
        return self.camera.name


class UnitStatus(models.Model):
    unit = models.OneToOneField(Unit, on_delete=models.CASCADE)
    last_update = models.DateTimeField("Last update", null=True)
    total = models.IntegerField('Total')
    restart = models.IntegerField('Restarts')
    reboot = models.IntegerField('Reboots')
    start = models.IntegerField('Starts')
    data_validation = models.IntegerField('Data validations')
    source_missing = models.IntegerField('SourceID')
    camera_connection = models.IntegerField('Camera')
    storage_devices = models.IntegerField('Storage devices')
    forced_reboot = models.IntegerField('Forced reboot')
    read_only_ssd = models.IntegerField('Read only SSD')
    ignition = models.IntegerField()
    aux = models.IntegerField()
    others = models.IntegerField('Others')
    last_connection = models.DateTimeField("Last connection", null=True)
    pending_events = models.IntegerField('Pending events', null=True)
    pending_status = models.IntegerField('Pending status', null=True)
    restarting_loop = models.BooleanField(default=False)
    on_trip = models.BooleanField("On trip", null=True)
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "Unit status"

    def __str__(self):
        return self.last_update.strftime("%Y-%m-%d %H:%M:%S") + ' - ' + str(self.unit.name)


class UnitHistory(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    register_date = models.DateField("Dia registro", db_index=True)
    register_datetime = models.DateTimeField("Fecha registro")
    total = models.IntegerField('Total')
    restart = models.IntegerField('Restarts')
    reboot = models.IntegerField('Reboots')
    start = models.IntegerField('Starts')
    data_validation = models.IntegerField('Data validations')
    source_missing = models.IntegerField('Source ID')
    camera_connection = models.IntegerField('Camera')
    storage_devices = models.IntegerField('Storage devices')
    forced_reboot = models.IntegerField('Forced reboot')
    read_only_ssd = models.IntegerField('Read only SSD')
    ignition = models.IntegerField()
    aux = models.IntegerField()
    others = models.IntegerField('Others')
    last_connection = models.DateTimeField("Last connection", null=True)
    pending_events = models.IntegerField('Pending events', null=True)
    pending_status = models.IntegerField('Pending status', null=True)
    restarting_loop = models.BooleanField(default=False)
    on_trip = models.BooleanField("On trip", null=True)
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "Unit histories"

    def __str__(self):
        return self.register_date.strftime("%Y-%m-%d %H:%M:%S") + ' - ' + str(self.unit.name)


class DeviceStatus(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    last_update = models.DateTimeField("Last update", null=True)
    last_connection = models.DateTimeField("Last connection", null=True)
    delayed = models.BooleanField(null=True)
    delay_time = models.DurationField(default=timedelta(0))
    batch_dropping = models.IntegerField()
    camera_connection = models.DurationField()
    restart = models.IntegerField()
    license = models.IntegerField()
    shift_change = models.IntegerField()
    others = models.IntegerField()
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "Device status"

    def __str__(self):
        return self.last_update.strftime("%Y-%m-%d %H:%M:%S") + ' - ' + str(self.device.client.name) + " " + str(
            self.device.name)


class DeviceHistory(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    register_date = models.DateField("Dia registro", db_index=True)
    register_datetime = models.DateTimeField("Fecha registro")
    last_connection = models.DateTimeField("Last connection", null=True)
    delayed = models.BooleanField(null=True)
    delay_time = models.DurationField(default=timedelta(0))
    batch_dropping = models.IntegerField()
    camera_connection = models.DurationField()
    restart = models.IntegerField()
    license = models.IntegerField()
    shift_change = models.IntegerField()
    others = models.IntegerField()
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "Device histories"

    def __str__(self):
        return self.register_date.strftime("%Y-%m-%d %H:%M:%S") + ' - ' + str(self.device.name)



