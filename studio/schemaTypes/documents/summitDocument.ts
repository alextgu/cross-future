import { defineField, defineType } from "sanity";

const documentTypes = [
  { title: "Certificate", value: "certificate" },
  { title: "Letter", value: "letter" },
];

export default defineType({
  name: "summitDocument",
  title: "Document",
  type: "document",
  fields: [
    defineField({
      name: "migrationKey",
      title: "Migration key",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: { list: documentTypes },
      validation: (Rule: any) => Rule.required().valid(...documentTypes.map((item) => item.value)),
    }),
    defineField({ name: "image", title: "Image", type: "mediaAsset", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "issuer", title: "Issuer", type: "string", validation: (Rule: any) => Rule.required() }),
  ],
});
