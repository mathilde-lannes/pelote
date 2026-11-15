import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { View } from 'react-native';

import { Button, colors, Modal, Text } from '@/components/ui';

type Props = {
  title?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirming?: boolean;
};

export function UnfavoriteConfirmSheet({
  ref,
  title = 'Remove from favorites?',
  onConfirm,
  onCancel,
  confirming = false,
}: Props & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const renderHandle = React.useCallback(
    () => (
      <View className="items-center bg-black pt-2 pb-1">
        <View
          className="mb-3 h-1 w-12 rounded-lg"
          style={{ backgroundColor: colors.ink[500] }}
        />
      </View>
    ),
    [],
  );

  const dismiss = React.useCallback(() => {
    onCancel?.();
    ref?.current?.dismiss();
  }, [onCancel, ref]);

  return (
    <Modal
      ref={ref}
      snapPoints={[240]}
      backgroundStyle={{ backgroundColor: colors.black }}
      handleComponent={renderHandle}
    >
      <View className="gap-3 bg-black px-5 pb-8">
        <Text className="text-center text-base font-bold text-white">
          {title}
        </Text>
        <Text className="text-center text-sm text-fog-400">
          This will remove it from your Ravelry favorites.
        </Text>
        <Button
          label="Remove"
          variant="destructive"
          onPress={onConfirm}
          loading={confirming}
          disabled={confirming}
          className="mt-1"
        />
        <Button
          label="Cancel"
          variant="ghost"
          onPress={dismiss}
          disabled={confirming}
        />
      </View>
    </Modal>
  );
}
