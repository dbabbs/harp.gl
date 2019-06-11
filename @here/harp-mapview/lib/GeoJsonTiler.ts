/*
 * Copyright (C) 2018-2019 HERE Global B.V. and its affiliate(s). All rights reserved.
 *
 * This software and other materials contain proprietary information controlled by HERE and are
 * protected by applicable copyright legislation. Any use and utilization of this software and other
 * materials and disclosure to any third parties is conditional upon having a separate agreement
 * with HERE for the access, use, utilization or disclosure of this software. In the absence of such
 * agreement, the use of the software is not allowed.
*/

import { GeoJson, ITiler } from "@here/harp-datasource-protocol";
import { TileKey } from "@here/harp-geoutils";
import {LoggerManager} from "../../harp-utils/lib/Logger";

// tslint:disable-next-line:no-var-requires
const geojsonvt = require("geojson-vt");

const logger = LoggerManager.instance.create("GeoJsonTiler");

export class GeoJsonTiler implements ITiler {
    indexes: Map<string, ITiler>;

    constructor() {
        this.indexes = new Map();
    }

    dispose() {/* */
    }

    async connect(): Promise<void> {
        return Promise.resolve();
    }

    async registerIndex(indexId: string, input: URL | GeoJson): Promise<void> {
        if (this.indexes.has(indexId)) { return; }
        if (input instanceof URL) {
            const response = await fetch(input.href);
            if (!response.ok) {
                logger.error(`${input} Status Text:  ${response.statusText}`);
                return Promise.reject();
            }
            input = await response.json();
        } else {
            input = input as GeoJson;
        }

        this.indexes.set(indexId, geojsonvt.default(input, {
            maxZoom: 20, // max zoom to preserve detail on
            indexMaxZoom: 5, // max zoom in the tile index
            indexMaxPoints: 100000, // max number of points per tile in the tile index
            tolerance: 3, // simplification tolerance (higher means simpler)
            extent: 4096, // tile extent
            buffer: 0, // tile buffer on each side
            lineMetrics: false, // whether to calculate line metrics
            promoteId: null, // name of a feature property to be promoted to feature.id
            generateId: false, // whether to generate feature ids. Cannot be used with promoteId
            debug: 0 // logging level (0, 1 or 2)
        }));
    }

    async updateIndex(indexId: string, input: URL | GeoJson): Promise<void> {
        return Promise.resolve();
    }

    async getTile(indexId: string, tileKey?: TileKey): Promise<{}> {
        const result = this.indexes.get(indexId);

        if (result === undefined) {
            throw new Error('not found');
        }
        return result;
    }
}