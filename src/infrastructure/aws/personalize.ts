/**
 * AWS Personalize Service
 * 
 * Provides personalized product recommendations:
 * - Real-time recommendations based on user behavior
 * - Similar items recommendations
 * - Personalized ranking
 * - User segmentation
 */

import {
  PersonalizeRuntimeClient,
  GetRecommendationsCommand,
  GetPersonalizedRankingCommand,
} from '@aws-sdk/client-personalize-runtime';
import {
  PersonalizeEventsClient,
  PutEventsCommand,
  PutUsersCommand,
  PutItemsCommand,
} from '@aws-sdk/client-personalize-events';

// Configuration
const AWS_REGION = process.env.AWS_PERSONALIZE_REGION || process.env.AWS_REGION || 'us-east-1';
const CAMPAIGN_ARN = process.env.AWS_PERSONALIZE_CAMPAIGN_ARN;
const SIMILAR_ITEMS_CAMPAIGN_ARN = process.env.AWS_PERSONALIZE_SIMILAR_ITEMS_CAMPAIGN_ARN;
const TRACKING_ID = process.env.AWS_PERSONALIZE_TRACKING_ID || '8ed41df9-142b-4dfc-a0c1-a9d55dfc1fcd';
const DATASET_GROUP_ARN = process.env.AWS_PERSONALIZE_DATASET_GROUP_ARN || 'arn:aws:personalize:us-east-1:014498637134:dataset-group/indigo-ecommerce';

// Lazy-initialized clients
let personalizeClient: PersonalizeRuntimeClient | null = null;
let eventsClient: PersonalizeEventsClient | null = null;

function getPersonalizeClient(): PersonalizeRuntimeClient {
  if (!personalizeClient) {
    personalizeClient = new PersonalizeRuntimeClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return personalizeClient;
}

function getEventsClient(): PersonalizeEventsClient {
  if (!eventsClient) {
    eventsClient = new PersonalizeEventsClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return eventsClient;
}

// Types
export type InteractionEventType = 
  | 'view' 
  | 'click' 
  | 'add-to-cart' 
  | 'purchase' 
  | 'wishlist-add'
  | 'search';

export interface RecommendationResult {
  success: boolean;
  recommendations?: Array<{
    itemId: string;
    score: number;
  }>;
  error?: string;
}

export interface RankingResult {
  success: boolean;
  rankedItems?: Array<{
    itemId: string;
    score: number;
  }>;
  error?: string;
}

export interface EventResult {
  success: boolean;
  error?: string;
}

/**
 * Check if Personalize is enabled and configured
 */
export function isPersonalizeEnabled(): boolean {
  return process.env.AWS_PERSONALIZE_ENABLED === 'true' && !!CAMPAIGN_ARN;
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: string,
  options?: {
    numResults?: number;
    filterArn?: string;
    context?: Record<string, string>;
  }
): Promise<RecommendationResult> {
  if (!isPersonalizeEnabled() || !CAMPAIGN_ARN) {
    return { success: false, error: 'Personalize not configured' };
  }

  const { numResults = 25, filterArn, context } = options || {};

  try {
    const client = getPersonalizeClient();
    const command = new GetRecommendationsCommand({
      campaignArn: CAMPAIGN_ARN,
      userId,
      numResults,
      filterArn,
      context,
    });

    const response = await client.send(command);

    return {
      success: true,
      recommendations: response.itemList?.map((item: { itemId?: string; score?: number }) => ({
        itemId: item.itemId || '',
        score: item.score || 0,
      })) || [],
    };
  } catch (error) {
    console.error('Personalize recommendation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recommendations',
    };
  }
}

/**
 * Get similar items recommendations
 */
export async function getSimilarItems(
  itemId: string,
  options?: {
    userId?: string;
    numResults?: number;
    filterArn?: string;
  }
): Promise<RecommendationResult> {
  const campaignArn = SIMILAR_ITEMS_CAMPAIGN_ARN || CAMPAIGN_ARN;
  
  if (!isPersonalizeEnabled() || !campaignArn) {
    return { success: false, error: 'Personalize not configured' };
  }

  const { userId, numResults = 10, filterArn } = options || {};

  try {
    const client = getPersonalizeClient();
    const command = new GetRecommendationsCommand({
      campaignArn,
      itemId,
      userId,
      numResults,
      filterArn,
    });

    const response = await client.send(command);

    return {
      success: true,
      recommendations: response.itemList?.map((item: { itemId?: string; score?: number }) => ({
        itemId: item.itemId || '',
        score: item.score || 0,
      })) || [],
    };
  } catch (error) {
    console.error('Personalize similar items error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get similar items',
    };
  }
}

/**
 * Get personalized ranking for a list of items
 */
export async function getPersonalizedRanking(
  userId: string,
  itemIds: string[],
  options?: {
    context?: Record<string, string>;
  }
): Promise<RankingResult> {
  if (!isPersonalizeEnabled() || !CAMPAIGN_ARN) {
    return { success: false, error: 'Personalize not configured' };
  }

  const { context } = options || {};

  try {
    const client = getPersonalizeClient();
    const command = new GetPersonalizedRankingCommand({
      campaignArn: CAMPAIGN_ARN,
      userId,
      inputList: itemIds,
      context,
    });

    const response = await client.send(command);

    return {
      success: true,
      rankedItems: response.personalizedRanking?.map((item: { itemId?: string; score?: number }) => ({
        itemId: item.itemId || '',
        score: item.score || 0,
      })) || [],
    };
  } catch (error) {
    console.error('Personalize ranking error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get personalized ranking',
    };
  }
}

/**
 * Track user interaction event
 */
export async function trackInteraction(
  userId: string,
  sessionId: string,
  eventType: InteractionEventType,
  itemId: string,
  options?: {
    eventValue?: number;
    properties?: Record<string, string>;
  }
): Promise<EventResult> {
  if (!TRACKING_ID) {
    return { success: false, error: 'Personalize tracking not configured' };
  }

  const { eventValue, properties } = options || {};

  try {
    const client = getEventsClient();
    const command = new PutEventsCommand({
      trackingId: TRACKING_ID,
      userId,
      sessionId,
      eventList: [
        {
          eventType,
          sentAt: new Date(),
          itemId,
          eventValue,
          properties: properties ? JSON.stringify(properties) : undefined,
        },
      ],
    });

    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Personalize event tracking error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track event',
    };
  }
}

/**
 * Batch track multiple interaction events
 */
export async function trackInteractionsBatch(
  userId: string,
  sessionId: string,
  events: Array<{
    eventType: InteractionEventType;
    itemId: string;
    eventValue?: number;
    timestamp?: Date;
    properties?: Record<string, string>;
  }>
): Promise<EventResult> {
  if (!TRACKING_ID) {
    return { success: false, error: 'Personalize tracking not configured' };
  }

  try {
    const client = getEventsClient();
    const command = new PutEventsCommand({
      trackingId: TRACKING_ID,
      userId,
      sessionId,
      eventList: events.map(event => ({
        eventType: event.eventType,
        sentAt: event.timestamp || new Date(),
        itemId: event.itemId,
        eventValue: event.eventValue,
        properties: event.properties ? JSON.stringify(event.properties) : undefined,
      })),
    });

    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Personalize batch event tracking error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track events',
    };
  }
}

/**
 * Update user metadata in Personalize
 */
export async function updateUserMetadata(
  userId: string,
  properties: Record<string, string | number>
): Promise<EventResult> {
  if (!DATASET_GROUP_ARN) {
    return { success: false, error: 'Personalize dataset group not configured' };
  }

  try {
    const client = getEventsClient();
    const command = new PutUsersCommand({
      datasetArn: `${DATASET_GROUP_ARN}/dataset/USERS`,
      users: [
        {
          userId,
          properties: JSON.stringify(properties),
        },
      ],
    });

    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Personalize user update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

/**
 * Update item metadata in Personalize
 */
export async function updateItemMetadata(
  itemId: string,
  properties: Record<string, string | number>
): Promise<EventResult> {
  if (!DATASET_GROUP_ARN) {
    return { success: false, error: 'Personalize dataset group not configured' };
  }

  try {
    const client = getEventsClient();
    const command = new PutItemsCommand({
      datasetArn: `${DATASET_GROUP_ARN}/dataset/ITEMS`,
      items: [
        {
          itemId,
          properties: JSON.stringify(properties),
        },
      ],
    });

    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Personalize item update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item',
    };
  }
}

/**
 * Batch update items in Personalize
 */
export async function updateItemsBatch(
  items: Array<{
    itemId: string;
    properties: Record<string, string | number>;
  }>
): Promise<EventResult> {
  if (!DATASET_GROUP_ARN) {
    return { success: false, error: 'Personalize dataset group not configured' };
  }

  try {
    const client = getEventsClient();
    const command = new PutItemsCommand({
      datasetArn: `${DATASET_GROUP_ARN}/dataset/ITEMS`,
      items: items.map(item => ({
        itemId: item.itemId,
        properties: JSON.stringify(item.properties),
      })),
    });

    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Personalize batch item update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update items',
    };
  }
}
