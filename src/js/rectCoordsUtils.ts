import proj4 from 'proj4';

function normalizeCoords(coordsArray: [number, number]) {
	if (!coordsArray[0] || !Number.isFinite(coordsArray[0])) {
		coordsArray[0] = 0;
	}

	if (!coordsArray[1] || !Number.isFinite(coordsArray[1])) {
		coordsArray[1] = 0;
	}

	return coordsArray;
}

function getUsk2000Projection(lon0: number, zone: number) {
	return `+proj=tmerc +ellps=krass +towgs84=24.322,-121.372,-75.847,0,0,0,0 +lon_0=${lon0} +x_0=${zone}500000`;
}

export const fromDecimalToRect = (north: number, east: number) => {
	const zone = Math.trunc(east / 6) + 1;
	const lon0 = Math.trunc(east / 6) * 6 + 3;
	const toProjection = getUsk2000Projection(lon0, zone);
	const result = proj4('WGS84', toProjection, normalizeCoords([east, north]));
	normalizeCoords(result);
	return {
		x: Math.round(result[1]),
		y: Math.round(result[0]),
		// x: result[1].toFixed(3),
		// y: result[0].toFixed(3),
	};
};

export const fromRectToDecimal = ({ x, y }: { x: number; y: number }) => {
	let zone = Math.trunc(y / 1000000);
	zone = zone || 1;
	const lon0 = zone * 6 - 3;
	const fromProjection = getUsk2000Projection(lon0, zone);

	const result = proj4(fromProjection, 'WGS84', normalizeCoords([y, x]));
	normalizeCoords(result);
	return [result[1], result[0]];
	// return [parseFloat(result[1].toFixed(6)), parseFloat(result[0].toFixed(6))];
};
