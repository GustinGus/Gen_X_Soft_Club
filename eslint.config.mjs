import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
  INTERNAL LINKS ARE BUILT, NOT WRITTEN. The site is in more than one language,
  and where a page lives depends on the language (src/i18n/href.ts). An address
  typed into an `href` knows nothing of that and would send a reader of one
  language to another, so it is refused here.

  Not concerned: a place on the page (href="#manifesto"), an address that comes
  from data (a source's URL), and anything outside the site.
*/
const HOW = 'Build internal links with href(locale, "/…") from "@/i18n/href": an address written here ignores the page\'s language.';
const internalLinks = {
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": [
      "error",
      { selector: "JSXAttribute[name.name='href'] > Literal[value=/^\\/(?!\\/)/]", message: HOW },
      { selector: "JSXAttribute[name.name='href'] > JSXExpressionContainer > Literal[value=/^\\/(?!\\/)/]", message: HOW },
      { selector: "JSXAttribute[name.name='href'] > JSXExpressionContainer > TemplateLiteral > TemplateElement:first-child[value.raw=/^\\/(?!\\/)/]", message: HOW },
    ],
  },
};

const config = [
  ...nextVitals,
  ...nextTs,
  internalLinks,
  { ignores: [".next/**", ".next-public/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;
