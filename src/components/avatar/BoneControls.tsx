"use client";

import { getBoneAxisLimit } from "@/lib/animation/boneLimits";
import { CONTROLLED_BONES, type BoneAxis } from "@/types/avatar";
import { useAvatarStore } from "@/store/avatarStore";
import { radiansToDegrees } from "@/utils/radians";

const AXES: BoneAxis[] = ["x", "y", "z"];
const LEFT_BONES = CONTROLLED_BONES.filter((bone) => bone.startsWith("left"));
const RIGHT_BONES = CONTROLLED_BONES.filter((bone) => bone.startsWith("right"));
const CENTER_BONES = CONTROLLED_BONES.filter(
  (bone) => !bone.startsWith("left") && !bone.startsWith("right"),
);

function labelForBone(bone: string): string {
  return bone.replace(/([A-Z])/g, " $1").trim();
}

function BoneSliderGroup(props: {
  title: string;
  bones: readonly (typeof CONTROLLED_BONES)[number][];
  defaultOpen?: boolean;
}) {
  const pose = useAvatarStore((state) => state.currentBonePose);
  const updateBoneRotation = useAvatarStore((state) => state.updateBoneRotation);

  return (
    <details
      className="rounded-md border border-panel-border bg-white/70 p-2"
      open={props.defaultOpen}
    >
      <summary className="cursor-pointer select-none text-sm font-semibold text-text">
        {props.title}
      </summary>
      <div className="mt-3 space-y-3">
        {props.bones.map((bone) => {
          const rotation = pose[bone]?.rotation ?? { x: 0, y: 0, z: 0 };

          return (
            <details key={bone} className="rounded-md border border-panel-border bg-surface p-2">
              <summary className="cursor-pointer select-none text-sm font-semibold text-text">
                {labelForBone(bone)}
              </summary>
              <div className="mt-2 space-y-2">
                {AXES.map((axis) => {
                  const value = rotation[axis];
                  const limit = getBoneAxisLimit(bone, axis);
                  return (
                    <label key={axis} className="block text-xs text-muted">
                      <div className="mb-1 flex items-center justify-between font-mono">
                        <span>{axis.toUpperCase()}</span>
                        <span>
                          {value.toFixed(2)} rad ({radiansToDegrees(value).toFixed(0)} deg)
                        </span>
                      </div>
                      <input
                        type="range"
                        min={limit.min}
                        max={limit.max}
                        step={0.01}
                        value={value}
                        onChange={(event) =>
                          updateBoneRotation(
                            bone,
                            axis,
                            Number(event.currentTarget.value),
                          )
                        }
                        className="w-full"
                      />
                    </label>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </details>
  );
}

export function BoneControls() {
  return (
    <div className="space-y-3">
      <BoneSliderGroup title="Centro" bones={CENTER_BONES} defaultOpen />
      <BoneSliderGroup title="Brazo y Mano Izquierda" bones={LEFT_BONES} />
      <BoneSliderGroup title="Brazo y Mano Derecha" bones={RIGHT_BONES} />
    </div>
  );
}
