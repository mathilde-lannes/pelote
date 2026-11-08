import * as React from 'react';

import { cleanup, screen, setup } from '@/lib/test-utils';
import { LoginForm } from './login-form';

afterEach(cleanup);

describe('LoginForm', () => {
  it('renders Pelote wordmark and Ravelry sign-in', async () => {
    setup(<LoginForm oauthAvailable />);
    expect(await screen.findByText('Pelote')).toBeOnTheScreen();
    expect(screen.getByTestId('oauth-login-button')).toBeOnTheScreen();
  });

  it('calls onOAuth when the Ravelry button is pressed', async () => {
    const onOAuth = jest.fn();
    const { user } = setup(
      <LoginForm oauthAvailable onOAuth={onOAuth} />,
    );
    await user.press(screen.getByTestId('oauth-login-button'));
    expect(onOAuth).toHaveBeenCalledTimes(1);
  });
});
