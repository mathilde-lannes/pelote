import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Button, Modal, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  AVAILABILITY_OPTIONS,
  CATEGORY_OPTIONS,
  CRAFT_OPTIONS,
  FIT_OPTIONS,
  LANGUAGE_OPTIONS,
  WEIGHT_OPTIONS,
  type FilterOption,
  type PatternSearchFilters,
  toggleMultiValue,
} from '../pattern-search-filters';

type Props = {
  filters: PatternSearchFilters;
  onChange: (filters: PatternSearchFilters) => void;
  onClear: () => void;
  modalRef: React.RefObject<BottomSheetModal | null>;
};

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? 'rounded-full bg-ink-400 px-3 py-1.5'
          : 'rounded-full border border-ink-300 px-3 py-1.5'
      }
    >
      <Text className={selected ? 'text-sm text-white' : 'text-sm text-fog-300'}>
        {label}
      </Text>
    </Pressable>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 text-xs font-medium tracking-wide text-fog-500 uppercase">
        {title}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {children}
      </View>
    </View>
  );
}

function SingleSelectChips({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <>
      {options.map(option => (
        <Chip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onPress={() => {
            onChange(value === option.value ? null : option.value);
          }}
        />
      ))}
    </>
  );
}

function MultiSelectChips({
  options,
  values,
  onChange,
}: {
  options: FilterOption[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <>
      {options.map(option => (
        <Chip
          key={option.value}
          label={option.label}
          selected={values.includes(option.value)}
          onPress={() => {
            onChange(toggleMultiValue(values, option.value));
          }}
        />
      ))}
    </>
  );
}

export function ExploreFiltersSheet({
  filters,
  onChange,
  onClear,
  modalRef,
}: Props) {
  const renderHandle = React.useCallback(
    () => (
      <View className="items-center border-b border-ink-300 pt-2 pb-3">
        <View
          className="mb-3 h-1 w-12 rounded-lg"
          style={{ backgroundColor: colors.ink[500] }}
        />
        <View className="w-full flex-row items-center justify-between px-4">
          <Text className="text-lg font-semibold text-white">Filters</Text>
          <Pressable
            onPress={onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
          >
            <Text className="text-sm text-fog-400">Clear all</Text>
          </Pressable>
        </View>
      </View>
    ),
    [onClear],
  );

  return (
    <Modal
      ref={modalRef}
      snapPoints={['85%']}
      title={undefined}
      backgroundStyle={{ backgroundColor: colors.black }}
      handleComponent={renderHandle}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        <FilterSection title="Craft">
          <SingleSelectChips
            options={CRAFT_OPTIONS}
            value={filters.craft}
            onChange={craft => onChange({ ...filters, craft })}
          />
        </FilterSection>

        <FilterSection title="Availability">
          <SingleSelectChips
            options={AVAILABILITY_OPTIONS}
            value={filters.availability}
            onChange={availability => onChange({ ...filters, availability })}
          />
        </FilterSection>

        <FilterSection title="Yarn weight">
          <MultiSelectChips
            options={WEIGHT_OPTIONS}
            values={filters.weights}
            onChange={weights => onChange({ ...filters, weights })}
          />
        </FilterSection>

        <FilterSection title="Category">
          <MultiSelectChips
            options={CATEGORY_OPTIONS}
            values={filters.categories}
            onChange={categories => onChange({ ...filters, categories })}
          />
        </FilterSection>

        <FilterSection title="Fit / age">
          <MultiSelectChips
            options={FIT_OPTIONS}
            values={filters.fits}
            onChange={fits => onChange({ ...filters, fits })}
          />
        </FilterSection>

        <FilterSection title="Language">
          <SingleSelectChips
            options={LANGUAGE_OPTIONS}
            value={filters.language}
            onChange={language => onChange({ ...filters, language })}
          />
        </FilterSection>

        <FilterSection title="Photos">
          <Chip
            label="Has photos"
            selected={filters.photo}
            onPress={() => onChange({ ...filters, photo: !filters.photo })}
          />
        </FilterSection>

        <View className="mt-2">
          <Button
            label="Done"
            onPress={() => modalRef.current?.dismiss()}
          />
        </View>
      </BottomSheetScrollView>
    </Modal>
  );
}
