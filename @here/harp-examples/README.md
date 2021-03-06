# @here/harp-examples

## Overview

This repository contains examples for `harp.gl`.

## Building and running

You can build and run the examples running the following commands from the root path of the project:

```shell
yarn install
yarn run build
yarn start
```

Open `http://localhost:8080` in a web browser to try the examples.

## Examples

We can group the examples by several categories, looking at what kind of features and capabilities they showcase.

### Getting Started

1. [The hello world example](src/hello.ts) that displays a map in an HTML element with our default map style and default data source.

### Camera

1. [Camera with free movement](src/camera_free.ts), that demonstrates how the camera works in `harp.gl`.
1. [Orbit camera](src/camera_orbit.ts), showcases the `lookAt` method and how to use it to orbit around a point.

### Text Rendering

1. Showcase of the [dynamic text rendering](src/textcanvas_dynamic.ts) capabilities of our [text rendering library](../harp-text-canvas/README.md).

### Data sources

1. [Display an interactive map of Italy](src/datasource_geojson_styling_game.ts) on a reduced map style that showcases picking and using GeoJSON Data that relies on [geojson-datasource](../harp-geojson-datasource/README.md).
1. [Show OMV Data](src/hello.ts) with our default map style.
1. [Render raster map tiles](src/datasource_webtile.ts) using the [webtile-datasource](../harp-webtile-datasource/README.md).
1. [Render satellite tiles](src/datasource_satellitetile.ts) using the [webtile-datasource](../harp-webtile-datasource/README.md).
1. [Show OSM MVT Data](src/datasource_xyzmvt.ts) with our default map style.

### Custom features

1. [The how-to for custom features](src/features.ts) demonstrates the process of adding features.
1. [A more advanced example](src/features_custom.ts) mingles Harp's capabilities with custom features to realize an engaging visualization.

### Styling

1. [Display three map views, side by side](src/multiview_triple-view.ts), in which we show the a map with three different styles at the same time, using OMV Data.
1. [Themes examples](src/themes.ts) features the various themes open sourced with Harp.

### [three.js](https://threejs.org/)

1. [Add simple object example](src/threejs_add-simple-object.ts) that shows how to add an object to the map.
1. [Raycast into map scene](src/threejs_raycast.ts) that shows how to raycast into the scene and add points at the intersected locations.

### Effects

1. [Playground for the post effects](src/effects_all.ts).
1. [Additional themes and post effects configuration files](src/effects_themes.ts), showcasing available setups for fancier renderings.
