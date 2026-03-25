import { createDefaultBonePose } from "../src/mocks/avatarPose.mock";
import { mockAvatarFrame } from "../src/mocks/avatarFrame.mock";
import { createGreetingRawCapture } from "../src/mocks/rawCapture.mock";
import { MOCK_SIGN_DICTIONARY } from "../src/mocks/signEntries.mock";
import { waveRightClip } from "../src/mocks/waveRight.clip.mock";
import { captureToAvatarFrame } from "../src/lib/adapters/captureToAvatarFrame";
import { jsonToAvatarFrame } from "../src/lib/adapters/jsonToAvatarFrame";
import { exportAvatarClip, exportAvatarFrame, exportSignEntry, importAvatarClip, importSignEntry } from "../src/lib/persistence/exportImport";
import { sampleAvatarClipAtTime, startAvatarClipPlayer } from "../src/lib/animation/clipPlayer";
import { neutralExpressions } from "../src/mocks/avatarExpressions.mock";
import { useAvatarStore } from "../src/store/avatarStore";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function approx(value: number, expected: number, tolerance = 0.0001): boolean {
  return Math.abs(value - expected) <= tolerance;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const results: string[] = [];

  const rawCapture = createGreetingRawCapture(123);
  const rawToFrame = captureToAvatarFrame(rawCapture);
  assert(rawToFrame.success, "RawCapture mock no se convirtió correctamente a AvatarFrame");
  assert(rawToFrame.frame, "captureToAvatarFrame devolvió frame nulo");
  assert(Object.keys(rawToFrame.frame.bones).length > 0, "AvatarFrame desde RawCapture quedó sin huesos");
  results.push("RawCapture mock -> AvatarFrame: OK");

  const avatarStore = useAvatarStore;
  avatarStore.getState().applyAvatarFrame(mockAvatarFrame, "mock-json");
  assert(
    approx(avatarStore.getState().currentBonePose.leftUpperArm?.rotation.x ?? 0, -0.8),
    "applyAvatarFrame no aplicó el mock frame esperado",
  );

  avatarStore.getState().applyAvatarFrame(
    {
      bones: {
        head: { rotation: { x: 0.2, y: 0.1, z: 0 } },
      },
      expressions: {},
    },
    "mock-json",
  );

  assert(
    approx(
      avatarStore.getState().currentBonePose.leftUpperArm?.rotation.x ?? 999,
      createDefaultBonePose().leftUpperArm?.rotation.x ?? 0,
    ),
    "applyAvatarFrame está acumulando deformaciones entre frames parciales",
  );

  avatarStore.getState().resetPose();
  avatarStore.getState().resetExpressions();
  assert(
    JSON.stringify(avatarStore.getState().currentBonePose) === JSON.stringify(createDefaultBonePose()),
    "resetPose no volvió a la pose base",
  );
  assert(
    JSON.stringify(avatarStore.getState().currentExpressions) === JSON.stringify(neutralExpressions),
    "resetExpressions no volvió al estado base",
  );
  results.push("Mock AvatarFrame -> resetPose/resetExpressions: OK");

  const sampledFrame = sampleAvatarClipAtTime(waveRightClip, 250);
  const sampledZ = sampledFrame.bones.rightUpperArm?.rotation.z ?? 0;
  assert(sampledZ > -1.34 && sampledZ < -1.16, "La interpolación del clip no cayó entre keyframes");
  results.push("Interpolación de AvatarAnimationClip: OK");

  const exportedFrame = exportAvatarFrame(mockAvatarFrame);
  const reimportedFrame = jsonToAvatarFrame(exportedFrame);
  assert(
    approx(reimportedFrame.bones.leftUpperArm?.rotation.x ?? 0, mockAvatarFrame.bones.leftUpperArm?.rotation.x ?? 0),
    "Export/import de AvatarFrame cambió los datos",
  );

  const exportedClip = exportAvatarClip(waveRightClip);
  const reimportedClip = importAvatarClip(exportedClip);
  assert(reimportedClip, "Import de AvatarAnimationClip devolvió null");
  assert(reimportedClip.frames.length === waveRightClip.frames.length, "Import de clip perdió keyframes");

  const exportedSignEntry = exportSignEntry(MOCK_SIGN_DICTIONARY.entries[0]);
  const reimportedSignEntry = importSignEntry(exportedSignEntry);
  assert(reimportedSignEntry, "Import de SignDictionaryEntry devolvió null");
  assert(reimportedSignEntry.clip.frames.length > 0, "Import de SignDictionaryEntry perdió el clip");
  results.push("Export/import JSON de frame/clip/sign entry: OK");

  const timers = new Map<number, NodeJS.Timeout>();
  let nextAnimationFrameId = 1;
  let frameCount = 0;

  Object.assign(globalThis, {
    window: {
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        const id = nextAnimationFrameId++;
        const timeout = setTimeout(() => callback(performance.now()), 8);
        timers.set(id, timeout);
        return id;
      },
      cancelAnimationFrame: (id: number) => {
        const timeout = timers.get(id);
        if (timeout) {
          clearTimeout(timeout);
          timers.delete(id);
        }
      },
    },
  });

  const stopPlayback = startAvatarClipPlayer({
    clip: waveRightClip,
    onFrame: () => {
      frameCount += 1;
    },
  });

  await wait(30);
  stopPlayback();
  const frozenFrameCount = frameCount;
  await wait(30);
  assert(frameCount === frozenFrameCount, "El clip player siguió emitiendo frames después de stop()");
  results.push("Clip player sin bucles residuales tras stop(): OK");

  const dictionaryEntry = MOCK_SIGN_DICTIONARY.entries[0];
  assert(dictionaryEntry.clip.frames.length > 0, "La entrada de diccionario no tiene clip reproducible");
  results.push("Entrada de diccionario con clip reproducible: OK");

  console.log("VALIDATION_RESULTS_START");
  for (const line of results) {
    console.log(`- ${line}`);
  }
  console.log("VALIDATION_RESULTS_END");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});