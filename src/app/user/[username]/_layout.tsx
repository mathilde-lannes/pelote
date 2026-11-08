import { Stack } from 'expo-router';

export default function UserProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="feed/[id]"
        options={{
          title: 'Posts',
          headerBackTitle: 'Profile',
        }}
      />
    </Stack>
  );
}
