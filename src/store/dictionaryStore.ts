/**
 * Store de diccionario: gestión del diccionario de señas
 * Proporciona búsqueda, carga y playback de entradas
 */

import { create } from "zustand";
import type {
  SignDictionary,
  SignDictionaryEntry,
  SignSearchQuery,
  SignSearchResult,
} from "@/types/dictionary";
import { MOCK_SIGN_DICTIONARY, findSignByGloss, findSignsByCategory } from "@/mocks/signEntries.mock";

interface DictionaryStoreState {
  // Diccionario cargado
  dictionary: SignDictionary;
  selectedEntry: SignDictionaryEntry | null;

  // Búsqueda y filtros
  searchQuery: string;
  selectedCategory: string | null;
  searchResults: SignSearchResult | null;

  // Métodos
  loadDictionary: (dict: SignDictionary) => void;
  selectEntry: (entryId: string) => void;
  search: (query: SignSearchQuery) => void;
  filterByCategory: (category: string) => void;
  clearFilters: () => void;
}

export const useDictionaryStore = create<DictionaryStoreState>((set, get) => ({
  dictionary: MOCK_SIGN_DICTIONARY,
  selectedEntry: null,
  searchQuery: "",
  selectedCategory: null,
  searchResults: null,

  loadDictionary: (dict) => set({ dictionary: dict }),

  selectEntry: (entryId) => {
    const entry = get().dictionary.entries.find((e) => e.id === entryId);
    set({ selectedEntry: entry ?? null });
  },

  search: (query) => {
    const { dictionary } = get();
    let results = [...dictionary.entries];

    // Filtrar por glosa
    if (query.gloss) {
      const glossLower = query.gloss.toLowerCase();
      results = results.filter((entry) =>
        entry.gloss.toLowerCase().includes(glossLower)
      );
    }

    // Filtrar por categoría
    if (query.category) {
      results = results.filter(
        (entry) =>
          entry.metadata.category &&
          entry.metadata.category.toLowerCase() === query.category!.toLowerCase()
      );
    }

    // Filtrar por tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter((entry) =>
        query.tags!.some((tag) =>
          entry.metadata.tags?.some(
            (t) => t.toLowerCase() === tag.toLowerCase()
          )
        )
      );
    }

    // Limitar resultados
    if (query.limitResults) {
      results = results.slice(0, query.limitResults);
    }

    set({
      searchQuery: query.gloss ?? "",
      searchResults: {
        entries: results,
        totalFound: results.length,
        query,
      },
    });
  },

  filterByCategory: (category) => {
    set({ selectedCategory: category });
    const results = findSignsByCategory(category);
    set({
      searchResults: {
        entries: results,
        totalFound: results.length,
        query: { category },
      },
    });
  },

  clearFilters: () => {
    set({
      searchQuery: "",
      selectedCategory: null,
      searchResults: null,
      selectedEntry: null,
    });
  },
}));
