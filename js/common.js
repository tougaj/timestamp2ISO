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
    if (isNaN(duration.asMilliseconds()))
        return '';
    let result = '';
    if (!!duration.years())
        result += `${duration.years()} р. `;
    if (!!duration.months())
        result += `${duration.months()} міс. `;
    if (!!duration.days())
        result += `${duration.days()} д. `;
    if (!!duration.hours())
        result += `${duration.hours()} год. `;
    if (!!duration.minutes())
        result += `${duration.minutes()} хв. `;
    if (withSeconds && !!duration.seconds()) {
        result += `${duration.seconds()} с. `;
    }
    return result || 'декілька секунд';
};
exports.getHumanizeDuration = getHumanizeDuration;
const promiseTimeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.promiseTimeout = promiseTimeout;
