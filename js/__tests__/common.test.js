"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const dayjs_1 = __importDefault(require("dayjs"));
require("dayjs/locale/uk");
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
dayjs_1.default.extend(duration_1.default);
dayjs_1.default.extend(relativeTime_1.default);
dayjs_1.default.locale('uk');
const a = dayjs_1.default.duration(2, 'days');
console.log(a.humanize());
describe('getHumanizeDuration', () => {
    it('2 год. 12 хв.', () => {
        const duration = dayjs_1.default.duration({ hours: 2, minutes: 12 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('2 год. 12 хв. ');
    });
    it('7 days', () => {
        const duration = dayjs_1.default.duration({ days: 7 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('7 д. ');
    });
    it('11 months', () => {
        const duration = dayjs_1.default.duration({ months: 11 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('11 міс. ');
    });
    it('long', () => {
        const duration = dayjs_1.default.duration({ years: 1, months: 11, hours: 11, minutes: 5, seconds: 12 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('1 р. 11 міс. 11 год. 5 хв. ');
    });
});
