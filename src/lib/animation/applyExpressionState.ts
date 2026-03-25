import type { VRM } from "@pixiv/three-vrm";
import { clamp01 } from "@/utils/clamp";
import type { AvatarExpression, ExpressionState } from "@/types/avatar";
import { VRM_EXPRESSION_KEYS } from "@/lib/vrm/expressionMap";

type LegacyVRM = VRM & {
  blendShapeProxy?: {
    setValue: (name: string, value: number) => void;
  };
};

export function setExpressionWeight(
  vrm: VRM,
  expression: AvatarExpression,
  weight: number,
): void {
  const value = clamp01(weight);

  if (vrm.expressionManager) {
    vrm.expressionManager.setValue(expression, value);
    return;
  }

  const legacy = vrm as LegacyVRM;
  if (legacy.blendShapeProxy) {
    legacy.blendShapeProxy.setValue(expression, value);
  }
}

export function applyExpressionState(
  vrm: VRM,
  expressionState: Partial<ExpressionState>,
): void {
  for (const key of VRM_EXPRESSION_KEYS) {
    const weight = expressionState[key] ?? 0;
    setExpressionWeight(vrm, key, weight);
  }
}
