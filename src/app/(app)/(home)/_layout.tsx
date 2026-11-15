import { Stack } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="pattern/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="yarn/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="dyer/[id]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="user/[username]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="project/[username]/[id]"
        options={{ title: 'Project' }}
      />
    </Stack>
  );
}
