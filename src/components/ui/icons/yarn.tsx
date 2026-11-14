import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function Yarn({ color = '#000', strokeWidth = 2, ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M11 7C15.0825 6.99996 19.0105 8.56045 21.98 11.362"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12C10.958 13.3638 9.65633 14.5078 8.16999 15.366C6.68364 16.2241 5.04208 16.7795 3.34 17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.83 13.634C14.789 17.1694 11.4737 19.791 7.563 20.962"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.66 17C19.618 15.6362 18.3163 14.4922 16.83 13.634C15.3436 12.7759 13.7021 12.2205 12 12C11.3399 10.4157 11 8.71634 11 7C11 5.28366 11.3399 3.58431 12 2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.17 15.366C6.12852 11.8306 5.5157 7.64851 6.457 3.676"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
