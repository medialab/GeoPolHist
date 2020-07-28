# GeoPolHist data set

World Geo-Political entities sovereign status from 1816 to 2020.

- ./data : the data set in CSV and python (3) scripts to aggregate 
- ./datapackage.json : documentation of the data set
- ./src : source code of the visualisation web application

## Use the visualisation tool

Visit [http://medialab.github.io/GeoPolHist](http://medialab.github.io/GeoPolHist).
Or follow this instructions to use locally.

### prepare data

```bash
cd data
# aggregate the dataset to prepare sankey diagram data
python3 aggregate_GeoPolHist.py
# copy dataset in the visualisation application
python3 deploy_data_in_viz.py
```

### install deps

You need node and npm to be installed.

```bash
npm install
```

### run locally
```bash
npm run start
```

### deploy on github pages

You need to write rights on the origin repository
```bash
npm run deploy
```
