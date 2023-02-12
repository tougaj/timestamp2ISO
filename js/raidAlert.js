"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAlertAlarmEnableButton = exports.btnAlertAlarmEnableClick = exports.updateRaidAlert = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const jquery_1 = __importDefault(require("jquery"));
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
        regionsWithAlerts.sort((a, b) => -(a.changed || '2022-02-24T05:00:00+02:00').localeCompare(b.changed || '2022-02-24T05:00:00+02:00'));
        const now = (0, dayjs_1.default)();
        const container = (0, jquery_1.default)('.alarm__container').empty();
        (0, jquery_1.default)('.alarm__date').text(`(станом на ${(0, dayjs_1.default)(data.last_update).format('DD.MM.YYYY HH:mm')})`);
        regionsWithAlerts.forEach(({ name, id, changed }) => {
            const m = (0, dayjs_1.default)(changed);
            const duration = dayjs_1.default.duration(now.diff(m));
            const durationInMinutes = duration.asMinutes();
            const containerColorClass = durationInMinutes < 120
                ? durationInMinutes < 10
                    ? 'alarm__region-container--warning'
                    : durationInMinutes < 60
                        ? 'alarm__region-container--danger alarm__light_text'
                        : 'alarm__region-container--info'
                : '';
            const sStarted = !isNaN(duration.asMilliseconds()) ? ` в ${m.format('DD.MM.YYYY HH:mm')}` : '';
            (0, jquery_1.default)(`<div class="alarm__region-container rounded px-2 py-1 ${containerColorClass}" id="alarmRegion${id}"></div>`)
                .append(`<div class="alarm__region-title fs-5">${name}</div>`)
                .append((0, jquery_1.default)('<div class="d-flex justify-content-between align-items-end"></div>')
                .append(`<div class="alarm__duration text-nowrap"><i class="bi bi-clock"></i> Триває ${(0, common_1.getHumanizeDuration)(duration)}</div>
					`)
                .append(`<div class="alarm__started text-truncate ms-1 text-small" title="Оголошено${sStarted}"><i class="bi bi-megaphone"></i> ${sStarted}</div>`))
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
        (0, jquery_1.default)('#btnAlertAlarmEnable').removeClass('disabled');
    else
        (0, jquery_1.default)('#btnAlertAlarmEnable').addClass('disabled');
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
    defaultIcon: 'https://em-content.zobj.net/thumbs/160/google/350/megaphone_1f4e3.png',
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
