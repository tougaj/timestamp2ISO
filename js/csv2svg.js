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
exports.csv2svgInit = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const jquery_1 = __importDefault(require("jquery"));
const papaparse_1 = require("papaparse");
const SCALE_COEFFICIENT = 50;
let inputControl = undefined;
const btnCsv2SvgClick = () => {
    if (!inputControl)
        return;
    inputControl.click();
};
const getCsv = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
        var _a;
        const text = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
        if (!text)
            reject(new Error('Помилка читання файлу'));
        const csv = (0, papaparse_1.parse)(text).data;
        csv.shift();
        resolve(csv.map(([coords]) => coords).filter((coords) => coords.toUpperCase().startsWith('POLYGON')));
    };
    reader.readAsText(file);
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
    style="fill:#6a6a6a;stroke:#000000;stroke-width:0;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:0.5;stroke-dasharray:none"
    d="M ${sPath} Z"
    id="path_${index}" />`;
};
const getMinMax = (coord) => {
    const min = Math.min(...coord);
    const max = Math.max(...coord);
    return { min, max, avg: (min + max) / 2 };
};
const normalizeCoordItem = (coord, minLat, minLon) => coord.map(([lat, lon]) => [(lat - minLat) * SCALE_COEFFICIENT, (lon - minLon) * SCALE_COEFFICIENT]);
const normalizeCoords = (coords) => {
    const flat = coords.flat();
    const latBounds = getMinMax(flat.map(([lat]) => lat));
    const lonBounds = getMinMax(flat.map(([, lon]) => lon));
    return coords.map((coordItem) => normalizeCoordItem(coordItem, latBounds.min, lonBounds.min));
};
const saveSvg = (svg) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', objectUrl);
    link.setAttribute('download', `fromCSV_${(0, dayjs_1.default)().format('YYYYMMDD_HHmmss')}.svg`);
    link.textContent = 'download';
    link.className = 'd-none';
    const body = document.querySelector('body');
    if (!body)
        return;
    body.appendChild(link);
    link.click();
    setTimeout(() => {
        body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    }, 5000);
};
const inputControlChange = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!inputControl)
            return;
        const input = inputControl[0];
        if (!input.files || input.files.length === 0)
            return;
        const [file] = input.files;
        if (!file.name.endsWith('.csv'))
            throw new Error('Оберіть, будь-ласка, csv-файл');
        const polygons = yield getCsv(file);
        input.value = '';
        const polygonCoords = polygons.map(getPolygonCoords);
        const normalizedPolygonCoords = normalizeCoords(polygonCoords);
        const svgPath = normalizedPolygonCoords.map(getSvgPath);
        const paths = svgPath.join('\n');
        const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg>
  <g
     inkscape:label="Шар 1"
     inkscape:groupmode="layer"
     id="layer1">
	 ${paths}
  </g>
</svg>
`;
        saveSvg(svg);
    }
    catch (error) {
        alert(error.message);
    }
});
const csv2svgInit = () => {
    inputControl = (0, jquery_1.default)(`<input
	type="file"
	id="csv2svgInput"
	name="csv2svg"
	accept="text/csv"
	autoComplete="off"
	class="d-none"
/>`)
        .on('change', inputControlChange)
        .appendTo('body');
    (0, jquery_1.default)('#btnCsv2Svg').on('click', btnCsv2SvgClick);
};
exports.csv2svgInit = csv2svgInit;
