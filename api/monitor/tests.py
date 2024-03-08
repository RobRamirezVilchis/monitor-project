from django.test import TestCase
from .models import *

# Create your tests here.


class MonitorTest(TestCase):
    def setUp(self) -> None:
        return super().setUp()

    def test_unitstatus_recent(self):
        unitstatus = UnitStatus.objects.get(unit__name="9559")
        unit = Unit.objects.get(name="9559")
        self.assertEqual(unitstatus.unit, unit)
