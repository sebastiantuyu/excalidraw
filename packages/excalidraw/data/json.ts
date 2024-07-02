import { fileSave, loadFromProvider } from "./filesystem";
import { cleanAppStateForExport, clearAppStateForDatabase } from "../appState";
import {
  DEFAULT_FILENAME,
  EXPORT_DATA_TYPES,
  EXPORT_SOURCE,
  MIME_TYPES,
  VERSIONS,
} from "../constants";
import { clearElementsForDatabase, clearElementsForExport } from "../element";
import type { ExcalidrawElement } from "../element/types";
import type { AppState, BinaryFiles, LibraryItems } from "../types";
import { isImageFileHandle, loadFromBlob, normalizeFile } from "./blob";

import type {
  ExportedDataState,
  ImportedDataState,
  ExportedLibraryData,
  ImportedLibraryData,
} from "./types";
import { ApiService } from "../services/api";

/**
 * Strips out files which are only referenced by deleted elements
 */
const filterOutDeletedFiles = (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
) => {
  const nextFiles: BinaryFiles = {};
  for (const element of elements) {
    if (
      !element.isDeleted &&
      "fileId" in element &&
      element.fileId &&
      files[element.fileId]
    ) {
      nextFiles[element.fileId] = files[element.fileId];
    }
  }
  return nextFiles;
};

export const syncJSONWithProvider = async (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
  /** filename */
  name: string = appState.name || DEFAULT_FILENAME,
) => {
  const serialized = serializeAsJSON(elements, appState, files, "local");
  const blob = new Blob([serialized], {
    type: MIME_TYPES.excalidraw,
  });

  return ApiService.axios.post<{ statusCode: number }>(
    "/draws/7687cc88-83bd-4eb0-91e7-64d4927f9575",
    blob,
  );
};

export const serializeAsJSON = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
  type: "local" | "database",
): string => {
  const data: ExportedDataState = {
    type: EXPORT_DATA_TYPES.excalidraw,
    version: VERSIONS.excalidraw,
    source: EXPORT_SOURCE,
    elements:
      type === "local"
        ? clearElementsForExport(elements)
        : clearElementsForDatabase(elements),
    appState:
      type === "local"
        ? cleanAppStateForExport(appState)
        : clearAppStateForDatabase(appState),
    files:
      type === "local"
        ? filterOutDeletedFiles(elements, files)
        : // will be stripped from JSON
          undefined,
  };

  return JSON.stringify(data, null, 2);
};

export const saveAsJSON = async (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
  /** filename */
  name: string = appState.name || DEFAULT_FILENAME,
) => {
  const serialized = serializeAsJSON(elements, appState, files, "local");
  const blob = new Blob([serialized], {
    type: MIME_TYPES.excalidraw,
  });

  const fileHandle = await fileSave(blob, {
    name,
    extension: "excalidraw",
    description: "Excalidraw file",
    fileHandle: isImageFileHandle(appState.fileHandle)
      ? null
      : appState.fileHandle,
  });
  return { fileHandle };
};

export const loadFromJSON = async (
  localAppState: AppState,
  localElements: readonly ExcalidrawElement[] | null,
) => {
  const blobFile = await loadFromProvider();
  const file = new File([blobFile], "opened.json");
  return loadFromBlob(
    await normalizeFile(file),
    localAppState,
    localElements,
    file.handle,
  );
};

export const isValidExcalidrawData = (data?: {
  type?: any;
  elements?: any;
  appState?: any;
}): data is ImportedDataState => {
  return (
    data?.type === EXPORT_DATA_TYPES.excalidraw &&
    (!data.elements ||
      (Array.isArray(data.elements) &&
        (!data.appState || typeof data.appState === "object")))
  );
};

export const isValidLibrary = (json: any): json is ImportedLibraryData => {
  return (
    typeof json === "object" &&
    json &&
    json.type === EXPORT_DATA_TYPES.excalidrawLibrary &&
    (json.version === 1 || json.version === 2)
  );
};

export const serializeLibraryAsJSON = (libraryItems: LibraryItems) => {
  const data: ExportedLibraryData = {
    type: EXPORT_DATA_TYPES.excalidrawLibrary,
    version: VERSIONS.excalidrawLibrary,
    source: EXPORT_SOURCE,
    libraryItems,
  };
  return JSON.stringify(data, null, 2);
};

export const saveLibraryAsJSON = async (libraryItems: LibraryItems) => {
  const serialized = serializeLibraryAsJSON(libraryItems);
  await fileSave(
    new Blob([serialized], {
      type: MIME_TYPES.excalidrawlib,
    }),
    {
      name: "library",
      extension: "excalidrawlib",
      description: "Excalidraw library file",
    },
  );
};
