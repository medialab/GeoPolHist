#!/usr/bin/python3
from shutil import copy
import csv
import json

# copy full data
print("copying GeoPolHist_entities_status_in_time.csv")
copy("GeoPolHist_entities_status_in_time.csv", "../public/data/")
# copy status metadata
print("copying GPH_status.json")
with open('GeoPolHist_status.csv', 'r', encoding='utf8') as fcsv, open('../public/data/GPH_status.json', 'w', encoding='utf8') as fjson:
    status = csv.DictReader(fcsv)
    json.dump({s['GPH_status']:{"GPH_status":s['GPH_status'], "slug":s['slug'], "priority":s['priority_order']} for s in status}, fjson, indent=2, ensure_ascii=False)    
# copy Sankey data
print("copying ./aggregated/status_transitions_links_periods.csv")
copy("./aggregated/status_transitions_links_periods.csv", "../public/data/")