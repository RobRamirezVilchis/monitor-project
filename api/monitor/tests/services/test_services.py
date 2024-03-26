from django.test import TestCase
from monitor.services import update_or_create_unitstatus
from monitor.selectors import get_or_create_client
from monitor.models import *
from datetime import datetime


class MonitorTest(TestCase):
    def setUp(self) -> None:

        return super().setUp()

    def test_update_or_create_unitstatus(self):
        deployment = Deployment(name="Safe Driving")
        deployment.save()
        client = get_or_create_client(
            {"name": "Transpais", "deployment": deployment})

        unit = Unit(name="0000", client=client)
        unit.save()

        gx_status = GxStatus(deployment=deployment, severity=1)
        gx_status.save()

        unitstatus_args = {
            "unit_id": unit.id,
            "defaults": {
                "last_update": datetime.now(),
                "total": 0,
                "restart": 0,
                "reboot": 0,
                "start": 0,
                "data_validation": 0,
                "source_missing": 0,
                "camera_connection": 0,
                "storage_devices": 0,
                "forced_reboot": 0,
                "read_only_ssd": 0,
                "ignition": 0,
                "aux": 0,
                "others": 0,
                "last_connection": datetime.now(),
                "pending_events": 0,
                "pending_status": 0,
                "restarting_loop": False,
                "on_trip": False,
                "status": gx_status,
            }
        }
        unit_status = update_or_create_unitstatus(unitstatus_args)

        self.assertEqual(unit_status.unit.id, unit.id)
