declare var require: any
import {
	DragSourceHookSpec,
	DragObjectWithType,
	ConnectDragSource,
	ConnectDragPreview,
} from '../interfaces'
import { useMonitorOutput } from './internal/useMonitorOutput'
import { useDragSourceMonitor, useDragHandler } from './internal/drag'
import { useEffect, useMemo } from 'react'
const invariant = require('invariant')

/**
 * useDragSource hook (This API is experimental and subject to breaking changes in non-major versions)
 * @param sourceSpec The drag source specification *
 */
export function useDrag<
	DragObject extends DragObjectWithType,
	DropResult,
	CollectedProps
>(
	spec: DragSourceHookSpec<DragObject, DropResult, CollectedProps>,
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
	// TODO: wire options into createSourceConnector
	invariant(spec.item != null, 'item must be defined')
	invariant(spec.item.type != null, 'item type must be defined')

	const [monitor, connector] = useDragSourceMonitor()
	useDragHandler(spec, monitor, connector)

	const result: CollectedProps = useMonitorOutput(
		monitor,
		spec.collect || (() => ({} as CollectedProps)),
		() => connector.reconnect(),
	)

	const connectDragSource = useMemo(() => connector.hooks.dragSource(), [
		connector,
	])
	const connectDragPreview = useMemo(() => connector.hooks.dragPreview(), [
		connector,
	])
	useEffect(() => {
		connector.dragSourceOptions = spec.options || null
		connector.reconnect()
	}, [connector, spec])
	useEffect(() => {
		connector.dragPreviewOptions = spec.previewOptions || null
		connector.reconnect()
	}, [connector, spec])
	return [result, connectDragSource, connectDragPreview]
}
