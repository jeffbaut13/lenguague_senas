"use client";

/**
 * Componente: Reproductor de diccionario de señas
 * Permite seleccionar y reproducir entradas del diccionario
 */

import { useDictionaryStore } from "@/store/dictionaryStore";
import { useAvatarStore } from "@/store/avatarStore";
import {
  validationRightHandChinCalibratedFrame,
  validationRightHandChinCalibratedPoseMock,
  validationRightHandChinFinalFrame,
  validationRightHandChinFinalPoseMock,
  validationRightHandChinFrame,
  validationRightHandChinPoseMock,
} from "@/mocks/avatarFrame.mock";

export function DictionaryPlayback() {
  const dictionary = useDictionaryStore((state) => state.dictionary);
  const selectedEntry = useDictionaryStore((state) => state.selectedEntry);
  const selectEntry = useDictionaryStore((state) => state.selectEntry);

  const playAnimationClip = useAvatarStore((state) => state.playAnimationClip);
  const applyAvatarFrame = useAvatarStore((state) => state.applyAvatarFrame);
  const stopAnimationClip = useAvatarStore((state) => state.stopAnimationClip);

  const isOriginalValidationPose = selectedEntry?.clip.name === validationRightHandChinPoseMock.name;
  const isCalibratedValidationPose =
    selectedEntry?.clip.name === validationRightHandChinCalibratedPoseMock.name;
  const isFinalValidationPose = selectedEntry?.clip.name === validationRightHandChinFinalPoseMock.name;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Diccionario de Señas</h3>
        <span className="text-xs text-muted">{dictionary.entries.length} entradas</span>
      </div>

      {/* Selector de entradas */}
      <select
        value={selectedEntry?.id ?? ""}
        onChange={(e) => selectEntry(e.target.value)}
        className="w-full rounded-md border border-panel-border bg-surface px-2 py-1 text-sm text-text"
      >
        <option value="">-- Selecciona una seña --</option>
        {dictionary.entries.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.gloss} ({entry.metadata.category})
          </option>
        ))}
      </select>

      {/* Info de la seña seleccionada */}
      {selectedEntry && (
        <div className="rounded-md border border-panel-border bg-slate-50 p-2 text-xs space-y-1">
          <div className="font-mono font-semibold text-text">{selectedEntry.gloss}</div>
          <div className="text-muted line-clamp-2">{selectedEntry.metadata.definition}</div>
          <div className="text-muted">
            Mano dominante: <span className="font-semibold">{selectedEntry.metadata.dominantHand}</span>
          </div>
          {selectedEntry.metadata.tags && selectedEntry.metadata.tags.length > 0 && (
            <div className="text-muted">
              Tags: {selectedEntry.metadata.tags.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Botones de control */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => selectedEntry && playAnimationClip(selectedEntry.clip)}
          disabled={!selectedEntry}
          className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reproducir
        </button>
        <button
          type="button"
          onClick={stopAnimationClip}
          className="rounded-md border border-panel-border bg-surface px-2 py-1 text-xs font-medium text-text hover:bg-slate-100"
        >
          Detener
        </button>
      </div>

      {(isOriginalValidationPose || isCalibratedValidationPose || isFinalValidationPose) && (
        <button
          type="button"
          onClick={() =>
            applyAvatarFrame(
              isFinalValidationPose
                ? validationRightHandChinFinalFrame
                : isCalibratedValidationPose
                  ? validationRightHandChinCalibratedFrame
                  : validationRightHandChinFrame,
              "validation-pose",
              isFinalValidationPose
                ? validationRightHandChinFinalPoseMock.name
                : isCalibratedValidationPose
                  ? validationRightHandChinCalibratedPoseMock.name
                  : validationRightHandChinPoseMock.name,
            )
          }
          className="w-full rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-200"
        >
          Aplicar pose exacta de validacion
        </button>
      )}
    </div>
  );
}
