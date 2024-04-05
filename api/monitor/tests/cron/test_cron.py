
from django.test import TestCase
from monitor.cron import get_credentials, login, process_driving_data
from monitor.models import *


class LoginTests(TestCase):
    def setUp(self) -> None:
        pass

    def test_login_is_successful(self):
        client = "tp"
        credentials = get_credentials(client)
        token = login(client=client, credentials=credentials)

        self.assertIsNotNone(token)


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError


class DataProcessingTests(TestCase):
    def setUp(self) -> None:
        # self.maxDiff = None
        return super().setUp()

    def test_process_driving_data(self):
        import json
        from datetime import datetime

        with open('monitor/tests/utils/tp_driving_process_input_2024-04-04T15:10:05.399250+00:00.json', 'r') as f:
            input_data = json.load(f)
            # print(input_data["logs"][977])
        with open('monitor/tests/utils/tp_driving_process_output_2024-04-04T15:10:05.399250+00:00.json', 'r') as f:
            expected_output = json.load(f)

        now = datetime.fromisoformat('2024-04-04T15:10:05.399250+00:00')
        output = process_driving_data(input_data, now=now)

        with open("monitor/tests/utils/test_output.json", "w") as f:
            json.dump(output, f, ensure_ascii=False, default=set_default)
        with open("monitor/tests/utils/test_output.json", "r") as f:
            func_output = json.load(f)

        self.assertEqual(func_output, expected_output)
