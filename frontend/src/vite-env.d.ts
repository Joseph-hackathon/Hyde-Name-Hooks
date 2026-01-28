/// <reference types="vite/client" />
import type * as React from 'react';

type MdElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  href?: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  max?: string | number;
  disabled?: boolean;
  indeterminate?: boolean;
};

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': MdElementProps;
      'md-outlined-button': MdElementProps;
      'md-text-button': MdElementProps;
      'md-filled-text-field': MdElementProps;
      'md-linear-progress': MdElementProps;
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': MdElementProps;
      'md-outlined-button': MdElementProps;
      'md-text-button': MdElementProps;
      'md-filled-text-field': MdElementProps;
      'md-linear-progress': MdElementProps;
    }
  }
}

export {};
