import { HeaderBackButton } from '@react-navigation/elements';
import { Stack, useRouter } from 'expo-router';

export default function UserProfileLayout() {
  const router = useRouter();

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
          // Nested index has no prior screen in this stack; pop the root navigator.
          headerLeft: props => (
            <HeaderBackButton
              {...props}
              tintColor="#ffffff"
              onPress={() => {
                if (router.canGoBack())
                  router.back();
                else
                  router.replace('/');
              }}
            />
          ),
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
