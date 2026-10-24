/** The id a project's name suggests, as the add form fills it in: lowercase, dashes, a letter
 *  first. Where a project's id is just that, the shell names it once, by its name. */
export const suggestProjectId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^[^a-z]+|-+$/g, '')
    .slice(0, 40)

/** Whether a project's id says something its name does not. */
export const idDiffers = (project: { id: string; name: string }) =>
  project.id !== suggestProjectId(project.name)
