import { Stack } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="yarn/[id]" />
      <Stack.Screen name="dyer/[id]" />
      <Stack.Screen name="user/[username]" options={{ headerShown: false }} />
      <Stack.Screen
        name="stash/[id]"
        options={{
          headerShown: true,
          title: 'Yarn',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="queue/[id]"
        options={{
          headerShown: true,
          title: 'Queue',
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
    </Stack>
  );
}
