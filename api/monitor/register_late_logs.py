from django.db.models import Q
from functools import reduce
import json
from operator import or_
import pandas as pd
from datetime import datetime, timedelta
from collections import defaultdict
import pytz

from .selectors import get_unit

from .models import GxStatus, Unit, UnitHistory, UnitTrip

file_path = "./past_logs.json"
# file_path = "/home/spare/Documents/monitor/monitor-project/api/past_logs.json"


def register_logs():
    with open(file_path, "r") as f:
        response = json.load(f)

    # df = pd.DataFrame(response["logs"])
    df = pd.DataFrame(response)

    if df.empty:
        print(
            f'{datetime.now(tz=pytz.timezone("America/Mexico_City")).isoformat(sep=" ", timespec="seconds")} - File is empty')
        return

    df["Timestamp"] = df["Timestamp"].apply(
        lambda x: datetime.fromisoformat(x[:-1]))

    df["Fecha_subida"] = df["Fecha_subida"].apply(
        lambda x: datetime.fromisoformat(x[:-1]))

    intervals_data = defaultdict(lambda: defaultdict(
        lambda: {"counts": defaultdict(int), "disc_cams": set()}))

    count_field_names = [
        "restart",
        "reboot",
        "start",
        "data_validation",
        "source_missing",
        "camera_connection",
        "storage_devices",
        "forced_reboot",
        "read_only_ssd",
        "ignition",
        "aux"
    ]

    type_to_field = {
        "camera_missing": 'camera_connection',
        "Ignición": 'ignition',
        "Aux": 'aux',
        "batch_dropping": 'others',
    }
    field_to_type = {v: k for k, v in type_to_field.items()}

    print("Counting log types per interval...")
    for i in range(len(df)):
        log = df.iloc[i]
        unit_name = log["Unidad"]
        generation_time = log["Timestamp"]
        upload_time = log["Fecha_subida"]
        log_type = log["Tipo"]

        interval_time = (generation_time.replace(
            minute=generation_time.minute // 10 * 10, second=0) + timedelta(minutes=10)).to_pydatetime()
        interval_time = (interval_time + timedelta(hours=6)).astimezone(pytz.timezone('UTC')).replace(
            tzinfo=pytz.timezone('UTC'))

        if log_type == "read_only_ssd":
            print(f'{unit_name} {interval_time} - Read only SSD')

        intervals_data[unit_name][interval_time]["counts"][log_type] += 1

        restarting_loop = False
        if log_type == "restart" and "Restarting" in log["Log"]:
            execution_number = int(log["Log"].split()[4])
            if execution_number > 1:
                restarting_loop = True

        intervals_data[unit_name][interval_time]["restarting_loop"] = restarting_loop

        if log_type == "camera_missing" and log["Log"].split()[1] == "'DISCONNECTED":
            cameras = set(log["Log"][:-2].split(":")[2].split())

            intervals_data[unit_name][interval_time]["disc_cams"].update(
                cameras)

    print("Finding and modifying DB instances...")
    created_histories = []
    modified_histories = []
    unit_timelines = defaultdict(lambda: defaultdict(dict))
    unit_names = set(intervals_data.keys())

    unit_entries = Unit.objects.filter(name__in=unit_names)
    unit_entries_dict = {entry.name: entry for entry in unit_entries}

    for unit_name, interval_time in intervals_data.items():
        # unit_obj = Unit.objects.get(name=unit_name)

        for time, interval_data in interval_time.items():

            unit_history = None
            try:
                unit_history = UnitHistory.objects.get(unit__name=unit_name,
                                                       register_datetime__gt=time,
                                                       register_datetime__lt=time+timedelta(minutes=2))

            except Exception as e:
                pass

            total = sum([num for log, num in interval_data["counts"].items()
                         if log not in {'Aux', 'Ignición'}])
            if unit_history:

                for log_type, count in interval_data["counts"].items():
                    field_name = type_to_field.get(log_type, log_type)
                    setattr(unit_history, field_name, getattr(
                        unit_history, field_name) + count)
                unit_history.total += total
                unit_history.modified = True

                modified_histories.append(unit_history)
                unit_timelines[unit_name][time] = {field: getattr(
                    unit_history, field) for field in count_field_names}

            else:
                count_fields = {field_name: interval_data["counts"].get(field_to_type.get(field_name, field_name), 0)
                                for field_name in count_field_names}

                unit_timelines[unit_name][time] = count_fields

                trips = UnitTrip.objects.filter(unit__name=unit_name,
                                                start_datetime__lt=time, end_datetime__gt=time)
                on_trip = len(trips) > 0

                register_time = time.astimezone(
                    pytz.timezone('UTC'))
                created_histories.append(UnitHistory(
                    unit=unit_entries_dict[unit_name],
                    register_datetime=register_time,
                    register_date=register_time.date(),
                    total=total,
                    **count_fields,
                    others=0,
                    on_trip=on_trip,
                    modified=True
                ))

    all_new_entries = created_histories + modified_histories
    all_new_entries.sort(key=lambda x: x.register_datetime)

    changed_entries_by_unit = defaultdict(list)
    for entry in all_new_entries:
        changed_entries_by_unit[entry.unit.name].append(entry)

    print("Generating new status...")

    gx_status = GxStatus.objects.filter(deployment__name="Safe Driving")
    status_dict = {(status.severity, status.description): status
                   for status in gx_status}

    for unit_name, entries in changed_entries_by_unit.items():

        for entry in entries:

            register_datetime = entry.register_datetime
            prev_hour_times = [register_datetime -
                               timedelta(minutes=10*i) for i in range(1, 6)]

            # Initialize last_hour_counts with log counts of the CURRENT entry,
            # before checking the previous 5 (the last hour)
            last_hour_counts = {field: getattr(
                entry, field) for field in count_field_names}

            for t in prev_hour_times:
                rounded_t = t.replace(
                    minute=t.minute // 10 * 10, second=0, microsecond=0)

                if rounded_t in unit_timelines[unit_name]:
                    last_hour_counts = {
                        field: count +
                        unit_timelines[unit_name][rounded_t][field]
                        for field, count in last_hour_counts.items()}
                else:
                    past_entry = None
                    # units_and_times.append((unit_name, t))
                    try:
                        past_entry = UnitHistory.objects.get(unit__name=unit_name,
                                                             register_datetime__gt=t -
                                                             timedelta(
                                                                 minutes=1),
                                                             register_datetime__lt=t+timedelta(minutes=1))
                    except Exception as e:

                        unit_timelines[unit_name][rounded_t] = {
                            field: 0 for field in count_field_names}

                    if past_entry:

                        for field in count_field_names:
                            last_hour_counts[field] += getattr(
                                past_entry, field)
                            unit_timelines[unit_name][rounded_t][field] = getattr(
                                past_entry, field)

            rounded_time = register_datetime.replace(
                minute=register_datetime.minute // 10 * 10, second=0, microsecond=0)

            disc_cameras = intervals_data[unit_name][rounded_time]["disc_cams"]

            total = sum([num for log, num in last_hour_counts.items()
                        if log not in {'Aux', 'Ignición'}])

            status_conditions = [
                # (Condition, Status, Description)
                (last_hour_counts["read_only_ssd"]
                 > 0, 5, "Read only SSD"),
                (entry.on_trip and len(disc_cameras)
                 > 2, 5, "Tres cámaras fallando"),
                (entry.restarting_loop
                 and entry.on_trip, 5, "Múltiples restarts"),
                (last_hour_counts["forced_reboot"]
                 > 1, 5, "forced reboot (>1)"),
                # (device_data.get("Jsons_eventos_pendientes") > 100 or device_data.get(
                #     "Jsons_status_pendientes") > 1000, 5, "Logs pendientes (>100)"),
                (entry.on_trip and len(disc_cameras) in {
                    1, 2}, 4, "1-2 cámaras fallando"),
                (entry.restarting_loop
                 and not entry.on_trip, 4, "Múltiples restarts"),
                (last_hour_counts["forced_reboot"]
                 == 1, 4, "Forced reboot reciente"),
                (last_hour_counts["storage_devices"]
                 > 0, 3, "Errores de memoria"),
                (total > 10, 3, "Más de 10 mensajes"),
                ((last_hour_counts["aux"] == 0 or last_hour_counts["ignition"]
                  == 0), 2, "Sin AUX ni Ignición"),
                (not entry.on_trip, 2, "Comunicación reciente"),
                (entry.on_trip and 10 > total > 5, 2,
                 "De 5 a 10 mensajes en última hora"),
                (entry.on_trip and total < 5, 1, "Comunicación reciente"),
            ]

            original_severity = entry.status.severity if entry.status else None
            original_description = entry.status.description if entry.status else None

            status_severity = entry.status.severity if entry.status else None
            status_description = entry.status.description if entry.status else None

            for condition, level, description in status_conditions:
                if condition:
                    status_severity = level
                    status_description = description
                    break

            status = status_dict[(status_severity, status_description)]
            entry.status = status

            # if status_description in {"Read only SSD", "forced reboot (>1)", "Forced reboot reciente"} and status_description != original_description:
            # entry.save()
            # print(entry.id)
            # print(entry.register_datetime)

            print(unit_name,
                  f'Before: {original_severity} - {original_description} | After: {status_severity} - {status_description}')

    print(f'\n{datetime.now(tz=pytz.timezone("America/Mexico_City")).isoformat(sep=" ", timespec="seconds")} - Updated {len(all_new_entries)} entries\n\n')

    with open(file_path, "w") as f:
        response = json.dump([], f)
