#!/usr/bin/python3
from shutil import copy

# copy full data
print("copying GeoPolHist_entities_status_in_time.csv")
copy("GeoPolHist_entities_status_in_time.csv", "../public/data/")
# copy status metadata
print("copying GeoPolHist_status.csv")
copy("GeoPolHist_status.csv", "../public/data/")
# copy Sankey data
print("copying ./aggregated/status_transitions_links_periods.csv")
copy("./aggregated/status_transitions_links_periods.csv", "../public/data/")