import { defineField, defineType } from "sanity";

const chainStages = [
  { title: "Grid interface", value: "grid-interface" },
  { title: "Network", value: "network" },
  { title: "Facility", value: "facility" },
  { title: "Scale", value: "scale" },
];

export default defineType({
  name: "track",
  title: "Track",
  type: "document",
  fields: [
    defineField({
      name: "migrationKey",
      title: "Migration key",
      type: "string",
      readOnly: true,
      hidden: true,
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({ name: "code", title: "Code", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule: any) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3, validation: (Rule: any) => Rule.required() }),
    defineField({
      name: "chainStage",
      title: "Chain stage",
      type: "string",
      options: { list: chainStages },
      validation: (Rule: any) => Rule.required().valid(...chainStages.map((item) => item.value)),
    }),
  ],
});
