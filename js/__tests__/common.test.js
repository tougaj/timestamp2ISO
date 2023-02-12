"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const common_1 = require("../common");
describe('getHumanizeDuration', () => {
    it('2 год. 12 хв.', () => {
        const duration = moment_1.default.duration({ hour: 2, minute: 12 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('2 год. 12 хв. ');
    });
    it('7 days', () => {
        const duration = moment_1.default.duration({ days: 7 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('7 д. ');
    });
    it('11 months', () => {
        const duration = moment_1.default.duration({ month: 11 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('11 міс. ');
    });
    it('long', () => {
        const duration = moment_1.default.duration({ year: 1, month: 11, hour: 11, minute: 5, second: 12 });
        expect((0, common_1.getHumanizeDuration)(duration)).toBe('1 р. 11 міс. 11 год. 5 хв. ');
    });
});
