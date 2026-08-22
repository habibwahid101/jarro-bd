/**
 * AWS DynamoDB client wiring for the JARRO storefront. Points at JARRO's
 * own DynamoDB tables (JARRO-Products / JARRO-Orders) — fully separate
 * from the Valent & Co. resources this project was originally cloned
 * from. See README.md → Infrastructure for the full resource list.
 *
 * Credentials come from a Cognito Identity Pool:
 *  - No idToken -> unauthenticated ("guest") role: read products, create + look up own orders.
 *  - idToken from an admin sign-in -> authenticated ("admin") role: full read/write on both tables.
 *
 * All table/pool identifiers are injected at build time via Vite env vars
 * (set as Amplify Hosting environment variables — see amplify console).
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

export const REGION = import.meta.env.VITE_AWS_REGION as string;
export const IDENTITY_POOL_ID = import.meta.env.VITE_IDENTITY_POOL_ID as string;
export const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID as string;
export const PRODUCTS_TABLE = import.meta.env.VITE_DDB_PRODUCTS_TABLE as string;
export const ORDERS_TABLE = import.meta.env.VITE_DDB_ORDERS_TABLE as string;

const isConfigured = Boolean(REGION && IDENTITY_POOL_ID && USER_POOL_ID && PRODUCTS_TABLE && ORDERS_TABLE);

/**
 * Builds a fresh DynamoDB Document client scoped to either the guest role
 * (idToken omitted) or the admin role (idToken from a Cognito User Pool sign-in).
 */
export function createDocClient(idToken?: string): DynamoDBDocumentClient {
  if (!isConfigured) {
    throw new Error(
      'AWS is not configured (missing VITE_AWS_REGION / VITE_IDENTITY_POOL_ID / VITE_COGNITO_USER_POOL_ID / table names).'
    );
  }
  const credentials = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
    logins: idToken
      ? { [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken }
      : undefined,
  });

  const client = new DynamoDBClient({ region: REGION, credentials });
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
}

export const awsIsConfigured = isConfigured;

export {
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
};
