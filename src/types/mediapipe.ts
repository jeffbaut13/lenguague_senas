/**
 * Tipos para MediaPipe Pose, Hands y Face Detection
 * Estos son tipos NOMINALES (basados en la API real de MediaPipe)
 * útiles para tipado pero sin dependencia real todavía.
 *
 * Referencia: https://developers.google.com/mediapipe/solutions
 */

/**
 * Pose landmarks de MediaPipe (COCO + algunos adicionales)
 * Total: 33 landmarks (0-32)
 */
export enum MediaPipePoseLandmark {
  NOSE = 0,
  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,
  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,
  LEFT_EAR = 7,
  RIGHT_EAR = 8,
  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,
  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,
  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,
  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}

/**
 * Hand landmarks de MediaPipe
 * 21 landmarks por mano
 */
export enum MediaPipeHandLandmark {
  WRIST = 0,
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  THUMB_IP = 3,
  THUMB_TIP = 4,
  INDEX_MCP = 5,
  INDEX_PIP = 6,
  INDEX_DIP = 7,
  INDEX_TIP = 8,
  MIDDLE_MCP = 9,
  MIDDLE_PIP = 10,
  MIDDLE_DIP = 11,
  MIDDLE_TIP = 12,
  RING_MCP = 13,
  RING_PIP = 14,
  RING_DIP = 15,
  RING_TIP = 16,
  PINKY_MCP = 17,
  PINKY_PIP = 18,
  PINKY_DIP = 19,
  PINKY_TIP = 20,
}

/**
 * Face Blendshapes de MediaPipe (52 tipos)
 * Estos son los blend shapes faciales soportados
 */
export enum MediaPipeFaceBlendshape {
  // Eyes
  EYE_LOOK_UP_LEFT = "_eyeLookUpLeft",
  EYE_LOOK_DOWN_LEFT = "_eyeLookDownLeft",
  EYE_LOOK_IN_LEFT = "_eyeLookInLeft",
  EYE_LOOK_OUT_LEFT = "_eyeLookOutLeft",
  EYE_BLINK_LEFT = "_eyeBlinkLeft",
  EYE_SQUINT_LEFT = "_eyeSquintLeft",
  EYE_LOOK_UP_RIGHT = "_eyeLookUpRight",
  EYE_LOOK_DOWN_RIGHT = "_eyeLookDownRight",
  EYE_LOOK_IN_RIGHT = "_eyeLookInRight",
  EYE_LOOK_OUT_RIGHT = "_eyeLookOutRight",
  EYE_BLINK_RIGHT = "_eyeBlinkRight",
  EYE_SQUINT_RIGHT = "_eyeSquintRight",

  // Mouth
  MOUTH_FUNNEL = "_mouthFunnel",
  MOUTH_PUCKER = "_mouthPucker",
  MOUTH_PRESS_LEFT = "_mouthPressLeft",
  MOUTH_PRESS_RIGHT = "_mouthPressRight",
  MOUTH_DIMPLE_LEFT = "_mouthDimpleLeft",
  MOUTH_DIMPLE_RIGHT = "_mouthDimpleRight",
  MOUTH_STRETCH_LEFT = "_mouthStretchLeft",
  MOUTH_STRETCH_RIGHT = "_mouthStretchRight",
  MOUTH_ROLL_UPPER = "_mouthRollUpper",
  MOUTH_ROLL_LOWER = "_mouthRollLower",
  MOUTH_SHRUGGLOWER = "_mouthShruggLower",
  MOUTH_SHRUGGUPPER = "_mouthShruggUpper",
  MOUTH_CLOSE = "_mouthClose",
  MOUTH_SMILE_LEFT = "_mouthSmileLeft",
  MOUTH_SMILE_RIGHT = "_mouthSmileRight",
  MOUTH_FROWN_LEFT = "_mouthFrownLeft",
  MOUTH_FROWN_RIGHT = "_mouthFrownRight",
  MOUTH_UPPER_UP_LEFT = "_mouthUpperUpLeft",
  MOUTH_UPPER_UP_RIGHT = "_mouthUpperUpRight",
  MOUTH_LOWER_DOWN_LEFT = "_mouthLowerDownLeft",
  MOUTH_LOWER_DOWN_RIGHT = "_mouthLowerDownRight",
  MOUTH_INSIDE = "_mouthInside",
  MOUTH_CORNER_PULL_LEFT = "_mouthCornerPullLeft",
  MOUTH_CORNER_PULL_RIGHT = "_mouthCornerPullRight",

  // Nose
  NOSE_SNEER_LEFT = "_noseSneerLeft",
  NOSE_SNEER_RIGHT = "_noseSneerRight",

  // Cheeks
  CHEEK_PUFF = "_cheekPuff",
  CHEEK_SQUINT_LEFT = "_cheekSquintLeft",
  CHEEK_SQUINT_RIGHT = "_cheekSquintRight",

  // Jaw
  JAW_OPEN = "_jawOpen",
  JAW_FORWARD = "_jawForward",
  JAW_LEFT = "_jawLeft",
  JAW_RIGHT = "_jawRight",

  // Eyebrows
  EYEBROW_DOWN_LEFT = "_eyebrowDownLeft",
  EYEBROW_DOWN_RIGHT = "_eyebrowDownRight",
  EYEBROW_INNER_UP = "_eyebrowInnerUp",
  EYEBROW_LATERAL_UP_LEFT = "_eyebrowLateralUpLeft",
  EYEBROW_LATERAL_UP_RIGHT = "_eyebrowLateralUpRight",

  // Tongue
  TONGUE_OUT = "_tongueOut",
  TONGUE_CURL_UP = "_tongueCurlUp",
  TONGUE_CURL_DOWN = "_tongueCurlDown",
  TONGUE_ROLL_UP = "_tongueRollUp",
  TONGUE_ROLL_DOWN = "_tongueRollDown",
  TONGUE_PUSH_OUT = "_tonguePushOut",
  TONGUE_SQUISH = "_tongueSquish",
}

/**
 * Resultado de MediaPipe Pose
 */
export interface MediaPipePoseResult {
  landmarks: Array<{
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }>;
  worldLandmarks?: Array<{
    x: number;
    y: number;
    z: number;
  }>;
  segmentation?: ArrayBuffer;
}

/**
 * Resultado de MediaPipe Hands
 */
export interface MediaPipeHandsResult {
  multiHandLandmarks: Array<
    Array<{
      x: number;
      y: number;
      z: number;
    }>
  >;
  multiHandedness: Array<{
    label: "Left" | "Right";
    score: number;
  }>;
}

/**
 * Resultado de MediaPipe Face Detection
 */
export interface MediaPipeFaceDetectionResult {
  detections: Array<{
    boundingBox: {
      xCenter: number;
      yCenter: number;
      width: number;
      height: number;
    };
    locationData: {
      relativeBoundingBox: {
        xMin: number;
        yMin: number;
        width: number;
        height: number;
      };
      relativeLandmarks: Array<{
        x: number;
        y: number;
        z: number;
      }>;
    };
    score: number;
  }>;
}

/**
 * Resultado de MediaPipe Face Mesh (468 landmarks)
 */
export interface MediaPipeFaceMeshResult {
  multiFaceLandmarks: Array<
    Array<{
      x: number;
      y: number;
      z: number;
    }>
  >;
  multiFaceInsetLandmarks?: Array<
    Array<{
      x: number;
      y: number;
      z: number;
    }>
  >;
}

/**
 * Resultado de MediaPipe Face Expression
 */
export interface MediaPipeFaceExpressionResult {
  faceBlendshapes: Array<{
    categoryName: string;
    displayName: string;
    score: number;
    index: number;
  }>;
}

/**
 * Resultado combinado de MediaPipe (simulado, para tipado)
 */
export interface MediaPipeResult {
  pose?: MediaPipePoseResult;
  leftHand?: {
    landmarks: Array<{ x: number; y: number; z: number }>;
    handedness: number; // 0-1, confianza
  };
  rightHand?: {
    landmarks: Array<{ x: number; y: number; z: number }>;
    handedness: number;
  };
  face?: {
    landmarks: Array<{ x: number; y: number; z: number }>;
    blendshapes: Record<string, number>;
  };
  frameTimestampMs: number;
}
