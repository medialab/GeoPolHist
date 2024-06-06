#!/usr/bin/python3
from shutil import copy
import csv
import json

# copy full data
print("copying GeoPolHist_entities_status_over_time.csv")
overTimeHeaders = []
overTimeData = []
with open("GeoPolHist_entities_status_over_time.csv", "r") as overTimeF, open(
    "./GeoPolHist_entities.csv", "r"
) as entitiesf:
    _overTimeData = csv.DictReader(overTimeF)
    overTimeHeaders = list(_overTimeData.fieldnames or [])
    overTimeHeaders.append("continent")
    entities = {e["GPH_code"]: e for e in csv.DictReader(entitiesf)}
    for overTime in _overTimeData:
        overTime["continent"] = entities[overTime["GPH_code"]]["continent"]
        overTimeData.append(overTime)
with open("../public/data/GeoPolHist_entities_status_over_time.csv", "w") as o:
    output = csv.DictWriter(o, overTimeHeaders)
    output.writeheader()
    output.writerows(overTimeData)


# copy full data
print("copying GeoPolHist_entities.csv")
copy("GeoPolHist_entities.csv", "../public/data/")
# copy full data
print("copying GeoPolHist_status.csv")
copy("GeoPolHist_status.csv", "../public/data/")
# copy status metadata
print("copying GPH_status.json")
with open("GeoPolHist_status.csv", "r", encoding="utf8") as fcsv, open(
    "../public/data/GPH_status.json", "w", encoding="utf8"
) as fjson:
    status = csv.DictReader(fcsv)
    json.dump(
        {
            s["GPH_status"]: {
                "GPH_status": s["GPH_status"],
                "slug": s["slug"],
                "priority": s["priority_order"],
            }
            for s in status
        },
        fjson,
        indent=2,
        ensure_ascii=False,
    )
# copy Sankey data
print("copying ./aggregated/status_transitions_links_periods.csv")
copy("./aggregated/status_transitions_links_periods.csv", "../public/data/")
