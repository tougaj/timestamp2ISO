"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mgrs_1 = __importStar(require("geodesy/mgrs"));
const moment_1 = __importDefault(require("moment"));
var bootstrap;
const API_KEY = 'AIzaSyDBQj8I0ElYPaXxgInMT3Ped3BS9blqy8Q';
const ALERT_X_API_KEY = '86a7a81dad35ff830cb6e8d4d346434c48c0c514';
const ALERT_UPDATE_INTERVAL = 20 * 1000;
const state = {
    alerts: new Set(),
};
try {
    moment_1.default.locale(navigator.language);
}
catch (error) {
    moment_1.default.locale('uk-UA');
}
$(function () {
    $('#editDate').on('change', printUTCDate);
    $('#editTime').on('change', printUTCDate);
    $('#formTimeStamp').on('submit', onTimeStampSubmit);
    $('#btnReset').on('click', resetToCurrentDateTime);
    $('#formLat input[name]').add('#formLon input[name]').on('change', onDegreeChange);
    $('.btn-copy-to-clipboard').on('click', copyInputToClipboard);
    $('#editDegreeNumeric').on('change', onEditDegreeNumericChange);
    $('#editMgrs').on('change', onEditMgrsChange);
    $('#btnAlertAlarmEnable').on('click', btnAlertAlarmEnableClick);
    updateAlertAlarmEnableButton();
    resetToCurrentDateTime();
    onDegreeChange();
    updateWarDuration();
    updateRaidAlert();
    setInterval(updateRaidAlert, ALERT_UPDATE_INTERVAL);
});
const printUTCDate = () => {
    const date = $('#editDate').val();
    const time = $('#editTime').val();
    const mm = (0, moment_1.default)(`${date} ${time}`);
    $('#utcDate').val(mm.toISOString());
};
const onTimeStampSubmit = (event) => {
    event.preventDefault();
    printUTCDate();
};
const resetToCurrentDateTime = () => {
    const mmCurrent = (0, moment_1.default)();
    $('#editDate').val(mmCurrent.format('YYYY-MM-DD'));
    $('#editTime').val(mmCurrent.format('HH:mm'));
    printUTCDate();
    $('#utcDate').focus().select();
};
const getDecimalDegree = (form) => {
    if (!form)
        return '0';
    const originalDegree = parseInt(form['degrees'].value);
    const isNegative = originalDegree < 0;
    const absDegree = Math.abs(originalDegree);
    const minutes = parseInt(form['minutes'].value) / 60;
    const seconds = parseInt(form['seconds'].value) / 3600;
    return ((absDegree + minutes + seconds) * (isNegative ? -1 : 1)).toLocaleString('en-US', {
        maximumFractionDigits: 8,
    });
};
const onDegreeChange = () => {
    const coordinates = [
        getDecimalDegree(document.getElementById('formLat')),
        getDecimalDegree(document.getElementById('formLon')),
    ].join(', ');
    updateDegreesFromCoordinates(coordinates);
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
function onEditDegreeNumericChange() {
    updateDegreesFromCoordinates($(this).val());
}
function onEditMgrsChange() {
    const mgrs = mgrs_1.default.parse($(this).val());
    const latlon = mgrs.toUtm().toLatLon();
    updateDegreesFromCoordinates(`${latlon._lat}, ${latlon._lon}`);
}
const getHumanNumber = (n, maximumFractionDigits = 1) => n.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    maximumFractionDigits,
});
const updateDegreeForm = (form, degrees, minutes, seconds) => {
    if (!form)
        return;
    form['degrees'].value = degrees;
    form['minutes'].value = minutes;
    form['seconds'].value = Math.round(seconds);
};
const updateDegreesFromCoordinates = (coordinates) => {
    const getDegreeFromDecimal = (decOriginal, suffix) => {
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
        updateDegreeForm(document.querySelector(['N', 'S'].indexOf(suffix) !== -1 ? '#formLat' : '#formLon'), degrees * (isNegative ? -1 : 1), minutes, seconds);
        return `${degrees}°${getHumanNumber(minutes)}'${getHumanNumber(seconds)}"${isNegative ? (suffix === 'N' ? 'S' : 'W') : suffix}`;
    };
    const coords = coordinates
        .split(/[,\s]+/i)
        .map(Number)
        .filter((val) => !isNaN(val));
    if (coords.length !== 2)
        return;
    const degree = getDegreeFromDecimal(coords[0], 'N') + ' ' + getDegreeFromDecimal(coords[1], 'E');
    document.getElementById('editDegreeNumeric').value = coordinates;
    document.querySelector('#editDegree').value = degree;
    document.querySelector('#editMgrs').value = new mgrs_1.LatLon(coords[0], coords[1])
        .toUtm()
        .toMgrs()
        .toString();
    const params = {
        q: encodeURIComponent(coordinates),
        key: API_KEY,
        zoom: 14,
        region: 'UA',
    };
    document.querySelector('.map-frame').setAttribute('src', `https://www.google.com/maps/embed/v1/place?${Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join('&')}`);
    updatePlaceFromCoordinates(coords);
};
const updatePlaceFromCoordinates = (coordinates) => {
    fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${coordinates[0]}&lon=${coordinates[1]}&zoom=18&format=jsonv2`)
        .then((response) => {
        if (!response.ok)
            throw new Error(response.statusText);
        return response.json();
    })
        .then((r) => {
        if (r.error)
            throw new Error(r.error);
        $('#placeByPoint').text(r.display_name);
        $('#placeByPointIcon').addClass('animation-bounce');
        setTimeout(() => $('#placeByPointIcon').removeClass('animation-bounce'), 2000);
    })
        .catch((error) => {
        $('#placeByPoint').text('Місце не визначено');
        console.error(error);
    });
};
const mWarStart = (0, moment_1.default)('2022-02-24T03:00:00.000Z');
const updateWarDuration = () => {
    const mCurrent = (0, moment_1.default)();
    const warDuration = moment_1.default.duration(mCurrent.diff(mWarStart));
    const sDuration = getHumanizeDuration(warDuration);
    document.querySelector('.war-duration__duration').innerText = sDuration;
    document.querySelector('.war-duration__days').innerText = `${Math.ceil(warDuration.asDays())} добу`;
    setTimeout(updateWarDuration, 60000 - (mCurrent.get('seconds') * 1000 + mCurrent.get('milliseconds')) + 1);
};
const updateRaidAlert = () => {
    fetch('https://alerts.com.ua/api/states', {
        headers: {
            'X-API-Key': ALERT_X_API_KEY,
        },
    })
        .then((response) => response.json())
        .then((data) => {
        const regionsWithAlerts = data.states.filter((state) => state.alert);
        regionsWithAlerts.sort((a, b) => -a.changed.localeCompare(b.changed));
        const now = (0, moment_1.default)();
        const container = $('.alarm__container').empty();
        $('.alarm__date').text(`(станом на ${(0, moment_1.default)(data.last_update).format('L LT')})`);
        regionsWithAlerts.forEach(({ name, id, changed }) => {
            const m = (0, moment_1.default)(changed);
            const duration = moment_1.default.duration(now.diff(m));
            const durationInMinutes = duration.asMinutes();
            const containerColorClass = durationInMinutes < 120
                ? durationInMinutes < 10
                    ? 'alarm__region-container--warning'
                    : durationInMinutes < 60
                        ? 'alarm__region-container--danger alarm__light_text'
                        : 'alarm__region-container--info'
                : '';
            const sStarted = m.format('LT L');
            $(`<div class="alarm__region-container rounded px-2 py-1 ${containerColorClass}" id="alarmRegion${id}"></div>`)
                .append(`<div class="alarm__region-title fs-5">${name}</div>`)
                .append($('<div class="d-flex justify-content-between align-items-end"></div>')
                .append(`<div class="alarm__duration text-nowrap"><i class="bi bi-clock"></i> Триває ${getHumanizeDuration(duration)}</div>
					`)
                .append(`<div class="alarm__started text-truncate ms-1 text-small" title="Оголошено в ${sStarted}"><i class="bi bi-megaphone"></i> ${sStarted}</div>`))
                .appendTo(container);
        });
        if (Notify.allow())
            notifyAlerts(regionsWithAlerts.map((state) => state.name));
    });
};
const notifyAlerts = (newAlerts) => {
    function difference(setA, setB) {
        var _difference = new Set(setA);
        for (var elem of setB) {
            _difference.delete(elem);
        }
        return _difference;
    }
    const oldAlertSet = state.alerts;
    const newAlertSet = new Set(newAlerts);
    const addedALerts = difference(newAlertSet, oldAlertSet);
    const removedAlerts = difference(oldAlertSet, newAlertSet);
    state.alerts = newAlertSet;
    if (addedALerts.size === 0 && removedAlerts.size === 0)
        return;
    const title = [
        addedALerts.size === 0 ? undefined : `оголошені 🔴 ${addedALerts.size}`,
        removedAlerts.size === 0 ? undefined : `скасовані 🟢 ${removedAlerts.size}`,
    ]
        .filter(Boolean)
        .join(', ');
    Notify.show({
        title: `Повітряні тривоги: ${title}`,
        body: [...addedALerts]
            .map((s) => `🔴 ${s}`)
            .concat([...removedAlerts].map((s) => `🟢 ${s}`))
            .join('\n'),
    });
};
const getHumanizeDuration = (duration, withSeconds = false) => {
    let result = '';
    if (duration.months() !== 0)
        result += `${duration.months()} міс. `;
    if (duration.days() !== 0)
        result += `${duration.days()} д. `;
    if (duration.hours() !== 0)
        result += `${duration.hours()} год. `;
    if (duration.minutes() !== 0)
        result += `${duration.minutes()} хв. `;
    if (withSeconds && duration.seconds() !== 0) {
        result += `${duration.seconds()} с. `;
    }
    return result || 'декілька секунд';
};
const btnAlertAlarmEnableClick = () => {
    Notify.requestPermission();
};
const updateAlertAlarmEnableButton = () => {
    if (Notification.permission === 'default')
        $('#btnAlertAlarmEnable').removeClass('disabled');
    else
        $('#btnAlertAlarmEnable').addClass('disabled');
};
1;
const Notify = {
    defaultIcon: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/megaphone_1f4e3.png',
    defaultTimeout: 10000,
    requestPermission: function () {
        if (!('Notification' in window)) {
            return;
        }
        Notification.requestPermission().then((permission) => {
            updateAlertAlarmEnableButton();
        });
    },
    allow: function () {
        return Notification.permission === 'granted';
    },
    show: function ({ title = 'Оповіщення', body = '', icon = Notify.defaultIcon, timeout = Notify.defaultTimeout }) {
        const notification = new Notification(title, {
            body,
            icon,
        });
        setTimeout(() => notification.close(), timeout);
    },
};
