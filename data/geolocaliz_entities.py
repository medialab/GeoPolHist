import csv
import os
import time

import requests

def geolocalize_GPH_entities(datadir="./"):

    with open(
        os.path.join(datadir, "GeoPolHist_entities.csv"), "r", encoding="UTF8"
    ) as f, open("GeoPolHist_entities_geoloc.csv", "w", encoding="UTF8") as of:
        entities = csv.DictReader(f)
        entities_geoloc = csv.DictWriter(of, fieldnames=entities.fieldnames)
        entities_geoloc.writeheader()

        
        for entity in list(entities):

            if entity["wikidata"] and entity["wikidata"] != "" and entity["lat"] == "":
                wikidata_id = entity["wikidata"].split('/')[-1]
                query =  "http://www.wikidata.org/wiki/Special:EntityData/%s.json"% wikidata_id
                print("query", query)
                req = requests.get(query, headers={"Accept-Encoding": "gzip,deflate", "User-Agent": "python script for research" })
                print(req.status_code)
                if req.status_code == 200:
                    wikidata = req.json()
                    # geoloc
                    try:
                        geoloc = wikidata["entities"][wikidata_id]["claims"][
                            "P625"
                        ][0]["mainsnak"]["datavalue"]["value"]
                        lat = geoloc["latitude"]
                        lng = geoloc["longitude"]
                        entity["lat"] = lat
                        entity["lng"] = lng
                        print(
                            "ok, %s,%s,%s/%s"
                            % (entity["GPH_name"], wikidata_id, lat, lng)
                        )
                    except KeyError as e:
                        print(
                            "error,%s,%s,%s"
                            % (entity["GPH_name"], wikidata_id, e)
                        )
                    # throttle
                    time.sleep(0.6)
            
            # write to output file
            entities_geoloc.writerow(entity)
        
    # # replace file
    # if replace:
    #     os.remove(os.path.join(datadir, "RICentities.csv"))
    #     os.rename("RICentities_geoloc.csv", os.path.join(datadir, "RICentities.csv"))

if __name__ == "__main__":
    geolocalize_GPH_entities()