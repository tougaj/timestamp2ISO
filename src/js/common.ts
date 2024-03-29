import duration from 'dayjs/plugin/duration';

export interface IGlobalState {
	alerts: Set<string>;
}

export interface IRedAlertElement {
	id: number;
	name: string;
	alert: boolean;
	changed: string | null;
}
export interface IRedAlert {
	last_update: string;
	states: IRedAlertElement[];
}

export type TWorldDirection = 'N' | 'E' | 'S' | 'W';

export const API_KEY = 'AIzaSyDBQj8I0ElYPaXxgInMT3Ped3BS9blqy8Q';
export const ALERT_X_API_KEY = '86a7a81dad35ff830cb6e8d4d346434c48c0c514';
export const ALERT_UPDATE_INTERVAL = 20 * 1000;
export const TOAST_TIMEOUT = 1000;

export const state: IGlobalState = {
	alerts: new Set(),
};

export const getHumanizeDuration = (duration: duration.Duration, withSeconds = false) => {
	if (isNaN(duration.asMilliseconds())) return '';
	let result = '';
	if (!!duration.years()) result += `${duration.years()} р. `;
	if (!!duration.months()) result += `${duration.months()} міс. `;
	if (!!duration.days()) result += `${duration.days()} д. `;
	if (!!duration.hours()) result += `${duration.hours()} год. `;
	if (!!duration.minutes()) result += `${duration.minutes()} хв. `;
	if (withSeconds && !!duration.seconds()) {
		result += `${duration.seconds()} с. `;
	}
	return result || 'декілька секунд';
};

export const promiseTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
