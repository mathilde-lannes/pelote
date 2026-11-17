import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { FriendActivity } from '@/lib/ravelry/types';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { Modal, Pressable, Text, useModal, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { PatternInfo } from '@/components/ui/icons';
import { useActivityTarget } from '@/features/feed/api';
import { useQueuedProject } from '@/features/profile/api';
import {
  parseActivityTargetUri,
  patternHintFromTitle,
} from '@/lib/ravelry/activity-target';
import { PatternInfoContent, PatternInfoSheet } from './pattern-info-sheet';
import { ProjectInfoSheet } from './project-info-sheet';

type SheetRef = React.RefObject<BottomSheetModal | null>;

function positive(value: number | null | undefined): number | null {
  return value != null && Number.isFinite(value) && value > 0 ? value : null;
}

function activityPatternId(item: FriendActivity): number | null {
  return positive(item.pattern_id)
    ?? positive(item.project?.pattern_id)
    ?? parseActivityTargetUri(item.target_uri).patternId;
}

function activityPatternName(item: FriendActivity): string | null | undefined {
  return item.pattern_name
    ?? item.project?.pattern_name
    ?? patternHintFromTitle(item.title)?.name
    ?? item.title;
}

/** Project owner + id. The person on a favorite is who liked it, not the owner. */
function resolvedProject(item: FriendActivity): { username: string; id: number } | null {
  const fromUri = parseActivityTargetUri(item.target_uri);
  if (fromUri.projectId != null && fromUri.projectUsername)
    return { id: fromUri.projectId, username: fromUri.projectUsername };
  const fromProject = positive(Number(item.project?.id));
  if (fromProject != null) {
    return {
      id: fromProject,
      username: item.project?.user?.username || item.person.username,
    };
  }
  if (item.type === 'project_photo') {
    const target = positive(item.target_id);
    if (target != null)
      return { id: target, username: item.person.username };
  }
  return null;
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

function ActivityTargetSheet({
  sheetRef,
  item,
  enabled,
}: {
  sheetRef: SheetRef;
  item: FriendActivity;
  enabled: boolean;
}) {
  const hint = patternHintFromTitle(item.title);
  const canResolve = Boolean(item.target_uri || item.title);
  const query = useActivityTarget({
    variables: {
      uri: item.target_uri ?? '',
      title: item.title ?? null,
      type: item.type,
    },
    enabled: enabled && canResolve,
  });
  const patternId = query.data?.patternId ?? 0;
  const patternName = query.data?.patternName ?? hint?.name ?? item.title;
  const title = patternName?.trim() || 'Post info';
  const onDismiss = React.useCallback(() => {
    sheetRef.current?.dismiss();
  }, [sheetRef]);
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
      snapPoints={['55%', '80%']}
      backgroundStyle={{ backgroundColor: colors.black }}
      handleComponent={renderHandle}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="bg-black"
      >
        {patternId > 0
          ? (
              <PatternInfoContent
                patternId={patternId}
                patternName={patternName}
                enabled={enabled}
                onDismiss={onDismiss}
              />
            )
          : !canResolve || query.isFetched
              ? (
                  <View className="px-5 py-4">
                    <Text className="text-base text-white">
                      {item.body?.trim() || 'No further details for this activity.'}
                    </Text>
                  </View>
                )
              : (
                  <View className="items-center py-10">
                    <ActivityIndicator color="#ffffff" />
                  </View>
                )}
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
  const project = resolvedProject(item);
  const patternId = activityPatternId(item);
  const patternName = activityPatternName(item);
  const queuedId = item.type === 'queued' ? positive(item.target_id) : null;

  if (project != null) {
    return (
      <ProjectInfoSheet
        ref={sheetRef}
        username={project.username}
        projectId={project.id}
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
  return <ActivityTargetSheet sheetRef={sheetRef} item={item} enabled={opened} />;
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
