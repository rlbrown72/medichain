// amplify/data/schema.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Patient: a
    .model({
      id: a.id().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      ghanaCardId: a.string().required(),
      phoneNumber: a.string().required(),
      dateOfBirth: a.date().required(),
      gender: a.string().required(),
      bloodType: a.string().required(),
    })
    // Explicitly typed parameter to satisfy strict TS rules
    .authorization((allow: any) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});