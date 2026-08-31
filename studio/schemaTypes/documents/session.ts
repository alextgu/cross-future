import { defineField, defineType } from "sanity";

const sessionStatuses = [
  { title: "Proposed", value: "proposed" },
  { title: "Confirmed", value: "confirmed" },
  { title: "Cancelled", value: "cancelled" },
];

const slugValidation = (Rule: any) =>
  Rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    name: "slug",
    invert: false,
  });

export default defineType({
  name: "session",
  title: "Session",
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
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: slugValidation }),
    defineField({ name: "edition", title: "Edition", type: "reference", to: [{ type: "edition" }], validation: (Rule: any) => Rule.required() }),
    defineField({ name: "track", title: "Track", type: "reference", to: [{ type: "track" }], validation: (Rule: any) => Rule.required() }),
    defineField({ name: "startsAt", title: "Starts at", type: "datetime", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "endsAt", title: "Ends at", type: "datetime", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "room", title: "Room", type: "string" }),
    defineField({
      name: "speakers",
      title: "Speakers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "person" }] }],
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: sessionStatuses },
      validation: (Rule: any) => Rule.required().valid(...sessionStatuses.map((item) => item.value)),
    }),
    defineField({ name: "code", title: "Code", type: "string" }),
    defineField({ name: "categoryLabel", title: "Category label", type: "string" }),
    defineField({ name: "speakerLabel", title: "Speaker label", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "outcomes", title: "Outcomes", type: "array", of: [{ type: "string" }] }),
  ],
});
