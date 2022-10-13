"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseTimeout = exports.getHumanizeDuration = exports.state = exports.TOAST_TIMEOUT = exports.ALERT_UPDATE_INTERVAL = exports.ALERT_X_API_KEY = exports.API_KEY = void 0;
exports.API_KEY = 'AIzaSyDBQj8I0ElYPaXxgInMT3Ped3BS9blqy8Q';
exports.ALERT_X_API_KEY = '86a7a81dad35ff830cb6e8d4d346434c48c0c514';
exports.ALERT_UPDATE_INTERVAL = 20 * 1000;
exports.TOAST_TIMEOUT = 1000;
exports.state = {
    alerts: new Set(),
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
exports.getHumanizeDuration = getHumanizeDuration;
const promiseTimeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.promiseTimeout = promiseTimeout;
