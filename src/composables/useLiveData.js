import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { db } from '../db.js'

export function useLiveActivities() {
  return useObservable(
    liveQuery(() => db.activities.orderBy('createdAt').toArray()),
    []
  )
}

export function useLiveHistory() {
  return useObservable(
    liveQuery(() => 
      db.history
        .orderBy('timestamp')
        .reverse()
        .limit(10)
        .toArray()
        .then(entries => 
          entries.map(entry => ({
            date: entry.timestamp.toISOString(),
            activity: entry.activity
          }))
        )
    ),
    []
  )
}

export function useLiveSettings() {
  return useObservable(
    liveQuery(async () => {
      const selectedActivitySetting = await db.settings.where('key').equals('selectedActivity').first()
      const rerollsLeftSetting = await db.settings.where('key').equals('rerollsLeft').first()
      const lastRollDateSetting = await db.settings.where('key').equals('lastRollDate').first()

      return {
        selectedActivity: selectedActivitySetting?.value || null,
        rerollsLeft: parseInt(rerollsLeftSetting?.value) || 2,
        lastRollDate: lastRollDateSetting?.value || null
      }
    }),
    {
      selectedActivity: null,
      rerollsLeft: 2,
      lastRollDate: null
    }
  )
}
