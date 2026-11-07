import * as React from 'react';
import { Text, View } from '@/components/ui';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export function SettingsContainer({ children, title }: Props) {
  return (
    <>
      {title
        ? (
            <Text className="pt-4 pb-2 text-lg text-fog-300">{title}</Text>
          )
        : null}
      <View className="rounded-md border border-ink-300 bg-ink-100">
        {children}
      </View>
    </>
  );
}
