$(function () {
	$('#editDate').on('change', printUTCDate);
	$('#editTime').on('change', printUTCDate);
	$('#formTimeStamp').on('submit', onTimeStampSubmit);
	$('#btnReset').on('click', resetToCurrentDateTime);
	$('#formLat input[name]').add('#formLon input[name]').on('change', onDegreeChange);
	$('.btn-copy-to-clipboard').on('click', copyInputToClipboard);
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
