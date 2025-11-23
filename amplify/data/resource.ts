import { defineData, a } from '@aws-amplify/backend'
import { ClientSchema } from '@aws-amplify/backend'

const schema = a.schema({
  UserProfile: a.model({
    id: a.id(),
    email: a.string(),
    username: a.string(),
    created_at: a.string(),
    updated_at: a.string()
  }).authorization(allow => [allow.owner()]),

  List: a.model({
    id: a.id(),
    user_id: a.string(),
    name: a.string(),
    color: a.string().default('teal'),
    icon: a.string().default('List'),
    type: a.string().default('task'),
    created_at: a.string(),
    todos: a.hasMany('Todo', 'list_id')
  }).authorization(allow => [allow.owner()]),

  Todo: a.model({
    id: a.id(),
    user_id: a.string(),
    list_id: a.id(),
    list: a.belongsTo('List', 'list_id'),
    title: a.string(),
    description: a.string(),
    completed: a.boolean().default(false),
    priority: a.string().default('medium'),
    due_date: a.string(),
    due_time: a.string(),
    is_recurring_instance: a.boolean().default(false),
    parent_recurring_task_id: a.string(),
    recurrence: a.json(),
    created_at: a.string(),
    completed_at: a.string()
  }).authorization(allow => [allow.owner()]),

  UserSettings: a.model({
    id: a.id(),
    user_id: a.string(),
    font: a.string().default('Rock Salt'),
    theme: a.string().default('light'),
    updated_at: a.string()
  }).authorization(allow => [allow.owner()])
})

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  }
})

export type Schema = ClientSchema<typeof schema>
