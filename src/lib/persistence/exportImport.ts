/**
 * Utilidades de persistencia:
 * - Exportar frames/clips a JSON
 * - Importar JSON y recrear frames/clips
 */

import type { AvatarFrame, AvatarAnimationClip, AvatarFrameJSON } from "@/types/motion";
import type { SignDictionaryEntry } from "@/types/dictionary";

/**
 * Exporta un AvatarFrame a JSON
 */
export function exportAvatarFrame(frame: AvatarFrame): AvatarFrameJSON {
  const json: AvatarFrameJSON = {
    bones: {},
    expressions: frame.expressions ? { ...frame.expressions } : {},
  };

  // Convertir bones a formato JSON
  for (const [boneName, transform] of Object.entries(frame.bones)) {
    if (transform && json.bones) {
      (json.bones as Record<string, unknown>)[boneName] = {
        rotation: { ...transform.rotation },
      };
    }
  }

  return json;
}

/**
 * Exporta un clip de animación a JSON
 */
export function exportAvatarClip(clip: AvatarAnimationClip): string {
  const data = {
    name: clip.name,
    frames: clip.frames.map((f) => ({
      timestampMs: f.timestampMs,
      bones: Object.entries(f.bones).reduce(
        (acc, [bone, transform]) => {
          acc[bone as keyof typeof acc] = {
            rotation: transform?.rotation,
          };
          return acc;
        },
        {} as Record<string, unknown>,
      ),
      expressions: f.expressions,
    })),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Exporta una entrada del diccionario a JSON
 */
export function exportSignEntry(entry: SignDictionaryEntry): string {
  const data = {
    id: entry.id,
    gloss: entry.gloss,
    metadata: entry.metadata,
    clip: {
      name: entry.clip.name,
      frames: entry.clip.frames.map((f) => ({
        timestampMs: f.timestampMs,
        bones: f.bones,
        expressions: f.expressions,
      })),
    },
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Importa un JSON y crea un AvatarAnimationClip
 */
export function importAvatarClip(jsonString: string): AvatarAnimationClip | null {
  try {
    const data = JSON.parse(jsonString);

    if (!data.name || !Array.isArray(data.frames)) {
      return null;
    }

    return {
      name: data.name,
      frames: data.frames.map((f: any) => ({
        timestampMs: f.timestampMs ?? 0,
        bones: f.bones ?? {},
        expressions: f.expressions ?? {},
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Importa un SignDictionaryEntry desde JSON
 */
export function importSignEntry(jsonString: string): SignDictionaryEntry | null {
  try {
    const data = JSON.parse(jsonString);

    if (!data.id || !data.gloss || !data.clip) {
      return null;
    }

    const clip: AvatarAnimationClip = {
      name: data.clip.name ?? data.gloss,
      frames: data.clip.frames.map((f: any) => ({
        timestampMs: f.timestampMs ?? 0,
        bones: f.bones ?? {},
        expressions: f.expressions ?? {},
      })),
    };

    return {
      id: data.id,
      gloss: data.gloss,
      clip,
      metadata: data.metadata ?? {
        id: data.id,
        gloss: data.gloss,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Descarga un JSON al navegador del usuario
 */
export function downloadJSON(
  data: string,
  filename: string = "export.json",
): void {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Lee un archivo JSON desde un input file
 */
export async function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        resolve(json);
      } catch (e) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
