import { type NextRequest } from "next/server";
import { getSessionFromContext } from "@/lib/auth";
import { BigCommerceRestClient } from "@bigcommerce/translations-rest-client";
import {
  fallbackLocale,
  translatableProductFields,
} from "@/lib/constants";
import { createGraphQLClient } from "@bigcommerce/translations-graphql-client";
import {
  getBasicInformationFieldsToRemove,
  getSeoInformationFieldsToRemove,
  getStorefrontDetailsFieldsToRemove,
  getPreOrderSettingsFieldsToRemove,
  getCustomFieldsToRemove
} from "@/lib/utils/product-mutation-helpers";

type Locale = {
  code: string;
  status: string;
  is_default: boolean;
  title?: string;
};

type ChannelData = {
  channel_id: number;
  channel_name: string;
  default_locale: string;
  locales: Locale[];
};

type LocaleInfo = {
  defaultLocale: string;
  availableLocales: Locale[];
};

/**
 * Creates a mapping of GraphQL fields from the provided posted form data.
 * @param postData - The post data containing key-value pairs.
 * @param graphqlParentObject - The parent object in the GraphQL schema.
 * @returns A mapping of GraphQL fields.
 */
function createGraphFieldsFromPostData(
  postData: { [key: string]: string },
  graphqlParentObject: string
): { [key: string]: string } {
  return translatableProductFields
    .filter(
      (productField) => productField.graphqlParentObject === graphqlParentObject
    )
    .reduce<{ [key: string]: string }>((acc, field) => {
      acc[field.key] = postData[field.key];
      return acc;
    }, {});
}

/**
 * Transforms GraphQL options data to locale-specific data.
 * @param optionsData - The GraphQL options data.
 * @param localeCode - The locale code to transform data for.
 * @returns Transformed locale-specific options data.
 */
function transformGraphQLOptionsDataToLocaleData(
  optionsData: any,
) {
  // Ensure we're working with an array of edges
  const options = optionsData?.edges || optionsData || [];

  return options.reduce((acc: any, edge: any) => {
    const optionId = edge.node.id;
    const localeOption = edge.node.overridesForLocale;

    acc[optionId] = {
      displayName: localeOption?.displayName || "",
      values: {},
    };

    edge.node.values.forEach((value: any) => {
      const localeValue = localeOption?.values?.find(
        (v: any) => v.id === value.id
      );
      acc[optionId].values[value.id] = localeValue?.label || "";
    });

    return acc;
  }, {});
}

/**
 * Transforms posted option data to match the GraphQL schema.
 * @param optionData - The posted option data containing options with their display names and values
 * @returns {Object} An object containing:
 *   - options: Array of transformed options with their IDs, display names, and non-empty values
 *   - removedValues: Array of options and values to remove from overrides
 */
function transformPostedOptionDataToGraphQLSchema(optionData: any) {
  if (!optionData.options) return { options: [], removedValues: [] };

  const removedValues: any[] = [];
  
  const options = Object.entries(optionData.options)
    .map(([optionId, optionDetails]: [string, any]) => {
      // Track empty values
      const emptyValueIds: string[] = [];
      Object.entries(optionDetails.values).forEach(([valueId, label]) => {
        if (!label || (label as string).trim() === '') {
          emptyValueIds.push(valueId);
        }
      });

      if (emptyValueIds.length > 0) {
        removedValues.push({
          optionId,
          data: {
            dropdown: {
              ...((!optionDetails.displayName || optionDetails.displayName.trim() === '') && {
                fields: ["DROPDOWN_PRODUCT_OPTION_DISPLAY_NAME_FIELD"]
              }),
              values: {
                ids: emptyValueIds
              }
            }
          }
        });
      }

      const nonEmptyValues = Object.entries(optionDetails.values).reduce((acc: any[], [valueId, label]) => {
        if (!label || (label as string).trim() === '') {
          return acc;
        }
        acc.push({ valueId, label });
        return acc;
      }, []);

      // Only return the option if it has a non-empty display name or non-empty values
      const displayName = optionDetails.displayName?.trim();
      if (displayName || nonEmptyValues.length > 0) {
        return {
          optionId,
          data: {
            dropdown: {
              // An empty or null displayName will throw an error, so remove it if it's empty
              ...(displayName && { displayName }),
              ...(nonEmptyValues.length > 0 && { values: nonEmptyValues }),
            },
          },
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null entries

  return { options, removedValues };
}

/**
 * Transforms GraphQL options response to a simplified object.
 * @param optionsData - The GraphQL options response data.
 * @returns A simplified object of options data.
 */
function transformGraphQLOptionsResponse(optionsData: any) {
  if (!optionsData?.edges) return {};

  return optionsData.edges.reduce((acc: any, edge: any) => {
    const optionId = edge.node.id;
    const localeData = edge.node.overridesForLocale;

    acc[optionId] = {
      displayName: localeData?.displayName || "",
      values: {},
    };

    // Transform values array into object with id as key
    if (localeData?.values) {
      localeData.values.forEach((value: any) => {
        acc[optionId].values[value.id] = value.label;
      });
    }

    return acc;
  }, {});
}

/**
 * Transforms GraphQL custom fields response to a simplified object.
 * @param customFieldsData - The GraphQL custom fields response data.
 * @returns A simplified object of custom fields data.
 */
function transformGraphQLCustomFieldsResponse(customFieldsData: any) {
  if (!customFieldsData?.edges) return {};

  return customFieldsData.edges.reduce((acc: any, edge: any) => {
    
    const customFieldId = edge.node.id;
    const localeData = edge.node.overrides;

    acc[customFieldId] = {
      name: localeData?.edges?.[0]?.node?.name || "",
      value: localeData?.edges?.[0]?.node?.value || "",
    };

    return acc;
  }, {});
}

/**
 * Transforms GraphQL custom fields data to locale-specific data.
 * @param customFieldsData - The GraphQL custom fields data.
 * @param localeCode - The locale code to transform data for.
 * @returns Transformed locale-specific custom fields data.
 */
function transformGraphQLCustomFieldsDataToLocaleData(
  customFieldsData: any
) {
  // Ensure we're working with an array
  const customFields = customFieldsData || [];

  return customFields.reduce((acc: any, field: any) => {
    const fieldId = field.node.id;
    const localeData = field.node?.overrides?.edges?.[0]?.node || {};

    acc[fieldId] = {
      name: localeData?.name || "",
      value: localeData?.value || "",
    };

    return acc;
  }, {});
}

/**
 * Transforms posted custom field data to match the GraphQL schema.
 * @param customFieldData - The posted custom field data.
 * @param channelId - The channel ID for the data.
 * @param locale - The locale for the data.
 * @returns An array of transformed custom field data.
 */
function transformPostedCustomFieldDataToGraphQLSchema(
  customFieldData: any,
  channelId: string,
  locale: string
) {
  if (!customFieldData.customFields) return [];

  return Object.entries(customFieldData.customFields).map(
    ([fieldId, fieldDetails]: [string, any]) => ({
      customFieldId: fieldId,
      overrides: [
        {
          channelLocaleOverrides: {
            context: {
              channelId: `bc/store/channel/${channelId}`,
              locale: locale,
            },
            data: {
              name: fieldDetails.name || null,
              value: fieldDetails.value || null,
              isVisible: true,
            },
          },
        },
      ],
    })
  );
}

/**
 * Transforms GraphQL modifiers data to locale-specific data.
 * @param modifiersData - The GraphQL modifiers data.
 * @param localeCode - The locale code to transform data for.
 * @returns Transformed locale-specific modifiers data.
 */
function transformGraphQLModifiersDataToLocaleData(
  modifiersData: any
) {
  // Ensure we're working with an array of edges
  const modifiers = modifiersData?.edges || modifiersData || [];

  return modifiers.reduce((acc: any, edge: any) => {
    const modifierId = edge.node.id;
    const localeModifier = edge.node.overridesForLocale;
    const modifierType = edge.node.__typename;

    acc[modifierId] = {
      __typename: modifierType,
      displayName: localeModifier?.displayName || "",
    };

    // Handle type-specific fields
    switch (modifierType) {
      case 'CheckboxProductModifier':
        acc[modifierId].fieldValue = localeModifier?.fieldValue || "";
        break;
      case 'TextFieldProductModifier':
      case 'MultilineTextFieldProductModifier':
        acc[modifierId].defaultValue = localeModifier?.defaultValue || "";
        break;
      case 'NumbersOnlyTextFieldProductModifier':
        acc[modifierId].defaultValueFloat = localeModifier?.defaultValueFloat || null;
        break;
      case 'DropdownProductModifier':
      case 'RadioButtonsProductModifier':
      case 'RectangleListProductModifier':
      case 'SwatchProductModifier':
      case 'PickListProductModifier':
        acc[modifierId].values = {};
        // Handle modifiers with values
        if (edge.node.values) {
          edge.node.values.forEach((value: any) => {
            const localeValue = localeModifier?.values?.find(
              (v: any) => v.id === value.id
            );
            acc[modifierId].values[value.id] = localeValue?.label || "";
          });
        }
        break;
      // FileUpload and DateField only need displayName, which is already set
    }

    return acc;
  }, {});
}

/**
 * Transforms posted modifier data to match the GraphQL schema.
 * @param modifierData - The posted modifier data containing modifiers with their display names and values
 * @returns {Object} An object containing:
 *   - modifiers: Array of transformed modifiers with their IDs, display names, and non-empty values
 *   - removedValues: Array of modifiers and values to remove from overrides
 */
function transformPostedModifierDataToGraphQLSchema(modifierData: any) {
  if (!modifierData.modifiers) return { modifiers: [], removedValues: [] };

  const removedValues: any[] = [];
  
  const modifiers = Object.entries(modifierData.modifiers)
    .map(([modifierId, modifierDetails]: [string, any]) => {
      // Track empty values
      const emptyValueIds: string[] = [];
      if (modifierDetails.values) {
        Object.entries(modifierDetails.values).forEach(([valueId, label]) => {
          if (!label || (label as string).trim() === '') {
            emptyValueIds.push(valueId);
          }
        });
      }

      if (emptyValueIds.length > 0 || (!modifierDetails.displayName || modifierDetails.displayName.trim() === '')) {
        const modifierType = modifierDetails.__typename;
        let data: any = {};

        // Handle different modifier types for removal
        switch (modifierType) {
          case 'CheckboxProductModifier':
            data = {
              checkbox: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.checkbox.fields.push("CHECKBOX_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (modifierDetails.fieldValue === '') {
              data.checkbox.fields.push("CHECKBOX_PRODUCT_MODIFIER_VALUE_FIELD");
            }
            break;
          case 'TextFieldProductModifier':
            data = {
              textField: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.textField.fields.push("TEXT_FIELD_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (modifierDetails.defaultValue === '') {
              data.textField.fields.push("TEXT_FIELD_PRODUCT_MODIFIER_DEFAULT_VALUE_FIELD");
            }
            break;
          case 'MultilineTextFieldProductModifier':
            data = {
              multiLineTextField: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.multiLineTextField.fields.push("MULTILINE_TEXT_FIELD_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (modifierDetails.defaultValue === '') {
              data.multiLineTextField.fields.push("MULTILINE_TEXT_FIELD_PRODUCT_MODIFIER_DEFAULT_VALUE_FIELD");
            }
            break;
          case 'NumbersOnlyTextFieldProductModifier':
            data = {
              numberField: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.numberField.fields.push("NUMBER_FIELD_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (modifierDetails.defaultValue === '') {
              data.numberField.fields.push("NUMBER_FIELD_PRODUCT_MODIFIER_DEFAULT_VALUE_FIELD");
            }
            break;
          case 'DateFieldProductModifier':
            data = {
              dateField: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.dateField.fields.push("DATE_FIELD_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            break;
          case 'FileUploadProductModifier':
            data = {
              fileUpload: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.fileUpload.fields.push("FILE_UPLOAD_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            break;
          case 'DropdownProductModifier':
            data = {
              dropdown: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.dropdown.fields.push("DROPDOWN_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (emptyValueIds.length > 0) {
              data.dropdown.values = {
                ids: emptyValueIds
              };
            }
            break;
          case 'RadioButtonsProductModifier':
            data = {
              radioButtons: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.radioButtons.fields.push("RADIO_BUTTONS_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (emptyValueIds.length > 0) {
              data.radioButtons.values = {
                ids: emptyValueIds
              };
            }
            break;
          case 'RectangleListProductModifier':
            data = {
              rectangleList: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.rectangleList.fields.push("RECTANGLE_LIST_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (emptyValueIds.length > 0) {
              data.rectangleList.values = {
                ids: emptyValueIds
              };
            }
            break;
          case 'SwatchProductModifier':
            data = {
              swatch: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.swatch.fields.push("SWATCH_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (emptyValueIds.length > 0) {
              data.swatch.values = {
                ids: emptyValueIds
              };
            }
            break;
          case 'PickListProductModifier':
            data = {
              pickList: {
                fields: []
              }
            };
            if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
              data.pickList.fields.push("PICK_LIST_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
            }
            if (emptyValueIds.length > 0) {
              data.pickList.values = {
                ids: emptyValueIds
              };
            }
            break;
          default:
            // If we don't know the type, try to infer it based on the data
            if (modifierDetails.values) {
              data = {
                dropdown: {
                  fields: []
                }
              };
              if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
                data.dropdown.fields.push("DROPDOWN_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
              }
              if (emptyValueIds.length > 0) {
                data.dropdown.values = {
                  ids: emptyValueIds
                };
              }
            } else {
              data = {
                textField: {
                  fields: []
                }
              };
              if (!modifierDetails.displayName || modifierDetails.displayName.trim() === '') {
                data.textField.fields.push("TEXT_FIELD_PRODUCT_MODIFIER_DISPLAY_NAME_FIELD");
              }
            }
        }

        // Only add to removedValues if we have fields or values to remove
        const dataType = Object.keys(data)[0];
        if (data[dataType].fields?.length > 0 || data[dataType].values?.ids?.length > 0) {
          removedValues.push({
            modifierId,
            data
          });
        }
      }

      // Only return the modifier if it has a non-empty display name or non-empty values
      const displayName = modifierDetails.displayName?.trim();
      if (displayName || (modifierDetails.values && Object.values(modifierDetails.values).some(v => v))) {
        const modifierType = modifierDetails.__typename;
        let data: any = {};

        // Handle different modifier types
        switch (modifierType) {
          case 'CheckboxProductModifier':
            data = {
              checkbox: {
                ...(displayName && { displayName }),
                // The GraphQL API returns an error if "value" field is not provided
                value: modifierDetails.fieldValue || ''
              }
            };
            break;
          case 'TextFieldProductModifier':
            data = {
              textField: {
                ...(displayName && { displayName }),
                ...(modifierDetails.defaultValue && { defaultValue: modifierDetails.defaultValue })
              }
            };
            break;
          case 'MultilineTextFieldProductModifier':
            data = {
              multiLineTextField: {
                ...(displayName && { displayName }),
                ...(modifierDetails.defaultValue && { defaultValue: modifierDetails.defaultValue })
              }
            };
            break;
          case 'NumbersOnlyTextFieldProductModifier':
            data = {
              numberField: {
                ...(displayName && { displayName }),
                ...(modifierDetails.defaultValueFloat && { defaultValue: parseFloat(modifierDetails.defaultValueFloat) })
              }
            };
            break;
          case 'DateFieldProductModifier':
            data = {
              dateField: {
                displayName
              }
            };
            break;
          case 'FileUploadProductModifier':
            data = {
              fileUpload: {
                displayName
              }
            };
            break;
          case 'DropdownProductModifier':
            data = {
              dropdown: {
                ...(displayName && { displayName }),
                ...(modifierDetails.values && { values: Object.entries(modifierDetails.values)
                  .filter(([_, label]) => label && (label as string).trim())
                  .map(([valueId, label]) => ({ valueId, label }))
                })
              }
            };
            break;
          case 'RadioButtonsProductModifier':
            data = {
              radioButtons: {
                ...(displayName && { displayName }),
                ...(modifierDetails.values && { values: Object.entries(modifierDetails.values)
                  .filter(([_, label]) => label && (label as string).trim())
                  .map(([valueId, label]) => ({ valueId, label }))
                })
              }
            };
            break;
          case 'RectangleListProductModifier':
            data = {
              rectangleList: {
                ...(displayName && { displayName }),
                ...(modifierDetails.values && { values: Object.entries(modifierDetails.values)
                  .filter(([_, label]) => label && (label as string).trim())
                  .map(([valueId, label]) => ({ valueId, label }))
                })
              }
            };
            break;
          case 'SwatchProductModifier':
            data = {
              swatch: {
                ...(displayName && { displayName }),
                ...(modifierDetails.values && { values: Object.entries(modifierDetails.values)
                  .filter(([_, label]) => label && (label as string).trim())
                  .map(([valueId, label]) => ({ valueId, label }))
                })
              }
            };
            break;
          case 'PickListProductModifier':
            data = {
              pickList: {
                ...(displayName && { displayName }),
                ...(modifierDetails.values && { values: Object.entries(modifierDetails.values)
                  .filter(([_, label]) => label && (label as string).trim())
                  .map(([valueId, label]) => ({ valueId, label }))
                })
              }
            };
            break;
          default:
            // If we don't know the type, try to infer it based on the data
            if (modifierDetails.values) {
              data = {
                dropdown: {
                  ...(displayName && { displayName }),
                  ...(modifierDetails.values && { values: Object.entries(modifierDetails.values)
                    .filter(([_, label]) => label && (label as string).trim())
                    .map(([valueId, label]) => ({ valueId, label }))
                  })
                }
              };
            } else {
              data = {
                textField: {
                  displayName
                }
              };
            }
        }

        return {
          modifierId,
          data
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null entries

  return { modifiers, removedValues };
}

/**
 * Transforms GraphQL modifiers response to a simplified object.
 * @param modifiersData - The GraphQL modifiers response data.
 * @returns A simplified object of modifiers data.
 */
function transformGraphQLModifiersResponse(modifiersData: any) {
  if (!modifiersData?.edges) return {};

  return modifiersData.edges.reduce((acc: any, edge: any) => {
    const modifierId = edge.node.id;
    const localeData = edge.node.overridesForLocale;
    const modifierType = edge.node.__typename;

    acc[modifierId] = {
      __typename: modifierType,
      displayName: localeData?.displayName || "",
    };

    // Handle type-specific fields
    switch (modifierType) {
      case 'CheckboxProductModifier':
        acc[modifierId].fieldValue = localeData?.fieldValue || "";
        break;
      case 'TextFieldProductModifier':
      case 'MultilineTextFieldProductModifier':
        acc[modifierId].defaultValue = localeData?.defaultValue || "";
        break;
      case 'NumbersOnlyTextFieldProductModifier':
        acc[modifierId].defaultValueFloat = localeData?.defaultValueFloat || null;
        break;
      case 'DropdownProductModifier':
      case 'RadioButtonsProductModifier':
      case 'RectangleListProductModifier':
      case 'SwatchProductModifier':
      case 'PickListProductModifier':
        acc[modifierId].values = {};
        // Transform values array into object with id as key
        if (localeData?.values) {
          localeData.values.forEach((value: any) => {
            acc[modifierId].values[value.id] = value.label;
          });
        }
        break;
      // FileUpload and DateField only need displayName, which is already set
    }

    return acc;
  }, {});
}

async function getChannelLocales(context: string, channelId: string): Promise<LocaleInfo> {
  const response = await fetch(`${process.env.APP_ORIGIN}/api/channels?context=${context}`);
  if (!response.ok) {
    throw new Error('Failed to fetch channel data');
  }
  
  const channels: ChannelData[] = await response.json();
  const channel = channels.find((c) => c.channel_id.toString() === channelId);
  
  if (!channel) {
    return {
      defaultLocale: fallbackLocale.code,
      availableLocales: [fallbackLocale]
    };
  }

  return {
    defaultLocale: channel.default_locale,
    availableLocales: channel.locales
  };
}

/**
 * Handles GET requests to retrieve product locale data.
 * @param request - The incoming request object.
 * @param params - The request parameters containing the product ID.
 * @returns A response with the product locale data or an error message.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ pid: string }> }) {
  const params = await props.params;
  const pid = params.pid;
  const searchParams = request.nextUrl.searchParams;
  const context = searchParams.get("context") ?? "";
  const channelId = searchParams.get("channel_id") ?? null;

  if (!channelId) {
    return new Response("Channel ID missing", {
      status: 422,
    });
  }

  try {
    const { defaultLocale, availableLocales } = await getChannelLocales(context, channelId);
    const selectedLocale = searchParams.get("locale") ?? (availableLocales?.[1]?.code || availableLocales[0].code);
    const { accessToken, storeHash } = await getSessionFromContext(context);
    const graphQLClient = createGraphQLClient(accessToken, storeHash);

    // NEW: Use new Translations API to get translations (with error handling)
    // Make both API calls in parallel for better performance
    let translationMap: Record<string, string> = {};
    
    const [translationsDataResult, gqlDataResult] = await Promise.allSettled([
      // New API call - wrapped in promise to handle failures gracefully
      graphQLClient.getProductTranslations({
        channelId: Number(channelId),
        locale: selectedLocale,
        productId: Number(pid),
      }).catch((error) => {
        console.warn(`Failed to fetch translations from new API for product ${pid}, falling back to old API:`, error);
        return null; // Return null on failure to allow graceful fallback
      }),
      // Old API call - required for options/modifiers/customFields
      graphQLClient.getProductLocaleData({
        pid: Number(pid),
        channelId: Number(channelId),
        locale: selectedLocale,
        availableLocales,
        defaultLocale,
      })
    ]);

    // Handle translations data from new API (if available)
    if (translationsDataResult.status === 'fulfilled' && translationsDataResult.value) {
      const translationNode = translationsDataResult.value.edges?.[0]?.node;
      if (translationNode?.fields) {
        translationNode.fields.forEach((field: { fieldName: string; original: string; translation: string | null }) => {
          translationMap[field.fieldName] = field.translation || field.original;
        });
      }
    }

    // Handle product data from old API (required)
    if (gqlDataResult.status === 'rejected') {
      return new Response(`Failed to fetch product data: ${gqlDataResult.reason}`, {
        status: 500,
      });
    }

    const gqlData = gqlDataResult.value;
    if (!gqlData?.id) {
      return new Response(`Product ID ${pid} not found or invalid GraphQL response`, {
        status: 404,
      });
    }

    const productNode = gqlData;

    // Build normalized product data with translations from new API, fallback to old API data
    const normalizedProductData = {
      name: translationMap['name'] || productNode.basicInformation?.name || '',
      description: translationMap['description'] || productNode.basicInformation?.description || '',
      pageTitle: translationMap['page_title'] || productNode.seoInformation?.pageTitle || '',
      metaDescription: translationMap['meta_description'] || productNode.seoInformation?.metaDescription || '',
      preOrderMessage: translationMap['pre_order_message'] || productNode.preOrderSettings?.message || '',
      warranty: translationMap['warranty_information'] || productNode.storefrontDetails?.warranty || '',
      availabilityDescription: translationMap['availability_text'] || productNode.storefrontDetails?.availabilityDescription || '',
      searchKeywords: translationMap['search_keywords'] || productNode.storefrontDetails?.searchKeywords || '',
      options: {
        edges: (productNode.options?.edges || []).map((edge: any) => ({
          node: {
            id: edge.node?.id,
            displayName: edge.node?.displayName,
            values: (edge.node?.values || []).map((value: any) => ({
              id: value?.id,
              label: value?.label,
            })),
          },
        })),
      },
      modifiers: {
        edges: (productNode.modifiers?.edges || []).map((edge: any) => {
          const baseNode = {
            id: edge.node?.id,
            __typename: edge.node?.__typename,
            displayName: edge.node?.displayName,
            values: (edge.node?.values || []).map((value: any) => ({
              id: value?.id,
              label: value?.label,
            })),
          };

          // Handle type-specific fields
          switch (edge.node?.__typename) {
            case 'CheckboxProductModifier':
              return {
                node: {
                  ...baseNode,
                  fieldValue: edge.node?.fieldValue || '',
                  checkedByDefault: edge.node?.checkedByDefault || false,
                },
              };
            case 'TextFieldProductModifier':
            case 'MultilineTextFieldProductModifier':
              return {
                node: {
                  ...baseNode,
                  defaultValue: edge.node?.defaultValue || '',
                },
              };
            case 'NumbersOnlyTextFieldProductModifier':
              return {
                node: {
                  ...baseNode,
                  defaultValueFloat: edge.node?.defaultValueFloat || null,
                },
              };
            default:
              return { node: baseNode };
          }
        }),
      },
      customFields: {
        edges: (productNode.customFields?.edges || []).map((edge: any) => ({
          node: {
            id: edge.node?.id,
            name: edge.node?.name,
            value: edge.node?.value,
            overridesForLocale: edge.node?.overridesForLocale,
          },
        })),
      },
      localeData: {} as { [key: string]: any },
    };

    // Build locale data from translations
    // Use translations from new API for basic fields, old API for options/modifiers/customFields
    normalizedProductData.localeData[selectedLocale] = {
      name: translationMap['name'] || null,
      description: translationMap['description'] || null,
      pageTitle: translationMap['page_title'] || null,
      metaDescription: translationMap['meta_description'] || null,
      preOrderMessage: translationMap['pre_order_message'] || null,
      warranty: translationMap['warranty_information'] || null,
      availabilityDescription: translationMap['availability_text'] || null,
      searchKeywords: translationMap['search_keywords'] || null,
      // Options, modifiers, customFields still use old API structure
      // Note: These transform functions already exist in the route file
      options: transformGraphQLOptionsDataToLocaleData(gqlData?.options?.edges),
      modifiers: transformGraphQLModifiersDataToLocaleData(gqlData?.modifiers?.edges),
      customFields: transformGraphQLCustomFieldsDataToLocaleData(gqlData?.customFields?.edges),
    };

    return Response.json(normalizedProductData);
  } catch (error: any) {
    const { message, response } = error;

    return new Response(message || "Authentication failed, please re-install", {
      status: response?.status || 500,
    });
  }
}

/**
 * Handles PUT requests to update product locale data.
 * @param request - The incoming request object.
 * @param params - The request parameters containing the product ID.
 * @returns A response with the updated product data or an error message.
 */
export async function PUT(request: NextRequest, props: { params: Promise<{ pid: string }> }) {
  const params = await props.params;
  const body = (await request.json()) as any;
  const pid = params.pid;
  const searchParams = request.nextUrl.searchParams;
  const context = searchParams.get("context") ?? "";
  const channelId = searchParams.get("channel_id") ?? null;

  if (!channelId) {
    return new Response("Channel ID missing", {
      status: 422,
    });
  }

  try {
    const { defaultLocale } = await getChannelLocales(context, channelId);
    let result: any;
    const { accessToken, storeHash } = await getSessionFromContext(context);
    const graphQLClient = createGraphQLClient(accessToken, storeHash);

    if (body["locale"] && body.locale !== defaultLocale) {
      // NEW: Use new Translations API for basic product fields
      const fields: Array<{ fieldName: string; value: string }> = [];

      // Map form data to new API field names (validate and add fields)
      if (body.name !== undefined && typeof body.name === 'string') {
        fields.push({ fieldName: 'name', value: body.name });
      }
      if (body.description !== undefined && typeof body.description === 'string') {
        fields.push({ fieldName: 'description', value: body.description });
      }
      if (body.pageTitle !== undefined && typeof body.pageTitle === 'string') {
        fields.push({ fieldName: 'page_title', value: body.pageTitle });
      }
      if (body.metaDescription !== undefined && typeof body.metaDescription === 'string') {
        fields.push({ fieldName: 'meta_description', value: body.metaDescription });
      }
      if (body.preOrderMessage !== undefined && typeof body.preOrderMessage === 'string') {
        fields.push({ fieldName: 'pre_order_message', value: body.preOrderMessage });
      }
      if (body.warranty !== undefined && typeof body.warranty === 'string') {
        fields.push({ fieldName: 'warranty_information', value: body.warranty });
      }
      if (body.availabilityDescription !== undefined && typeof body.availabilityDescription === 'string') {
        fields.push({ fieldName: 'availability_text', value: body.availabilityDescription });
      }
      if (body.searchKeywords !== undefined && typeof body.searchKeywords === 'string') {
        fields.push({ fieldName: 'search_keywords', value: body.searchKeywords });
      }

      // Update basic fields with new API (with error handling)
      if (fields.length > 0) {
        try {
          await graphQLClient.updateProductTranslations({
            channelId: Number(channelId),
            locale: body.locale,
            productId: Number(pid),
            fields: fields,
          });
        } catch (error) {
          console.error(`Failed to update translations with new API for product ${pid}:`, error);
          // Continue with old API updates - partial update is better than complete failure
          // Log error but don't throw to allow options/modifiers to still update
        }
      }

      // Options, modifiers, and custom fields still use old API
      const optionData = createGraphFieldsFromPostData(body, "options");
      const modifierData = createGraphFieldsFromPostData(body, "modifiers");
      const customFieldData = createGraphFieldsFromPostData(body, "customFields");

      // Get fields to remove for each section
      const basicInfoFieldsToRemove = getBasicInformationFieldsToRemove({
        name: body.name,
        description: body.description
      });
      const seoFieldsToRemove = getSeoInformationFieldsToRemove({
        pageTitle: body.pageTitle,
        metaDescription: body.metaDescription
      });
      const storefrontFieldsToRemove = getStorefrontDetailsFieldsToRemove({
        warranty: body.warranty,
        availabilityDescription: body.availabilityDescription,
        searchKeywords: body.searchKeywords
      });
      const preOrderFieldsToRemove = getPreOrderSettingsFieldsToRemove({
        preOrderMessage: body.preOrderMessage
      });
      const customFieldsToRemove = getCustomFieldsToRemove(customFieldData);

      // Map old API field names to new API field names for deletion
      // Note: Field names must match what getBasicInformationFieldsToRemove, etc. return
      const oldToNewFieldNameMap: Record<string, string> = {
        'PRODUCT_NAME_FIELD': 'name',
        'PRODUCT_DESCRIPTION_FIELD': 'description',
        'PRODUCT_PAGE_TITLE_FIELD': 'page_title',
        'PRODUCT_META_DESCRIPTION_FIELD': 'meta_description',
        'PRODUCT_WARRANTY': 'warranty_information',
        'PRODUCT_AVAILABILITY_DESCRIPTION_FIELD': 'availability_text',
        'PRODUCT_SEARCH_KEYWORDS': 'search_keywords',
        'PRODUCT_PRE_ORDER_MESSAGE': 'pre_order_message',
      };

      // Collect all basic fields to delete using new API
      const fieldsToDelete: string[] = [];
      
      // Map basic info fields
      basicInfoFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });
      
      // Map SEO fields
      seoFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });
      
      // Map storefront fields
      storefrontFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });
      
      // Map pre-order fields
      preOrderFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });

      // Delete basic fields using new API
      if (fieldsToDelete.length > 0) {
        try {
          await graphQLClient.deleteProductTranslations({
            channelId: Number(channelId),
            locale: body.locale,
            productId: Number(pid),
            fields: fieldsToDelete,
          });
        } catch (error) {
          console.error(`Failed to delete translations with new API for product ${pid}:`, error);
          // Continue with other updates - partial update is better than complete failure
        }
      }

      // Delete custom fields using new API
      if (customFieldsToRemove.length > 0) {
        try {
          await graphQLClient.deleteCustomFieldTranslations({
            channelId: Number(channelId),
            locale: body.locale,
            customFields: customFieldsToRemove.map(field => ({
              customFieldId: field.customFieldId,
              fields: field.fields
            })),
          });
        } catch (error) {
          console.error(`Failed to delete custom field translations with new API for product ${pid}:`, error);
          // Continue with other updates - partial update is better than complete failure
        }
      }

      // Update options/modifiers/customFields with old API (existing code)
      // Note: Custom fields removals now use new API, but updates still use old API
      const graphVariables = {
        channelId: `bc/store/channel/${channelId}`,
        locale: body.locale,
        removedOptionsInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            options: transformPostedOptionDataToGraphQLSchema(optionData).removedValues
          }
        },
        optionsInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            options: transformPostedOptionDataToGraphQLSchema(optionData).options,
          },
        },
        removedModifiersInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            modifiers: transformPostedModifierDataToGraphQLSchema(modifierData).removedValues
          }
        },
        modifiersInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            modifiers: transformPostedModifierDataToGraphQLSchema(modifierData).modifiers,
          },
        },
        customFieldsInput: {
          productId: `bc/store/product/${pid}`,
          data: transformPostedCustomFieldDataToGraphQLSchema(
            customFieldData,
            channelId,
            body.locale
          ),
        },
      };

      // Update options/modifiers/customFields with old API
      try {
        await graphQLClient.NOTADA_updateProductLocaleData(graphVariables);
      } catch (error) {
        console.error(`Failed to update options/modifiers/customFields with old API for product ${pid}:`, error);
        // If this fails, we still want to return the basic fields that were updated
        // Log error but continue to return partial result
      }

      // Fetch complete updated data to return in response
      const { defaultLocale: updatedDefaultLocale, availableLocales: updatedLocales } = await getChannelLocales(context, channelId);
      
      // Fetch updated product data (includes options/modifiers/customFields)
      const updatedGqlData = await graphQLClient.getProductLocaleData({
        pid: Number(pid),
        channelId: Number(channelId),
        locale: body.locale,
        availableLocales: updatedLocales,
        defaultLocale: updatedDefaultLocale,
      });

      // Fetch updated translations from new API (with error handling)
      let updatedTranslationMap: Record<string, string> = {};
      try {
        const updatedTranslationsData = await graphQLClient.getProductTranslations({
          channelId: Number(channelId),
          locale: body.locale,
          productId: Number(pid),
        });
        
        const updatedTranslationNode = updatedTranslationsData.edges?.[0]?.node;
        if (updatedTranslationNode?.fields) {
          updatedTranslationNode.fields.forEach((field: { fieldName: string; translation: string | null; original: string }) => {
            updatedTranslationMap[field.fieldName] = field.translation || field.original;
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch updated translations, using old API data:`, error);
        // Fallback to old API data
        if (updatedGqlData.overridesForLocale) {
          updatedTranslationMap['name'] = updatedGqlData.overridesForLocale.basicInformation?.name || '';
          updatedTranslationMap['description'] = updatedGqlData.overridesForLocale.basicInformation?.description || '';
          updatedTranslationMap['page_title'] = updatedGqlData.overridesForLocale.seoInformation?.pageTitle || '';
          updatedTranslationMap['meta_description'] = updatedGqlData.overridesForLocale.seoInformation?.metaDescription || '';
          updatedTranslationMap['pre_order_message'] = updatedGqlData.overridesForLocale.preOrderSettings?.message || '';
          updatedTranslationMap['warranty_information'] = updatedGqlData.overridesForLocale.storefrontDetails?.warranty || '';
          updatedTranslationMap['availability_text'] = updatedGqlData.overridesForLocale.storefrontDetails?.availabilityDescription || '';
          updatedTranslationMap['search_keywords'] = updatedGqlData.overridesForLocale.storefrontDetails?.searchKeywords || '';
        }
      }

      // Build complete result with all fields
      result = {
        name: updatedTranslationMap['name'] || updatedGqlData.overridesForLocale?.basicInformation?.name || null,
        description: updatedTranslationMap['description'] || updatedGqlData.overridesForLocale?.basicInformation?.description || null,
        pageTitle: updatedTranslationMap['page_title'] || updatedGqlData.overridesForLocale?.seoInformation?.pageTitle || null,
        metaDescription: updatedTranslationMap['meta_description'] || updatedGqlData.overridesForLocale?.seoInformation?.metaDescription || null,
        preOrderMessage: updatedTranslationMap['pre_order_message'] || updatedGqlData.overridesForLocale?.preOrderSettings?.message || null,
        warranty: updatedTranslationMap['warranty_information'] || updatedGqlData.overridesForLocale?.storefrontDetails?.warranty || null,
        availabilityDescription: updatedTranslationMap['availability_text'] || updatedGqlData.overridesForLocale?.storefrontDetails?.availabilityDescription || null,
        searchKeywords: updatedTranslationMap['search_keywords'] || updatedGqlData.overridesForLocale?.storefrontDetails?.searchKeywords || null,
        // Include options, modifiers, customFields from updated product data
        // Note: These transform functions already exist in the route file
        options: transformGraphQLOptionsResponse(updatedGqlData?.options),
        modifiers: transformGraphQLModifiersResponse(updatedGqlData?.modifiers),
        customFields: transformGraphQLCustomFieldsResponse(updatedGqlData?.customFields),
      };
      // } else {
      //   // For basic product information updates, use the new simplified interface
      //   const gqlData = await graphQLClient.updateProductLocaleData({
      //     locale: body.locale,
      //     channelId: Number(channelId),
      //     productId: Number(pid),
      //     productData: {
      //       name: basicInformationGraphData.name,
      //       description: basicInformationGraphData.description,
      //       pageTitle: seoGraphData.pageTitle,
      //       metaDescription: seoGraphData.metaDescription,
      //       preOrderMessage: preOrderGraphData.preOrderMessage,
      //       warranty: storefrontGraphData.warranty,
      //       availabilityDescription: storefrontGraphData.availabilityDescription,
      //       searchKeywords: storefrontGraphData.searchKeywords
      //     }
      //   });

      //   result = {
      //     ...gqlData?.setProductBasicInformation?.product?.overridesForLocale?.basicInformation,
      //     ...gqlData?.setProductSeoInformation?.product?.overridesForLocale?.seoInformation,
      //     preOrderMessage: gqlData?.setProductPreOrderSettings?.product?.overridesForLocale?.preOrderSettings?.message,
      //     ...gqlData?.setProductStorefrontDetails?.product?.overridesForLocale?.storefrontDetails,
      //   };
      // }
    } else {
      // This is for the default lang, so update the main product
      // (currently the front-end does not allow this)
      const bigcommerce = new BigCommerceRestClient({
        accessToken,
        storeHash,
      });
      const { data: updatedProduct } = await bigcommerce.put(`/v3/catalog/products/${pid}`, body);
      result = updatedProduct;
    }

    return Response.json(result);
  } catch (error: any) {
    const { message, response } = error;

    return new Response(message || "Authentication failed, please re-install", {
      status: response?.status || 500,
    });
  }
}

// export const runtime = 'edge';

