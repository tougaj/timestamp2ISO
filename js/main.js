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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mgrs_1 = __importStar(require("geodesy/mgrs"));
const moment_1 = __importDefault(require("moment"));
const common_1 = require("./common");
const csv2svg_1 = require("./csv2svg");
const raidAlert_1 = require("./raidAlert");
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
    $('#btnAlertAlarmEnable').on('click', raidAlert_1.btnAlertAlarmEnableClick);
    (0, csv2svg_1.csv2svgInit)();
    (0, raidAlert_1.updateAlertAlarmEnableButton)();
    resetToCurrentDateTime();
    onDegreeChange();
    updateWarDuration();
    (0, raidAlert_1.updateRaidAlert)();
    setInterval(raidAlert_1.updateRaidAlert, common_1.ALERT_UPDATE_INTERVAL);
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
const showToast = (text, className = 'bg-success text-white') => __awaiter(void 0, void 0, void 0, function* () {
    const toastsContainer = $('.toasts__container');
    if (!toastsContainer)
        return;
    const toast = $('<div id="liveToast" class="toast fade show showing" role="alert" aria-live="assertive" aria-atomic="true"></div>')
        .append(`<div class="toast-body p-3 ${className}">${text}</div>`)
        .appendTo(toastsContainer);
    yield (0, common_1.promiseTimeout)(0);
    toast.removeClass('showing');
    yield (0, common_1.promiseTimeout)(common_1.TOAST_TIMEOUT);
    toast.addClass('showing');
    yield (0, common_1.promiseTimeout)(500);
    toast.remove();
});
function copyInputToClipboard() {
    const classForToggle = 'btn-outline-secondary btn-outline-success';
    const button = $(this);
    const input = button.siblings('input')[0];
    navigator.clipboard.writeText(input.value);
    button.toggleClass(classForToggle);
    setTimeout(() => button.toggleClass(classForToggle), common_1.TOAST_TIMEOUT);
    showToast('Скопійовано до буферу обміну');
}
function onEditDegreeNumericChange() {
    updateDegreesFromCoordinates($(this).val());
}
function onEditMgrsChange() {
    const mgrs = mgrs_1.default.parse($(this).val().toUpperCase());
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
        key: common_1.API_KEY,
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
    const sDuration = (0, common_1.getHumanizeDuration)(warDuration);
    document.querySelector('.war-duration__duration').innerText = sDuration;
    document.querySelector('.war-duration__days').innerText = `${Math.ceil(warDuration.asDays())} добу`;
    setTimeout(updateWarDuration, 60000 - (mCurrent.get('seconds') * 1000 + mCurrent.get('milliseconds')) + 1);
};
