import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined

export function isFirebaseAuthClientConfigured(): boolean {
  return Boolean(apiKey?.trim() && authDomain?.trim() && projectId?.trim())
}

function getOrInitApp(): FirebaseApp {
  if (getApps().length > 0) return getApp()
  if (!apiKey || !authDomain || !projectId) {
    throw new Error('Firebase web config missing')
  }
  return initializeApp({
    apiKey,
    authDomain,
    projectId,
    ...(appId ? { appId } : {}),
  })
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseAuthClientConfigured()) return null
  try {
    return getAuth(getOrInitApp())
  } catch {
    return null
  }
}
