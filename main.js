$(function () {
	$("#editDate").on("change", printUTCDate);
	$("#editTime").on("change", printUTCDate);
	$("#formTimeStamp").on("submit", onTimeStampSubmit);
	$("#btnReset").on("click", resetToCurrentDateTime);
	resetToCurrentDateTime();
});

const printUTCDate = () => {
	const date = $("#editDate").val();
	const time = $("#editTime").val();
	const mm = moment(`${date} ${time}`);
	$("#utcDate").val(mm.toISOString());
};

const onTimeStampSubmit = (event) => {
	event.preventDefault();
	printUTCDate();
};

const resetToCurrentDateTime = () => {
	const mmCurrent = moment();
	$("#editDate").val(mmCurrent.format("YYYY-MM-DD"));
	$("#editTime").val(mmCurrent.format("HH:mm"));
	printUTCDate();
};
