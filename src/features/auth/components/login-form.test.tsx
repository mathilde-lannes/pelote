import * as React from 'react';

import { cleanup, screen, setup } from '@/lib/test-utils';
import { LoginForm } from './login-form';

afterEach(cleanup);

describe('LoginForm', () => {
  it('renders Pelote wordmark and demo CTA', async () => {
    setup(<LoginForm oauthAvailable={false} />);
    expect(await screen.findByText('Pelote')).toBeOnTheScreen();
    expect(screen.getByTestId('demo-login-button')).toBeOnTheScreen();
  });

  it('calls onDemo when demo button pressed', async () => {
    const onDemo = jest.fn();
    const { user } = setup(
      <LoginForm oauthAvailable={false} onDemo={onDemo} />,
    );
    await user.press(screen.getByTestId('demo-login-button'));
    expect(onDemo).toHaveBeenCalledTimes(1);
  });
});
