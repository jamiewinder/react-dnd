import { useEffect } from 'react'
import { useCollector } from './useCollector'
import { HandlerManager, MonitorEventEmitter } from '../../interfaces'

export function useMonitorOutput<Monitor extends HandlerManager, Collected>(
	monitor: Monitor & MonitorEventEmitter,
	collect: (monitor: Monitor) => Collected,
	onCollect?: () => void,
): Collected {
	const [collected, updateCollected] = useCollector(monitor, collect, onCollect)

	useEffect(
		function subscribeToMonitorStateChange() {
			const handlerId = monitor.getHandlerId()
			if (handlerId == null) {
				return undefined
			}
			const unsubscribe = monitor.subscribeToStateChange(updateCollected, {
				handlerIds: [handlerId],
			})
			return unsubscribe
		},
		[monitor, updateCollected],
	)

	return collected
}
