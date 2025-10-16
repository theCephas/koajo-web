import { HTMLTag } from "@/types";
// import { remark } from "remark";
// import html from "remark-html";
// import gfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
// import { rehype } from "rehype";
// import rehypeSanitize, { defaultSchema } from "rehype-sanitize";


// Extend String prototype with chainable HTML processing methods
declare global {
  interface String {
    convertClassNameToClass(): string;
    replaceHtmlTag(oldTag: HTMLTag, newTag?: HTMLTag): string;
    addClassToHtmlTag(tag: HTMLTag, className: string): string;
    removeUndesirableTags(tags: HTMLTag[]): string;
    bulkAddClassToHtmlTag(tags: HTMLTag[], className: string): string;
  }
}

/**
 * Utility function to convert className to class for proper HTML rendering
 * @param htmlString - The HTML string to process
 * @returns The processed HTML string
 */
String.prototype.convertClassNameToClass = function(): string {
  return this.toString().replace(/className=/g, "class=");
};

/**
 * Replaces an HTML tag with a new tag or removes the corresponding element if there is not new tag
 * @param oldTag - The tag to replace
 * @param newTag - The new tag
 * @returns The content with the tag replaced or removed
 */
String.prototype.replaceHtmlTag = function(
  oldTag: HTMLTag,
  newTag?: HTMLTag
): string {
  const content = this.toString();
  const regex = new RegExp(`<${oldTag}([^>]*)>([\\s\\S]*?)<\\/${oldTag}>`, "g");
  if (newTag) {
    return content.replace(
      regex,
      (match, p1, p2) => `<${newTag}${p1}>${p2}</${newTag}>`
    );
  } else {
    return content.replace(regex, "");
  }
};

String.prototype.addClassToHtmlTag = function(
  tag: HTMLTag,
  className: string
): string {
  const content = this.toString();
  
  // Replace all opening tags of the specified type
  const regex = new RegExp(`<${tag}([^>]*)>`, "g");
  
  return content.replace(regex, (match, attributes) => {
    // Check if the tag already has a class attribute
    if (attributes.includes('class="') || attributes.includes("class='")) {
      // Add the new class to existing classes
      return match.replace(/class="([^"]*)"/, `class="$1 ${className}"`);
    } else {
      // Add the class attribute if it doesn't exist
      return `<${tag}${attributes} class="${className}">`;
    }
  });
};

/**
 * Removes undesirable tags from the content
 * @param tags - The tags to remove
 * @returns The content without the undesirable tags
 */
String.prototype.removeUndesirableTags = function(tags: HTMLTag[]): string {
  let content = this.toString();
  tags.forEach(tag => {
    content = content.replaceHtmlTag(tag);
  });
  return content;
};

/**
 * Adds a class to multiple HTML tags
 * @param tags - The tags to add the class to
 * @param className - The class to add to the tags
 * @returns The content with the class added to the tags
 */
String.prototype.bulkAddClassToHtmlTag = function(tags: HTMLTag[], className: string): string {
  let content = this.toString();
  tags.forEach(tag => {
    content = content.addClassToHtmlTag(tag, className);
  });
  return content;
};


// /**
//  * Identifies a specific HTML tag and adds a class to it
//  * @param content - The content to process
//  * @param tag - The tag (modifier: strong, italic, underline, strikethrough, code) to add the class to
//  * @param className - The class to add to the tag
//  */
// export const addClassToHtmlTag = (
//   content: string,
//   tag: HTMLTag,
//   className: string
// ): string => {
//   // Create a regular expression to match the opening and closing tags
//   const tagRegex = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "g");

//   // Replace the tags with the same tag but with the added class
//   return content.replace(tagRegex, (match, attributes, content) => {
//     // Check if the tag already has a class attribute
//     if (attributes && attributes.includes('class="')) {
//       // Add the new class to existing classes
//       return `<${tag}${attributes.replace(
//         'class="',
//         `class="${className} `
//       )}>${content}</${tag}>`;
//     } else {
//       // Add the class attribute if it doesn't exist
//       return `<${tag} class="${className}"${attributes}>${content}</${tag}>`;
//     }
//   });
// };

// /**
//  * Identifies a specific HTML tag and adds an id to it
//  * @param content - The content to process
//  * @param tag - The tag to add the id to
//  * @param id - The id to add to the tag
//  */
// export const addIdToHtmlTag = (
//   content: string,
//   tag: HTMLTag,
//   id: string
// ): string => {
//   // slugify the id
//   if (!id) return content;
//   const slugifiedId = slugify(id);
//   const regex = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "g");
//   return content.replace(
//     regex,
//     (match, p1, p2) => `<${tag}${p1} id="${slugifiedId}">${p2}</${tag}>`
//   );
// };

// /**
//  * Replaces a specific HTML tag with a new tag or remooves the corresponding element if there is not new tag
//  * @param content - The content to process
//  * @param oldTag - The tag to replace
//  * @param newTag - The new tag
//  */
// export const replaceHtmlTag = (
//   content: string,
//   oldTag: HTMLTag,
//   newTag?: HTMLTag
// ): string => {
//   const regex = new RegExp(`<${oldTag}([^>]*)>([\\s\\S]*?)<\\/${oldTag}>`, "g");
//   if (newTag) {
//     return content.replace(
//       regex,
//       (match, p1, p2) => `<${newTag}${p1}>${p2}</${newTag}>`
//     );
//   } else {
//     return content.replace(regex, "");
//   }
// };

// /**
//  * Removes all tags except specific tags. If no tags are provided, all tags will be removed
//  * @param content - The content to process
//  * @param allowedTags - The tags to keep
//  */
// export const removeAllTags = (
//   content: string,
//   allowedTags: HTMLTag[] = []
// ): string => {
//   return content.replace(/<[^>]*>/g, (match) => {
//     if (allowedTags.includes(match as HTMLTag)) {
//       return match;
//     }
//     return "";
//   });
// };

// /**
//  * Converts a string to HTML
//  * @param content - The content to convert
//  */
// export const toHtml = (content: string): string => {
//   return content
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;");
// };

// /**
//  * Converts a Markdown string to HTML.
//  *
//  * This function uses the `remark` library to process the provided Markdown string
//  * and convert it into HTML. The `remark` library is a powerful Markdown processor
//  * that allows for extensive customization and plugins. In this simplified version,
//  * it directly converts Markdown to HTML without any additional processing or plugins.
//  *
//  * @param {string} markdown - The Markdown string to be converted to HTML.
//  * @returns {Promise<string>} - A promise that resolves to the HTML string.
//  *
//  * @example
//  * // Import the function
//  * import { markdownToHtmlSimplified } from 'path/to/this/module';
//  *
//  * // Convert Markdown to HTML
//  * const markdownContent = "# Hello, World!";
//  * markdownToHtmlSimplified(markdownContent).then(htmlContent => {
//  *   console.log(htmlContent); // Outputs: <h1>Hello, World!</h1>
//  * });
//  *
//  * @throws {Error} Will throw an error if the Markdown processing fails.
//  */
// export const markdownToHtml = async (markdown: string): Promise<string> => {
//   try {
//     // Extend the default schema to allow the <u> tag
//     const customSchema = {
//       ...defaultSchema,
//       tagNames: [...(defaultSchema.tagNames || []), "u"],
//     };

//     // Convert Markdown to HTML with GitHub Flavored Markdown support
//     const processedContent = await remark()
//       .use(gfm) // Support for tables, strikethrough, etc.
//       .use(html) // Convert Markdown to HTML
//       .process(markdown);

//     // Convert the HTML from Markdown to a format that can be processed by rehype
//     const htmlContent = processedContent.toString();

//     // Sanitize HTML while allowing specific tags
//     const sanitizedContent = await rehype()
//       .use(rehypeRaw) // Parse raw HTML in Markdown
//       .use(rehypeSanitize, customSchema)
//       .process(htmlContent);

//     return sanitizedContent.toString();
//   } catch (error) {
//     console.error("Error processing Markdown:", error);
//     throw new Error("Failed to process Markdown.");
//   }
// };

// /**
//  * Slugifies a string
//  * @param text - The text to slugify
//  * @returns The slugified text
//  */
// export const slugify = (text: string) => {
//   if (!text) return "";
//   return text.toLowerCase().replace(/ /g, "-").replace(/-+/g, "-");
// };

// /**
//  * Get text inside an html tag
//  * @param content - The content to process
//  * @param tag - The tag to get the text from
//  * @returns The text from the tag
//  */
// export const getTextInsideHtmlTag = (content: string, tag: HTMLTag) => {
//   const regex = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "g");
//   const tagElements = content.match(regex) || [];
//   const results = tagElements.map((tagElement) => removeAllTags(tagElement));
//   return results;
// };

// /** Process and format text
//  * @param text - The text to process
//  * @param allowedTags - The tags to keep
//  * @param notAllowedTags - The tags to remove
//  * @param classNames - An object of key value pair. keys continuted the tag and the value is the className
//  * @returns The processed text
//  */
// export const processAndFormatText = async ({
//   text,
//   notAllowedTags = [],
//   allowedTags = [],
//   classNames = {},
// }: {
//   text: string;
//   notAllowedTags?: HTMLTag[];
//   allowedTags?: HTMLTag[];
//   classNames?: Partial<Record<HTMLTag, string>>;
// }) => {
//   if (!text) return "";
//   const htmlText = await markdownToHtml(text || "");
//   const withoutNotAllowedTags = notAllowedTags.reduce(
//     (acc, tag) => replaceHtmlTag(acc, tag),
//     htmlText
//   );
//   const withAllowedTags = allowedTags.reduce(
//     (acc, tag) => removeAllTags(acc, [tag]),
//     withoutNotAllowedTags
//   );
//   const withStyledTags = Object.entries(classNames).reduce(
//     (acc, [tag, className]) =>
//       addClassToHtmlTag(acc, tag as HTMLTag, className),
//     withAllowedTags
//   );
//   return withStyledTags;
// };

/**
 * Utility function to convert className to class for proper HTML rendering
 * @param htmlString - The HTML string to process
 * @returns The processed HTML string
 */
// export const convertClassNameToClass = (htmlString: string) => {
//   return htmlString.replace(/className=/g, "class=");
// };