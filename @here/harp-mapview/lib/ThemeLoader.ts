/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { isReference, isValueDefinition, Theme } from "@here/harp-datasource-protocol/lib/Theme";
import "@here/harp-fetch";
import { composeUrlResolvers, defaultUrlResolver, resolveReferenceUrl } from "@here/harp-utils";

/**
 * Loads and validates a theme from URL objects.
 */
export class ThemeLoader {
    /**
     * Loads a [[Theme]] from a remote resource, provided as a URL that points to a
     * JSON-encoded theme.
     *
     * Relative URLs are resolved to full URL using the document's base URL
     * (see: https://www.w3.org/TR/WD-html40-970917/htmlweb.html#h-5.1.2).
     *
     * @param themeUrl The URL to the theme.
     * @param expand A boolean to control if references should be expanded.
     */
    static async loadAsync(themeUrl: string, expand: boolean = true): Promise<Theme> {
        themeUrl = defaultUrlResolver(themeUrl);

        const response = await fetch(themeUrl);
        if (!response.ok) {
            throw new Error(`ThemeLoader#loadAsync: cannot load theme: ${response.statusText}`);
        }
        const theme = (await response.json()) as Theme | null;
        if (theme === null) {
            throw new Error("ThemeLoader#loadAsync: loaded resource is not valid JSON");
        }
        // Remember the URL where the theme has been loaded from.
        theme.url = themeUrl;

        const resolvedTheme = this.resolveUrls(theme);

        if (expand) {
            return this.preprocess(await resolvedTheme);
        }

        return resolvedTheme;
    }

    /**
     * Resolves all [[Theme]]'s relatives URLs to full URL using the [[Theme]]'s URL
     * (see: https://www.w3.org/TR/WD-html40-970917/htmlweb.html#h-5.1.2).
     *
     * @param theme The [[Theme]] to resolve.
     */
    static resolveUrls(theme: Theme): Theme {
        // Ensure that all resources referenced in theme by relative URLs are in fact relative to
        // theme.
        const childUrlResolver = composeUrlResolvers(
            (childUrl: string) => resolveReferenceUrl(theme.url, childUrl),
            defaultUrlResolver
        );
        if (theme.images) {
            for (const name of Object.keys(theme.images)) {
                const image = theme.images[name];
                image.url = childUrlResolver(image.url);

                if (image.atlas !== undefined) {
                    image.atlas = childUrlResolver(image.atlas);
                }
            }
        }
        if (theme.fontCatalogs) {
            for (const font of theme.fontCatalogs) {
                font.url = childUrlResolver(font.url);
            }
        }
        if (theme.poiTables) {
            for (const poiTable of theme.poiTables) {
                poiTable.url = childUrlResolver(poiTable.url);
            }
        }

        if (theme.styles) {
            for (const styleSetName in theme.styles) {
                if (!theme.styles.hasOwnProperty(styleSetName)) {
                    continue;
                }
                const styleSet = theme.styles[styleSetName];
                for (const style of styleSet) {
                    if (!style.attr) {
                        continue;
                    }
                    ["map", "normalMap", "displacementMap", "roughnessMap"].forEach(
                        texturePropertyName => {
                            const textureProperty = (style.attr! as any)[texturePropertyName];
                            if (textureProperty && typeof textureProperty === "string") {
                                (style.attr! as any)[texturePropertyName] = childUrlResolver(
                                    textureProperty
                                );
                            }
                        }
                    );
                }
            }
        }
        return theme;
    }

    static async preprocess(theme: Theme): Promise<Theme> {
        const result = await this.resolve(theme);

        if (result.styles === undefined) {
            return result;
        }

        if (result.definitions === undefined) {
            return result;
        }

        const defs = result.definitions;

        function hasOwnProperty(obj: any, name: string) {
            return Object.prototype.hasOwnProperty.call(obj, name);
        }

        for (const styleSetName in result.styles) {
            if (!hasOwnProperty(result.styles, styleSetName)) {
                continue;
            }

            const styleSet = result.styles[styleSetName];

            styleSet.forEach((currentStyle, index) => {
                let style = currentStyle;

                if (isReference(style)) {
                    // expand and instantiate references to style definitions.

                    const def = defs[style.$ref];

                    if (isValueDefinition(def)) {
                        // a style definition is required but a value is found, skip it.
                        return;
                    }

                    // instantiate the style
                    style = JSON.parse(JSON.stringify(def));
                    delete (style as any).$ref;
                    styleSet[index] = { ...styleSet[index], ...style } as any;
                }

                if (style.attr === undefined) {
                    // nothing to do.
                    return;
                }

                const attr = style.attr as any;

                for (const prop in attr) {
                    if (!hasOwnProperty(attr, prop)) {
                        continue;
                    }

                    const value = attr[prop];

                    if (!isReference(value)) {
                        continue; // nothing to do
                    }

                    const def = defs[value.$ref];

                    if (def === undefined || !isValueDefinition(def)) {
                        delete attr[prop];
                        continue; // unresolved property, warn the user.
                    }

                    attr[prop] = def.value;
                }
            });
        }
        return result;
    }

    static async resolve(theme: Theme, depth = 0): Promise<Theme> {
        if (theme.extends === undefined) {
            return theme;
        }

        if (depth > 3) {
            return theme;
        }

        const extendedThemeUrl = theme.extends;
        delete theme.extends;
        const extendedTheme = await ThemeLoader.loadAsync(extendedThemeUrl, false);
        const definitions = { ...extendedTheme.definitions, ...theme.definitions };
        const styles = { ...extendedTheme.styles, ...theme.styles };
        return this.resolve({ ...extendedTheme, ...theme, definitions, styles }, depth + 1);
    }
}
