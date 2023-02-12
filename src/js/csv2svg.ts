import dayjs from 'dayjs';
import $ from 'jquery';
import { parse } from 'papaparse';

type TLatLon = [number, number];
interface IMinMax {
	min: number;
	max: number;
	avg: number;
}

const SCALE_COEFFICIENT = 50;

let inputControl: JQuery | undefined = undefined;

const btnCsv2SvgClick = () => {
	if (!inputControl) return;
	inputControl.click();
};

const getCsv = (file: File): Promise<string[]> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function (e) {
			const text = e.target?.result as string;
			if (!text) reject(new Error('Помилка читання файлу'));
			const csv = parse(text).data as string[][];
			csv.shift();
			resolve(csv.map(([coords]) => coords).filter((coords) => coords.toUpperCase().startsWith('POLYGON')));
		};
		reader.readAsText(file);
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

const saveSvg = (svg: string) => {
	const blob = new Blob([svg], { type: 'image/svg+xml' });
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.setAttribute('href', objectUrl);
	link.setAttribute('download', `fromCSV_${dayjs().format('YYYYMMDD_HHmmss')}.svg`);
	link.textContent = 'download';
	link.className = 'd-none';
	const body = document.querySelector('body');
	if (!body) return;
	body.appendChild(link);
	link.click();
	setTimeout(() => {
		body.removeChild(link);
		URL.revokeObjectURL(objectUrl);
	}, 5000);
};

const inputControlChange = async () => {
	try {
		if (!inputControl) return;
		const input = inputControl[0] as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		const [file] = input.files;
		if (!file.name.endsWith('.csv')) throw new Error('Оберіть, будь-ласка, csv-файл');
		const polygons = await getCsv(file);
		input.value = '';

		const polygonCoords = polygons.map(getPolygonCoords);
		// console.log(polygonCoords);

		const normalizedPolygonCoords = normalizeCoords(polygonCoords);
		// console.log(normalizedPolygonCoords);

		// const svgPath = polygonCoords.map(getSvgPath);
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
	} catch (error) {
		alert((error as Error).message);
	}
};

export const csv2svgInit = () => {
	inputControl = $(`<input
	type="file"
	id="csv2svgInput"
	name="csv2svg"
	accept="text/csv"
	autoComplete="off"
	class="d-none"
/>`)
		.on('change', inputControlChange)
		.appendTo('body');

	$('#btnCsv2Svg').on('click', btnCsv2SvgClick);
};
