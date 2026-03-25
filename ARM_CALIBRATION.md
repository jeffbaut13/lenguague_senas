# Arm Calibration Notes

Objetivo: calibrar el avatar actual por hueso y eje antes de integrar MediaPipe o generar poses compuestas.

## Bateria de tests

- `rightUpperArm x+`
- `rightUpperArm y+`
- `rightUpperArm z+`
- `rightLowerArm x+`
- `rightLowerArm y+`
- `rightLowerArm z+`
- `rightHand x+`
- `rightHand y+`
- `rightHand z+`
- `leftUpperArm x+`
- `leftUpperArm y+`
- `leftUpperArm z+`

## Resumen esperado para este VRM

| Comportamiento | Eje de referencia |
|---|---|
| Forward raise brazo derecho a 90° | `rightUpperArm.y+` |
| Levantar brazo derecho | `rightUpperArm.z-` |
| Levantar brazo izquierdo | `leftUpperArm.z-` |
| Abrir lateralmente hombro derecho | `rightUpperArm.y+` |
| Torcer upper arm derecho | `rightUpperArm.x-` |
| Doblar codo derecho | `rightLowerArm.y+` |
| Orientar palma/mano derecha | `rightHand.y` |

## Pose compuesta corregida

La pose `validation-right-hand-chin-calibrated` usa esta hipotesis de calibracion:

- hombro derecho: `z-` para elevar
- hombro derecho: `y+` para abrir lateral/diagonal
- hombro derecho: `x-` para torsion fina
- codo derecho: `y+` para flexionar
- mano derecha: `y+` para orientar cerca del menton

## Fuente editable

La fuente de verdad editable para la pose compuesta vive en:

- `src/mocks/armCalibrationMap.mock.ts`

La pose `validation-right-hand-chin-final` se construye a partir de ese mapa.

Ahora el mapa usa `percent` en lugar de valores absolutos:

- `percent: 1` significa usar el 100% del limite del hueso/eje en la direccion elegida
- `percent: 0.5` significa usar el 50% del limite
- el valor final en radianes se calcula desde `boneLimits`

## RightForwardRaise90

La postura atomica `RightForwardRaise90` usa el calibration map actual en lugar del JSON base literal:

- hueso final usado: `rightUpperArm`
- eje/signo final usado: `y+`
- porcentaje final usado: `82%` del limite positivo de `rightUpperArm.y`

Nota: este ajuste sale de la validacion manual reportada para el avatar actual. Yo no pude verificar visualmente el resultado en esta sesion, asi que queda documentado como la mejor calibracion disponible hasta ahora.

No se integra MediaPipe todavia. Esta fase existe solo para calibrar el rig del avatar actual.
