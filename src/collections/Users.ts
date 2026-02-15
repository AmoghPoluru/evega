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
    // Add more fields as needed
  ],
}
