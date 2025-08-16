import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

const authConfig = defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      provider: sessionUserProvider({
        model: () => import('#models/User'),
      }),
    }),
  },
})

export default authConfig

/**
 * Inferring types for the list of authenticators, the auth
 * events and the user providers
 */
declare module '@adonisjs/auth/types' {
  interface Authenticators extends InferAuthenticators<typeof authConfig> {}
  interface AuthEvents extends InferAuthEvents<Authenticators> {}
}

