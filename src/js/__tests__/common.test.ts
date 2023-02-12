import { getHumanizeDuration } from '../common';

import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('uk');

const a = dayjs.duration(2, 'days');
console.log(a.humanize());

describe('getHumanizeDuration', () => {
	it('2 год. 12 хв.', () => {
		const duration = dayjs.duration({ hours: 2, minutes: 12 });
		expect(getHumanizeDuration(duration)).toBe('2 год. 12 хв. ');
	});
	it('7 days', () => {
		const duration = dayjs.duration({ days: 7 });
		expect(getHumanizeDuration(duration)).toBe('7 д. ');
	});
	it('11 months', () => {
		const duration = dayjs.duration({ months: 11 });
		expect(getHumanizeDuration(duration)).toBe('11 міс. ');
	});
	it('long', () => {
		const duration = dayjs.duration({ years: 1, months: 11, hours: 11, minutes: 5, seconds: 12 });
		expect(getHumanizeDuration(duration)).toBe('1 р. 11 міс. 11 год. 5 хв. ');
	});
});
