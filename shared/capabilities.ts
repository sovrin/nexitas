// What one module offers the others, by name. A module provides one in NexitasModule.provides;
// another asks for it with capability(name) on the server (#nexitas/server/utils/nexitas) and
// useCapability(name) on its pages, and finds nothing while no switched-on module provides it, so
// it must work without. The contracts live here, so neither module imports the other: a new
// capability is a new entry, and any one module can provide it.
import type { DatabaseSync } from 'node:sqlite'

export interface Capabilities {
  files: FilesCapability
}

/** One of a project's files, as the files capability describes it. */
export interface StoredFile {
  id: string
  name: string
  /** Its media type: image/png, application/pdf. */
  type: string
  /** In bytes. */
  size: number
  /** In pixels, for an image; null otherwise. */
  width: number | null
  height: number | null
  /** Where anyone reads it, on this app's origin: /v1/files/<project>/<id>. */
  path: string
}

/** A project's uploaded files. Its provider's pages also register a global FilesPicker component
 *  for the open project: `<component :is="'FilesPicker'" id="…" v-model="fileId" accept="image"
 *  @picked="…" />` lists its files (images only with accept="image"), uploads one, and emits the
 *  StoredFile picked, or null for none, as `picked`: for the file it is given once the list is in,
 *  and on each change. An id that is no longer there becomes null. */
export interface FilesCapability {
  /** One of the project's files, or null when it has none by this id (deleted, or never there). */
  get(db: DatabaseSync, projectId: string, fileId: string): StoredFile | null
}
