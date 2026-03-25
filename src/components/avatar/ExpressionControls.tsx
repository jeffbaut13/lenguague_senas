"use client";

import { CONTROLLED_EXPRESSIONS } from "@/types/avatar";
import { useAvatarStore } from "@/store/avatarStore";

export function ExpressionControls() {
  const expressions = useAvatarStore((state) => state.currentExpressions);
  const setExpression = useAvatarStore((state) => state.setExpression);

  return (
    <div className="space-y-2">
      {CONTROLLED_EXPRESSIONS.map((name) => {
        const value = expressions[name] ?? 0;
        return (
          <label
            key={name}
            className="block rounded-md border border-panel-border bg-surface p-2 text-xs text-muted"
          >
            <div className="mb-1 flex items-center justify-between font-mono text-text">
              <span>{name}</span>
              <span>{value.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={value}
              onChange={(event) =>
                setExpression(name, Number(event.currentTarget.value))
              }
              className="w-full"
            />
          </label>
        );
      })}
    </div>
  );
}
