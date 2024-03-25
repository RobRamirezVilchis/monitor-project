
from django.test import TestCase
from monitor.cron import get_credentials, login
from monitor.models import *


class LoginTests(TestCase):
    def setUp(self) -> None:
        pass

    def test_login_is_successful(self):
        client = "tp"
        credentials = get_credentials(client)
        token = login(client=client, credentials=credentials)

        self.assertIsNotNone(token)


class MonitorTest(TestCase):
    def setUp(self) -> None:

        return super().setUp()

    def test_unitstatus_recent(self):
        unitstatus = UnitStatus.objects.get(unit__name="9559")
        unit = Unit.objects.get(name="9559")
        self.assertEqual(unitstatus.unit, unit)
