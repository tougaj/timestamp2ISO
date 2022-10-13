import CsvReadableStream from 'csv-reader';
import { createReadStream, writeFileSync } from 'node:fs';

type TLatLon = [number, number];
interface IMinMax {
	min: number;
	max: number;
	avg: number;
}

const SCALE_COEFFICIENT = 50;

const getPolygons = (fileName: string) =>
	new Promise<string[]>((resolve) => {
		const csv: string[][] = [];
		let inputStream = createReadStream(fileName, 'utf8');

		inputStream
			.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
			.on('data', function (row: string[]) {
				csv.push(row);
			})
			.on('end', function () {
				csv.shift();
				resolve(csv.map(([coords]) => coords).filter((coords) => coords.toUpperCase().startsWith('POLYGON')));
			});
	});

const getPolygonCoords = (polygon: string) => {
	const m = polygon.match(/((?:[\d.]+ [\d.]+,?\s*)+)/i);
	if (!m) return [];
	const coords = m[1].split(/,\s*/).map((s) => {
		const [sLat, sLon] = s.split(' ');
		return [parseFloat(sLat), -parseFloat(sLon)] as TLatLon;
	});
	return coords;
};

const getSvgPath = (coords: TLatLon[], index: number) => {
	const sPath = coords.map(([lat, lon]) => `${lat},${lon}`).join(' ');
	return `<path
    style="fill:#6a6a6a;stroke:#000000;stroke-width:0;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;fill-opacity:0.5;stroke-dasharray:none"
    d="M ${sPath} Z"
    id="path_${index}" />`;
};

const getMinMax = (coord: number[]): IMinMax => {
	const min = Math.min(...coord);
	const max = Math.max(...coord);
	return { min, max, avg: (min + max) / 2 };
};

const normalizeCoordItem = (coord: TLatLon[], minLat: number, minLon: number): TLatLon[] =>
	coord.map(([lat, lon]) => [(lat - minLat) * SCALE_COEFFICIENT, (lon - minLon) * SCALE_COEFFICIENT]);

const normalizeCoords = (coords: TLatLon[][]) => {
	const flat = coords.flat();
	const latBounds = getMinMax(flat.map(([lat]) => lat));
	// console.log(latBounds);
	const lonBounds = getMinMax(flat.map(([, lon]) => lon));
	// console.log(lonBounds);
	return coords.map((coordItem) => normalizeCoordItem(coordItem, latBounds.min, lonBounds.min));
};

const convert = async (fileName: string) => {
	const polygons = await getPolygons(fileName);

	const polygonCoords = polygons.map(getPolygonCoords);
	// console.log(polygonCoords);

	const normalizedPolygonCoords = normalizeCoords(polygonCoords);
	// console.log(normalizedPolygonCoords);

	// const svgPath = polygonCoords.map(getSvgPath);
	const svgPath = normalizedPolygonCoords.map(getSvgPath);

	return svgPath.join('\n');
};

(async function main() {
	const paths = await convert('./data/occupation.csv');
	writeFileSync(
		'./data/occupation.svg',
		`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg>
  <g
     inkscape:label="Шар 1"
     inkscape:groupmode="layer"
     id="layer1">
	 ${paths}
  </g>
</svg>
`
	);
})();
