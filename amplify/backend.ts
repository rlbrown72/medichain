// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';

defineBackend({
  data,
});