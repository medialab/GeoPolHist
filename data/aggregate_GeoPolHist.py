import csv
from collections import defaultdict, Counter
import json 
import os

COW_entities = defaultdict(dict)
COW_types_by_year = defaultdict(Counter)

OUTPUT_PATH = "./aggregated"


with open('./GeoPolHist_status.csv', 'r', encoding='utf8') as f:
    status = csv.DictReader(f)
    translate_GPH_status = {s['GPH_status']:s for s in status}


periods = [
    {
        "start_year":1816,
        "end_year":1885,
        "transitions": Counter()
    },
    {
        "start_year":1886,
        "end_year":1949,
        "transitions": Counter()
    },
    {
        "start_year":1950,
        "end_year":2019,
        "transitions": Counter()
    },
    {
        "start_year":2020,
        "end_year":2020,
        "transitions": Counter()
    }
]


minYear = 1816
maxYear = 2020
                
with open('GeoPolHist_entities_status_in_time.csv', 'r', encoding='utf8') as r:
    
    COW_links = csv.DictReader(r)

    for link in COW_links:
      
        if link['GPH_status'] not in translate_GPH_status:
              print(link)
              exit(1)
        link = dict((k,v.replace('\n','').strip()) for k,v in  link.items())
        if link['GPH_code'] not in COW_entities:
            COW_entities[link['GPH_code']]['name'] = link['GPH_name']
            COW_entities[link['GPH_code']]['years'] = {}
        if link['end_year'] == '':
            link['end_year'] = maxYear
        if link['start_year'] == '':
            link['start_year'] = minYear
        if link['start_year'] == '?' or link['end_year'] == '?':
            print(link)
            continue


        for y in range(int(link['start_year']), int(link['end_year'])+1):
            if y not in COW_entities[link['GPH_code']]['years']:
                COW_entities[link['GPH_code']]['years'][y] = []
            
            COW_entities[link['GPH_code']]['years'][y].append({
                "status": link['GPH_status'],
                "sovereign": link['sovereign_GPH_code']
                })

    status_stock_period = []
    status_stock_period_agg = defaultdict(Counter)
    years_stock = [p['start_year'] for p in periods]
    get_priority_status = lambda status : sorted((o['status'] for o in status), key=lambda o : -1*translate_GPH_status[o]['priority_order'])[0]
    for code,entity in COW_entities.items():            
        year_status = sorted(list(entity['years'].items()), key=lambda e :e[0])
        ssp = {'name': entity['name']}
        for p in periods:
            status = '?'

            for y,s in sorted(year_status, key=lambda e:e[0]):
                # attribute to period
                if y >= p['start_year'] and y <= p['end_year']:
                    status = get_priority_status(s)
                    break
            ssp[p['start_year']] = status
        status_stock_period.append(ssp) 
        for s_p,e_p in zip(periods, periods[1:]):
            start_status = None
            end_status = None
            for y,s in sorted(year_status, key=lambda e:e[0]):
                # attribute to period
                if not start_status and y >= s_p['start_year'] and y <= s_p['end_year']:
                    start_status = get_priority_status(s)
                if not end_status and y >= e_p['start_year'] and y <= e_p['end_year']:
                    end_status = get_priority_status(s)
            if start_status and end_status:
                status_stock_period_agg["%s %s-%s"%(start_status,s_p['start_year'],s_p['end_year'])]["%s %s-%s"%(end_status,e_p['start_year'],e_p['end_year'])]+=1
            # if one status is not know the entity disapeared => no link
        for p,n in zip(year_status, year_status[1:]):
            previous_status = translate_GPH_status[get_priority_status(p[1])]['group']
            next_status = translate_GPH_status[get_priority_status(n[1])]['group']
            
            if previous_status != next_status:
                # status changed
                for p in periods:
                    # attribute to period
                    if n[0] >= p['start_year'] and n[0] <= p['end_year']:
                        p['transitions']["%s>%s"%(previous_status, next_status)]+=1
                        break
    with open(os.path.join(OUTPUT_PATH, 'GeoPolHist_entities_extended.json'), 'w', encoding='utf8') as f:
        json.dump(COW_entities, f, indent=2)

    with open(os.path.join(OUTPUT_PATH, 'status_transitions_by_periods.json'), 'w', encoding='utf8') as f:
        json.dump(periods, f, indent=2)
    with open(os.path.join(OUTPUT_PATH, 'status_transitions_by_periods.csv'), 'w', encoding='utf8') as f:
        transitions_csv = csv.DictWriter(f, fieldnames=['period', 'transition', 'nb'])
        transitions_csv.writeheader()
        for p in periods:
            transitions_csv.writerows(({
                'period': '%s-%s'%(p['start_year'], p['end_year']),
                'transition':t,
                'nb':nb } for t,nb in p['transitions'].items()))
    
    with open(os.path.join(OUTPUT_PATH, 'status_stocks_by_periods.csv'), 'w', encoding='utf8') as f:
        status_stock_csv = csv.DictWriter(f, fieldnames=['name']+years_stock)
        status_stock_csv.writeheader()
        status_stock_csv.writerows(status_stock_period)
    
    with open(os.path.join(OUTPUT_PATH, 'status_transitions_links_periods.csv'), 'w', encoding='utf8') as f:
        transitions_csv = csv.DictWriter(f, fieldnames=['source', 'target', 'nb'])
        transitions_csv.writeheader()
        for source,targets in status_stock_period_agg.items():
            transitions_csv.writerows(({
                'source': source,
                'target':target,
                'nb':nb } for target,nb in targets.items()))

    with open(os.path.join(OUTPUT_PATH, 'GeoPolHist_entities_in_time.csv'), 'w', encoding='utf8') as o:
        fieldnames = ['GPH_name', 'COW_id'] + list(range(minYear, maxYear+1))
        output = csv.DictWriter(o, fieldnames=fieldnames)
        output.writeheader()
        for number, e in COW_entities.items():
            line = { 'GPH_name':e['name'],
              'COW_id':number}
            for y in range(minYear, maxYear+1):
                if y in e['years'] :
                    status_by_priority = sorted((o['status'] for o in e['years'][y]), key=lambda o : -1*translate_GPH_status[o]['priority_order'])
                    line[y] = " | ".join([translate_GPH_status[o]["slug"] for o in status_by_priority])
                    the_status = status_by_priority[0]
                    COW_types_by_year[the_status][y] += 1
                else :
                    line[y] = ''
            output.writerow(line) 
    with open(os.path.join(OUTPUT_PATH, 'GeoPolHist_status_in_time.csv'), 'w', encoding='utf8') as o:
        fieldnames = ['GPH_status'] + list(range(minYear, maxYear+1))
        output = csv.DictWriter(o, fieldnames=fieldnames)
        output.writeheader()
        group_by_year = defaultdict(Counter)
        type_by_year = {}
        for ctype, years in sorted(COW_types_by_year.items(), key=lambda o : translate_GPH_status[o[0]]['priority_order']):
            line = { 'GPH_status': ctype}
            for y in range(minYear, maxYear+1):
                line[y] = years[y] if y in years else 0
                # aggregate by group
                if translate_GPH_status[ctype]['group'] != "":
                    group_by_year[translate_GPH_status[ctype]['group']][y] += line[y]
            type_by_year[ctype] = line
            output.writerow(line)

        with open(os.path.join(OUTPUT_PATH, 'GeoPolHist_statu_group_in_time.csv'), 'w', encoding='utf8') as f:
            output = csv.DictWriter(f, fieldnames= ["GPH_status_group"]+list(range(minYear, maxYear+1)))
            output.writeheader()
            for g,years in group_by_year.items():
                years["GPH_status_group"] = g
                output.writerow(years)


