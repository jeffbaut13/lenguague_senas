import type { VRM } from "@pixiv/three-vrm";

export type RuntimeVRM = VRM | null;

export interface AvatarRuntimeContext {
  vrm: RuntimeVRM;
  isLoaded: boolean;
}
