import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: "username",
      type: "text",
      required: false, // OAuth users may not have username initially
      unique: true,
    },
    {
      name: "name",
      type: "text",
      label: "Full Name",
      required: false,
    },
    {
      name: "roles",
      type: "select",
      defaultValue: ["user"],
      hasMany: true,
      options: ["super-admin", "user"],
      admin: {
        position: "sidebar",
      },
    },
    // OAuth provider fields
    {
      name: "oauthProviders",
      type: "group",
      fields: [
        {
          name: "google",
          type: "group",
          fields: [
            {
              name: "id",
              type: "text",
              label: "Google ID",
            },
            {
              name: "email",
              type: "email",
              label: "Google Email",
            },
          ],
        },
        {
          name: "facebook",
          type: "group",
          fields: [
            {
              name: "id",
              type: "text",
              label: "Facebook ID",
            },
            {
              name: "email",
              type: "email",
              label: "Facebook Email",
            },
          ],
        },
      ],
    },
    {
      name: "profilePicture",
      type: "text",
      label: "Profile Picture URL",
    },
    // Shipping addresses (multiple addresses per user)
    {
      name: "shippingAddresses",
      type: "array",
      label: "Shipping Addresses",
      admin: {
        description: "Manage multiple shipping addresses. Set one as default for faster checkout.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          label: "Address Label",
          required: true,
          defaultValue: "Home",
          admin: {
            description: "e.g., Home, Work, Office",
          },
        },
        {
          name: "isDefault",
          type: "checkbox",
          label: "Default Address",
          defaultValue: false,
          admin: {
            description: "Set as default shipping address",
          },
        },
        {
          name: "fullName",
          type: "text",
          label: "Full Name",
          required: true,
          admin: {
            description: "Recipient's full name",
          },
        },
        {
          name: "phone",
          type: "text",
          label: "Phone Number",
          required: true,
          admin: {
            description: "Contact phone number (e.g., +1-555-123-4567)",
          },
        },
        {
          name: "street",
          type: "text",
          label: "Street Address",
          required: true,
          admin: {
            description: "Street address, apartment, suite, etc.",
          },
        },
        {
          name: "city",
          type: "text",
          label: "City",
          required: true,
        },
        {
          name: "state",
          type: "select",
          label: "State",
          required: true,
          options: [
            { label: "Alabama", value: "AL" },
            { label: "Alaska", value: "AK" },
            { label: "Arizona", value: "AZ" },
            { label: "Arkansas", value: "AR" },
            { label: "California", value: "CA" },
            { label: "Colorado", value: "CO" },
            { label: "Connecticut", value: "CT" },
            { label: "Delaware", value: "DE" },
            { label: "Florida", value: "FL" },
            { label: "Georgia", value: "GA" },
            { label: "Hawaii", value: "HI" },
            { label: "Idaho", value: "ID" },
            { label: "Illinois", value: "IL" },
            { label: "Indiana", value: "IN" },
            { label: "Iowa", value: "IA" },
            { label: "Kansas", value: "KS" },
            { label: "Kentucky", value: "KY" },
            { label: "Louisiana", value: "LA" },
            { label: "Maine", value: "ME" },
            { label: "Maryland", value: "MD" },
            { label: "Massachusetts", value: "MA" },
            { label: "Michigan", value: "MI" },
            { label: "Minnesota", value: "MN" },
            { label: "Mississippi", value: "MS" },
            { label: "Missouri", value: "MO" },
            { label: "Montana", value: "MT" },
            { label: "Nebraska", value: "NE" },
            { label: "Nevada", value: "NV" },
            { label: "New Hampshire", value: "NH" },
            { label: "New Jersey", value: "NJ" },
            { label: "New Mexico", value: "NM" },
            { label: "New York", value: "NY" },
            { label: "North Carolina", value: "NC" },
            { label: "North Dakota", value: "ND" },
            { label: "Ohio", value: "OH" },
            { label: "Oklahoma", value: "OK" },
            { label: "Oregon", value: "OR" },
            { label: "Pennsylvania", value: "PA" },
            { label: "Rhode Island", value: "RI" },
            { label: "South Carolina", value: "SC" },
            { label: "South Dakota", value: "SD" },
            { label: "Tennessee", value: "TN" },
            { label: "Texas", value: "TX" },
            { label: "Utah", value: "UT" },
            { label: "Vermont", value: "VT" },
            { label: "Virginia", value: "VA" },
            { label: "Washington", value: "WA" },
            { label: "West Virginia", value: "WV" },
            { label: "Wisconsin", value: "WI" },
            { label: "Wyoming", value: "WY" },
            { label: "District of Columbia", value: "DC" },
          ],
        },
        {
          name: "zipcode",
          type: "text",
          label: "ZIP Code",
          required: true,
          admin: {
            description: "5-digit ZIP code or ZIP+4 format (e.g., 12345 or 12345-6789)",
          },
        },
      ],
    },
    // Add more fields as needed
  ],
}
