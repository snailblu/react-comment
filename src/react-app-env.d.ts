/// <reference types="react-scripts" />

// CSS Modules (.module.css) 타입 선언
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// 이미지 파일 타입 선언
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
    import * as React from 'react';

    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;

    const src: string;
    export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.tiff' {
  const src: string;
  export default src;
}

// 오디오 파일 타입 선언 (필요에 따라 추가)
declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
    const src: string;
    export default src;
}

// JSON 파일 타입 선언 (resolveJsonModule 옵션과 함께 사용)
declare module '*.json' {
    const value: any;
    export default value;
}
