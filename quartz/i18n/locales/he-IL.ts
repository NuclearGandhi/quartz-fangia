import { Translation } from "./definition"

export default {
  propertyDefaults: {
    title: "חסר כותרת",
    description: "לא מסופק תיאור",
  },
  components: {
    callout: {
      note: "הערה",
      abstract: "סיכום",
      info: "מידע",
      todo: "לעשות",
      tip: "עצה",
      success: "הצחלה",
      question: "שאלה",
      warning: "אזהרה",
      failure: "כישלון",
      danger: "סכנה",
      bug: "באג",
      example: "דוגמא",
      quote: "ציטוט",
    },
    backlinks: {
      title: "עמודים המציינים את העמוד הזה",
      noBacklinksFound: "עמוד זה לא מצויין באף עמוד אחר",
    },
    themeToggle: {
      lightMode: "Light mode",
      darkMode: "Dark mode",
    },
    explorer: {
      title: "מגלה תכנים",
    },
    footer: {
      createdWith: "נוצר עם",
    },
    graph: {
      title: "תצוגה גרפית",
    },
    recentNotes: {
      title: "דפים שנערכו לאחרונה",
      seeRemainingMore: ({ remaining }) => `ראה עוד ${remaining} →`,
    },
    transcludes: {
      transcludeOf: ({ targetSlug }) => `הכללת טרנס של ${targetSlug}`,
      linkToOriginal: "קישור למקור",
    },
    search: {
      title: "חפש",
      searchBarPlaceholder: "חפש משהו",
    },
    tableOfContents: {
      title: "תוכן עניינים",
    },
    contentMeta: {
      readingTime: ({ minutes }) => `${minutes} min read`,
    },
  },
  pages: {
    rss: {
      recentNotes: "דפים שנערכו לאחרונה",
      lastFewNotes: ({ count }) => `${count} דפים האחרונים`,
    },
    error: {
      home: "בית",
      title: "לא נמצא",
      notFound: "דף זה פרטי או שלא קיים.",
    },
    folderContent: {
      folder: "תיקייה",
      itemsUnderFolder: ({ count }) =>
        count === 1 ? "פריט אחד תחת תיקייה זו." : `${count} פריטים תחת תיקייה זו.`,
    },
    tagContent: {
      tag: "תג",
      tagIndex: "סקירת תגים",
      itemsUnderTag: ({ count }) =>
        count === 1 ? "פריט אחד עם תג זה." : `${count} פריטים עם תג זה.`,
      showingFirst: ({ count }) => `מראה את ${count} תגים הראשונים.`,
      totalTags: ({ count }) => `${count} תגים בסך הכל.`,
    },
  },
} as const satisfies Translation
