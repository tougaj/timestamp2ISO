const mgrs_array = [
	'37U CR 10865 71580',
	'37U CR 12286 70848',
	'37U CR 57287 02868',
	'37U CR 57960 02414',
	'37U CQ 47588 82229',
	'37U CQ 80926 52432',
	'37U CQ 80217 52430',
	'37U CQ 72012 41123',
	'37U CQ 71383 41187',
	'37U CQ 70083 42442',
	'37U CQ 77239 38009',
	'37U DP 59883 85677',
	'37U DQ 55826 16170',
	'37U EP 28720 63527',
	'37U EP 33050 61885',
	'37T DP 35381 13342',
	'37T DP 35699 13247',
	'37T CN 30184 80430',
	'36T XT 91097 56985',
	'36T YT 01690 30195',
	'36T XS 73442 90801',
	'36T XS 72798 91318',
	'36T WS 28606 74882',
	'36T WS 28153 74372',
	'36T WS 43123 98650',
	'36T WT 55822 40830',
	'36T VT 91669 10288',
	'36T VT 93778 11800',
	'36T VS 61506 70744',
	'36T VS 56511 83310',
	'36T VS 55130 82695',
]

async function main(){
	// import Mgrs, { LatLon } from 'geodesy/mgrs.js';
	const {default: Mgrs} = await import('geodesy/mgrs.js');

	const convert = mgrs_string => {
		const mgrs = Mgrs.parse(mgrs_string);
		const latlon = mgrs.toUtm().toLatLon();
		return [latlon._lat, latlon._lon]
		
	}

	for (mgrs_string of mgrs_array){
		const latlon = convert(mgrs_string);
		console.log(`${mgrs_string} - ${latlon.join(', ')}`);
	}

	// const Mgrs = require('geodesy/mgrs.js');
	// const mgrs_string = '31U DQ 48251 11932';
	// const latlon = convert('31U DQ 48251 11932');
	// console.log(`${'31U DQ 48251 11932'} - ${latlon.join(', ')}`);

	// const mgrs = Mgrs.parse('31U DQ 48251 11932');
	// const latlon = mgrs.toUtm().toLatLon();
	// console.log(latlon.toString('dms', 2));
	// console.assert(latlon.toString('dms', 2) == '48° 51′ 29.50″ N, 002° 17′ 40.16″ E');

	// const p = Mgrs.LatLon.parse('51°28′40.37″N, 000°00′05.29″W');
	// const ref = p.toUtm().toMgrs();
	// console.assert(ref.toString() == '30U YC 08215 07233');
}

main()