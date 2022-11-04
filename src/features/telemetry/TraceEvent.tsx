import React, { PropsWithChildren } from 'react'
import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'
import { sendAnalyticsEvent } from 'src/features/telemetry'
import { ElementName, EventName, ReactNativeEvent } from 'src/features/telemetry/constants'
import { ITraceContext, Trace, TraceContext } from 'src/features/telemetry/Trace'

export type TraceEventProps = {
  // Element name used to identify events sources
  // e.g. account-card, onboarding-create-wallet
  // TODO: Enforce ElementName type only
  elementName?: ElementName
  // event name to log
  // TODO: Enforce EventName type only
  eventName: EventName
  // Known components' events that trigger callbacks to be augmented with telemetry logging
  events: ReactNativeEvent[]
  // extra properties to log with the event
  properties?: Record<string, unknown>
} & ITraceContext

/**
 * Telemetry instrumentation component that wraps event callbacks with logging logic.
 *
 * @example
 *  <TraceEvent actionProps={{ onPress: { action: 'press' }}} elementType='button'>
 *    <Button onPress={() => console.log('pressed')}>Push me</Button>
 *  </TraceEvent>
 */
function _TraceEvent(props: PropsWithChildren<TraceEventProps>) {
  const { elementName, eventName, events, properties, children, ...logEventProps } = props

  return (
    <Trace {...logEventProps}>
      <TraceContext.Consumer>
        {(consumedProps) =>
          React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) {
              return child
            }

            // For each child, augment event handlers defined in `actionProps`  with event tracing
            return React.cloneElement(
              child,
              getEventHandlers(child, consumedProps, events, eventName, elementName, properties)
            )
          })
        }
      </TraceContext.Consumer>
    </Trace>
  )
}

export const TraceEvent = React.memo(_TraceEvent)

/**
 * Given a set of child element and action props, returns a spreadabble
 * object of the event handlers augmented with telemetry logging.
 */
function getEventHandlers(
  child: React.ReactElement,
  consumedProps: ITraceContext,
  events: ReactNativeEvent[],
  eventName: EventName,
  elementName?: ElementName,
  properties?: Record<string, unknown>
) {
  const eventHandlers: Partial<
    Record<ReactNativeEvent, (e: NativeSyntheticEvent<NativeTouchEvent>) => void>
  > = {}

  for (const event of Object.values(events)) {
    eventHandlers[event] = (eventHandlerArgs: unknown) => {
      // call child event handler with original arguments
      child.props[event]?.apply(child, eventHandlerArgs)

      // augment handler with analytics logging
      sendAnalyticsEvent(eventName, {
        ...consumedProps,
        ...properties,
        elementName,
      })
    }
  }

  // return a spreadable event handler object
  return eventHandlers
}
