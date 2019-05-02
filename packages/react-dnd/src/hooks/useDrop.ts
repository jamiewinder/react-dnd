declare var require: any
import {
	DropTargetHookSpec,
	ConnectDropTarget,
	DragObjectWithType,
} from '../interfaces'
import { useMonitorOutput } from './internal/useMonitorOutput'
import { useDropHandler, useDropTargetMonitor } from './internal/drop'
import { useEffect, useMemo } from 'react'
const invariant = require('invariant')

/**
 * useDropTarget Hook (This API is experimental and subject to breaking changes in non-breaking versions)
 * @param spec The drop target specification
 */
export function useDrop<
	DragObject extends DragObjectWithType,
	DropResult,
	CollectedProps
>(
	spec: DropTargetHookSpec<DragObject, DropResult, CollectedProps>,
): [CollectedProps, ConnectDropTarget] {
	invariant(spec.accept != null, 'accept must be defined')

	const [monitor, connector] = useDropTargetMonitor()
	useDropHandler(spec, monitor, connector)

	const result: CollectedProps = useMonitorOutput(
		monitor,
		spec.collect || (() => ({} as CollectedProps)),
		() => connector.reconnect(),
	)

	const connectDropTarget = useMemo(() => connector.hooks.dropTarget(), [
		connector,
	])

	useEffect(() => {
		connector.dropTargetOptions = spec.options || null
		connector.reconnect()
	}, [spec.options, connector])
	return [result, connectDropTarget]
}
