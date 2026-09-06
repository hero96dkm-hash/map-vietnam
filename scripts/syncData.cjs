const fs = require('fs');
const path = require('path');

const provincesPath = path.join(__dirname, '../src/data/provinces.json');
const groupsPath = path.join(__dirname, '../src/data/provinceGroups.json');

const provinces = JSON.parse(fs.readFileSync(provincesPath, 'utf8'));
const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf8'));

// 11 tỉnh thành giữ nguyên (không sáp nhập)
const keptProvinces = [
  'Cao Bằng',
  'Điện Biên',
  'Hà Tĩnh',
  'Lai Châu',
  'Lạng Sơn',
  'Nghệ An',
  'Quảng Ninh',
  'Thanh Hóa',
  'Sơn La',
  'Hà Nội',
  'Hà Tây', // Hà Tây thuộc Hà Nội
  'Thừa Thiên - Huế' // TP Huế
];

// Tạo bản đồ ánh xạ từ tên tỉnh cũ sang group
const provinceToGroup = {};
for (const g of groups) {
  for (const prov of g.provinces) {
    provinceToGroup[prov] = g;
  }
}

let updatedCount = 0;
let keptCount = 0;

for (const p of provinces) {
  const matchedGroup = provinceToGroup[p.oldProvince];
  if (matchedGroup) {
    p.groupId = matchedGroup.groupId;
    p.newProvince = matchedGroup.newProvince;
    p.isKept = false;
    updatedCount++;
  } else if (keptProvinces.includes(p.oldProvince)) {
    p.groupId = 'KEPT_' + p.code;
    p.newProvince = (p.oldProvince === 'Thừa Thiên - Huế') ? 'TP Huế' : ((p.oldProvince === 'Hà Tây') ? 'Hà Nội' : p.oldProvince);
    p.isKept = true;
    keptCount++;
  } else {
    console.warn('Unknown province:', p.oldProvince);
  }
}

fs.writeFileSync(provincesPath, JSON.stringify(provinces, null, 2), 'utf8');
console.log(`Successfully updated ${updatedCount} merged provinces and ${keptCount} kept provinces.`);
