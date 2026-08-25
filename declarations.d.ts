declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "*.png" {
  const source: number;
  export default source;
}

declare module "*.jpg" {
  const source: number;
  export default source;
}

declare module "*.jpeg" {
  const source: number;
  export default source;
}

declare module "*.gif" {
  const source: number;
  export default source;
}

declare module "*.mp3" {
  const source: number;
  export default source;
}

declare module "*.wav" {
  const source: number;
  export default source;
}
