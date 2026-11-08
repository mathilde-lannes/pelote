import type { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';
import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';

type Props = {
  text: string;
  /** Bold prefix shown before the body (e.g. username). */
  prefix?: string | null;
  numberOfLines?: number;
  className?: string;
  prefixClassName?: string;
  moreClassName?: string;
  onExpandedChange?: (expanded: boolean) => void;
};

/**
 * Instagram-style caption: collapsed to N lines with a “more” toggle.
 * Remounts when the caption text changes so expand state resets without
 * calling setState inside an effect.
 */
export function ExpandableText(props: Props) {
  const body = props.text.trim();
  return (
    <ExpandableTextInner
      key={`${props.prefix ?? ''}\0${body}`}
      {...props}
    />
  );
}

function ExpandableTextInner({
  text,
  prefix,
  numberOfLines = 2,
  className = 'text-sm text-white',
  prefixClassName = 'font-semibold text-white',
  moreClassName = 'text-sm text-fog-400',
  onExpandedChange,
}: Props) {
  const body = text.trim();
  const [expanded, setExpanded] = React.useState(false);
  const [canExpand, setCanExpand] = React.useState(false);

  const onMeasureLayout = React.useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      setCanExpand(event.nativeEvent.lines.length > numberOfLines);
    },
    [numberOfLines],
  );

  const toggle = React.useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      onExpandedChange?.(next);
      return next;
    });
  }, [onExpandedChange]);

  if (!body && !prefix)
    return null;

  const content = (
    <>
      {prefix
        ? (
            <Text className={prefixClassName}>
              {prefix}
              {' '}
            </Text>
          )
        : null}
      {body}
    </>
  );

  return (
    <View>
      {/* Full text (hidden) — measures whether content exceeds the collapse limit. */}
      {!expanded
        ? (
            <Text
              className={`${className} absolute opacity-0`}
              onTextLayout={onMeasureLayout}
            >
              {content}
            </Text>
          )
        : null}
      <Text
        className={className}
        numberOfLines={expanded ? undefined : numberOfLines}
      >
        {content}
      </Text>
      {canExpand
        ? (
            <Pressable onPress={toggle} hitSlop={8} accessibilityRole="button">
              <Text className={moreClassName}>
                {expanded ? 'show less' : 'more'}
              </Text>
            </Pressable>
          )
        : null}
    </View>
  );
}
