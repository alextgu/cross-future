import { defineField, defineType } from "sanity";

export default defineType({
  name: "mediaAsset",
  title: "Media asset",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (Rule: any) => Rule.required(),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "text",
          rows: 2,
        }),
        defineField({
          name: "credit",
          title: "Credit",
          type: "string",
        }),
      ],
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "aspect",
      title: "Aspect ratio",
      type: "string",
    }),
  ],
});
