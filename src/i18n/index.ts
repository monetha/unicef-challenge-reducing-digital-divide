import I18nJS, { TranslateOptions } from 'i18n-js';
import en from 'src/i18n/locales/en';

// #region -------------- i18n engine configuration -------------------------------------------------------------------

I18nJS.locale = 'en';
I18nJS.fallbacks = true;

I18nJS.translations = {
  en,
};

// #endregion

// #region -------------- Types -------------------------------------------------------------------

export type TranslationSelector = (translations: Translations) => any;

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

/**
 * Base translation tree type that holds all translations (en)
 */
export type Translations = RecursivePartial<typeof en>;

/**
 * Translation tree type that must be used for locale translations (non-en)
 */
export type LocaleTranslations = Partial<Translations>;

// #endregion

// #region -------------- Main translation function -------------------------------------------------------------------

type TranslationSelector = (translations: Translations) => any;

export const translate = (selector: TranslationSelector, options?: TranslateOptions): string => {
  let path: string;

  if (typeof selector === 'string') {
    path = selector;
  } else {
    const node: any = selector(translationPaths);
    path = node.__path || node;
  }

  return I18nJS.t(path, options);
};

// #endregion

// #region -------------- i18n path creation -------------------------------------------------------------------

/**
 * Recursively maps translations tree into same tree
 * but with __path fields which contain
 * i18n friendly paths
 * @param tree translations tree
 * @param path current path
 */
const createPaths = <TTranslationTree extends object>(tree: TTranslationTree, path: string): TTranslationTree => {
  const container: any = {};

  for (const key in tree) {
    if (!tree.hasOwnProperty(key)) {
      continue;
    }

    const newPath = path ? `${path}.${key}` : key;
    const element: any = tree[key];

    if (typeof element === 'string') {
      container[key] = newPath;
    } else {
      container[key] = {
        ...createPaths(element, newPath),
        __path: newPath,
      };
    }
  }

  return container as TTranslationTree;
};

// Creating translation paths for i18n library
const translationPaths = createPaths(en, '');

  // #endregion
