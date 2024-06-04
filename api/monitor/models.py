from django.db import models
from datetime import timedelta


# Create your models here.
class Deployment(models.Model):
    name = models.CharField("Despliegue", max_length=50)

    def __str__(self):
        return str(self.id) + ' - ' + str(self.name)


class Client(models.Model):
    name = models.CharField("Nombre", max_length=50)
    keyname = models.CharField("Clave", null=True)
    active = models.BooleanField("Activo", default=True)
    deployment = models.ForeignKey(
        Deployment, on_delete=models.CASCADE, null=True)
    api_username = models.CharField(null=True)
    api_password = models.BinaryField(null=True)

    def __str__(self):
        return self.name


class GxStatus(models.Model):
    description = models.CharField(max_length=100, null=True, blank=True)
    severity = models.IntegerField("Severidad", null=True)
    reason = models.IntegerField("Razón", null=True, blank=True)
    priority = models.BooleanField(default=False)
    deployment = models.ForeignKey(
        Deployment, on_delete=models.CASCADE, null=True)

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
    license_end = models.DateTimeField(null=True)

    def __str__(self):
        return self.client.name


class AlertType(models.Model):
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.description


class Alert(models.Model):
    alert_type = models.ForeignKey(AlertType, on_delete=models.CASCADE)
    gx = models.ForeignKey(Gx, on_delete=models.CASCADE, null=True)
    register_date = models.DateField("Dia registro", db_index=True)
    register_datetime = models.DateTimeField("Fecha registro")
    description = models.CharField(max_length=100, null=True)

    def __str__(self):
        return f'{self.gx.client} - {self.alert_type}'


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
    last_alert = models.DateTimeField(null=True, blank=True)
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
    on_trip = models.BooleanField("On trip", null=True, blank=True)
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE, null=True)
    active = models.BooleanField(default=True)

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
    on_trip = models.BooleanField("On trip", null=True, blank=True)
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE, null=True)

    class Meta:
        verbose_name_plural = "Unit histories"

    def __str__(self):
        return self.register_date.strftime("%Y-%m-%d %H:%M:%S") + ' - ' + str(self.unit.name)


class UnitTrip(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    start_datetime = models.DateTimeField(
        blank=True, auto_now=False, auto_now_add=False)
    start_date = models.DateField(
        db_index=True, blank=True, auto_now=False, auto_now_add=False)
    end_datetime = models.DateTimeField(
        null=True, blank=True, auto_now=False, auto_now_add=False)

    end_date = models.DateField(
        null=True, db_index=True, blank=True, auto_now=False, auto_now_add=False)
    success = models.BooleanField(default=True)
    active = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.unit} - {self.start_datetime}'


class DeviceStatus(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    last_update = models.DateTimeField("Last update", null=True)
    last_connection = models.DateTimeField("Last connection", null=True)
    last_alert = models.DateTimeField(null=True)
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


class RetailDeviceStatus(models.Model):
    device = models.OneToOneField(Device, on_delete=models.CASCADE)
    last_update = models.DateTimeField("Last update", null=True)
    last_connection = models.DateTimeField(
        "Last connection", null=True, blank=True)
    last_alert = models.DateTimeField(null=True, blank=True)
    delayed = models.BooleanField(default=False)
    delay_time = models.DurationField(default=timedelta(0))
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE)
    log_counts = models.JSONField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Retail device status"

    def __str__(self):
        return self.device.name


class RetailDeviceHistory(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    register_date = models.DateField("Dia registro", db_index=True)
    register_datetime = models.DateTimeField("Fecha registro")
    last_connection = models.DateTimeField("Last connection", null=True)
    last_alert = models.DateTimeField(null=True, blank=True)
    delayed = models.BooleanField(default=False)
    delay_time = models.DurationField(default=timedelta(0))
    status = models.ForeignKey(GxStatus, on_delete=models.CASCADE)
    log_counts = models.JSONField()

    class Meta:
        verbose_name_plural = "Retail device histories"

    def __str__(self):
        return self.device.name


class SeverityCount(models.Model):
    deployment = models.ForeignKey(Deployment, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, null=True, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    date = models.DateField(db_index=True)
    severity_counts = models.JSONField()
    status_fields = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f'{self.deployment} | {self.client} - {self.timestamp}'


class ServerRegion(models.Model):
    name = models.CharField(max_length=50)


class RDSInstanceClass(models.Model):
    name = models.CharField(max_length=50)
    core_count = models.IntegerField()
    vcpu = models.IntegerField()
    cpu_credits = models.IntegerField()
    memory = models.IntegerField()
    network_performance = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class RDS(models.Model):
    name = models.CharField(max_length=50)
    instance_class = models.ForeignKey(
        RDSInstanceClass, on_delete=models.CASCADE, null=True)
    region = models.ForeignKey(
        ServerRegion, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f'{self.id} - {self.name}'


# AWS Services -----------------------------------------------------
class Server(models.Model):
    name = models.CharField(max_length=50)
    server_type = models.CharField(max_length=50)
    aws_id = models.CharField(max_length=50)
    region = models.ForeignKey(
        ServerRegion, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name


class Project(models.Model):
    name = models.CharField(max_length=50, unique=True)
    server = models.ManyToManyField(Server, related_name="projects")
    database = models.ForeignKey(
        RDS, on_delete=models.DO_NOTHING, null=True, blank=True)
    deployment = models.ForeignKey(Deployment, on_delete=models.DO_NOTHING)


class ServerMetric(models.Model):
    name = models.CharField(max_length=50)
    key = models.CharField(max_length=50)
    statistic = models.CharField(max_length=50, default='Average')
    service = models.CharField(default="", max_length=40)
    threshold = models.IntegerField(null=True, blank=True)
    to_exceed = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ServerStatus(models.Model):
    server = models.OneToOneField(Server, on_delete=models.CASCADE)
    last_launch = models.DateTimeField(auto_now=False, auto_now_add=False)
    last_activity = models.DateTimeField(
        auto_now=False, auto_now_add=False, blank=True)
    state = models.CharField(max_length=50)
    activity_data = models.JSONField(blank=True, null=True)
    active = models.BooleanField(default=True)
    critical = models.BooleanField(default=False)

    def __str__(self):
        return self.server.name

    class Meta:
        verbose_name_plural = "Server status"


class ServerHistory(models.Model):
    server = models.ForeignKey(Server, on_delete=models.CASCADE)
    last_launch = models.DateTimeField(auto_now=False, auto_now_add=False)
    register_datetime = models.DateTimeField(
        auto_now=False, auto_now_add=False)
    register_date = models.DateField(
        db_index=True, auto_now=False, auto_now_add=False)
    state = models.CharField(max_length=50)
    metric_type = models.ForeignKey(ServerMetric, on_delete=models.CASCADE)
    metric_value = models.FloatField()
    critical = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Server histories"


class RDSStatus(models.Model):
    rds = models.ForeignKey(RDS, on_delete=models.CASCADE)
    allocated_storage = models.IntegerField(null=True)
    status = models.CharField(max_length=50)
    last_activity = models.DateTimeField(
        auto_now=False, auto_now_add=False, blank=True)
    activity_data = models.JSONField(blank=True, null=True)
    critical = models.BooleanField(default=False)

    def __str__(self):
        return self.rds.name

    class Meta:
        verbose_name_plural = "RDS status"


class RDSHistory(models.Model):
    rds = models.ForeignKey(RDS, on_delete=models.CASCADE)
    register_datetime = models.DateTimeField(
        auto_now=False, auto_now_add=False)
    register_date = models.DateField(
        db_index=True, auto_now=False, auto_now_add=False)
    status = models.CharField(max_length=50)
    metric_type = models.ForeignKey(ServerMetric, on_delete=models.CASCADE)
    metric_value = models.FloatField()
    critical = models.BooleanField(default=False)

    def __str__(self):
        return self.rds.name

    class Meta:
        verbose_name_plural = "RDS histories"


class LoadBalancer(models.Model):
    name = models.CharField(max_length=50)
    arn = models.TextField(max_length=50)
    elb_type = models.CharField(max_length=50)
    created_time = models.DateTimeField()
    region = models.ForeignKey(
        ServerRegion, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name


class LoadBalancerStatus(models.Model):
    elb = models.ForeignKey(LoadBalancer, on_delete=models.CASCADE)
    last_activity = models.DateTimeField(auto_now=False, auto_now_add=False)
    state_code = models.CharField(max_length=50)
    state_reason = models.CharField(max_length=50, null=True, blank=True)
    activity_data = models.JSONField(blank=True, null=True)
    critical = models.BooleanField(default=False)

    def __str__(self):
        return self.elb.name

    class Meta:
        verbose_name_plural = "Load balancer status"


class LoadBalancerHistory(models.Model):
    elb = models.ForeignKey(LoadBalancer, on_delete=models.CASCADE)
    register_datetime = models.DateTimeField(
        auto_now=False, auto_now_add=False)
    register_date = models.DateField(
        db_index=True, auto_now=False, auto_now_add=False)
    state_code = models.CharField(max_length=50)
    state_reason = models.CharField(max_length=50)
    metric_type = models.ForeignKey(ServerMetric, on_delete=models.CASCADE)
    metric_value = models.FloatField()
    critical = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.elb.name} - {self.metric_type.name}'

    class Meta:
        verbose_name_plural = "Load balancer histories"
