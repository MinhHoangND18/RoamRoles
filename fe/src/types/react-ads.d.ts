import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {

    se?: string;
    'data-ad-sizes'?: string;
    'data-fluid'?: string;
    'data-fit-size'?: string;
    'data-ad-mode'?: string;
  }
}