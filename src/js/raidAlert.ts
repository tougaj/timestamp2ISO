import dayjs from 'dayjs';
import $ from 'jquery';
import { ALERT_X_API_KEY, getHumanizeDuration, IRedAlert, state } from './common';

export const updateRaidAlert = () => {
	fetch('https://alerts.com.ua/api/states', {
		headers: {
			'X-API-Key': ALERT_X_API_KEY,
		},
	})
		.then((response) => response.json())
		.then((data: IRedAlert) => {
			const regionsWithAlerts = data.states.filter((state) => state.alert);
			regionsWithAlerts.sort(
				(a, b) => -(a.changed || '2022-02-24T05:00:00+02:00').localeCompare(b.changed || '2022-02-24T05:00:00+02:00')
			);
			const now = dayjs();
			const container = $('.alarm__container').empty();
			$('.alarm__date').text(`(станом на ${dayjs(data.last_update).format('DD.MM.YYYY HH:mm')})`);
			regionsWithAlerts.forEach(({ name, id, changed }) => {
				const m = dayjs(changed);
				const duration = dayjs.duration(now.diff(m));

				const durationInMinutes = duration.asMinutes();
				const containerColorClass =
					durationInMinutes < 120
						? durationInMinutes < 10
							? 'alarm__region-container--warning'
							: durationInMinutes < 60
							? 'alarm__region-container--danger alarm__light_text'
							: 'alarm__region-container--info'
						: '';
				const sStarted = !isNaN(duration.asMilliseconds()) ? ` в ${m.format('DD.MM.YYYY HH:mm')}` : '';
				$(`<div class="alarm__region-container rounded px-2 py-1 ${containerColorClass}" id="alarmRegion${id}"></div>`)
					.append(`<div class="alarm__region-title fs-5">${name}</div>`)
					.append(
						$('<div class="d-flex justify-content-between align-items-end"></div>')
							.append(
								`<div class="alarm__duration text-nowrap"><i class="bi bi-clock"></i> Триває ${getHumanizeDuration(
									duration
								)}</div>
					`
							)
							.append(
								`<div class="alarm__started text-truncate ms-1 text-small" title="Оголошено${sStarted}"><i class="bi bi-megaphone"></i> ${sStarted}</div>`
							)
					)
					.appendTo(container);
			});
			if (Notify.allow()) notifyAlerts(regionsWithAlerts.map((state) => state.name));
		});
};

export const btnAlertAlarmEnableClick = () => {
	Notify.requestPermission();
};

export const updateAlertAlarmEnableButton = () => {
	if (Notification.permission === 'default') $('#btnAlertAlarmEnable').removeClass('disabled');
	else $('#btnAlertAlarmEnable').addClass('disabled');
};

const notifyAlerts = (newAlerts: string[]) => {
	function difference(setA: Set<string>, setB: Set<string>) {
		var _difference = new Set(setA);
		for (var elem of setB) {
			_difference.delete(elem);
		}
		return _difference;
	}

	const oldAlertSet = state.alerts;
	const newAlertSet = new Set(newAlerts);
	const addedALerts = difference(newAlertSet, oldAlertSet);
	const removedAlerts = difference(oldAlertSet, newAlertSet);

	state.alerts = newAlertSet;
	if (addedALerts.size === 0 && removedAlerts.size === 0) return;

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
			updateAlertAlarmEnableButton();
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
} as any;
