from collections import defaultdict
from .aws_metrics import AWSUtils
from .models import *
from .selectors import *
from .services import *

from dotenv import load_dotenv
import requests
import pandas as pd
import json

from datetime import datetime, timedelta

import pytz
import os
import subprocess

from typing import Optional


def generate_testing_data(client_alias, response, processed_data):
    import json

    now = datetime.now(tz=pytz.timezone('UTC')).astimezone(pytz.timezone(
        'America/Mexico_City')).replace(tzinfo=pytz.utc)

    def set_default(obj):
        if isinstance(obj, set):
            return list(obj)
        raise TypeError

    with open(f'/home/spare/Documents/monitor/monitor-project/api/monitor/{client_alias}_driving_process_input_{now.isoformat()}.json', "w") as f:
        json.dump(response, f, ensure_ascii=False)
    with open(f'/home/spare/Documents/monitor/monitor-project/api/monitor/{client_alias}_driving_process_output_{now.isoformat()}.json', "w") as f:
        json.dump(processed_data, f, ensure_ascii=False,
                  default=set_default)


def send_telegram(chat: str, message: str):
    load_dotenv()
    if os.environ.get("ALERTS") != "true":
        print("Alerts are disabled")
        return
    TELEGRAM_CHAT = os.environ.get(chat)
    TELEGRAM_BOT = os.environ.get("TELEGRAM_BOT")

    subprocess.run(
        f"curl -X POST -H 'Content-Type: application/json' -d '{{\"chat_id\": \"{TELEGRAM_CHAT}\", \"text\": \"{message}\"}}\' https://api.telegram.org/bot{TELEGRAM_BOT}/sendMessage",
        shell=True)


def send_sd_alerts(chat, alerts):
    message = ""
    for unit, descriptions in alerts.items():
        for description in descriptions:
            message += f'- Unidad {unit}: {description}\n'
    send_telegram(chat=chat, message=message)


def api_login(login_url, credentials):

    r = requests.post(login_url, data=credentials)

    if r.status_code == 200 or r.status_code == 201:
        token = r.json()["token"]
    else:
        token = None
        print(f"Login error: {r.status_code}")

    return token


def make_request(request_url, data, token):
    headers = {"Authorization": f"Token {token}"}
    r = requests.get(request_url, data=data, headers=headers)
    # print(r.status_code)
    # print(r.text)
    return r, r.status_code


# Safe Driving

def get_driving_data(client_keyname, client_id):

    now = datetime.now(tz=pytz.timezone('UTC')).astimezone(pytz.timezone(
        'America/Mexico_City')).replace(tzinfo=pytz.utc)

    credentials = get_api_credentials("Safe Driving", client_id)

    # Hardcoded
    urls = {
        "tp": {
            "login": 'https://tp.introid.com/login/',
            "logs": 'https://tp.introid.com/logs/'
        },
        "cmx": {
            "login": 'https://cmx.safe-d.aivat.io/login/',
            "logs": 'https://cmx.safe-d.aivat.io/cemex/logs/'
        },
        "trm": {
            "login": 'https://trm.safe-d.aivat.io/login/',
            "logs": 'https://trm.safe-d.aivat.io/ternium/logs/'
        }
    }
    if client_keyname in urls:
        login_url = urls[client_keyname]["login"]
        request_url = urls[client_keyname]["logs"]
    else:
        login_url = f'https://{client_keyname}.safe-d.aivat.io/login/'
        request_url = f'https://{client_keyname}.safe-d.aivat.io/logs/'

    try:
        token = api_login(login_url, credentials)
    except requests.exceptions.ConnectionError:
        print("Connection error")
        return

    response, status = make_request(request_url, {"minutes": 60}, token=token)
    if status == 401:
        token = api_login(login_url, credentials)
        response, status = make_request(
            request_url, {"minutes": 60}, token=token)

    if status == 200 or status == 201:
        response = response.json()
    else:
        print(f"Status code: {status}")
        return

    return response


def process_driving_data(response, now=None):
    if not now:
        now = datetime.now(tz=pytz.timezone('UTC')).astimezone(pytz.timezone(
            'America/Mexico_City')).replace(tzinfo=pytz.utc)

    logs = response["logs"]
    devices = response["devices"]

    df_logs = pd.DataFrame(logs)

    past_logs = pd.DataFrame([])
    if not df_logs.empty:
        df_logs["Timestamp"] = df_logs["Timestamp"].apply(
            lambda x: datetime.fromisoformat(x))
        df_logs["Fecha_subida"] = df_logs["Fecha_subida"].apply(
            lambda x: datetime.fromisoformat(x))

        df_logs["Timestamp"] = df_logs["Timestamp"].dt.tz_localize('UTC')
        df_logs["Fecha_subida"] = df_logs["Fecha_subida"].dt.tz_localize('UTC')
        # Arreglar timezone

        # Consider a log as delayed, if it was uploaded within the last 10 minutes,
        # but generated before that time interval
        past_logs = df_logs[(df_logs["Timestamp"] < (
            now - timedelta(minutes=10))) & (df_logs["Fecha_subida"] > (
                now - timedelta(minutes=10)))]

        logs_last_hour = df_logs[df_logs["Timestamp"] > (
            now - timedelta(hours=1))]

        aux = logs_last_hour.loc[logs_last_hour["Tipo"] == "Aux"]
        all_ignitions = logs_last_hour.loc[logs_last_hour["Tipo"]
                                           == "Ignición"]

        # logs_last_hour = logs_last_hour.loc[(logs_last_hour["Tipo"] != "Aux") &
        #                                        (logs_last_hour["Tipo"] != "Ignición")]

    else:
        logs_last_hour = pd.DataFrame([])

    past_logs_file_path = "./past_logs.json"

    try:
        with open(past_logs_file_path, "r") as f:
            previous_past_logs = json.load(f)

        df_past_logs = pd.DataFrame(previous_past_logs)
        df_past_logs = pd.concat([df_past_logs, past_logs], ignore_index=True)
        df_past_logs.to_json(past_logs_file_path,
                             orient='records', date_format='iso')
    except FileNotFoundError:
        past_logs.to_json(past_logs_file_path,
                          orient='records', date_format='iso')

    log_types = ["total", "restart", "reboot", "start",
                 "data_validation", "source_missing",
                 "camera_missing", "storage_devices",
                 "forced_reboot", "read_only_ssd",
                 "Ignición", "Aux", "others"]

    device_dict = {dev["Unidad"]: {k: v for k, v in dev.items() if k != "Unidad"}
                   for dev in devices}

    # Initialize "output_gx" dictionary with device info (last connection and pending jsons),
    # and all log categories with zeroes, for each time interval
    output_gx = {interval: {device: {**datos, **{t: 0 for t in log_types}, "restarting_loop": False}
                            for device, datos in device_dict.items()}
                 for interval in ["hour", "ten_minutes"]}

    output_cameras = {interval: {device: {0: 0, 1: 0, 2: 0}
                                 for device, datos in device_dict.items()}
                      for interval in ["hour", "ten_minutes"]}

    for i in range(len(logs_last_hour)):
        log = logs_last_hour.iloc[i]
        unit = log["Unidad"]
        log_type = log["Tipo"]

        recent = log["Timestamp"] > now - timedelta(minutes=10)
        if recent:
            intervals = ["hour", "ten_minutes"]

        else:
            intervals = ["hour"]

        if unit not in output_gx["hour"]:
            continue

        for interval in intervals:

            if log_type in output_gx[interval][unit]:
                output_gx[interval][unit][log_type] += 1
            else:
                output_gx[interval][unit]["others"] += 1

            if log_type == "camera_missing":
                cameras_num = log["Log"][:-2].split(":")[2].split()
                if log["Log"].split()[1] == "'DISCONNECTED":
                    for camera in cameras_num:
                        if int(camera) in output_cameras[interval][unit]:
                            output_cameras[interval][unit][int(camera)] += 5
                        else:
                            output_cameras[interval][unit][int(camera)] = 5

            # Ignore Ignition or Aux in total log count
            if log_type not in {"Ignición", "Aux"}:
                output_gx[interval][unit]["total"] += 1

            # Discard restarts that happened right after ignition
            if log_type == "restart":
                unit_ignitions = all_ignitions[all_ignitions["Unidad"] == unit]

                restart_time = log["Timestamp"]
                for n in range(len(unit_ignitions)):
                    ignition = unit_ignitions.iloc[n]

                    ignition_time = ignition["Timestamp"]
                    if ignition_time + timedelta(minutes=5) > restart_time > ignition_time:
                        output_gx[interval][unit][log_type] -= 1
                        output_gx[interval][unit]["total"] -= 1
                        # Break out of the loop, to prevent repeating this logic
                        # in case there was more than one ignition before the restart
                        break

                if recent and "Restarting" in log["Log"]:
                    execution_number = int(log["Log"].split()[4])
                    if execution_number > 1:
                        output_gx["hour"][unit]["restarting_loop"] = True
                        output_gx["ten_minutes"][unit]["restarting_loop"] = True

    severities = {}
    alerts = {}
    for device, device_data in device_dict.items():
        disc_cameras = sum(
            [mins > 0 for cam, mins in output_cameras["ten_minutes"][device].items()])
        if device_data["Ultima_actualizacion"] != 'null':
            last_connection = datetime.fromisoformat(
                device_data["Ultima_actualizacion"]).replace(tzinfo=pytz.utc)
        else:
            last_connection = None

        alert_conditions = {
            "Read only SSD": output_gx["hour"][device]["read_only_ssd"] > 0,
            "En viaje con tres cámaras fallando": device_data.get("En_viaje") and disc_cameras == 3
        }

        for description, cond in alert_conditions.items():
            if cond:
                if device not in alerts:
                    alerts[device] = set([description])
                else:
                    alerts[device].add(description)

        status_conditions = [
            # (Condition, Status, Description)
            (output_gx["hour"][device]["read_only_ssd"]
             > 0, 5, "Read only SSD"),
            (device_data.get("En_viaje") and disc_cameras >
             2, 5, "Tres cámaras fallando"),
            (output_gx["ten_minutes"][device]["restarting_loop"]
             and device_data.get("En_viaje"), 5, "Múltiples restarts"),
            (output_gx["hour"][device]["forced_reboot"]
             > 1, 5, "forced reboot (>1)"),
            (device_data.get("Estatus") == "red" and device_data.get(
                "En_viaje"), 5, "Sin comunicación reciente"),
            (device_data.get("Jsons_eventos_pendientes") > 100 or device_data.get(
                "Jsons_status_pendientes") > 1000, 5, "Logs pendientes (>100)"),
            (device_data.get("En_viaje") and disc_cameras in {
             1, 2}, 4, "1-2 cámaras fallando"),
            (output_gx["ten_minutes"][device]["restarting_loop"]
             and not device_data.get("En_viaje"), 4, "Múltiples restarts"),
            (output_gx["hour"][device]["forced_reboot"]
             == 1, 4, "Forced reboot reciente"),
            (device_data.get("Estatus") == "orange", 4,
             "Sin comunicación reciente (< 1 día)"),
            (output_gx["hour"][device]["storage_devices"]
             > 0, 3, "Errores de memoria"),
            (100 > device_data.get("Jsons_eventos_pendientes") >
             20 or device_data.get("Jsons_status_pendientes") > 100, 3, "Logs pendientes (>20)"),
            (output_gx["hour"][device]["total"]
             > 10, 3, "Más de 10 mensajes"),
            (device_data.get("Estatus") == "green" and (
                output_gx["hour"][device]["Aux"] == 0 or output_gx["hour"][device]["Ignición"] == 0), 2, "Sin AUX ni Ignición"),
            (last_connection and not device_data.get("En_viaje")
             and last_connection > now - timedelta(hours=2), 2, "Comunicación reciente"),
            (device_data.get("En_viaje") and last_connection > now - timedelta(hours=1)
             and 10 > output_gx["hour"][device]["total"] > 5, 2, "De 5 a 10 mensajes en última hora"),
            (device_data.get("En_viaje") and last_connection > now - timedelta(hours=1)
             and output_gx["hour"][device]["total"] < 5, 1, "Comunicación reciente"),
        ]

        for condition, level, rule_des in status_conditions:
            if condition:
                new_status = {"severity": level, "description": rule_des}
                if device not in severities:
                    severities[device] = [new_status]
                else:
                    severities[device].append(new_status)

    for device in device_dict.keys():
        if device not in severities:
            severities[device] = [{"severity": 0, "description": "Inactivo"}]

    if not past_logs.empty:
        past_log_times = past_logs.groupby(
            "Unidad")['Timestamp'].apply(lambda x: list(x.dt.to_pydatetime())).to_dict()
    else:
        past_log_times = {}

    return {"gx": output_gx,
            "cameras": output_cameras,
            "severities": severities,
            "alerts": alerts,
            "past_log_times": past_log_times}


def update_driving_status():

    deployment = get_or_create_deployment('Safe Driving')
    clients = get_deployment_clients(deployment=deployment)

    for client in clients:
        client_name = client.name
        client_keyname = client.keyname
        client_id = client.id

        response = get_driving_data(client_keyname, client_id)
        if response is not None:
            processed_data = process_driving_data(response)

            # generate_testing_data(client_alias, response, processed_data)

            data = processed_data["gx"]
            camera_data = processed_data["cameras"]
            all_units_status = processed_data["severities"]
            alerts = processed_data["alerts"]
            past_log_times = processed_data["past_log_times"]

        else:
            print(f"No data for {client_name}")
            continue

        hour_data = data["hour"]
        recent_data = data["ten_minutes"]

        date_now = datetime.now(tz=pytz.timezone('UTC'))

        client_args = {
            'name': client_name,
            'deployment': deployment
        }
        client = get_client(client_args)

        history_logs = []
        alerts_to_send = {}
        for unit_name, unit_logs in hour_data.items():
            if client_keyname != "tp":  # Hardcoded
                unit_logs["En_viaje"] = None
                unit_logs["Estatus"] = None

            # Get Unit instance
            unit_args = {
                'name': unit_name,
                'client': client
            }
            unit_obj = get_or_create_unit(unit_args)

            failed_trips = get_unit_failed_trips(unit_obj)
            num_failed_trips = len(failed_trips)

            if unit_name in past_log_times:
                for log_time in past_log_times[unit_name]:
                    for trip in failed_trips:
                        if (not trip.active and trip.end_datetime and trip.end_datetime > log_time > trip.start_datetime) \
                                or (trip.end_datetime is None and log_time > trip.start_datetime):
                            print(f"Setting {trip} to successful")
                            trip.active = True
                            trip.save()
                            num_failed_trips -= 1

            # Returns None if the unit is new
            current_unit_status = get_unitstatus(unit_id=unit_obj.id)

            if current_unit_status:
                was_unit_active = not (current_unit_status.status.description.startswith("Sin comunicación") or
                                       current_unit_status.status.description.startswith("Logs pendientes") or
                                       current_unit_status.status.description == "Inactivo")

                was_unit_on_trip = current_unit_status.on_trip
            else:  # In case the unit is new
                was_unit_active = False
                was_unit_on_trip = False

            trip = None

            if was_unit_on_trip == False and unit_logs.get("En_viaje", False):
                trip = create_unit_trip(unit=unit_obj, start_datetime=date_now)
                print(f"Trip created {unit_obj.name}")
            elif was_unit_on_trip:
                trip, created = get_or_create_open_trip(
                    unit_obj, start_datetime=date_now)

                if not unit_logs.get("En_viaje", True):
                    trip.end_datetime = date_now
                    trip.end_date = date_now.date()
                    trip.save()

            unit_status = all_units_status[unit_name]

            # If the unit met the conditions for more than one severity level, take the most critical (max)
            most_severe = max(unit_status, key=lambda x: x["severity"])
            severity = most_severe["severity"]
            description = most_severe["description"]

            if unit_logs.get("En_viaje", True) and not description.startswith("Sin comunicación") and trip is not None:
                trip.active = True
                trip.save()

            priority = False
            if num_failed_trips >= 3:
                description = "Sin comunicación (>2 viajes)"
                severity = 5
                priority = True

            if description == "Read only SSD" or description == "forced reboot (>1)" or description == "Tres cámaras fallando":
                priority = True
            elif not description.endswith("viajes)") and \
                    (description.startswith("Sin comunicación") or description == "Inactivo" or description.startswith("Logs pendientes")):
                # If the unit just turned inactive, check last active status
                # If the last status was read only ssd, override severity to 5 and priority to True

                last_active_status = get_unit_last_active_status(unit_obj)
                if last_active_status:
                    if last_active_status.status.description == "Read only SSD":
                        severity = 5
                        priority = True
                        message = "Sin comunicación reciente, último mensaje fue Read only SSD"
                        if unit_name in alerts:
                            alerts[unit_name].append(message)
                        else:
                            alerts[unit_name] = [message]

                """ if was_unit_active:
                    last_active_status = get_unit_last_active_status(unit_obj)
                    if last_active_status:
                        if last_active_status.status.description == "Read only SSD":
                            severity = 5
                            priority = True
                            message = "Sin comunicación reciente, último mensaje fue Read only SSD"
                            if unit_name in alerts:
                                alerts[unit_name].append(message)
                            else:
                                alerts[unit_name] = [message]
                else:
                    # If the unit was inactive before, copy previous priority
                    priority = current_unit_status.status.priority if current_unit_status else False

                    if priority:
                        severity = 5
                        message = "Sin comunicación reciente, último mensaje fue Read only SSD"
                        if unit_name in alerts:
                            alerts[unit_name].append(message)
                        else:
                            alerts[unit_name] = [message] """

            # Get GxStatus object
            status_args = {
                'severity': severity,
                'description': description,
                'deployment': deployment,
                'priority': priority
            }

            status_obj = get_or_create_gxstatus(status_args)

            camerastatus_list = []
            camerahistory_list = []
            for cam_num, count in camera_data["hour"][unit_name].items():
                camera_args = {
                    'name': f"cam_{unit_name}_{cam_num}",
                    'gx': unit_obj
                }
                camera_obj = get_or_create_camera(camera_args)

                recent_disconnection_time = camera_data["ten_minutes"][unit_name].get(
                    cam_num, 0)
                connected = recent_disconnection_time == 0

                camera_status_args = {
                    'camera': camera_obj,
                    'last_update': date_now,
                    'connected': connected,
                    'disconnection_time': timedelta(minutes=count)

                }
                camerastatus_list.append(camera_status_args)

                camera_history_args = {
                    'camera': camera_obj,
                    'register_datetime': date_now,
                    'register_date': date_now.date(),
                    'connected': connected,
                    'disconnection_time': timedelta(minutes=recent_disconnection_time)
                }
                camerahistory_list.append(camera_history_args)

            bulk_update_camerastatus(camerastatus_list)
            bulk_create_camerahistory(camerahistory_list)

            last_connection = (datetime.fromisoformat(unit_logs['Ultima_actualizacion']) + timedelta(hours=6)).replace(tzinfo=pytz.UTC) \
                if unit_logs['Ultima_actualizacion'] != 'null' else None

            if current_unit_status:
                last_alert = current_unit_status.last_alert
            else:  # In case the unit is new
                last_alert = date_now

            alert_interval = 59
            if unit_name in alerts and (last_alert == None or date_now - last_alert > timedelta(minutes=alert_interval)):
                for description in alerts[unit_name]:
                    alert_type = get_or_create_alerttype(description)
                    alert_args = {"alert_type": alert_type, "gx": unit_obj,
                                  "register_datetime": date_now, "register_date": date_now.date()}
                    alert = create_alert(alert_args)

                alerts_to_send[unit_name] = alerts[unit_name]
                last_alert = date_now

            unit_status_args = {
                'unit_id': unit_obj.id,
                'defaults': {
                    'last_update': date_now,
                    'last_alert': last_alert,
                    'total': unit_logs["total"],
                    'restart': unit_logs["restart"],
                    'reboot': unit_logs["reboot"],
                    'start': unit_logs["start"],
                    'data_validation': unit_logs["data_validation"],
                    'source_missing': unit_logs["source_missing"],
                    'camera_connection': unit_logs["camera_missing"],
                    'storage_devices': unit_logs["storage_devices"],
                    'forced_reboot': unit_logs["forced_reboot"],
                    'read_only_ssd': unit_logs["read_only_ssd"],
                    'ignition': unit_logs["Ignición"],
                    'aux': unit_logs["Aux"],
                    'others': unit_logs["others"],
                    'last_connection': last_connection,
                    'pending_events': unit_logs['Jsons_eventos_pendientes'],
                    'pending_status': unit_logs['Jsons_status_pendientes'],
                    'restarting_loop': unit_logs["restarting_loop"],
                    'status': status_obj,
                    'active': True
                }
            }
            if "En_viaje" in unit_logs:
                unit_status_args["defaults"]["on_trip"] = unit_logs["En_viaje"]

            unitstatus = update_or_create_unitstatus(unit_status_args)

            # Last 10 minutes

            recent_unit_logs = recent_data[unit_name]
            if client_keyname != "tp":  # Hardcoded
                recent_unit_logs["En_viaje"] = None
                recent_unit_logs["Estatus"] = None

            if 'Ultima_actualizacion' not in recent_unit_logs:
                print(recent_unit_logs)

            last_connection = (datetime.fromisoformat(unit_logs['Ultima_actualizacion']) + timedelta(hours=6)).replace(tzinfo=pytz.UTC) \
                if unit_logs['Ultima_actualizacion'] != 'null' else None

            unit_history = {
                'unit': unit_obj,
                'register_date': date_now.date(),
                'register_datetime': date_now,
                'total': recent_unit_logs["total"],
                'restart': recent_unit_logs["restart"],
                'reboot': recent_unit_logs["reboot"],
                'start': recent_unit_logs["start"],
                'data_validation': recent_unit_logs["data_validation"],
                'source_missing': recent_unit_logs["source_missing"],
                'camera_connection': recent_unit_logs["camera_missing"],
                'storage_devices': recent_unit_logs["storage_devices"],
                'forced_reboot': recent_unit_logs["forced_reboot"],
                'read_only_ssd': recent_unit_logs["read_only_ssd"],
                'ignition': recent_unit_logs["Ignición"],
                'aux': recent_unit_logs["Aux"],
                'others': recent_unit_logs["others"],
                'last_connection': last_connection,
                'pending_events': recent_unit_logs['Jsons_eventos_pendientes'],
                'pending_status': recent_unit_logs['Jsons_status_pendientes'],
                'restarting_loop': recent_unit_logs["restarting_loop"],
                'status': status_obj
            }
            if "En_viaje" in recent_unit_logs:
                unit_history['on_trip'] = recent_unit_logs["En_viaje"]

            history_logs.append(unit_history)

        bulk_create_unithistory(history_logs)

        if alerts_to_send and os.environ.get("ALERTS") == "true":
            send_sd_alerts(chat="SAFEDRIVING_CHAT", alerts=alerts_to_send)


def check_inactive_units():
    inactive_units = get_inactive_units()

    if inactive_units:
        print("Units to set inactive:")
        print([unitstatus.unit.name for unitstatus in inactive_units])

    inactive_units.update(active=False)


def check_severity_ratios():
    counts = get_units_severity_counts()
    problem_counts = get_units_problem_counts()

    counts_dict = {count["severity"]: count["count"] for count in counts}

    total_active_units = sum(counts_dict.values()) - counts_dict[0]

    # Hardcoded
    status_names = {
        0: "Inactivo",
        1: "Funcionando",
        2: "Normal",
        3: "Alerta",
        4: "Fallando",
        5: "Crítico",
    }
    # Thresholds for each problematic severity level, to send an alert if exceeded
    status_thresholds = {
        3: 0.25,
        4: 0.3,
        5: 0.3,
    }

    for level, threshold in status_thresholds.items():
        if counts_dict[level] / total_active_units >= threshold:
            most_common_problem = problem_counts.filter(
                status__severity=level).order_by('-count')[0]["description"]

            msg = f'ALERTA: {counts_dict[level] / total_active_units:.2%} de dispositivos en estado {status_names[level]}\nProblema prevalente: {most_common_problem}'
            send_telegram(chat="SAFEDRIVING_CHAT", message=msg)


# Industry

def calculate_logs_delay(first_log_time: Optional[datetime], data_last_connection: Optional[datetime],
                         db_last_connection: Optional[datetime], db_register_time: Optional[datetime],
                         db_delay_time: Optional[timedelta]):
    date_now = datetime.now(tz=pytz.timezone('UTC'))

    last_connection = db_last_connection

    if data_last_connection:
        # Asignar nueva última conexión
        # Hardcoded
        last_connection = data_last_connection
        time_since_last_log = date_now - last_connection

        # Si existe ese dato, ver si tiene más de 10 minutos. En ese caso, ponerlo como atrasado
        if db_last_connection:

            # Revisar si hubo retraso entre el primer log en los últimos 10 minutos y la última conexión según la DB
            # Se verifica que hayan registros recientes (con db_register_time) para no tomar un error en el ćodigo
            # como retraso

            # Arreglar caso en el que se missea el log reciente por poquito, produciendo un retraso falso
            if first_log_time and first_log_time - db_last_connection > timedelta(minutes=11) and \
                    not (db_register_time == None or last_connection - db_register_time > timedelta(minutes=11)):
                delayed = True

                # Redondear a segundos
                delay_time = first_log_time - \
                    db_last_connection - timedelta(minutes=10)
                delay_time -= timedelta(microseconds=delay_time.microseconds)
                delay_time = delay_time

            # Si hay un retraso actualmente
            elif time_since_last_log > timedelta(minutes=11):
                delayed = True
                delay_time = time_since_last_log - \
                    timedelta(minutes=10)
            else:
                delayed = False
                delay_time = timedelta(0)

        else:  # En caso de que haya un nuevo dispositivo
            if time_since_last_log > timedelta(minutes=11):
                delayed = True
                delay_time = time_since_last_log - \
                    timedelta(minutes=10)
            else:
                delayed = False
                delay_time = timedelta(0)

    # Si no ha llegado nada en una hora, marcarlo directamente como retraso
    else:
        delayed = True

        if db_last_connection:  # Si hay última conexión en BD, usarla para calcular retraso
            delay_from_last_connection = date_now - \
                db_last_connection - timedelta(minutes=10)
            delay_from_last_connection -= timedelta(
                microseconds=delay_from_last_connection.microseconds)
            delay_time = delay_from_last_connection

        else:  # Si no, sumar 10 minutos a tiempo de retraso en BD
            delay_time = db_delay_time + \
                timedelta(minutes=10)

    return delayed, delay_time


def get_industry_data(client_keyname: str, client_id: int, deployment="Industry"):

    if deployment == "Industry":
        login_url = f'https://{client_keyname}.industry.aivat.io/login/'
        request_url = f'https://{client_keyname}.industry.aivat.io/stats_json/'
    elif deployment == "Smart Buildings":
        login_url = f'https://{client_keyname}.sm-build.aivat.io/login/'
        request_url = f'https://{client_keyname}.sm-build.aivat.io/stats_json/'

    credentials = get_api_credentials(deployment, client_id)

    try:
        token = api_login(login_url, credentials)
    except requests.exceptions.ConnectionError:
        print("Connection error")
        return

    now = datetime.now(tz=pytz.timezone('UTC')).replace(tzinfo=None)
    time_interval = {
        "initial_datetime": (now - timedelta(hours=1)).isoformat(timespec="seconds"),
        "final_datetime": now.isoformat(timespec='seconds')
    }

    response, status = make_request(request_url, time_interval, token)
    if not (status == 200 or status == 201):
        token = api_login(login_url, credentials)
        response, status = make_request(request_url, time_interval, token)

    if status == 200 or status == 201:
        response = response.json()
    else:
        print(f"Status code: {status}")
        return

    return response


def process_industry_data(response):
    now = datetime.now(tz=pytz.timezone('UTC'))
    fields = {"batch_dropping": 0,
              "camera_connection": timedelta(0),
              "restart": 0,
              "license": 0,
              "shift_change": 0,
              "others": 0,
              "delayed": False,
              "delay_time": timedelta(0)}

    output_cameras = {}

    log_types = {"batch_dropping": "Batch dropping",
                 "restart": "Restarting",
                 "license": "[LICENSE]",
                 "shift_change": "SRC"}

    license_ends = {}

    recent_threshold = 10  # Minutes

    hourly_log_counts = {}
    recent_log_counts = {}
    last_connections = {}
    # First log received within the threshold time window, for each device
    first_log_times = {}
    disconnection_times = {}

    alerts = {}

    for device_name, data in response.items():
        disconnection_times[device_name] = {}

        last_connections[device_name] = None
        first_log_times[device_name] = None
        license_ends[device_name] = None

        device_logs = data["logs"]
        cameras_data = data["cameras"]

        hourly_log_counts[device_name] = {"counts": {}, "cameras": {}}
        recent_log_counts[device_name] = {"counts": {}, "cameras": {}}

        if device_logs:
            last_log = device_logs[0]
            last_log_date = datetime.fromisoformat(
                last_log["register_time"][:-1]).replace(tzinfo=pytz.utc)

            last_connections[device_name] = last_log_date

        device_hour_counts = {"batch_dropping": 0,
                              "restart": 0,
                              "license": 0,
                              "shift_change": 0,
                              "others": 0, }
        device_recent_counts = {"batch_dropping": 0,
                                "restart": 0,
                                "license": 0,
                                "shift_change": 0,
                                "others": 0, }
        for log in device_logs:
            register_time = datetime.fromisoformat(
                log["register_time"][:-1]).replace(tzinfo=pytz.utc)
            log_time = datetime.fromisoformat(f'{log["log_date"]}T{log["log_time"]}').replace(
                tzinfo=pytz.utc)

            # Check if the log arrived at the server within the last 10 minutes

            if register_time > now - timedelta(minutes=recent_threshold):
                intervals = [device_hour_counts, device_recent_counts]

                first_log_times[device_name] = register_time
            else:
                intervals = [device_hour_counts]

            log_msg = log["log"]

            if log_msg != "":
                found_category = False
                for log_type, start in log_types.items():
                    if log_msg.startswith(start):

                        for interval_count in intervals:
                            if log_type not in interval_count:
                                interval_count[log_type] = 1
                            else:
                                interval_count[log_type] += 1
                        found_category = True

                        if start == "[LICENSE]":
                            days_remaining = int(log_msg.split()[-2])
                            date, time = log_msg.split("until")[
                                1].split()[:2]
                            license_end = datetime.fromisoformat(
                                f'{date}T{time[:-1]}')
                            license_ends[device_name] = license_end

                if not found_category:
                    for interval_count in intervals:
                        if "others" in interval_count:
                            interval_count["others"] += 1
                        else:
                            interval_count["others"] = 1

        hourly_log_counts[device_name]["counts"] = device_hour_counts
        recent_log_counts[device_name]["counts"] = device_recent_counts

        cam_hour_counts = {}
        cam_recent_counts = {}
        for camera_name, camera_logs in cameras_data.items():
            disconnection_times[device_name][camera_name] = {}
            for interval in ["hour", "recent"]:
                disconnection_times[device_name][camera_name][interval] = timedelta(
                    0)

            for log in camera_logs:
                register_time = datetime.fromisoformat(
                    log["register_time"][:-1]).replace(tzinfo=pytz.utc)
                log_time = datetime.fromisoformat(f'{log["log_date"]}T{log["log_time"]}').replace(
                    tzinfo=pytz.utc)

                log_msg = log["log"]

                if log["log"].startswith("Desconectada"):
                    disconnection_times[device_name][camera_name]["hour"] += timedelta(
                        minutes=2)

                # Check if the log arrived at the server within the last 10 minutes

                if register_time > now - timedelta(minutes=recent_threshold):
                    intervals = [cam_hour_counts, cam_recent_counts]

                    first_log_time = register_time
                    first_log_times[device_name] = first_log_time

                    if log["log"].startswith("Desconectada"):
                        disconnection_times[device_name][camera_name]["recent"] += timedelta(
                            minutes=2)
                else:
                    intervals = [cam_hour_counts]

                """ if log_type:  # If log isn't empty
                    for interval_count in intervals:
                        if log_type not in interval_count:
                            interval_count[log_type] = 1
                        else:
                            interval_count[log_type] += 1 """

        # Prevent an error in case there were no logs and the list is empty
        try:
            max_cam_disc_time = max([camera_data["recent"]
                                    for name, camera_data in disconnection_times[device_name].items()])
        except ValueError:
            max_cam_disc_time = timedelta(0)

        hourly_log_counts[device_name]["cameras"][camera_name] = cam_hour_counts
        recent_log_counts[device_name]["cameras"][camera_name] = cam_recent_counts

        alert_conditions = {
            "Reinicios de pipeline": (hourly_log_counts[device_name]["counts"]["restart"] > 0),
            "Desconexión de cámara": (max_cam_disc_time > timedelta(minutes=2)),
            "Batch dropping": (hourly_log_counts[device_name]["counts"]["batch_dropping"] > 0),
        }
        alerts[device_name] = set()
        for description, cond in alert_conditions.items():
            if cond:
                alerts[device_name].add(description)

    log_counts = {"hour": hourly_log_counts, "recent": recent_log_counts}

    return log_counts, disconnection_times, last_connections, first_log_times, alerts, license_ends


def update_industry_status(deployment_name="Industry"):
    now = datetime.now(tz=pytz.timezone("UTC"))

    if deployment_name == "Industry":
        chat_name = "INDUSTRY"
    elif deployment_name == "Smart Buildings":
        chat_name = "SMART_BUILDINGS"

    deployment = get_or_create_deployment(deployment_name)
    clients = get_deployment_clients(deployment)

    for client in clients:
        client_keyname = client.keyname
        client_name = client.name
        client_id = client.id

        response = get_industry_data(
            client_keyname, client_id, deployment_name)

        """ if client_alias != "cmxws":
            continue """
        """ with open("./monitor/industry_logs_sample.json", "r") as f:
            response = json.load(f) """

        if response is not None:
            processed_data = process_industry_data(response)
        else:
            print(f"No data for {client_name}")
            continue

        log_counts, disconnection_times, last_connections, first_log_times, alerts, license_ends = processed_data

        camerastatus_data = []
        camerahistory_data = []
        max_cam_disc_times = {}
        for device_name, cameras in disconnection_times.items():
            device_args = {
                "client": client,
                "name": device_name,
            }
            device = get_or_create_device(device_args)

            max_cam_disc_times[device_name] = timedelta(0)
            for camera_name, intervals in cameras.items():
                recent_disc_time = intervals["recent"]
                hour_disc_time = intervals["hour"]

                if recent_disc_time > max_cam_disc_times[device_name]:
                    max_cam_disc_times[device_name] = recent_disc_time

                camera_args = {
                    'name': camera_name,
                    'gx': device
                }
                camera = get_or_create_camera(camera_args)

                camerastatus_data.append({
                    'camera': camera,
                    'connected': recent_disc_time == timedelta(0),
                    'last_update': now,
                    'disconnection_time': hour_disc_time
                })

                camerahistory_data.append({
                    'camera': camera,
                    'register_datetime': now,
                    'register_date': now.date(),
                    'connected': recent_disc_time == timedelta(0),
                    'disconnection_time': recent_disc_time
                })
        bulk_update_camerastatus(camerastatus_data)
        bulk_create_camerahistory(camerahistory_data)

        device_names = last_connections.keys()

        for device_name in device_names:
            device_args = {
                "client": client,
                "name": device_name,
            }
            device = get_or_create_device(device_args)

            if license_ends[device_name]:
                device.license_end = license_ends[device_name]
                days_remaining = license_ends[device_name].replace(
                    tzinfo=pytz.timezone('UTC')) - now
                device.license_days = days_remaining.days
                device.save()

            # Get last connection from DeviceStatus entry
            try:
                current_device_status = get_device_status(
                    device_id=device.id)
                db_register_time = current_device_status.last_update
                db_last_connection = current_device_status.last_connection
                db_delay_time = current_device_status.delay_time
            except:
                current_device_status = None
                db_last_connection = None
                db_register_time = None
                db_delay_time = timedelta(0)

            delayed, delay_time = calculate_logs_delay(
                first_log_times[device_name],
                last_connections[device_name],
                db_last_connection,
                db_register_time,
                db_delay_time
            )

            if last_connections[device_name]:
                last_connection = last_connections[device_name]
            else:
                last_connection = db_last_connection

            last_alert = current_device_status.last_alert if current_device_status else None
            alert_interval = 59

            if delayed:
                alerts[device_name].add("Sin conexión reciente")

            # Create and send new alerts
            if last_alert == None or now - last_alert > timedelta(minutes=alert_interval):
                message = f'{client_name} - {device.name}:\n'
                alert_info = ""

                for description in alerts[device_name]:
                    alert_type = get_or_create_alerttype(description)

                    if description == "Desconexión de cámara":
                        # Mandar minutos de desconexión en última hora
                        alert_info = str(
                            log_counts['hour'][device_name]['counts'].get('camera_connection'))

                    message += f'{description}: {alert_info}\n' if alert_info else f'{description}\n'

                    alert_args = {"alert_type": alert_type, "gx": device,
                                  "register_datetime": now, "register_date": now.date(),
                                  "description": alert_info}
                    alert = create_alert(alert_args)

                if alerts[device_name] and os.environ.get("ALERTS") == "true":
                    send_telegram(chat=f'{chat_name}_CHAT',
                                  message=message)

                    last_alert = now

            restarted_recently = current_device_status.status.description == "Reinicios" \
                if current_device_status else False

            status_conditions = [
                (log_counts["recent"][device_name]['counts'].get('restart', 0) >
                 0 and not restarted_recently, 3, "Reinicios"),
                (timedelta(minutes=10) > max_cam_disc_times[device_name] >
                 timedelta(minutes=2), 3, "Cámara desconectada"),
                (log_counts["hour"][device_name]['counts'].get('batch_dropping', 0)
                 > 0, 3, "Batch dropping"),
                (delayed and delay_time
                 < timedelta(minutes=60), 3, "Sin comunicación reciente"),
                (max_cam_disc_times[device_name] >= timedelta(
                    minutes=10), 5, "Cámara desconectada"),
                (log_counts["recent"][device_name]['counts'].get('restart', 0) >
                 0 and restarted_recently, 5, "Reinicios"),
                (delay_time >= timedelta(
                    minutes=60), 5, "Sin comunicación"),
            ]

            severity = 1
            rule = "Comunicación reciente"
            for condition, status, description in status_conditions:
                if condition:
                    severity = status
                    rule = description

            gxstatus_args = {
                'severity': severity,
                'description': rule,
                'deployment': deployment
            }
            status = get_or_create_gxstatus(gxstatus_args)

            total_disc_time = sum(
                [intervals["hour"] for cam_name, intervals in disconnection_times[device_name].items()], timedelta())

            defaults = {
                'last_update': now,
                'batch_dropping': log_counts["hour"][device_name]['counts'].get("batch_dropping", 0),
                'camera_connection': total_disc_time,
                'restart': log_counts["hour"][device_name]['counts'].get("restart", 0),
                'license': log_counts["hour"].get("license", 0),
                'shift_change': log_counts["hour"][device_name]['counts'].get("shift_change", 0),
                'others': log_counts["hour"][device_name]['counts'].get("others", 0),
                'last_connection': last_connection,
                'last_alert': last_alert,
                'delayed': delayed,
                'delay_time': delay_time,
                'status': status,
            }
            device_status = update_or_create_device_status(
                {"device": device, "defaults": defaults})

            """ devicehistory_args = {
                "device": device,
                "register_datetime": now,
                "register_date": now.date(),
                "last_connection": last_connection,
                "last_alert": last_alert_time,
                "delayed": delayed,
                "delay_time": delay_time,
                "status": status,
                "log_counts": log_counts["recent"][device_name]["counts"]
            } """
            total_disc_time = sum([intervals["recent"] for cam_name,
                                  intervals in disconnection_times[device_name].items()], timedelta())

            devicehistory_args = {
                'device': device,
                'register_date': now.date(),
                'register_datetime': now,
                'last_connection': last_connection,
                'delayed': delayed,
                'delay_time': delay_time,
                'batch_dropping': log_counts["recent"][device_name]["counts"].get("batch_dropping"),
                'camera_connection': total_disc_time,
                'restart': log_counts["recent"][device_name]["counts"].get("restart"),
                'license': log_counts["recent"][device_name]["counts"].get("license"),
                'shift_change': log_counts["recent"][device_name]["counts"].get("shift_change"),
                'others': log_counts["recent"][device_name]["counts"].get("others"),
                'status': status
            }
            create_device_history(devicehistory_args)

    disconnected_devices = get_devices_without_updates(deployment_name)
    for device in disconnected_devices:
        client_name = device.client.name

        try:
            current_device_status = device.devicestatus
            db_register_time = current_device_status.last_update
            db_last_connection = current_device_status.last_connection
            db_delay_time = current_device_status.delay_time
        except:
            current_device_status = None
            db_last_connection = None
            db_register_time = None
            db_delay_time = timedelta(0)

        delayed, delay_time = calculate_logs_delay(
            None, None, db_last_connection, db_register_time, db_delay_time)

        last_alert = current_device_status.last_alert if current_device_status else None
        alert_interval = 59

        if delayed:
            alerts = ["Sin comunicación reciente"]
        else:
            alerts = []

        if last_alert == None or now - last_alert > timedelta(minutes=alert_interval):
            message = f'{client_name} - {device.name}:\n'
            alert_info = ""

            for description in alerts:
                alert_type = get_or_create_alerttype(description)

                message += f'{description}: {alert_info}\n' if alert_info else f'{description}\n'

                alert_args = {"alert_type": alert_type, "gx": device,
                              "register_datetime": now, "register_date": now.date(),
                              "description": alert_info}
                create_alert(alert_args)

            if alerts and os.environ.get("ALERTS") == "true":
                send_telegram(chat="INDUSTRY_CHAT",
                              message=message)

                last_alert = now

        if (delay_time >= timedelta(
                minutes=60)):

            args = {
                'severity': 5,
                'description': "Sin comunicación",
                'deployment': deployment
            }
            status = get_or_create_gxstatus(args)

            defaults = {
                'last_update': now,
                'camera_connection': timedelta(0),
                'batch_dropping': 0,
                'restart': 0,
                'license': 0,
                'shift_change': 0,
                'others': 0,
                'last_alert': last_alert,
                'delayed': delayed,
                'delay_time': delay_time,
                'status': status,
            }
            update_or_create_device_status(
                {"device": device, "defaults": defaults})

            devicehistory_args = {
                'device': device,
                'register_date': now.date(),
                'register_datetime': now,
                'last_connection': db_last_connection,
                'delayed': delayed,
                'delay_time': delay_time,
                'camera_connection': timedelta(0),
                'batch_dropping': 0,
                'restart': 0,
                'license': 0,
                'shift_change': 0,
                'others': 0,
                'status': status
            }
            create_device_history(devicehistory_args)


# Smart Retail
def get_retail_data(client_keyname, client_id):
    # Hardcoded
    urls = {
        "enbl": {
            "login": 'https://enbl.retail.aivat.io/login/',
            "logs": 'https://enbl.retail.aivat.io/itw_logs/'
        },
    }
    login_url = urls[client_keyname]["login"]
    request_url = urls[client_keyname]["logs"]

    credentials = get_api_credentials("Smart Retail", client_id)
    if not credentials:
        return None

    try:
        token = api_login(login_url, credentials)
    except requests.exceptions.ConnectionError:
        print("Connection error")
        return

    now = datetime.now(tz=pytz.timezone('UTC')).replace(tzinfo=None)
    time_interval = {
        "initial_datetime": (now - timedelta(hours=1)).isoformat(timespec="seconds"),
        "final_datetime": now.isoformat(timespec='seconds')
    }

    response, status = make_request(request_url, time_interval, token)
    print(response, status)
    if not (status == 200 or status == 201):
        token = api_login(login_url, credentials)
        response, status = make_request(request_url, time_interval, token)

    if status == 200 or status == 201:
        response = response.json()
    else:
        print(f"Status code: {status}")
        return

    return response


def process_retail_data(response):
    now = datetime.now(tz=pytz.timezone('UTC'))

    recent_threshold = 10  # Minutes

    hourly_log_counts = {}
    recent_log_counts = {}
    last_connections = {}
    # First log received within the threshold time window, for each device
    first_log_times = {}
    disconnection_times = {}

    alerts = defaultdict(set)

    for device_name, data in response.items():
        disconnection_times[device_name] = {}

        last_connections[device_name] = None
        first_log_times[device_name] = None

        device_logs = data["logs"]
        cameras_data = data["cameras"]

        hourly_log_counts[device_name] = {"counts": {}, "cameras": {}}
        recent_log_counts[device_name] = {"counts": {}, "cameras": {}}

        if device_logs:
            last_log = device_logs[0]
            last_log_date = datetime.fromisoformat(
                last_log["register_time"][:-1]).replace(tzinfo=pytz.utc)

            last_connections[device_name] = last_log_date

        device_hour_counts = {}
        device_recent_counts = {}
        for log in device_logs:
            register_time = datetime.fromisoformat(
                log["register_time"][:-1]).replace(tzinfo=pytz.utc)
            log_time = datetime.fromisoformat(f'{log["log_date"]}T{log["log_time"]}').replace(
                tzinfo=pytz.utc)

            # Check if the log arrived at the server within the last 10 minutes

            if register_time > now - timedelta(minutes=recent_threshold):
                intervals = [device_hour_counts, device_recent_counts]

                first_log_times[device_name] = register_time
            else:
                intervals = [device_hour_counts]

            log_msg = log["log"]
            log_type = log_msg.split("]")[0][1:]

            if log_type:  # If log isn't empty
                for interval_count in intervals:
                    if log_type not in interval_count:
                        interval_count[log_type] = 1
                    else:
                        interval_count[log_type] += 1

            alert_conditions = {}
            for description, cond in alert_conditions.items():
                if cond:
                    alerts[device_name].add(description)

        hourly_log_counts[device_name]["counts"] = device_hour_counts
        recent_log_counts[device_name]["counts"] = device_recent_counts

        cam_hour_counts = {}
        cam_recent_counts = {}
        for camera_name, camera_logs in cameras_data.items():
            disconnection_times[device_name][camera_name] = {}
            for interval in ["hour", "recent"]:
                disconnection_times[device_name][camera_name][interval] = timedelta(
                    0)

            for log in camera_logs:
                register_time = datetime.fromisoformat(
                    log["register_time"][:-1]).replace(tzinfo=pytz.utc)
                log_time = datetime.fromisoformat(f'{log["log_date"]}T{log["log_time"]}').replace(
                    tzinfo=pytz.utc)

                log_msg = log["log"]
                log_type = log_msg.split("]")[0][1:]

                if log_type == "DISC_CAM":
                    disconnection_times[device_name][camera_name]["hour"] += timedelta(
                        minutes=2)

                # Check if the log arrived at the server within the last 10 minutes

                if register_time > now - timedelta(minutes=recent_threshold):
                    intervals = [cam_hour_counts, cam_recent_counts]

                    first_log_time = register_time
                    first_log_times[device_name] = first_log_time

                    if log_type == "DISC_CAM":
                        disconnection_times[device_name][camera_name]["recent"] += timedelta(
                            minutes=2)
                else:
                    intervals = [cam_hour_counts]

                if log_type:  # If log isn't empty
                    for interval_count in intervals:
                        if log_type not in interval_count:
                            interval_count[log_type] = 1
                        else:
                            interval_count[log_type] += 1

            hourly_log_counts[device_name]["cameras"][camera_name] = cam_hour_counts
            hourly_log_counts[device_name]["cameras"][camera_name] = cam_recent_counts

    log_counts = {"hour": hourly_log_counts, "recent": recent_log_counts}
    license = 0  # Placeholder

    return log_counts, disconnection_times, last_connections, first_log_times, alerts, license


def update_retail_status():
    now = datetime.now(tz=pytz.timezone("UTC"))

    deployment = get_or_create_deployment('Smart Retail')
    clients = get_deployment_clients(deployment)

    for client in clients:
        client_alias = client.keyname
        client_name = client.name

        response = get_retail_data(client_alias, client.id)

        if response is not None:
            processed_data = process_retail_data(response)
        else:
            print(f"No data for {client_name}")
            continue

        log_counts, disconnection_times, last_connections, first_log_times, alerts, license = processed_data

        camerastatus_data = []
        camerahistory_data = []
        max_cam_disc_times = {}
        for device_name, cameras in disconnection_times.items():
            device_args = {
                "client": client,
                "name": device_name,
            }
            device = get_or_create_device(device_args)

            max_cam_disc_times[device_name] = timedelta(0)
            for camera_name, intervals in cameras.items():
                recent_disc_time = intervals["recent"]
                hour_disc_time = intervals["hour"]

                if recent_disc_time > max_cam_disc_times[device_name]:
                    max_cam_disc_times[device_name] = recent_disc_time

                camera_args = {
                    'name': camera_name,
                    'gx': device
                }
                camera = get_or_create_camera(camera_args)

                camerastatus_data.append({
                    'camera': camera,
                    'connected': recent_disc_time == timedelta(0),
                    'last_update': now,
                    'disconnection_time': hour_disc_time
                })

                camerahistory_data.append({
                    'camera': camera,
                    'register_datetime': now,
                    'register_date': now.date(),
                    'connected': recent_disc_time == timedelta(0),
                    'disconnection_time': recent_disc_time
                })
        bulk_update_camerastatus(camerastatus_data)
        bulk_create_camerahistory(camerahistory_data)

        device_names = last_connections.keys()

        for device_name in device_names:
            device_args = {
                "client": client,
                "name": device_name,
            }
            device = get_or_create_device(device_args)

            # Get last connection from DeviceStatus entry
            try:
                current_device_status = get_retail_device_status(
                    device_id=device.id)
                db_register_time = current_device_status.last_update
                db_last_connection = current_device_status.last_connection
                db_delay_time = current_device_status.delay_time
            except:
                current_device_status = None
                db_last_connection = None
                db_register_time = None
                db_delay_time = timedelta(0)

            delayed, delay_time = calculate_logs_delay(
                first_log_times[device_name], last_connections[device_name], db_last_connection, db_register_time, db_delay_time)

            if last_connections[device_name]:
                last_connection = last_connections[device_name]
            else:
                last_connection = db_last_connection

            last_alert = current_device_status.last_alert if current_device_status else None
            alert_interval = 59

            if delayed:
                alerts[device_name].add("Sin conexión reciente")

            # Create and send new alerts
            if last_alert == None or now - last_alert > timedelta(minutes=alert_interval):
                message = f'{client_name} - {device.name}:\n'
                alert_info = ""

                for description in alerts[device_name]:
                    alert_type = get_or_create_alerttype(description)

                    if description == "Desconexión de cámara":
                        # Mandar minutos de desconexión en última hora
                        alert_info = str(
                            log_counts['hour'][device_name]['counts'].get('camera_connection'))

                    message += f'{description}: {alert_info}\n' if alert_info else f'{description}\n'

                    alert_args = {"alert_type": alert_type, "gx": device,
                                  "register_datetime": now, "register_date": now.date(),
                                  "description": alert_info}
                    alert = create_alert(alert_args)

                """ if alerts[device_name] and os.environ.get("ALERTS") == "true":
                    send_telegram(chat="INDUSTRY_CHAT",
                                  message=message) """

            status_conditions = [
                (max_cam_disc_times[device_name] >
                 timedelta(0), 5, "Cámara desconectada"),
                (delay_time > timedelta(minutes=20),
                 5, "Sin comunicación reciente"),
                (log_counts["hour"][device_name]["counts"].get(
                    "MASTER_RESTART", 0) > 0, 5, "Reinicio de máster"),
                (timedelta(minutes=20) >= delay_time > timedelta(0), 3,
                 "Sin comunicación reciente (<20 min)"),
            ]
            severity = 1
            rule = "Comunicación reciente"
            for condition, status, description in status_conditions:
                if condition:
                    severity = status
                    rule = description

            gxstatus_args = {
                'severity': severity,
                'description': rule,
                'deployment': deployment
            }
            status = get_or_create_gxstatus(gxstatus_args)

            defaults = {
                "last_update": now,
                "last_connection": last_connection,
                "last_alert": last_alert,
                "delayed": delayed,
                "delay_time": delay_time,
                "status": status,
                "log_counts": log_counts["hour"][device_name]["counts"]
            }
            device_status = update_or_create_retail_device_status(
                device=device, defaults=defaults)

            devicehistory_args = {
                "device": device,
                "register_datetime": now,
                "register_date": now.date(),
                "last_connection": last_connection,
                "last_alert": last_alert,
                "delayed": delayed,
                "delay_time": delay_time,
                "status": status,
                "log_counts": log_counts["recent"][device_name]["counts"]
            }
            create_retail_device_history(devicehistory_args)

    disconnected_devices = get_retail_devices_without_updates()
    for device in disconnected_devices:
        client_name = device.client.name

        try:
            current_device_status = device.retaildevicestatus
            db_register_time = current_device_status.last_update
            db_last_connection = current_device_status.last_connection
            db_delay_time = current_device_status.delay_time
        except:
            current_device_status = None
            db_last_connection = None
            db_register_time = None
            db_delay_time = timedelta(0)

        delayed, delay_time = calculate_logs_delay(
            None, None, db_last_connection, db_register_time, db_delay_time)

        last_alert = current_device_status.last_alert if current_device_status else None
        alert_interval = 59

        """ if delayed:
            alerts = ["Sin comunicación reciente"]
        else:
            alerts = [] """
        alerts = []

        if last_alert == None or now - last_alert > timedelta(minutes=alert_interval):
            message = f'{client_name} - {device.name}:\n'
            alert_info = ""

            for description in alerts:
                alert_type = get_or_create_alerttype(description)

                message += f'{description}: {alert_info}\n' if alert_info else f'{description}\n'

                alert_args = {"alert_type": alert_type, "gx": device,
                              "register_datetime": now, "register_date": now.date(),
                              "description": alert_info}
                create_alert(alert_args)

            """ if alerts and os.environ.get("ALERTS") == "true":
                send_telegram(chat="INDUSTRY_CHAT",
                              message=message)

                last_alert = now """

        if (delay_time >= timedelta(
                minutes=60)):

            args = {
                'severity': 5,
                'description': "Sin comunicación",
                'deployment': deployment
            }
            status = get_or_create_gxstatus(args)

            defaults = {
                'last_update': now,
                'last_alert': last_alert,
                'delayed': delayed,
                'delay_time': delay_time,
                'status': status,
                'log_counts': {}
            }
            device_status = update_or_create_retail_device_status(
                device=device, defaults=defaults)

            devicehistory_args = {
                'device': device,
                'register_datetime': now,
                'register_date': now.date(),
                'last_connection': db_last_connection,
                "last_alert": last_alert,
                'delayed': delayed,
                'delay_time': delay_time,
                'status': status,
                'log_counts': {}
            }
            create_retail_device_history(devicehistory_args)


# Servers

def update_servers_status():
    now = datetime.now(tz=pytz.timezone("UTC"))
    server_regions = get_serverregions()

    for region in server_regions:
        utils = AWSUtils(region.name)
        instances = utils.list_instances()
        metrics_to_get = get_servermetrics("ec2")

        all_metrics_data = {}
        for metric in metrics_to_get:
            metric_data = utils.get_ec2_metrics(instances, metric.name)
            all_metrics_data[metric.name] = metric_data

        for i in range(len(instances)):
            instance = instances[i]

            name = instance["name"]
            keyname = instance["keyname"]
            server_type = instance["type"]
            server_id = instance["id"]
            state = instance["state"]
            launch_time = instance["launch_time"]

            if not name:
                name = keyname

            current_server_status = get_serverstatus_by_awsid(server_id)

            server = get_or_create_server(server_id, defaults={
                "name": name, "server_type": server_type, "region": region})

            if server.name != name:
                server.name = name
                server.save()

            if not server.region:
                server.region = region
                server.save()

            activity_data = {}
            activity = False

            any_critical = False
            critical_messages = defaultdict(list)
            for metric in metrics_to_get:
                server_metric_values = all_metrics_data[metric.name]['MetricDataResults'][i]['Values']
                server_metric_dates = all_metrics_data[metric.name]['MetricDataResults'][i]['Timestamps']

                threshold = metric.threshold
                to_exceed = metric.to_exceed

                if server_metric_values:
                    activity = True
                    activity_data[metric.key] = server_metric_values[0]

                else:
                    break

                for j in range(len(server_metric_values)):
                    critical = False
                    metric_date = server_metric_dates[j]
                    readable_date = metric_date.astimezone(pytz.timezone(
                        'America/Mexico_City')).replace(tzinfo=None).isoformat(sep=" ", timespec="seconds")

                    if threshold is not None:
                        if to_exceed:
                            if server_metric_values[j] > threshold:
                                critical = True
                                any_critical = True
                                critical_messages[readable_date].append(
                                    f'{metric.name}: {server_metric_values[j]:.2f}')

                        else:
                            if server_metric_values[j] < threshold:
                                critical = True
                                any_critical = True
                                critical_messages[readable_date].append(
                                    f'{metric.name}: {server_metric_values[j]:.2f}')

                    serverhistory_args = {
                        "server": server,
                        "last_launch": launch_time,
                        "register_datetime": metric_date,
                        "register_date": metric_date.date(),
                        "state": state,
                        "critical": critical,
                        "metric_type": metric,
                        "metric_value": server_metric_values[j],
                    }
                    create_serverhistory(serverhistory_args)

            if activity:
                server_status = update_or_create_serverstatus(server_id, defaults={
                    "server": server,
                    "state": state,
                    "last_launch": launch_time,
                    "last_activity": now,
                    "activity_data": activity_data,
                    "critical": any_critical,
                    "active": True,
                })

            elif current_server_status == None:
                server_status = update_or_create_serverstatus(server_id, defaults={
                    "server": server,
                    "state": state,
                    "last_launch": launch_time,
                    "last_activity": now,
                    "critical": any_critical,
                    "activity_data": {}
                })
            # If the server just stopped or terminated, update the status one last time
            # with empty activity_data and the new state
            elif state != "running" and current_server_status.state == "running":
                server_status = update_or_create_serverstatus(server_id, defaults={
                    "server": server,
                    "state": state,
                    "critical": any_critical,
                    "activity_data": {}
                })

            if any_critical:
                message = f'CRÍTICO: EC2 {server.name}\n{server.aws_id}\n\n'
                for date, messages in critical_messages.items():
                    message += f'{date}\n'
                    for msg in messages:
                        message += f' {msg}\n'
                    message += '\n'

                    send_telegram(f'AWS_CHAT', message)

    set_servers_as_inactive()


def update_rds_status():
    now = datetime.now(tz=pytz.timezone("UTC"))
    server_regions = get_serverregions()

    for region in server_regions:
        utils = AWSUtils(region.name)
        instances = utils.list_db_instances()
        all_metrics_data = {}

        if not instances:
            continue

        metrics_to_get = get_servermetrics("rds")

        for metric in metrics_to_get:
            metric_data = utils.get_db_metrics(instances, metric.name)
            all_metrics_data[metric.name] = metric_data

        for i in range(len(instances)):
            instance = instances[i]

            name = instance["db_id"]
            instance_status = instance["instance_status"]
            instance_class = instance["instance_class"]
            allocated_storage = instance["allocated_storage"]

            current_rds_status = get_rdsstatus_by_name(name)

            rds = get_or_create_rds(name, defaults={
                "region": region, "instance_class": get_rds_type(instance_class)})

            activity_data = {}
            activity = False

            any_critical = False
            critical_messages = defaultdict(list)
            for metric in metrics_to_get:
                metric_values = all_metrics_data[metric.name]['MetricDataResults'][i]['Values']
                metric_dates = all_metrics_data[metric.name]['MetricDataResults'][i]['Timestamps']

                threshold = metric.threshold
                to_exceed = metric.to_exceed

                if metric_values:
                    activity = True
                    activity_data[metric.key] = metric_values[0]

                else:
                    break

                for j in range(len(metric_values)):
                    critical = False
                    metric_date = metric_dates[j]
                    readable_date = metric_date.astimezone(pytz.timezone(
                        'America/Mexico_City')).replace(tzinfo=None).isoformat(sep=" ", timespec="seconds")

                    if threshold is not None:
                        if to_exceed:
                            if metric_values[j] > threshold:
                                critical = True
                                any_critical = True
                                critical_messages[readable_date].append(
                                    f'{metric.name}: {metric_values[j]:.2f}')
                        else:
                            if metric_values[j] < threshold:
                                critical = True
                                any_critical = True
                                critical_messages[readable_date].append(
                                    f'{metric.name}: {metric_values[j]:.2f}')

                    rdshistory_args = {
                        "rds": rds,
                        "register_datetime": metric_date,
                        "register_date": metric_date.date(),
                        "status": instance_status,
                        "metric_type": metric,
                        "metric_value": metric_values[j],
                        "critical": critical
                    }
                    create_rdshistory(rdshistory_args)

            if activity:
                server_status = update_or_create_rdsstatus(name, defaults={
                    "rds": rds,
                    "allocated_storage": allocated_storage,
                    "status": instance_status,
                    "last_activity": now,
                    "activity_data": activity_data,
                    "critical": any_critical,
                })

            elif current_rds_status == None:
                server_status = update_or_create_rdsstatus(name, defaults={
                    "rds": rds,
                    "allocated_storage": allocated_storage,
                    "status": instance_status,
                    "last_activity": now,
                    "activity_data": {},
                    "critical": any_critical,
                })
            # If the server just stopped or terminated, update the status one last time
            # with empty activity_data and the new state
            elif activity_data == {} and current_rds_status.activity_data != {}:
                server_status = update_or_create_rdsstatus(name, defaults={
                    "rds": rds,
                    "allocated_storage": allocated_storage,
                    "status": instance_status,
                    "activity_data": {},
                    "critical": any_critical,
                })

            if any_critical:
                message = f'CRÍTICO: RDS {rds.name}\n\n'
                for date, messages in critical_messages.items():
                    message += f'{date}\n'
                    for msg in messages:
                        message += f' {msg}\n'
                    message += '\n'

                    send_telegram(f'AWS_CHAT', message)

                print(message)


def update_elb_status():
    now = datetime.now(tz=pytz.timezone("UTC"))
    server_regions = get_serverregions()

    for region in server_regions:
        utils = AWSUtils(region.name)
        instances = utils.list_elb_instances()
        all_metrics_data = {}

        if not instances:
            continue

        metrics_to_get = get_servermetrics("elb")

        for metric in metrics_to_get:
            metric_data = utils.get_elb_metrics(
                instances, metric.name, stat=metric.statistic)
            all_metrics_data[metric.name] = metric_data['MetricDataResults']

        for i in range(len(instances)):
            instance = instances[i]

            arn = instance.get("arn")
            name = instance.get("name")
            created_time = instance.get("created_time")
            state_code = instance.get("state_code")
            state_reason = instance.get("state_reason")
            elb_type = instance.get("type")

            current_elb_status = get_elbstatus_by_name(name)

            elb = get_or_create_elb(name, defaults={
                "region": region,
                "arn": arn,
                "created_time": created_time,
                "elb_type": elb_type
            })

            activity_data = {}
            activity = False

            metrics_expected_times = [now.replace(second=0, microsecond=0)-timedelta(minutes=5),
                                      now.replace(second=0, microsecond=0)-timedelta(minutes=10)]

            any_critical = False
            critical_messages = defaultdict(list)
            for metric in metrics_to_get:
                metric_values = all_metrics_data[metric.name][i]['Values']
                metric_dates = all_metrics_data[metric.name][i]['Timestamps']

                threshold = metric.threshold
                to_exceed = metric.to_exceed

                if len(metric_values) == 2:
                    activity = True
                    activity_data[metric.key] = metric_values[0]

                else:
                    if now.replace(second=0, microsecond=0)-timedelta(minutes=5) not in metric_dates:
                        activity_data[metric.key] = 0
                    else:
                        activity_data[metric.key] = metric_values[0]

                    for metric_time in metrics_expected_times:
                        if metric_time not in metric_dates:
                            metric_dates.append(metric_time)
                            metric_values.append(0)

                for j in range(len(metric_values)):
                    critical = False
                    metric_date = metric_dates[j]
                    readable_date = metric_date.astimezone(pytz.timezone(
                        'America/Mexico_City')).replace(tzinfo=None).isoformat(sep=" ", timespec="seconds")

                    if threshold is not None:
                        if to_exceed:
                            if metric_values[j] > threshold:
                                critical = True
                                any_critical = True
                                critical_messages[readable_date].append(
                                    f'{metric.name}: {metric_values[j]:.2f}')
                        else:
                            if metric_values[j] < threshold:
                                critical = True
                                any_critical = True
                                critical_messages[readable_date].append(
                                    f'{metric.name}: {metric_values[j]:.2f}')

                    elbhistory_args = {
                        "elb": elb,
                        "register_datetime": metric_date,
                        "register_date": metric_date.date(),
                        "state_code": state_code,
                        "state_reason": state_reason,
                        "metric_type": metric,
                        "metric_value": metric_values[j],
                        "critical": critical,
                    }
                    create_elbhistory(elbhistory_args)

            if activity:
                elb_status = update_or_create_elbstatus(name, defaults={
                    "elb": elb,
                    "state_code": state_code,
                    "state_reason": state_reason,
                    "last_activity": now,
                    "activity_data": activity_data,
                    "critical": any_critical,
                })

            elif current_elb_status == None:
                elb_status = update_or_create_elbstatus(name, defaults={
                    "elb": elb,
                    "state_code": state_code,
                    "state_reason": state_reason,
                    "last_activity": now,
                    "activity_data": {},
                    "critical": any_critical,
                })
            # If the server just stopped or terminated, update the status one last time
            # with empty activity_data and the new state
            elif activity_data == {} and current_elb_status.activity_data != {}:
                elb_status = update_or_create_rdsstatus(name, defaults={
                    "elb": elb,
                    "state_code": state_code,
                    "state_reason": state_reason,
                    "last_activity": now,
                    "activity_data": {},
                    "critical": any_critical,
                })

            if any_critical:
                message = f'CRÍTICO: ELB {elb.name}\n\n'
                for date, messages in critical_messages.items():
                    message += f'{date}\n'
                    for msg in messages:
                        message += f' {msg}\n'
                    message += '\n'

                    send_telegram(f'AWS_CHAT', message)

                print(message)

    set_load_balancers_as_inactive()


# Smart Buildings

def update_buildings_status():
    update_industry_status("Smart Buildings")


# Generate daily Telegram Safe Driving Report

def send_daily_sd_report():
    import time

    all_critical_registers = get_sd_critical_last_day()

    unit_problems = {}
    critical_last_message = "Sin comunicación, último mensaje fue read only SSD"
    for register in all_critical_registers:
        name = register.unit.name
        description = register.status.description
        priority = register.status.priority

        description_out = description

        # Make the message more descriptive
        if description == "Sin comunicación reciente":
            description_out = "En viaje, sin comunicación (>1 día)"

        # Verify if the unit is inactive, and its last active status was read only ssd
        if priority and (description.startswith("Sin comunicación") or description == "Inactivo" or
                         description.startswith("Logs pendientes")):
            description_out = critical_last_message

        if description_out not in unit_problems:
            unit_problems[description_out] = {name}
        else:
            unit_problems[description_out].add(name)

    # If any unit shows up in both read_only_ssd and critical_last_message categories, only leave it in read_only_ssd
    if critical_last_message in unit_problems:
        filtered_units = unit_problems[critical_last_message].copy()
        units = unit_problems[critical_last_message]
        for u in units:
            if unit_problems.get("Read only SSD") and u in unit_problems.get("Read only SSD"):
                filtered_units.remove(u)
        unit_problems[critical_last_message] = filtered_units

    # Sort list of possible problems by amount of units in each one
    unit_problems = dict(
        sorted(unit_problems.items(), key=lambda x: len(x[1])))

    message = f"Reporte de últimas 24 horas ({datetime.now().date()})\n"
    for problem, units in unit_problems.items():
        if not units:
            continue
        message += f"\n\n{problem}:\n"
        for unit in units:
            message += f"{unit} - "
        message = message[:-3]

    if unit_problems == {}:
        message += "\nNo hubieron unidades críticas"

    send_telegram(chat="SAFEDRIVING_CHAT", message=message)


# Generate data for area plots, runs hourly
def register_severity_counts():
    now = datetime.now(tz=pytz.timezone('UTC'))

    get_severity_counts = {
        "Safe Driving": get_units_severity_counts,
        "Industry": lambda client: get_devices_severity_counts(client, "Industry"),
        "Smart Retail": get_retail_devices_severity_counts,
        "Smart Buildings": lambda client: get_devices_severity_counts(client, "Smart Buildings"),
    }

    for deployment_name in list(get_severity_counts.keys()):
        dep_clients = get_clients(deployment_name)
        deployment = get_or_create_deployment(deployment_name)

        for client in dep_clients:
            severity_counts = get_severity_counts[deployment_name](client)

            counts_json = {}
            for count in severity_counts:
                counts_json[count['severity']] = count['count']

            # FIX: Only SD has status level 0, but this doesn't cause a problem
            for n in range(0, 6):
                if n not in counts_json:
                    counts_json[n] = 0

            count_args = {
                "deployment": deployment,
                "client": client,
                "timestamp": now,
                "date": now.date(),
                "severity_counts": counts_json
            }
            create_severity_count(count_args)
