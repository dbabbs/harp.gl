/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeoCoordinates } from "@here/harp-geoutils";
import { MapControls, MapControlsUI } from "@here/harp-map-controls";
import { CopyrightElementHandler, CopyrightInfo, MapView } from "@here/harp-mapview";
import { APIFormat, OmvDataSource } from "@here/harp-omv-datasource";
import { GUI } from "dat.gui";
import { accessToken } from "../config";

/**
 * Example showing how to use separate post effects JSON files to configure the rendering through
 * the `loadPostEffects` method.
 */
export namespace EffectsExample {
    function initializeMapView(id: string): MapView {
        const canvas = document.getElementById(id) as HTMLCanvasElement;

        const mapView = new MapView({
            canvas,
            theme: "resources/berlin_tilezen_base.json"
        });

        CopyrightElementHandler.install("copyrightNotice", mapView);

        const mapControls = new MapControls(mapView);
        mapControls.maxPitchAngle = 60;
        const NY = new GeoCoordinates(40.707, -74.01);
        mapView.lookAt(NY, 4000, 60);

        const ui = new MapControlsUI(mapControls);
        canvas.parentElement!.appendChild(ui.domElement);

        mapView.resize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", () => {
            mapView.resize(window.innerWidth, window.innerHeight);
        });

        return mapView;
    }

    const map = initializeMapView("mapCanvas");

    const hereCopyrightInfo: CopyrightInfo = {
        id: "here.com",
        year: new Date().getFullYear(),
        label: "HERE",
        link: "https://legal.here.com/terms"
    };
    const copyrights: CopyrightInfo[] = [hereCopyrightInfo];

    const omvDataSource = new OmvDataSource({
        baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
        apiFormat: APIFormat.XYZOMV,
        styleSetName: "tilezen",
        maxZoomLevel: 17,
        authenticationCode: accessToken,
        copyrightInfo: copyrights
    });
    map.addDataSource(omvDataSource);

    const gui = new GUI({ width: 300 });
    const options = {
        theme: {
            streets: "resources/berlin_tilezen_effects_streets.json",
            outlines: "resources/berlin_tilezen_effects_outlines.json"
        },
        postEffects: {
            "resources/berlin_tilezen_effects_streets.json": "resources/effects_streets.json",
            "resources/berlin_tilezen_effects_outlines.json": "resources/effects_outlines.json"
        }
    };
    const selector = gui.add(options, "theme", options.theme);
    selector
        .onChange((value: string) => {
            fetch(value)
                .then(response => {
                    return response.json();
                })
                .then((theme: any) => {
                    map.clearTileCache();
                    map.theme = theme;
                    map.loadPostEffects((options.postEffects as { [key: string]: string })[value]);
                });
        })
        .setValue(options.theme.streets);
}
