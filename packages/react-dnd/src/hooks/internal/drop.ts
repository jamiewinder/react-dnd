import {
	DragObjectWithType,
	DropTargetMonitor,
	DropTargetHookSpec,
} from '../../interfaces'
import { useEffect, useMemo } from 'react'
import { DropTarget } from 'dnd-core'
import registerTarget from '../../registerTarget'
import { useDragDropManager } from './useDragDropManager'
import TargetConnector from '../../TargetConnector'
import DropTargetMonitorImpl from '../../DropTargetMonitorImpl'

export function useDropTargetMonitor(): [DropTargetMonitor, TargetConnector] {
	const manager = useDragDropManager()
	const monitor = useMemo(() => new DropTargetMonitorImpl(manager), [manager])
	const connector = useMemo(() => new TargetConnector(manager.getBackend()), [
		manager,
	])
	return [monitor, connector]
}

export function useDropHandler<
	DragObject extends DragObjectWithType,
	DropResult,
	CustomProps
>(
	spec: DropTargetHookSpec<DragObject, DropResult, CustomProps>,
	monitor: DropTargetMonitor,
	connector: any,
) {
	const manager = useDragDropManager()

	// Can't use createSourceFactory, as semantics are different
	const handler = useMemo(() => {
		// console.log('create drop target handler')
		return {
			canDrop() {
				const { canDrop } = spec
				return canDrop ? canDrop(monitor.getItem(), monitor) : true
			},
			hover() {
				const { hover } = spec
				if (hover) {
					hover(monitor.getItem(), monitor)
				}
			},
			drop() {
				const { drop } = spec
				if (drop) {
					return drop(monitor.getItem(), monitor)
				}
			},
		} as DropTarget
	}, [monitor, spec])

	useEffect(
		function registerHandler() {
			// console.log('register droptarget handler')
			const [handlerId, unregister] = registerTarget(
				spec.accept,
				handler,
				manager,
			)
			monitor.receiveHandlerId(handlerId)
			connector.receiveHandlerId(handlerId)
			return unregister
		},
		[monitor, connector, handler, manager, spec],
	)
}
