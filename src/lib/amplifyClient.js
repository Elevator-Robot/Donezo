import { Amplify } from 'aws-amplify'
import outputs from '../../amplify_outputs.json'

// Configure Amplify with the generated backend outputs once on app startup
Amplify.configure(outputs)
