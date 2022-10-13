// import Toast from 'bootstrap/js/dist/toast';
import Mgrs, { LatLon } from 'geodesy/mgrs';
import moment from 'moment';
import {
	ALERT_UPDATE_INTERVAL,
	API_KEY,
	getHumanizeDuration,
	promiseTimeout,
	TOAST_TIMEOUT,
	TWorldDirection,
} from './common';
import { csv2svgInit } from './csv2svg';
import { btnAlertAlarmEnableClick, updateAlertAlarmEnableButton, updateRaidAlert } from './raidAlert';

try {
	moment.locale(navigator.language);
} catch (error) {
	moment.locale('uk-UA');
}

$(function () {
	$('#editDate').on('change', printUTCDate);
	$('#editTime').on('change', printUTCDate);
	($('#formTimeStamp') as any).on('submit', onTimeStampSubmit);
	$('#btnReset').on('click', resetToCurrentDateTime);
	$('#formLat input[name]').add('#formLon input[name]').on('change', onDegreeChange);
	$('.btn-copy-to-clipboard').on('click', copyInputToClipboard);
	$('#editDegreeNumeric').on('change', onEditDegreeNumericChange);
	$('#editMgrs').on('change', onEditMgrsChange);
	$('#btnAlertAlarmEnable').on('click', btnAlertAlarmEnableClick);
	csv2svgInit();
	updateAlertAlarmEnableButton();
	resetToCurrentDateTime();
	onDegreeChange();
	updateWarDuration();

	// Оновлення повітряних тривог
	updateRaidAlert();
	setInterval(updateRaidAlert, ALERT_UPDATE_INTERVAL);
});

/**
 * Print the UTC date and time from the date and time inputs
 */
const printUTCDate = () => {
	const date = $('#editDate').val();
	const time = $('#editTime').val();
	const mm = moment(`${date} ${time}`);
	$('#utcDate').val(mm.toISOString());
};

/**
 * Prints the current date and time in UTC format
 * @param event - The event object that was triggered.
 */
const onTimeStampSubmit = (event: MouseEvent) => {
	event.preventDefault();
	printUTCDate();
};

/**
 * Reset the date and time fields to the current date and time
 */
const resetToCurrentDateTime = () => {
	const mmCurrent = moment();
	$('#editDate').val(mmCurrent.format('YYYY-MM-DD'));
	$('#editTime').val(mmCurrent.format('HH:mm'));
	printUTCDate();
	$('#utcDate').focus().select();
};

/**
 * Given a form with fields `degrees`, `minutes`, and `seconds`,
 * return the decimal degree value of the coordinates
 * @param form - The form object that we're working with.
 */
const getDecimalDegree = (form: HTMLFormElement) => {
	if (!form) return '0';
	const originalDegree = parseInt(form['degrees'].value);
	const isNegative = originalDegree < 0;
	const absDegree = Math.abs(originalDegree);
	const minutes = parseInt(form['minutes'].value) / 60;
	const seconds = parseInt(form['seconds'].value) / 3600;
	return ((absDegree + minutes + seconds) * (isNegative ? -1 : 1)).toLocaleString('en-US', {
		maximumFractionDigits: 8,
	});
};

/**
 * It takes the coordinates from the form and converts them to a string.
 */
const onDegreeChange = () => {
	// const coordinates = '50.43333333, 30.5';
	const coordinates = [
		getDecimalDegree(document.getElementById('formLat') as HTMLFormElement),
		getDecimalDegree(document.getElementById('formLon') as HTMLFormElement),
	].join(', ');
	updateDegreesFromCoordinates(coordinates);
};

const showToast = async (text: string, className = 'bg-success text-white') => {
	const toastsContainer = $('.toasts__container');
	if (!toastsContainer) return;
	const toast = $(
		'<div id="liveToast" class="toast fade show showing" role="alert" aria-live="assertive" aria-atomic="true"></div>'
	)
		.append(`<div class="toast-body p-3 ${className}">${text}</div>`)
		.appendTo(toastsContainer);

	await promiseTimeout(0);
	toast.removeClass('showing');
	await promiseTimeout(TOAST_TIMEOUT);
	toast.addClass('showing');
	await promiseTimeout(500);
	toast.remove();
};

/**
 * It copies the value of the input to the clipboard.
 */
function copyInputToClipboard(this: JQuery) {
	const classForToggle = 'btn-outline-secondary btn-outline-success';
	const button = $(this);
	const input = button.siblings('input')[0] as HTMLButtonElement;
	navigator.clipboard.writeText(input.value);

	button.toggleClass(classForToggle);
	setTimeout(() => button.toggleClass(classForToggle), TOAST_TIMEOUT);

	showToast('Скопійовано до буферу обміну');
	// const toastControl = document.getElementById('liveToast');
	// if (!toastControl) return;
	// new Toast(toastControl, { delay: TOAST_TIMEOUT }).show();
	// notifyInit();
}

/**
 * This function is called when the user changes the value of the degree input box.
 * It updates the minutes and seconds input boxes to reflect the new degrees
 */
function onEditDegreeNumericChange(this: JQuery) {
	updateDegreesFromCoordinates($(this).val() as string);
}

function onEditMgrsChange(this: JQuery) {
	const mgrs = Mgrs.parse(($(this).val() as string).toUpperCase());
	const latlon = mgrs.toUtm().toLatLon();
	updateDegreesFromCoordinates(`${latlon._lat}, ${latlon._lon}`);
}

/**
 * `getHumanNumber` returns a string representation of a number with a maximum of
 * `maximumFractionDigits` decimal places
 * @param n - The number to format.
 * @param [maximumFractionDigits=1] - The maximum number of digits after the decimal point.
 */
const getHumanNumber = (n: number, maximumFractionDigits = 1) =>
	n.toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		maximumFractionDigits,
	});

/**
 * Update the form fields with the given values
 * @param form - The form object that we're updating.
 * @param degrees - The degrees of the coordinate.
 * @param minutes - The number of minutes to add to the degrees.
 * @param seconds - The number of seconds to add to the degree.
 */
const updateDegreeForm = (form: HTMLFormElement | null, degrees: number, minutes: number, seconds: number) => {
	if (!form) return;
	form['degrees'].value = degrees;
	form['minutes'].value = minutes;
	form['seconds'].value = Math.round(seconds);
};

/**
 * It takes a decimal degree value and converts it to a human readable string
 * @param coordinates - The coordinates to search for.
 * @returns Nothing.
 */
const updateDegreesFromCoordinates = (coordinates: string) => {
	/**
	 * It takes a decimal degree value and converts it to a human readable string
	 * @param dec - the decimal value of the degree
	 * @param suffix - N or S for latitude, E or W for longitude
	 * @returns a string that represents the degree, minutes, and seconds of the decimal number.
	 */
	const getDegreeFromDecimal = (decOriginal: number, suffix: TWorldDirection) => {
		const isNegative = decOriginal < 0;
		const dec = Math.abs(decOriginal);

		const degrees = Math.floor(dec);
		let rest = dec - degrees;
		let minutes = Math.floor(rest * 60);
		rest = rest * 60 - minutes;
		let seconds = Math.round(rest * 6000) / 100;
		if (seconds === 60) {
			minutes++;
			seconds = 0;
		}
		updateDegreeForm(
			document.querySelector(['N', 'S'].indexOf(suffix) !== -1 ? '#formLat' : '#formLon'),
			degrees * (isNegative ? -1 : 1),
			minutes,
			seconds
		);
		return `${degrees}°${getHumanNumber(minutes)}'${getHumanNumber(seconds)}"${
			isNegative ? (suffix === 'N' ? 'S' : 'W') : suffix
		}`;
	};

	// coords - масив з координатами в вигляді десяткових частин градусів [lat, lon]
	const coords = coordinates
		.split(/[,\s]+/i)
		.map(Number)
		.filter((val) => !isNaN(val));
	if (coords.length !== 2) return;
	const degree = getDegreeFromDecimal(coords[0], 'N') + ' ' + getDegreeFromDecimal(coords[1], 'E');

	(document.getElementById('editDegreeNumeric') as HTMLInputElement).value = coordinates;

	(document.querySelector('#editDegree') as HTMLInputElement).value = degree;

	(document.querySelector('#editMgrs') as HTMLInputElement).value = new LatLon(coords[0], coords[1])
		.toUtm()
		.toMgrs()
		.toString();

	// const p = new LatLon(0, 0);
	// console.log(p.toUtm().toMgrs().toString());

	const params: { [key: string]: any } = {
		q: encodeURIComponent(coordinates),
		key: API_KEY,
		zoom: 14,
		region: 'UA',
	};
	(document.querySelector('.map-frame') as HTMLIFrameElement).setAttribute(
		'src',
		`https://www.google.com/maps/embed/v1/place?${Object.keys(params)
			.map((key) => `${key}=${params[key]}`)
			.join('&')}`
	);
	updatePlaceFromCoordinates(coords);
	// .setAttribute('src', `https://maps.google.com/maps?q=${coordinates}&z=14&ie=UTF8&output=embed`);
};

const updatePlaceFromCoordinates = (coordinates: number[]) => {
	fetch(
		`https://nominatim.openstreetmap.org/reverse.php?lat=${coordinates[0]}&lon=${coordinates[1]}&zoom=18&format=jsonv2`
	)
		.then((response) => {
			if (!response.ok) throw new Error(response.statusText);
			return response.json();
		})
		.then((r) => {
			if (r.error) throw new Error(r.error);
			$('#placeByPoint').text(r.display_name);
			$('#placeByPointIcon').addClass('animation-bounce');
			setTimeout(() => $('#placeByPointIcon').removeClass('animation-bounce'), 2000);
		})
		.catch((error) => {
			$('#placeByPoint').text('Місце не визначено');
			console.error(error);
		});
};

const mWarStart = moment('2022-02-24T03:00:00.000Z');
const updateWarDuration = () => {
	const mCurrent = moment();
	const warDuration = moment.duration(mCurrent.diff(mWarStart));
	const sDuration = getHumanizeDuration(warDuration);
	// const sDuration = `${warDuration.months()} міс. ${warDuration.days()} д. ${warDuration.hours()} год. ${warDuration.minutes()} хв.`;
	(document.querySelector('.war-duration__duration') as HTMLDivElement).innerText = sDuration;
	(document.querySelector('.war-duration__days') as HTMLDivElement).innerText = `${Math.ceil(
		warDuration.asDays()
	)} добу`;
	setTimeout(updateWarDuration, 60000 - (mCurrent.get('seconds') * 1000 + mCurrent.get('milliseconds')) + 1);
};
