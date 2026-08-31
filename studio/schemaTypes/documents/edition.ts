import { defineField, defineType } from "sanity";

const editionStatusValues = [
  { title: "Draft", value: "draft" },
  { title: "Announced", value: "announced" },
  { title: "Registration open", value: "registration-open" },
  { title: "Registration closed", value: "registration-closed" },
  { title: "Archived", value: "archived" },
];

const slugValidation = (Rule: any) =>
  Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    name: "slug",
    invert: false,
  });

export default defineType({
  name: "edition",
  title: "Edition",
  type: "document",
  fields: [
    defineField({
      name: "migrationKey",
      title: "Migration key",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: slugValidation,
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule: any) => Rule.required().integer(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "thesis",
      title: "Thesis",
      type: "text",
      rows: 4,
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "startsAt",
      title: "Starts at",
      type: "datetime",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "endsAt",
      title: "Ends at",
      type: "datetime",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "timezone",
      title: "Timezone",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "venue",
      title: "Venue",
      type: "object",
      fields: [
        defineField({ name: "name", title: "Name", type: "string", validation: (Rule: any) => Rule.required() }),
        defineField({ name: "city", title: "City", type: "string", validation: (Rule: any) => Rule.required() }),
        defineField({ name: "region", title: "Region", type: "string", validation: (Rule: any) => Rule.required() }),
        defineField({ name: "country", title: "Country", type: "string", validation: (Rule: any) => Rule.required() }),
      ],
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: editionStatusValues },
      validation: (Rule: any) => Rule.required().valid(...editionStatusValues.map((item) => item.value)),
    }),
    defineField({
      name: "isCurrent",
      title: "Current edition",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
          validation: (Rule: any) => Rule.required(),
        }),
      ],
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({ name: "editionNumber", title: "Edition number", type: "number" }),
    defineField({ name: "format", title: "Format", type: "string" }),
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "object",
      fields: [
        defineField({ name: "lat", title: "Latitude", type: "number" }),
        defineField({ name: "lng", title: "Longitude", type: "number" }),
      ],
    }),
    defineField({ name: "contactEmail", title: "Contact email", type: "string" }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (Rule: any) => Rule.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (Rule: any) => Rule.required() }),
          ],
        },
      ],
    }),
    defineField({
      name: "heroFigure",
      title: "Hero figure",
      type: "object",
      fields: [
        defineField({ name: "imageUrl", title: "Image URL", type: "url" }),
        defineField({ name: "alt", title: "Alt text", type: "string" }),
        defineField({ name: "label", title: "Label", type: "string" }),
      ],
    }),
    defineField({ name: "heroStatement", title: "Hero statement", type: "text", rows: 3 }),
  ],
});
