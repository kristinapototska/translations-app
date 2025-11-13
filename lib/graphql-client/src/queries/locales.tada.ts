import { graphql } from "../graphql";

// Get Channel Locales Query (using new GraphQL API)
export const GetChannelLocalesDocument = graphql(`
  query GetChannelLocales($channelId: ID!) {
    store {
      locales(input: { channelId: $channelId }) {
        edges {
          node {
            code
            status
            isDefault
          }
        }
      }
    }
  }
`);

// Helper function to create variables for getting channel locales
export function createGetChannelLocalesVariables(params: {
  channelId: number;
}) {
  return {
    channelId: `bc/store/channel/${params.channelId}`
  };
}

