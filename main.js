const API_KEY = 'AIzaSyDBQj8I0ElYPaXxgInMT3Ped3BS9blqy8Q';

$(function () {
	$('#editDate').on('change', printUTCDate);
	$('#editTime').on('change', printUTCDate);
	$('#formTimeStamp').on('submit', onTimeStampSubmit);
	$('#btnReset').on('click', resetToCurrentDateTime);
	$('#formLat input[name]').add('#formLon input[name]').on('change', onDegreeChange);
	$('.btn-copy-to-clipboard').on('click', copyInputToClipboard);
	$('#editDegreeNumeric').on('change', onEditDegreeNumericChange);
	resetToCurrentDateTime();
	onDegreeChange();
	updateWarDuration();
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
const onTimeStampSubmit = (event) => {
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
const getDecimalDegree = (form) =>
	(
		parseInt(form['degrees'].value) +
		parseInt(form['minutes'].value) / 60 +
		parseInt(form['seconds'].value) / 3600
	).toLocaleString('en-US', { maximumFractionDigits: 8 });

/**
 * It takes the coordinates from the form and converts them to a string.
 */
const onDegreeChange = () => {
	// const coordinates = '50.43333333, 30.5'; // TODO: remove this after debug
	const coordinates = [
		getDecimalDegree(document.getElementById('formLat')),
		getDecimalDegree(document.getElementById('formLon')),
	].join(', ');
	document.getElementById('editDegreeNumeric').value = coordinates;
	updateDegreesFromCoordinates(coordinates);
};

/**
 * It copies the value of the input to the clipboard.
 */
function copyInputToClipboard() {
	const classForToggle = 'btn-outline-secondary btn-outline-success';
	const timeout = 1000;
	const button = $(this);
	const input = button.siblings('input')[0];
	navigator.clipboard.writeText(input.value);

	button.toggleClass(classForToggle);
	setTimeout(() => button.toggleClass(classForToggle), timeout);

	new bootstrap.Toast(document.getElementById('liveToast'), { delay: timeout }).show();
}

/**
 * This function is called when the user changes the value of the degree input box.
 * It updates the minutes and seconds input boxes to reflect the new degrees
 */
function onEditDegreeNumericChange() {
	updateDegreesFromCoordinates($(this).val());
}

/**
 * `getHumanNumber` returns a string representation of a number with a maximum of
 * `maximumFractionDigits` decimal places
 * @param n - The number to format.
 * @param [maximumFractionDigits=1] - The maximum number of digits after the decimal point.
 */
const getHumanNumber = (n, maximumFractionDigits = 1) =>
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
const updateDegreeForm = (form, degrees, minutes, seconds) => {
	form['degrees'].value = degrees;
	form['minutes'].value = minutes;
	form['seconds'].value = Math.round(seconds);
};

/**
 * It takes a decimal degree value and converts it to a human readable string
 * @param coordinates - The coordinates to search for.
 * @returns Nothing.
 */
const updateDegreesFromCoordinates = (coordinates) => {
	/**
	 * It takes a decimal degree value and converts it to a human readable string
	 * @param dec - the decimal value of the degree
	 * @param suffix - N or S for latitude, E or W for longitude
	 * @returns a string that represents the degree, minutes, and seconds of the decimal number.
	 */
	const getDegreeFromDecimal = (dec, suffix) => {
		const degrees = Math.floor(dec);
		let rest = dec - degrees;
		let minutes = Math.floor(rest * 60);
		rest = rest * 60 - minutes;
		let seconds = Math.round(rest * 6000) / 100;
		if (seconds === 60) {
			minutes++;
			seconds = 0;
		}
		updateDegreeForm(document.querySelector(suffix === 'N' ? '#formLat' : '#formLon'), degrees, minutes, seconds);
		return `${degrees}°${getHumanNumber(minutes)}'${getHumanNumber(seconds)}"${suffix}`;
	};

	const coords = coordinates
		.split(/[,\s]+/i)
		.map(Number)
		.filter((val) => !isNaN(val));
	if (coords.length !== 2) return;
	const degree = getDegreeFromDecimal(coords[0], 'N') + ' ' + getDegreeFromDecimal(coords[1], 'E');

	document.querySelector('#editDegree').value = degree;

	const params = {
		q: encodeURIComponent(coordinates),
		key: API_KEY,
		zoom: 14,
		region: 'UA',
	};
	document.querySelector('.map-frame').setAttribute(
		'src',
		`https://www.google.com/maps/embed/v1/place?${Object.keys(params)
			.map((key) => `${key}=${params[key]}`)
			.join('&')}`
	);
	// .setAttribute('src', `https://maps.google.com/maps?q=${coordinates}&z=14&ie=UTF8&output=embed`);
};

const mWarStart = moment('2022-02-24T03:00:00.000Z');
const updateWarDuration = () => {
	const mCurrent = moment();
	const warDuration = moment.duration(mCurrent.diff(mWarStart));
	const sDuration = `${warDuration.months()} міс. ${warDuration.days()} д. ${warDuration.hours()} год. ${warDuration.minutes()} хв.`;
	document.querySelector('.war-duration__duration').innerText = sDuration;
	document.querySelector('.war-duration__days').innerText = Math.ceil(warDuration.asDays());
	setTimeout(updateWarDuration, 60000 - mCurrent.get('seconds') * 1000 + mCurrent.get('milliseconds') + 1);
};
