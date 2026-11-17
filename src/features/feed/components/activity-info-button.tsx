import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { FriendActivity } from '@/lib/ravelry/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { Modal, Pressable, Text, useModal, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { PatternInfo } from '@/components/ui/icons';
import { useQueuedProject } from '@/features/profile/api';
import { PatternInfoSheet } from './pattern-info-sheet';
import { ProjectInfoSheet } from './project-info-sheet';

type SheetRef = React.RefObject<BottomSheetModal | null>;

function positive(value: number | null | undefined): number | null {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

function activityProjectId(item: FriendActivity): number | null {
  const fromProject = positive(Number(item.project?.id));
  if (fromProject != null)
    return fromProject;
  return item.type === 'project_photo' ? positive(item.target_id) : null;
}

function activityPatternId(item: FriendActivity): number | null {
  return positive(item.pattern_id) ?? positive(item.project?.pattern_id);
}

/** A queued pattern only carries the queue entry id — resolve its pattern. */
function QueuedPatternSheet({
  sheetRef,
  username,
  queuedId,
  patternName,
  enabled,
}: {
  sheetRef: SheetRef;
  username: string;
  queuedId: number;
  patternName?: string | null;
  enabled: boolean;
}) {
  const query = useQueuedProject({
    variables: { username, id: queuedId },
    enabled,
  });
  return (
    <PatternInfoSheet
      ref={sheetRef}
      patternId={query.data?.pattern_id ?? 0}
      patternName={query.data?.pattern_name ?? patternName}
      enabled={enabled}
    />
  );
}

/** Nothing to link to — still show what the activity says. */
function ActivityDetailsSheet({
  sheetRef,
  item,
}: {
  sheetRef: SheetRef;
  item: FriendActivity;
}) {
  const title = item.title?.trim() || item.pattern_name?.trim() || 'Post info';
  const body = item.body?.trim() || null;
  const renderHandle = React.useCallback(
    () => (
      <View className="items-center border-b border-ink-300 bg-black pt-2 pb-3">
        <View
          className="mb-3 h-1 w-12 rounded-lg"
          style={{ backgroundColor: colors.ink[500] }}
        />
        <Text className="px-10 text-center text-base font-bold text-white" numberOfLines={2}>
          {title}
        </Text>
      </View>
    ),
    [title],
  );

  return (
    <Modal
      ref={sheetRef}
      snapPoints={['40%']}
      backgroundStyle={{ backgroundColor: colors.black }}
      handleComponent={renderHandle}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="bg-black"
      >
        <View className="px-5 py-4">
          <Text className="text-base text-white">
            {body ?? 'No further details for this activity.'}
          </Text>
        </View>
      </BottomSheetScrollView>
    </Modal>
  );
}

function ActivitySheet({
  sheetRef,
  item,
  opened,
}: {
  sheetRef: SheetRef;
  item: FriendActivity;
  opened: boolean;
}) {
  const projectId = activityProjectId(item);
  const patternId = activityPatternId(item);
  const patternName = item.pattern_name ?? item.project?.pattern_name ?? item.title;
  const queuedId = item.type === 'queued' ? positive(item.target_id) : null;

  if (projectId != null) {
    return (
      <ProjectInfoSheet
        ref={sheetRef}
        username={item.person.username}
        projectId={projectId}
        projectName={item.project?.name ?? item.title}
        patternId={patternId}
        patternName={patternName}
        enabled={opened}
      />
    );
  }
  if (patternId != null) {
    return (
      <PatternInfoSheet
        ref={sheetRef}
        patternId={patternId}
        patternName={patternName}
        enabled={opened}
      />
    );
  }
  if (queuedId != null) {
    return (
      <QueuedPatternSheet
        sheetRef={sheetRef}
        username={item.person.username}
        queuedId={queuedId}
        patternName={patternName}
        enabled={opened}
      />
    );
  }
  return <ActivityDetailsSheet sheetRef={sheetRef} item={item} />;
}

export function ActivityInfoButton({ item }: { item: FriendActivity }) {
  const modal = useModal();
  const [opened, setOpened] = React.useState(false);

  const onPress = React.useCallback(() => {
    setOpened(true);
    modal.present();
  }, [modal]);

  return (
    <View className="shrink-0">
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Post info"
        testID="activity-info"
      >
        <PatternInfo color="#ffffff" />
      </Pressable>
      <ActivitySheet sheetRef={modal.ref} item={item} opened={opened} />
    </View>
  );
}
