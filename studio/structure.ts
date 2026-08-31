import { singletonDocumentIds } from "./schemaTypes";

export const structure = (S: any) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home")
        .child(
          S.list()
            .title("Home")
            .items([
              S.documentListItem()
                .title("Site settings")
                .schemaType("siteSettings")
                .id(singletonDocumentIds.siteSettings),
              S.documentListItem()
                .title("Home page")
                .schemaType("homePage")
                .id(singletonDocumentIds.homePage),
            ])
        ),
      S.listItem()
        .title("Current Event")
        .child(
          S.documentList()
            .title("Current Event")
            .filter('_type == "edition" && isCurrent == true')
            .defaultOrdering([{ field: "year", direction: "desc" }])
        ),
      S.listItem()
        .title("Speakers")
        .child(S.documentTypeList("person").title("Speakers")),
      S.listItem()
        .title("Program")
        .child(
          S.list()
            .title("Program")
            .items([
              S.documentTypeListItem("edition").title("Editions"),
              S.documentTypeListItem("track").title("Tracks"),
              S.documentTypeListItem("session").title("Sessions"),
            ])
        ),
      S.listItem()
        .title("Partners")
        .child(
          S.list()
            .title("Partners")
            .items([
              S.documentTypeListItem("partner").title("Partners"),
              S.documentTypeListItem("organization").title("Organizations"),
            ])
        ),
      S.listItem()
        .title("Interviews")
        .child(S.documentTypeList("interview").title("Interviews")),
      S.listItem()
        .title("Media")
        .child(
          S.list()
            .title("Media")
            .items([
              S.documentTypeListItem("summitDocument").title("Documents"),
              S.documentTypeListItem("person").title("People"),
            ])
        ),
      S.listItem()
        .title("Past Events")
        .child(S.documentTypeList("pastEdition").title("Past Events")),
    ]);
