import * as React from 'react';
import { Text, View } from '@/components/ui';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
};

const sizeClass = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-5xl',
} as const;

export function PeloteWordmark({ size = 'md', subtitle }: Props) {
  return (
    <View className="items-center">
      <Text
        className={`font-display font-bold tracking-tight text-rust-700 ${sizeClass[size]}`}
      >
        Pelote
      </Text>
      {subtitle
        ? (
            <Text className="mt-1 text-center text-sm text-charcoal-600">
              {subtitle}
            </Text>
          )
        : null}
    </View>
  );
}
