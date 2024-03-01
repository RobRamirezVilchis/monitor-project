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


def login(credentials):
    global token
  
    r = requests.post(login_url, data=credentials)
    
    if r.status_code == 200 or r.status_code == 201:
        token = r.json()["token"]
    else:
        token = None
        print(f"Login error: {r.status_code}")


def make_request(interval):
    headers = {"Authorization": f"Token {token}"}
    r = requests.get(request_url, data=interval, headers=headers)
    # print(r.status_code)
    # print(r.text)
    return r, r.status_code
    
    
def get_driving_data(client):
    global login_url
    global request_url
    now = datetime.utcnow().astimezone(pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)

    credentials = get_credentials(client)
    
    if client == "tp":
        login_url = 'https://tp.introid.com/login/'
        request_url = 'https://tp.introid.com/logs/'

    elif client == "cemex":
        login_url = 'https://cmx.safe-d.aivat.io/login/'
        request_url = 'https://cmx.safe-d.aivat.io/cemex/logs/'


    try:
        login(credentials)
    except requests.exceptions.ConnectionError:
        print("Connection error")
        return

    response, status = make_request({"minutes": 60})
    if status == 401:
        login(credentials)
        response, status = make_request({"minutes": 60})
    
    if status == 200 or status == 201:
        response = response.json()
    else:
        print(f"Status code: {status}")
        return
    
    logs = response["logs"]
    devices = response["devices"]
    
    
    df_logs = pd.DataFrame(logs)

    logs_no_dropping = []
    past_logs = pd.DataFrame([])
    if not df_logs.empty:
        df_logs["Timestamp"] = df_logs["Timestamp"].apply(lambda x: datetime.fromisoformat(x))
        df_logs["Fecha_subida"] = df_logs["Fecha_subida"].apply(lambda x: datetime.fromisoformat(x))

        df_logs["Timestamp"] = df_logs["Timestamp"].dt.tz_localize('UTC')

        logs_no_dropping = df_logs.loc[df_logs["Log"].str.contains("Batch dropping").apply(lambda x: not x)]

        # Arreglar timezone 
        past_logs = logs_no_dropping[logs_no_dropping["Timestamp"] < (now - timedelta(hours=1))]
        logs_last_hour = logs_no_dropping[logs_no_dropping["Timestamp"] > (now - timedelta(hours=1))]

        aux = logs_last_hour.loc[logs_no_dropping["Tipo"] == "Aux"]
        all_ignitions = logs_last_hour.loc[logs_no_dropping["Tipo"] == "Ignición"]

        #logs_last_hour = logs_last_hour.loc[(logs_last_hour["Tipo"] != "Aux") & 
        #                                        (logs_last_hour["Tipo"] != "Ignición")]

    else:
        logs_last_hour = pd.DataFrame([])

    
    log_types = ["total", "restart", "reboot", "start", 
                 "data_validation", "source_missing", 
                 "camera_missing", "storage_devices", 
                 "forced_reboot", "read_only_ssd", 
                 "Ignición", "Aux", "others"]
    

    device_dict = {dev["Unidad"]: {k: v for k, v in dev.items() if k != "Unidad"} for dev in devices}
    

    # Inicializar el diccionario "output" con los datos del dispositivo (última conexión y jsons pendientes) 
    # y con las categrías de errores en 0
    output_gx = {interval: {device: {**datos, **{t: 0 for t in log_types}, "restarting_loop": False} 
                         for device, datos in device_dict.items()}
                         for interval in ["hour", "ten_minutes"]}

    output_cameras = {interval: {device: {0: 0, 1: 0, 2: 0} 
                         for device, datos in device_dict.items()}
                         for interval in ["hour", "ten_minutes"]}
    
    unit_status = {device: 1 for device, datos in device_dict.items()}
    
    
    for i in range(len(logs_last_hour)):
        log = logs_last_hour.iloc[i]
        row_idx = log.name

        recent = log["Timestamp"] > now - timedelta(minutes=10)

        if recent:
            intervals = ["hour", "ten_minutes"]
        else:
            intervals = ["hour"]

        unit = log["Unidad"]
        log_type = log["Tipo"]

        if log_type == "read_only_ssd":
            unit_status[unit] = 5


        for interval in intervals:
            if unit not in output_gx[interval]:
                for key in intervals:
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

            # No considerer Ignición o Aux en la cuenta total de logs
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

    

    severities = {
        1: {
            "1_1": set(),
        },
        2: {
            "2_1": set(),
            "2_2": set()
        },
        3: {
            "3_1": set(),
            "3_2": set(),
            "3_3": set()
        },
        4: {
            "4_1": set(),
            "4_2": set(),
            "4_3": set(),
            "4_4": set()
        },
        5: {
            "5_1": set(),
            "5_2": set(),
            "5_3": set(),
            "5_4": set(),
            "5_5": set(),
            "5_6": set(),
            "5_7": set(),
        },
        0: {
            "0_1": set()
        }
    }

    for device, datos in device_dict.items():
        state = {n: [] for n in range(1,6)}
        status = 0
        disc_cameras = sum([mins>0 for cam, mins in output_cameras["ten_minutes"][device].items()])
        if datos["Ultima_actualizacion"] != 'null':
            last_connection = datetime.fromisoformat(datos["Ultima_actualizacion"]).replace(tzinfo=pytz.utc)
        else:
            last_connection = None

        conditions = [
            # (Condition, Status, Severity Key)
            (datos.get("Estatus") == "red", 5, "5_1"),
            (output_gx["ten_minutes"][device]["restarting_loop"] and datos.get("En_viaje"), 5, "5_3"),
            (output_gx["hour"][device]["read_only_ssd"] > 0, 5, "5_4"),
            (output_gx["hour"][device]["forced_reboot"] > 5, 5, "5_5"),
            (datos.get("Jsons_eventos_pendientes") > 100 or datos.get("Jsons_status_pendientes") > 1000, 5, "5_6"),
            (datos.get("En_viaje") and disc_cameras == 3, 5, "5_7"),
            (datos.get("En_viaje") and disc_cameras in {1, 2}, 4, "4_1"),
            (output_gx["ten_minutes"][device]["restarting_loop"] and not datos.get("En_viaje"), 4, "4_2"),
            (1 <= output_gx["hour"][device]["forced_reboot"] <= 5, 4, "4_3"),
            (datos.get("Estatus") == "orange", 4, "4_4"),
            (output_gx["hour"][device]["storage_devices"] > 0, 3, "3_1"),
            (100 > datos.get("Jsons_eventos_pendientes") > 20 or datos.get("Jsons_status_pendientes") > 100, 3, "3_2"),
            (output_gx["hour"][device]["total"] > 10, 3, "3_3"),
            (datos.get("Estatus") == "green" and (output_gx["hour"][device]["Aux"] == 0 or output_gx["hour"][device]["Ignición"] == 0), 2, "2_1"),
            (last_connection and not datos.get("En_viaje") and last_connection > now - timedelta(hours=2), 2, "2_2"),
            (datos.get("Estatus") == "green" and 10 > output_gx["hour"][device]["total"] > 5, 1, "1_1"),
            (datos.get("Estatus") == "green" and output_gx["hour"][device]["total"] < 5, 1, "1_1"),
        ]

        for condition, status, rule in conditions:
            if condition:
                severities[status][rule].add(device)


    units_left = set(device_dict.keys())
    all_units = set(device_dict.keys())
    
    categorized = set()
    for level, rules in severities.items():
        for rule, devices in rules.items():
            units_left -= devices

            for dev in devices:
                categorized.add(dev)
    

    for unit in units_left:
        categorized.add(unit)
        severities[0]["0_1"].add(unit)


    return output_gx, output_cameras, severities


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


def get_industry_data(client):
    global login_url
    global request_url

    login_url = f'https://{client}.industry.aivat.io/login/'
    request_url = f'https://{client}.industry.aivat.io/stats_json/'

    credentials = get_credentials(client)

    try:
        login(credentials)
    except requests.exceptions.ConnectionError:
        print("Connection error")
        return
    
    now = datetime.utcnow().astimezone(pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
    time_interval = {
        "initial_datetime": (now - timedelta(hours=1, minutes=10)).isoformat(timespec="seconds")
    }

    response, status = make_request(time_interval)
    if status == 401:
        login(credentials)
        response, status = make_request(time_interval)
    
    if status == 200 or status == 201:
        response = response.json()
    else:
        print(f"Status code: {status}")
        return
    
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
        "last_connection": None,
        "status": 1,
    }
    output_cameras = {}
    
    log_types = {"batch_dropping": "Batch dropping",
                "restart": "Restarting",
                "license": "[LICENSE]",
                "shift_change": "SRC"}
    
    days_remaining = None
    for device, logs in response.items():
        output_camera = {k: {"connected": True, "disconnection_time": timedelta(0)} 
                      for k in ["hour", "ten_minutes"]}
        
        if device.startswith("GX"):
            last_log = logs[0]
            last_log_date = datetime.fromisoformat(last_log["register_time"][:-1]).astimezone(
                pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
            output_gx["last_connection"] = last_log_date

            for log in logs:
                register_time = datetime.fromisoformat(log["register_time"][:-1]).astimezone(
                    pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
                
                if register_time > now - timedelta(minutes=10):
                    intervals = ["hour", "ten_minutes"]
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

                    if not found_category:
                        for interval in intervals:
                            output_gx[interval]["others"] += 1

            last_register_time = datetime.fromisoformat(logs[0]["register_time"][:-1])
            try:
                penul_register_time = datetime.fromisoformat(logs[1]["register_time"][:-1])
            except IndexError: # Si sólo hubo un log en la última hora, tomar el tiempo del penúltimo como hace una hora
                penul_register_time = now - timedelta(hours=1)
                last_register_time = last_register_time.astimezone(
                    pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)


            time_since_log = now - last_register_time.astimezone(pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
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
                last_disconnect_time = 0
                register_time = datetime.fromisoformat(log["register_time"][:-1]).astimezone(
                    pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
                
                if register_time > now - timedelta(minutes=10):
                    intervals = ["hour", "ten_minutes"]
                else:
                    intervals = ["hour"]

                if log["log"].startswith("Desconectada"):
                    for interval in intervals:
                        
                        output_cameras[device][interval]["disconnection_time"] += timedelta(minutes=3)
                        output_gx[interval]["camera_connection"] += timedelta(minutes=3) 
                        


            last_log = logs[0]
            if last_log['log'].startswith("Cámara"):
                last_register_time = datetime.fromisoformat(last_log["register_time"][:-1]).astimezone(
                    pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
                
                intervals = ["hour", "ten_minutes"]
            
                for interval in intervals:
                    output_cameras[device][interval]["connected"] = False


    return output_gx, output_cameras, days_remaining


def update_driving_status():
    clients = {"tp": "Transpais",
               "cemex": "CEMEX Concretos"}
    
    for client_alias, client_name in clients.items():
        output = get_driving_data(client_alias)
        if output:
            data, camera_data, units_status = output
        else:
            print(f"No data for {client_name}")

        if not output:
            output = get_driving_data(client_alias)

            if output:
                data, camera_data, units_status = output
            else:
                print(f"No data for {client_name}")
                continue

        hour_data = data["hour"]
        recent_data = data["ten_minutes"]

        tz_utc = pytz.utc
        date_now = tz_utc.localize(datetime.utcnow())
        #date_now = date_now.astimezone(pytz.timezone("America/Mexico_City")).replace(tzinfo=pytz.utc)

        deployment = get_deployment('Safe Driving')

        client_args = {
            'name': client_name,
            'deployment': deployment
        }
        client = get_client(client_args)
        
        history_logs = []
        for unit, unit_logs in hour_data.items():
            if client_alias == "cemex":
                unit_logs["En_viaje"] = None
                unit_logs["Estatus"] = None


            # Si una unidad entró en más de un nivel, tomar el más grave
            # Si cumple con dos reglas en un nivel, se toma la última (arreglar)
            for level, rules in units_status.items():
                for condition, units in rules.items():
                    if unit in units:
                        status = level
                        rule = condition

            # Obtener objeto GxStatus
            status_args = {
                'name': rule,
                'severity': status
            }
            status_obj = get_or_create_gxstatus(status_args)

            # Obtener objeto Unit
            unit_args = {
                'name': unit,
                'client': client
            }    
            unit_obj = get_or_create_unit(unit_args)

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
                    'camera' : camera_obj,
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

           
            #last_connection = datetime.fromisoformat(unit_logs['Ultima_actualizacion']).replace(
            #    tzinfo=pytz.timezone("America/Monterrey")) if unit_logs['Ultima_actualizacion'] != 'null' else None
            last_connection = datetime.fromisoformat(unit_logs['Ultima_actualizacion']) + timedelta(hours=6) \
                  if unit_logs['Ultima_actualizacion'] != 'null' else None
            #last_connection = last_connection.astimezone(pytz.timezone('UTC')) if last_connection else None
          
           

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
            unitstatus_obj = update_or_create_unitstatus(unit_status_args)


            # Últimos 10 minutos

            recent_unit_logs = recent_data[unit]
            if client_alias == "cemex":
                recent_unit_logs["En_viaje"] = None
                recent_unit_logs["Estatus"] = None

            if 'Ultima_actualizacion' not in recent_unit_logs:
                print(recent_unit_logs)

            #last_connection = datetime.fromisoformat(recent_unit_logs['Ultima_actualizacion']).replace(
            #    tzinfo=pytz.timezone("America/Mexico_City")) if recent_unit_logs['Ultima_actualizacion'] != 'null' else None
            #last_connection = last_connection.astimezone(pytz.timezone('UTC')) if last_connection else None
            last_connection = datetime.fromisoformat(unit_logs['Ultima_actualizacion']) + timedelta(hours=6) \
                  if unit_logs['Ultima_actualizacion'] != 'null' else None
                      
            
            history_logs.append({
                'unit': unit_obj,
                'register_date': date_now.date(),
                'register_datetime': date_now,
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
            })

        bulk_create_unithistory(history_logs)

        
def update_industry_status():
    clients = {
        "trm": "Ternium",
        "rgs": "Ragasa",
        "bkrt": "Bekaert",
        "cmxrgn": "CEMEX Regenera"
    }

    for client_alias, client_name in clients.items():
        output = get_industry_data(client_alias)

        if output:
            gx_data, camera_data, days_remaining = get_industry_data(client_alias)
        else: 
            print(f"No data for {client_name}")
            return


        hour_data = gx_data["hour"]
        recent_data = gx_data["ten_minutes"]

        tz_utc = pytz.utc
        date_now = tz_utc.localize(datetime.utcnow())
        #date_now = datetime.utcnow().astimezone(pytz.timezone('America/Mexico_City')).replace(tzinfo=pytz.utc)
        
        deployment = get_deployment('Industry')

        client_args = {
            'name': client_name,
            'deployment': deployment
        }
        client = get_client(client_args)

        # TO DO: Obtener nombre de device
        device_args = {
            'client': client,
            'name': "GX_01"
        }
        device = get_or_create_device(device_args)

        if days_remaining:
            device.license_days = days_remaining
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
            db_last_connection = device_status.last_connection
            db_delay_time = device_status.delay_time
        except:
            db_last_connection = None

        last_connection = None
        if gx_data["last_connection"]:
            # Agregar nueva última conexión a los campos a actualizar
            update_values['last_connection'] = gx_data["last_connection"] + timedelta(hours=6)
            last_connection = gx_data["last_connection"] + timedelta(hours=6)


        # Si existe ese dato, ver si tiene más de 10 minutos. En ese caso, ponerlo como atrasado
        if last_connection and db_last_connection:
            difference = date_now - last_connection

            # Si hubo retraso entre el log nuevo y la última conexión según la DB
            # Arreglar caso en el que se missea el log reciente por poquito, produciendo un retraso falso
            if last_connection - db_last_connection > timedelta(minutes=11):
                update_values['delayed'] = True
                update_values['delay_time'] = last_connection - db_last_connection - timedelta(minutes=10)

            # Si hay un retraso actualmente
            elif difference > timedelta(minutes=11):
                update_values['delayed'] = True
                update_values['delay_time'] = difference - timedelta(minutes=10)
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
            (update_values['delay_time'] > timedelta(minutes=60), 5, "5_1"),
            (update_values['restart'] > 0, 5, "5_2"),
            (update_values['delayed'] and update_values['delay_time'] < timedelta(minutes=60), 3, "3_1"),
            (update_values['batch_dropping'] > 0, 3, "3_2")
        ]

        severity = 1
        rule = "1_1"
        for condition, status, r in conditions:
            if condition:
                severity = status
                rule = r

        gxstatus_args = {
            'severity': severity,
            'name': rule,
            'deployment': deployment
        }
        status = get_or_create_gxstatus(gxstatus_args)
 
        update_values['status'] = status
        devicestatus_args = {
            'device': device,
            'defaults': update_values,
        }
        device_status = update_or_create_devicestatus(devicestatus_args)

        delay_time = update_values['delay_time'] if 'delay_time' in update_values else timedelta(0)
        delayed = update_values['delayed'] if 'delayed' in update_values else False

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

