import { enabledModules, nexitasDatabase } from '../utils/nexitas'

// Each switched-on module's hourly work: once at start, after every module's plugin has run (the
// first run opens the database), then every hour. A failing job is logged and tried next hour.
export default defineNitroPlugin(() => {
  const run = () => {
    try {
      const db = nexitasDatabase()
      for (const module of enabledModules())
        try {
          module.hourly?.(db)
        } catch (error) {
          console.error(`${module.id}: its hourly work failed.`, error)
        }
    } catch (error) {
      console.error('nexitas: could not open the database for the hourly work.', error)
    }
  }
  setImmediate(run)
  setInterval(run, 60 * 60 * 1000).unref()
})
