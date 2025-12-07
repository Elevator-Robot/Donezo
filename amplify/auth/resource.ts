import { defineAuth, secret } from '@aws-amplify/backend'
import { SecretValue } from 'aws-cdk-lib'
import type { BackendSecret } from '@aws-amplify/plugin-types'

/**
 * Cognito User Pool definition for Donezo auth.
 * Mirrors the BrainInCup Amplify setup but scoped down to auth only.
 */

const isLocalDevelopment = process.env.NODE_ENV === 'development' ||
  process.env.AMPLIFY_ENVIRONMENT === 'sandbox' ||
  process.env.AMPLIFY_EXTERNAL_PROVIDERS === 'false'

if (isLocalDevelopment) {
  console.warn('⚠️  Using default secrets for external providers in local mode.')
  console.warn('   Configure real OAuth secrets via: npx ampx sandbox secret set')
}

function createSecretOrDefault(secretName: string, defaultValue: string): BackendSecret {
  if (isLocalDevelopment) {
    return {
      resolve: (): SecretValue => SecretValue.unsafePlainText(defaultValue),
      resolvePath: (): { branchSecretPath: string, sharedSecretPath: string } => ({
        branchSecretPath: `local-default-${secretName}`,
        sharedSecretPath: `local-default-${secretName}`
      })
    }
  }

  return secret(secretName)
}

const localUrls = ['http://localhost:3000/']
const productionUrls = ['https://mydoink.com/']

const callbackUrls = [...localUrls, ...productionUrls]
const logoutUrls = [...localUrls, ...productionUrls]

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: createSecretOrDefault('GOOGLE_CLIENT_ID', 'default-google-client-id'),
        clientSecret: createSecretOrDefault('GOOGLE_CLIENT_SECRET', 'default-google-client-secret'),
        attributeMapping: {
          email: 'email',
          nickname: 'given_name'
        },
        scopes: ['email', 'profile', 'openid']
      },
      callbackUrls,
      logoutUrls
    }
  },
  userAttributes: {
    nickname: {
      required: true,
      mutable: true
    }
  }
})
