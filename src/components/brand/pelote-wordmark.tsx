import * as React from 'react';
import { Text, View } from '@/components/ui';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
};

const sizeClass = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
} as const;

export function PeloteWordmark({ size = 'md', subtitle }: Props) {
  return (
    <View className="items-center">
      <Text
        className={`font-sans font-semibold tracking-wide text-white ${sizeClass[size]}`}
      >
        Pelote
      </Text>
      {subtitle
        ? (
            <Text className="mt-1 text-center text-sm text-fog-400">
              {subtitle}
            </Text>
          )
        : null}
    </View>
  );
}
