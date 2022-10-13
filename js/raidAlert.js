"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlertAlarmEnableButton = exports.btnAlertAlarmEnableClick = exports.updateRaidAlert = void 0;
const moment_1 = __importDefault(require("moment"));
const common_1 = require("./common");
const updateRaidAlert = () => {
    fetch('https://alerts.com.ua/api/states', {
        headers: {
            'X-API-Key': common_1.ALERT_X_API_KEY,
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
                .append(`<div class="alarm__duration text-nowrap"><i class="bi bi-clock"></i> Триває ${(0, common_1.getHumanizeDuration)(duration)}</div>
					`)
                .append(`<div class="alarm__started text-truncate ms-1 text-small" title="Оголошено в ${sStarted}"><i class="bi bi-megaphone"></i> ${sStarted}</div>`))
                .appendTo(container);
        });
        if (Notify.allow())
            notifyAlerts(regionsWithAlerts.map((state) => state.name));
    });
};
exports.updateRaidAlert = updateRaidAlert;
const btnAlertAlarmEnableClick = () => {
    Notify.requestPermission();
};
exports.btnAlertAlarmEnableClick = btnAlertAlarmEnableClick;
const updateAlertAlarmEnableButton = () => {
    if (Notification.permission === 'default')
        $('#btnAlertAlarmEnable').removeClass('disabled');
    else
        $('#btnAlertAlarmEnable').addClass('disabled');
};
exports.updateAlertAlarmEnableButton = updateAlertAlarmEnableButton;
const notifyAlerts = (newAlerts) => {
    function difference(setA, setB) {
        var _difference = new Set(setA);
        for (var elem of setB) {
            _difference.delete(elem);
        }
        return _difference;
    }
    const oldAlertSet = common_1.state.alerts;
    const newAlertSet = new Set(newAlerts);
    const addedALerts = difference(newAlertSet, oldAlertSet);
    const removedAlerts = difference(oldAlertSet, newAlertSet);
    common_1.state.alerts = newAlertSet;
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
const Notify = {
    defaultIcon: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/megaphone_1f4e3.png',
    defaultTimeout: 10000,
    requestPermission: function () {
        if (!('Notification' in window)) {
            return;
        }
        Notification.requestPermission().then((permission) => {
            (0, exports.updateAlertAlarmEnableButton)();
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