import moment from 'moment';
import { getHumanizeDuration } from '../common';

describe('getHumanizeDuration', () => {
	it('2 год. 12 хв.', () => {
		const duration = moment.duration({ hour: 2, minute: 12 });
		expect(getHumanizeDuration(duration)).toBe('2 год. 12 хв. ');
	});
	it('7 days', () => {
		const duration = moment.duration({ days: 7 });
		expect(getHumanizeDuration(duration)).toBe('7 д. ');
	});
	it('11 months', () => {
		const duration = moment.duration({ month: 11 });
		expect(getHumanizeDuration(duration)).toBe('11 міс. ');
	});
	it('long', () => {
		const duration = moment.duration({ year: 1, month: 11, hour: 11, minute: 5, second: 12 });
		expect(getHumanizeDuration(duration)).toBe('1 р. 11 міс. 11 год. 5 хв. ');
	});
});
