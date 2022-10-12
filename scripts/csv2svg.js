"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csv_reader_1 = __importDefault(require("csv-reader"));
const node_fs_1 = require("node:fs");
const getPolygons = (fileName) => new Promise((resolve) => {
    const csv = [];
    let inputStream = (0, node_fs_1.createReadStream)(fileName, 'utf8');
    inputStream
        .pipe(new csv_reader_1.default({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', function (row) {
        csv.push(row);
    })
        .on('end', function () {
        csv.shift();
        resolve(csv.map(([coords]) => coords).filter((coords) => coords.toUpperCase().startsWith('POLYGON')));
    });
});
const getPolygonCoords = (polygon) => {
    const m = polygon.match(/((?:[\d.]+ [\d.]+,?\s*)+)/i);
    if (!m)
        return [];
    const coords = m[1].split(/,\s*/).map((s) => {
        const [sLat, sLon] = s.split(' ');
        return [parseFloat(sLat), -parseFloat(sLon)];
    });
    return coords;
};
const getSvgPath = (coords, index) => {
    const sPath = coords.map(([lat, lon]) => `${lat},${lon}`).join(' ');
    return `<path
    style="fill:#1c1c1c;stroke:#000000;stroke-width:0;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:0.5;stroke-dasharray:none"
    d="M ${sPath} Z"
    id="path_${index}" />`;
};
const convert = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const polygons = yield getPolygons(fileName);
    const polygonCoords = polygons.map(getPolygonCoords);
    const svgPath = polygonCoords.map(getSvgPath);
    return svgPath.join('\n');
});
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const paths = yield convert('./data/occupation.csv');
        (0, node_fs_1.writeFileSync)('./data/occupation.svg', `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg>
  <g
     inkscape:label="Шар 1"
     inkscape:groupmode="layer"
     id="layer1">
	 ${paths}
  </g>
</svg>
`);
    });
})();
