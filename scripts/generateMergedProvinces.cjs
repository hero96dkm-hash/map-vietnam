const fs = require('fs');
const path = require('path');
const topojsonServer = require('topojson-server');
const topojsonClient = require('topojson-client');

const geoDataPath = path.join(__dirname, '../src/data/vietnamProvinces.json');
const groupsPath = path.join(__dirname, '../src/data/provinceGroups.json');
const provincesPath = path.join(__dirname, '../src/data/provinces.json');
const outputPath = path.join(__dirname, '../src/data/mergedProvinces.json');

const geoData = JSON.parse(fs.readFileSync(geoDataPath, 'utf8'));
const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));
const provinces = JSON.parse(fs.readFileSync(provincesPath, 'utf8'));

const topo = topojsonServer.topology({ provinces: geoData });

const mergedFeatures = groups.map((g) => {
  const provs = provinces.filter((p) => g.provinces.includes(p.oldProvince));
  const geoms = provs
    .map((p) => {
      return p.featureIndex !== undefined
        ? topo.objects.provinces.geometries[p.featureIndex]
        : topo.objects.provinces.geometries.find((geom) => geom.properties.Ma === p.code);
    })
    .filter(Boolean);

  const mergedGeometry = topojsonClient.merge(topo, geoms);

  return {
    type: 'Feature',
    id: g.groupId,
    properties: {
      groupId: g.groupId,
      newProvince: g.newProvince,
      description: g.description,
      region: g.region,
      provinces: g.provinces,
      color: g.color,
    },
    geometry: mergedGeometry,
  };
});

const mergedCollection = {
  type: 'FeatureCollection',
  features: mergedFeatures,
};

fs.writeFileSync(outputPath, JSON.stringify(mergedCollection), 'utf8');
console.log(`Successfully generated ${mergedFeatures.length} merged provinces at ${outputPath}`);
