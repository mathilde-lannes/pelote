import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

export function People({ color = '#000', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.5 13.5c-2.485 0-4.5 1.567-4.5 3.5v1h9v-1c0-1.933-2.015-3.5-4.5-3.5ZM15.5 13.5c-.37 0-.73.036-1.08.104 1.287.91 2.08 2.2 2.08 3.646v1H21v-1c0-1.933-2.015-3.75-5.5-3.75Z"
        fill={color}
      />
    </Svg>
  );
}
