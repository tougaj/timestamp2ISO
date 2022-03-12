$(function () {
	$('#editDate').on('change', printUTCDate);
	$('#editTime').on('change', printUTCDate);
	$('#formTimeStamp').on('submit', onTimeStampSubmit);
	$('#btnReset').on('click', resetToCurrentDateTime);
	$('#formLat input[name]').add('#formLon input[name]').on('change', onDegreeChange);
	resetToCurrentDateTime();
	onDegreeChange();
});

const printUTCDate = () => {
	const date = $('#editDate').val();
	const time = $('#editTime').val();
	const mm = moment(`${date} ${time}`);
	$('#utcDate').val(mm.toISOString());
};

const onTimeStampSubmit = (event) => {
	event.preventDefault();
	printUTCDate();
};

const resetToCurrentDateTime = () => {
	const mmCurrent = moment();
	$('#editDate').val(mmCurrent.format('YYYY-MM-DD'));
	$('#editTime').val(mmCurrent.format('HH:mm'));
	printUTCDate();
	$('#utcDate').focus().select();
};

const getDegree = (form) =>
	(
		parseInt(form['degrees'].value) +
		parseInt(form['minutes'].value) / 60 +
		parseInt(form['seconds'].value) / 3600
	).toLocaleString('en-US', { maximumFractionDigits: 8 });

const onDegreeChange = () => {
	document.getElementById('editDegreeNumeric').value = [
		getDegree(document.getElementById('formLat')),
		getDegree(document.getElementById('formLon')),
	].join(', ');
};
