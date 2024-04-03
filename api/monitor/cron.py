from .models import *
from .selectors import *
from .services import *

from dotenv import load_dotenv
import requests
import pandas as pd

from datetime import datetime, timedelta

import pytz
import os


def get_credentials(client):
    load_dotenv()
    credentials = {
        "username": os.environ.get(f'{client.upper()}_USERNAME'),
        "password": os.environ.get(f'{client.upper()}_PASSWORD')
    }

    return credentials


def login(client, credentials):

    if client == "tp":
        login_url = 'https://tp.introid.com/login/'
    elif client == "cemex":
        login_url = 'https://cmx.safe-d.aivat.io/login/'
    else:
        login_url = f'https://{client}.industry.aivat.io/login/'

    r = requests.post(login_url, data=credentials)

    if r.status_code == 200 or r.status_code == 201:
        token = r.json()["token"]
    else:
        token = None
        print(f"Login error: {r.status_code}")

    return token


def make_request(interval, token):
    headers = {"Authorization": f"Token {token}"}
    r = requests.get(request_url, data=interval, headers=headers)
    # print(r.status_code)
    # print(r.text)
    return r, r.status_code


# Safe Driving

def get_driving_data(client):
    global login_url
    global request_url
    now = datetime.now(tz=pytz.timezone('UTC')).astimezone(pytz.timezone(
        'America/Mexico_City')).replace(tzinfo=pytz.utc)

    credentials = get_credentials(client)

    if client == "tp":
        login_url = 'https://tp.introid.com/login/'
        request_url = 'https://tp.introid.com/logs/'

    elif client == "cemex":
        login_url = 'https://cmx.safe-d.aivat.io/login/'
        request_url = 'https://cmx.safe-d.aivat.io/cemex/logs/'

    try:
        token = login(client, credentials)
    except requests.exceptions.ConnectionError:
        print("Connection error")
        return

    response, status = make_request({"minutes": 60}, token=token)
    if status == 401:
        token = login(client, credentials)
        response, status = make_request({"minutes": 60}, token=token)

    if status == 200 or status == 201:
        response = response.json()
    else:
        print(f"Status code: {status}")
        return

    return response


def process_driving_data(response):
    now = datetime.now(tz=pytz.timezone('UTC')).astimezone(pytz.timezone(
        'America/Mexico_City')).replace(tzinfo=pytz.utc)

    logs = response["logs"]
    devices = response["devices"]

    df_logs = pd.DataFrame(logs)

    logs_no_dropping = []
    past_logs = pd.DataFrame([])
    if not df_logs.empty:
        df_logs["Timestamp"] = df_logs["Timestamp"].apply(
            lambda x: datetime.fromisoformat(x))
        df_logs["Fecha_subida"] = df_logs["Fecha_subida"].apply(
            lambda x: datetime.fromisoformat(x))

        df_logs["Timestamp"] = df_logs["Timestamp"].dt.tz_localize('UTC')

        logs_no_dropping = df_logs.loc[df_logs["Log"].str.contains(
            "Batch dropping").apply(lambda x: not x)]

        # Arreglar timezone
        past_logs = logs_no_dropping[logs_no_dropping["Timestamp"] < (
            now - timedelta(hours=1))]
        logs_last_hour = logs_no_dropping[logs_no_dropping["Timestamp"] > (
            now - timedelta(hours=1))]

        aux = logs_last_hour.loc[logs_no_dropping["Tipo"] == "Aux"]
        all_ignitions = logs_last_hour.loc[logs_no_dropping["Tipo"] == "Ignición"]

        # logs_last_hour = logs_last_hour.loc[(logs_last_hour["Tipo"] != "Aux") &
        #                                        (logs_last_hour["Tipo"] != "Ignición")]

    else:
        logs_last_hour = pd.DataFrame([])

    log_types = ["total", "restart", "reboot", "start",
                 "data_validation", "source_missing",
                 "camera_missing", "storage_devices",
                 "forced_reboot", "read_only_ssd",
                 "Ignición", "Aux", "others"]

    device_dict = {dev["Unidad"]: {k: v for k, v in dev.items() if k != "Unidad"}
                   for dev in devices}

    # Inicializar el diccionario "output" con los datos del dispositivo (última conexión y jsons pendientes)
    # y con las categrías de errores en 0
    output_gx = {interval: {device: {**datos, **{t: 0 for t in log_types}, "restarting_loop": False}
                            for device, datos in device_dict.items()}
                 for interval in ["hour", "ten_minutes"]}

    output_cameras = {interval: {device: {0: 0, 1: 0, 2: 0}
                                 for device, datos in device_dict.items()}
                      for interval in ["hour", "ten_minutes"]}

    alerts = {}

    for i in range(len(logs_last_hour)):
        log = logs_last_hour.iloc[i]
        unit = log["Unidad"]
        log_type = log["Tipo"]

        alert_conditions = {
            "Read only SSD": log["Tipo"] == "read_only_ssd"
        }

        recent = log["Timestamp"] > now - timedelta(minutes=10)
        if recent:
            intervals = ["hour", "ten_minutes"]

            for description, cond in alert_conditions.items():
                if cond:
                    if unit not in alerts:
                        alerts[unit] = set([description])
                    else:
                        alerts[unit].add(description)
        else:
            intervals = ["hour"]

        for interval in intervals:
            if unit not in output_gx[interval]:
                output_gx[interval][unit] = {t: 0 for t in log_types}

            if log_type in output_gx[interval][unit]:
                output_gx[interval][unit][log_type] += 1
            else:
                output_gx[interval][unit]["others"] += 1

            if log_type == "camera_missing":
                cameras_num = log["Log"][:-2].split(":")[2].split()
                if log["Log"].split()[1] == "'DISCONNECTED":
                    for camera in cameras_num:
                        output_cameras[interval][unit][int(camera)] += 5

            # No considerar Ignición o Aux en la cuenta total de logs
            if log_type not in {"Ignición", "Aux"}:
                output_gx[interval][unit]["total"] += 1

            # Checar qué restarts fueron justo después de una ignición (5 minutos)
            if log_type == "restart":
                unit_ignitions = all_ignitions[all_ignitions["Unidad"] == unit]

                restart_time = log["Timestamp"]
                for n in range(len(unit_ignitions)):
                    ignition = unit_ignitions.iloc[n]

                    ignition_time = ignition["Timestamp"]
                    if ignition_time + timedelta(minutes=5) > restart_time > ignition_time:
                        output_gx[interval][unit][log_type] -= 1
                        output_gx[interval][unit]["total"] -= 1
                        break  # Si hay más de una ignición antes del restart, no restar varias veces

                if recent and "Restarting" in log["Log"]:
                    execution_number = int(log["Log"].split()[4])
                    if execution_number > 1:
                        output_gx["hour"][unit]["restarting_loop"] = True
                        output_gx["ten_minutes"][unit]["restarting_loop"] = True

    severities = {n: {} for n in range(1, 6)}
    for device, datos in device_dict.items():
        disc_cameras = sum(
            [mins > 0 for cam, mins in output_cameras["ten_minutes"][device].items()])
        if datos["Ultima_actualizacion"] != 'null':
            last_connection = datetime.fromisoformat(
                datos["Ultima_actualizacion"]).replace(tzinfo=pytz.utc)
        else:
            last_connection = None

        conditions = [
            # (Condition, Status, Severity Key, Description)
            (datos.get("Estatus") == "red", 5, 1, "Sin comunicación reciente"),
            (output_gx["ten_minutes"][device]["restarting_loop"]
             and datos.get("En_viaje"), 5, 3, "Múltiples restarts"),
            (output_gx["hour"][device]["read_only_ssd"]
             > 0, 5, 4, "Read only SSD"),
            (output_gx["hour"][device]["forced_reboot"]
             > 5, 5, 5, "forced reboot (>1)"),
            (datos.get("Jsons_eventos_pendientes") > 100 or datos.get(
                "Jsons_status_pendientes") > 1000, 5, 6, "Demasiados logs pendientes"),
            (datos.get("En_viaje") and disc_cameras ==
             3, 5, 7, "Tres cámaras fallando"),
            (datos.get("En_viaje") and disc_cameras in {
             1, 2}, 4, 1, "1-2 cámaras fallando"),
            (output_gx["ten_minutes"][device]["restarting_loop"]
             and not datos.get("En_viaje"), 4, 2, "Múltiples restarts"),
            (1 <= output_gx["hour"][device]["forced_reboot"]
             <= 5, 4, 3, "Forced reboot reciente"),
            (datos.get("Estatus") == "orange", 4, 4,
             "Sin comunicación reciente (< 1 día)"),
            (output_gx["hour"][device]["storage_devices"]
             > 0, 3, 1, "Errores de memoria"),
            (100 > datos.get("Jsons_eventos_pendientes") >
             20 or datos.get("Jsons_status_pendientes") > 100, 3, 2, "Muchos logs pendientes"),
            (output_gx["hour"][device]["total"]
             > 10, 3, 3, "Más de 10 mensajes"),
            (datos.get("Estatus") == "green" and (
                output_gx["hour"][device]["Aux"] == 0 or output_gx["hour"][device]["Ignición"] == 0), 2, 1, "Sin AUX ni Ignición"),
            (last_connection and not datos.get("En_viaje")
             and last_connection > now - timedelta(hours=2), 2, 2, "Comunicación reciente"),
            (datos.get("En_viaje") and last_connection > now - timedelta(hours=1)
             and 10 > output_gx["hour"][device]["total"] > 5, 2, 3, "De 5 a 10 mensajes en última hora"),
            (datos.get("En_viaje") and last_connection > now - timedelta(hours=1)
             and output_gx["hour"][device]["total"] < 5, 1, 1, "Comunicación reciente"),
        ]

        for condition, level, rule, rule_des in conditions:
            if condition:
                if level in severities:
                    if rule_des in severities[level]:
                        severities[level][rule_des].add(device)
                    else:
                        severities[level][rule_des] = set([device])
                else:
                    severities[level] = {rule_des: set([device])}

    units_left = set(device_dict.keys())

    for level, rules in severities.items():
        for rule, devices in rules.items():
            units_left -= devices

    for unit in units_left:
        if 0 not in severities:
            severities[0] = {"Inactivo": set([unit])}
        else:
            severities[0]["Inactivo"].add(unit)

    return {"gx": output_gx,
            "cameras": output_cameras,
            "severities": severities,
            "alerts": alerts}

    '''
    for i in range(len(past_logs)):
        log = past_logs.iloc[i]
        row_idx = log.name

        unit = log["Unidad"]
        if unit not in unit_errors:
            unit_errors[unit] = {t: [] for t in log_types}
        unit_errors[unit]["total"].append(row_idx)

        log_type = log["Tipo"]
        if log_type not in unit_errors[unit]:
            unit_errors[unit]["others"].append(row_idx)
        else:
            unit_errors[unit][log_type].append(row_idx)
    '''


def update_driving_status():
    clients = {"tp": "Transpais",
               "cemex": "Cemex Concretos"}

    deployment = get_deployment('Safe Driving')

    for client_alias, client_name in clients.items():

        response = get_driving_data(client_alias)
        if response is not None:

            processed_data = process_driving_data(response)

            data = processed_data["gx"]
            camera_data = processed_data["cameras"]
            units_status = processed_data["severities"]
            alerts = processed_data["alerts"]

            def set_default(obj):
                if isinstance(obj, set):
                    return list(obj)
                raise TypeError

            '''import json
            with open(f'/home/spare/Documents/monitor/monitor-project/api/monitor/{client_alias}_driving_process_input.json', "w") as f:
                json.dump(response, f, ensure_ascii=False)
            with open(f'/home/spare/Documents/monitor/monitor-project/api/monitor/{client_alias}_driving_process_output.json', "w") as f:
                print(type(processed_data))
                json.dump(processed_data, f, ensure_ascii=False,
                          default=set_default)'''

        else:
            print(f"No data for {client_name}")
            continue

        hour_data = data["hour"]
        recent_data = data["ten_minutes"]

        tz_utc = pytz.utc
        date_now = tz_utc.localize(datetime.utcnow())
        # date_now = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(tzinfo=pytz.utc)

        client_args = {
            'name': client_name,
            'deployment': deployment
        }
        client = get_or_create_client(client_args)

        history_logs = []
        for unit, unit_logs in hour_data.items():
            if client_alias == "cemex":
                unit_logs["En_viaje"] = None
                unit_logs["Estatus"] = None

            # Si una unidad entró en más de un nivel, tomar el más grave
            # Si cumple con dos reglas en un nivel, se toma la última (arreglar)
            for level in range(6):
                rules = units_status[level]
                for condition, units in rules.items():
                    if unit in units:
                        status = level
                        description = condition

            # Obtener objeto GxStatus
            status_args = {
                'severity': status,
                'description': description,
                'deployment': deployment
            }
            status_obj = get_or_create_gxstatus(status_args)

            # Obtener objeto Unit
            unit_args = {
                'name': unit,
                'client': client
            }
            unit_obj = get_or_create_unit(unit_args)

            if unit in alerts:
                for alert in alerts[unit]:
                    alert_type = get_or_create_alerttype(
                        {"description": alert})

                    alert_args = {"alert_type": alert_type, "gx": unit_obj,
                                  "register_datetime": date_now, "register_date": date_now.date()}
                    alert = create_alert(alert_args)

            camerastatus_list = []
            camerahistory_list = []
            for cam_num, count in camera_data["hour"][unit].items():
                camera_args = {
                    'name': f"cam_{unit}_{cam_num}",
                    'gx': unit_obj
                }
                camera_obj = get_or_create_camera(camera_args)

                recent_disconnection_time = camera_data["ten_minutes"][unit][cam_num]
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

            # last_connection = datetime.fromisoformat(unit_logs['Ultima_actualizacion']).replace(
            #    tzinfo=pytz.timezone("America/Monterrey")) if unit_logs['Ultima_actualizacion'] != 'null' else None
            last_connection = datetime.fromisoformat(unit_logs['Ultima_actualizacion']) + timedelta(hours=6) \
                if unit_logs['Ultima_actualizacion'] != 'null' else None
            # last_connection = last_connection.astimezone(pytz.timezone('UTC')) if last_connection else None

            unit_status_args = {
                'unit_id': unit_obj.id,
                'defaults': {
                    'last_update': date_now,
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
                    'on_trip': unit_logs["En_viaje"],
                    'status': status_obj
                }
            }
            unitstatus = update_or_create_unitstatus(unit_status_args)

            # Últimos 10 minutos

            recent_unit_logs = recent_data[unit]
            if client_alias == "cemex":
                recent_unit_logs["En_viaje"] = None
                recent_unit_logs["Estatus"] = None

            if 'Ultima_actualizacion' not in recent_unit_logs:
                print(recent_unit_logs)

            # last_connection = datetime.fromisoformat(recent_unit_logs['Ultima_actualizacion']).replace(
            #    tzinfo=pytz.timezone("America/Mexico_City")) if recent_unit_logs['Ultima_actualizacion'] != 'null' else None
            # last_connection = last_connection.astimezone(pytz.timezone('UTC')) if last_connection else None
            last_connection = datetime.fromisoformat(unit_logs['Ultima_actualizacion']) + timedelta(hours=6) \
                if unit_logs['Ultima_actualizacion'] != 'null' else None

            history_logs.append({
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
                'on_trip': recent_unit_logs["En_viaje"],
                'status': status_obj
            })

        bulk_create_unithistory(history_logs)


# Industry

def get_industry_data(client):
    global login_url
    global request_url

    login_url = f'https://{client}.industry.aivat.io/login/'
    request_url = f'https://{client}.industry.aivat.io/stats_json/'

    credentials = get_credentials(client)

    try:
        token = login(client, credentials)
    except requests.exceptions.ConnectionError:
        print("Connection error")
        return

    now = datetime.utcnow().astimezone(pytz.timezone(
        'America/Mexico_City')).replace(tzinfo=pytz.utc)
    time_interval = {
        "initial_datetime": (now - timedelta(hours=1, minutes=10)).isoformat(timespec="seconds")
    }

    response, status = make_request(time_interval, token)
    if not (status == 200 or status == 201):
        token = login(client, credentials)
        response, status = make_request(time_interval, token)

    if status == 200 or status == 201:
        response = response.json()
    else:
        print(f"Status code: {status}")
        return

    return response


def process_industry_data(response):
    now = datetime.utcnow().astimezone(pytz.timezone(
        'America/Mexico_City')).replace(tzinfo=pytz.utc)

    fields = {"batch_dropping": 0,
              "camera_connection": timedelta(0),
              "restart": 0,
              "license": 0,
              "shift_change": 0,
              "others": 0,
              "delayed": False,
              "delay_time": timedelta(0)}

    output_gx = {
        "hour": fields.copy(),
        "ten_minutes": fields.copy(),
        "first_log_time": None,
        "last_connection": None,
        "status": 1,
    }
    output_cameras = {}

    log_types = {"batch_dropping": "Batch dropping",
                 "restart": "Restarting",
                 "license": "[LICENSE]",
                 "shift_change": "SRC"}

    days_remaining = None
    license_end = None

    alerts = set()

    for device, logs in response.items():
        output_camera = {k: {"connected": True, "disconnection_time": timedelta(0)}
                         for k in ["hour", "ten_minutes"]}

        if device.startswith("GX"):
            last_log = logs[0]
            last_log_date = datetime.fromisoformat(last_log["register_time"][:-1]).astimezone(
                pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
            output_gx["last_connection"] = last_log_date

            for log in logs:
                register_time = datetime.fromisoformat(
                    log["register_time"][:-1]).replace(tzinfo=pytz.utc)
                log_time = datetime.fromisoformat(f'{log["log_date"]}T{log["log_time"]}').replace(
                    tzinfo=pytz.utc) + timedelta(hours=6)

                alert_conditions = {
                    "Problemas de Wi-Fi": (register_time - log_time >
                                           timedelta(minutes=10))
                }

                if register_time > now - timedelta(minutes=10):
                    intervals = ["hour", "ten_minutes"]

                    first_log_time = datetime.fromisoformat(log["register_time"][:-1]).astimezone(
                        pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
                    output_gx["first_log_time"] = first_log_time

                    for description, cond in alert_conditions.items():
                        if cond:
                            alerts.add(description)
                else:
                    intervals = ["hour"]

                if log["log"] != "":
                    found_category = False
                    for name, start in log_types.items():
                        if log["log"].startswith(start):

                            for interval in intervals:
                                output_gx[interval][name] += 1
                            found_category = True

                            if start == "[LICENSE]":
                                days_remaining = int(log["log"].split()[-2])
                                date, time = log["log"].split("until")[
                                    1].split()
                                license_end = datetime.fromisoformat(
                                    f'{date}T{time[:-1]}')

                    if not found_category:
                        for interval in intervals:
                            output_gx[interval]["others"] += 1

            last_register_time = datetime.fromisoformat(
                logs[0]["register_time"][:-1])
            try:
                penul_register_time = datetime.fromisoformat(
                    logs[1]["register_time"][:-1])
            except IndexError:  # Si sólo hubo un log en la última hora, tomar el tiempo del penúltimo como hace una hora
                penul_register_time = now - timedelta(hours=1)
                last_register_time = last_register_time.astimezone(
                    pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)

            time_since_log = now - last_register_time.astimezone(
                pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
            prev_time_gap = last_register_time - penul_register_time

            delay_time = timedelta(0)
            delay_found = False
            # Si hay un restraso en este momento
            if time_since_log > timedelta(minutes=11):
                delay_time = time_since_log - timedelta(minutes=10)
                delay_found = True

            # Si hubo un retraso entre el último y el penúltimo
            elif prev_time_gap > timedelta(minutes=11):
                delay_time = prev_time_gap - timedelta(minutes=10)
                delay_found = True

            for interval in intervals:
                output_gx[interval]["delayed"] = delay_found
                output_gx[interval]["delay_time"] = delay_time

        else:
            if device not in output_cameras:
                output_cameras[device] = output_camera.copy()

            for log in logs:
                register_time = datetime.fromisoformat(log["register_time"][:-1]).astimezone(
                    pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)

                if register_time > now - timedelta(minutes=10):
                    intervals = ["hour", "ten_minutes"]
                else:
                    intervals = ["hour"]

                if log["log"].startswith("Desconectada"):
                    for interval in intervals:

                        output_cameras[device][interval]["disconnection_time"] += timedelta(
                            minutes=2)
                        output_gx[interval]["camera_connection"] += timedelta(
                            minutes=2)

            last_log = logs[0]
            if last_log['log'].startswith("Cámara") or last_log['log'].startswith("Desconectada"):
                last_register_time = datetime.fromisoformat(last_log["register_time"][:-1]).astimezone(
                    pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)

                intervals = ["hour", "ten_minutes"]

                for interval in intervals:
                    output_cameras[device][interval]["connected"] = False

    return output_gx, output_cameras, days_remaining, license_end, alerts


def update_industry_status():
    clients = {
        "rgs": "Ragasa",
        "cmxrgn": "Cemex Regenera",
        "mxlt": "Mexalit",
        "cmxsoc": "Cemex Soc"
    }

    deployment = get_deployment('Industry')

    for client_alias, client_name in clients.items():
        response = get_industry_data(client_alias)

        if response is not None:
            processed_data = process_industry_data(response)
        else:
            print(f"No data for {client_name}")
            continue

        gx_data, camera_data, days_remaining, license_end, alerts = processed_data

        hour_data = gx_data["hour"]
        recent_data = gx_data["ten_minutes"]

        tz_utc = pytz.utc
        date_now = tz_utc.localize(datetime.utcnow())
        # date_now = datetime.utcnow().astimezone(pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)

        client_args = {
            'name': client_name,
            'deployment': deployment
        }
        client = get_or_create_client(client_args)

        # TO DO: Obtener nombre de device
        device_args = {
            'client': client,
            'name': "GX_01"
        }
        device = get_or_create_device(device_args)

        # Crear registros de alertas
        for description in alerts:
            alert_type = get_or_create_alerttype({"description": description})

            alert_args = {"alert_type": alert_type, "gx": device,
                          "register_datetime": date_now, "register_date": date_now.date()}
            alert = create_alert(alert_args)

        if days_remaining and license_end:
            device.license_days = days_remaining
            device.license_end = license_end
            device.save()

        # Campos del registro a actualizar
        update_values = {
            'last_update': date_now,
            'batch_dropping': hour_data["batch_dropping"],
            'camera_connection': hour_data["camera_connection"],
            'restart': hour_data["restart"],
            'license': hour_data["license"],
            'shift_change': hour_data["shift_change"],
            'others': hour_data["others"],
        }

        # Obtener última conexión del registro del dispositivo
        db_delay_time = timedelta(0)
        try:
            device_status = DeviceStatus.objects.get(device_id=device.id)
            db_register_time = device_status.last_update
            db_last_connection = device_status.last_connection
            db_delay_time = device_status.delay_time
        except:
            db_last_connection = None

        last_connection = None
        if gx_data["last_connection"]:
            # Agregar nueva última conexión a los campos a actualizar
            update_values['last_connection'] = gx_data["last_connection"] + \
                timedelta(hours=6)
            last_connection = gx_data["last_connection"] + timedelta(hours=6)
            first_log_time = gx_data["first_log_time"] + timedelta(hours=6)

        # Si existe ese dato, ver si tiene más de 10 minutos. En ese caso, ponerlo como atrasado
        if last_connection and db_last_connection:
            difference = date_now - last_connection

            # Revisar si hubo retraso entre el primer log en los últimos 10 minutos y la última conexión según la DB
            # Se verifica que hayan registros recientes (con db_register_time) para no tomar un falla en el ćodigo
            # como retraso

            # Arreglar caso en el que se missea el log reciente por poquito, produciendo un retraso falso
            if first_log_time - db_last_connection > timedelta(minutes=11) and not last_connection - db_register_time > timedelta(minutes=11):
                update_values['delayed'] = True
                update_values['delay_time'] = last_connection - \
                    db_last_connection - timedelta(minutes=10)

            # Si hay un retraso actualmente
            elif difference > timedelta(minutes=11):
                update_values['delayed'] = True
                update_values['delay_time'] = difference - \
                    timedelta(minutes=10)
            else:
                update_values['delayed'] = False
                update_values['delay_time'] = timedelta(0)

        elif db_last_connection == None and last_connection:  # En caso de que haya un nuevo dispositivo
            update_values['delayed'] = False
            update_values['delay_time'] = timedelta(0)

        # Si no han llegado logs en la última hora, sumar 10 minutos a retraso
        else:
            update_values['delayed'] = True
            update_values['delay_time'] = db_delay_time + timedelta(minutes=10)

        conditions = [
            (recent_data['camera_connection'] >
             timedelta(0), 3, 3, "Cámara desconectada"),
            (update_values['batch_dropping'] > 0, 3, 2, "Batch dropping"),
            (update_values['delayed'] and update_values['delay_time']
             < timedelta(minutes=60), 3, 1, "Retraso menor a 1h"),
            (update_values['delay_time'] >= timedelta(
                minutes=60), 5, 1, "Retraso mayor a 1h"),
            (update_values['restart'] > 0, 5, 2, "Restarts"),
        ]

        severity = 1
        rule = "Comunicación reciente"
        for condition, status, r, description in conditions:
            if condition:
                severity = status
                rule = description

        gxstatus_args = {
            'severity': severity,
            'description': rule,
            'deployment': deployment
        }
        status = get_or_create_gxstatus(gxstatus_args)

        update_values['status'] = status
        devicestatus_args = {
            'device': device,
            'defaults': update_values,
        }
        device_status = update_or_create_devicestatus(devicestatus_args)

        delay_time = update_values['delay_time'] if 'delay_time' in update_values else timedelta(
            0)
        delayed = update_values['delayed'] if 'delayed' in update_values else False

        # Arreglar: Y si no hubo last connection de gx_data?
        devicehistory_args = {
            'device': device,
            'register_date': date_now.date(),
            'register_datetime': date_now,
            'delayed': delayed,
            'delay_time': delay_time,
            'batch_dropping': recent_data["batch_dropping"],
            'camera_connection': recent_data["camera_connection"],
            'restart': recent_data["restart"],
            'license': recent_data["license"],
            'shift_change': recent_data["shift_change"],
            'others': recent_data["others"],
            'last_connection': last_connection,
            'status': status
        }
        create_device_history(devicehistory_args)

        camerastatus_data = []
        camerahistory_data = []

        for name, camera_data in camera_data.items():
            recent_data = camera_data["ten_minutes"]
            hour_data = camera_data["hour"]

            camera_args = {
                'name': name,
                'gx': device
            }
            camera = get_or_create_camera(camera_args)

            camerastatus_data.append({
                'camera': camera,
                'connected': hour_data["connected"],
                'last_update': date_now,
                'disconnection_time': hour_data["disconnection_time"]
            })

            camerahistory_data.append({
                'camera': camera,
                'register_date': date_now,
                'register_datetime': date_now,
                'connected': recent_data["connected"],
                'disconnection_time': recent_data["disconnection_time"]
            })

        bulk_update_camerastatus(camerastatus_data)
        bulk_create_camerahistory(camerahistory_data)
