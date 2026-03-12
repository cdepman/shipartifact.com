import { SLUG_REGEX, RESERVED_SLUGS, MAX_CODE_LENGTH } from "../constants";

export type ValidationError = {
  field: string;
  message: string;
};

export function validateSlug(slug: string): ValidationError | null {
  if (!slug) {
    return { field: "slug", message: "Site name is required" };
  }

  if (!SLUG_REGEX.test(slug)) {
    return {
      field: "slug",
      message:
        "Site name must be 3-63 characters, lowercase letters, numbers, and hyphens only",
    };
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return { field: "slug", message: "This site name is reserved" };
  }

  return null;
}

export function validateCode(code: string): ValidationError | null {
  if (!code || !code.trim()) {
    return { field: "sourceCode", message: "Code is required" };
  }

  if (code.length > MAX_CODE_LENGTH) {
    return {
      field: "sourceCode",
      message: `Code is too large (max ${MAX_CODE_LENGTH / 1000}KB)`,
    };
  }

  return null;
}

export function validateTitle(title: string): ValidationError | null {
  if (!title || !title.trim()) {
    return { field: "title", message: "Title is required" };
  }

  if (title.length > 200) {
    return { field: "title", message: "Title must be 200 characters or less" };
  }

  return null;
}

export function validateDeployInput(input: {
  slug: string;
  title: string;
  sourceCode: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const slugError = validateSlug(input.slug);
  if (slugError) errors.push(slugError);

  const titleError = validateTitle(input.title);
  if (titleError) errors.push(titleError);

  const codeError = validateCode(input.sourceCode);
  if (codeError) errors.push(codeError);

  return errors;
}
