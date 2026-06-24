// amplify/data/schema.ts
import { type ClientSchema, a } from '@aws-amplify/backend';

export const schema = a.schema({
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
    // Changes rule from authenticated user pools to public API key access
    .authorization((allow: any) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;