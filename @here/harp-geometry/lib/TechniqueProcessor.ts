/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { getPropertyValue } from "@here/harp-datasource-protocol";
import { MapEnv } from "@here/harp-datasource-protocol/index-decoder";
import * as THREE from "three";

/**
 * State of the scene where objects generated by a [[TechniqueProcessor]] live. Can be used for
 * dynamic update of the object properties (uniforms, blending state, etc.).
 */
export interface SceneState {
    readonly camera: THREE.PerspectiveCamera;
    readonly zoomLevel: number;
    readonly pixelToWorld: number;
}

/**
 * Base interface for all [[Technique]]-related configuration paramets.
 */
export interface TechniqueParams {
    /**
     * [[Technique]] identifier.
     */
    readonly name: string;
    /**
     * The render order of the objects created using this technique.
     *
     * If not specified in style file, [[StyleSetEvaluator]] will assign monotonically increasing
     * values according to style position in file.
     */
    readonly renderOrder: number;
}

/**
 * Base class that handles processing data accordingly to its assigned [[Technique]].
 */
export abstract class TechniqueProcessor {
    /**
     * [[Technique]] identifier.
     */
    static readonly id: string = "none";

    /**
     * Array of uniforms assigned to the objects created with this [[TechniqueProcessor]].
     */
    static readonly uniforms: Map<string, THREE.Uniform>;
    /**
     * Vertex shader source code.
     */
    static readonly vertexShader: string;
    /**
     * Fragment shader source code.
     */
    static readonly fragmentShader: string;

    /**
     * Checks if this [[TechniqueProcessor]] can process the specified data.
     *
     * @param data Data to check for support.
     */
    static supportsData(data: ArrayBufferLike | {}): boolean {
        return false;
    }
    /**
     * Checks if this [[TechniqueProcessor]] supports this type of decoding info.
     *
     * @param data Data to check for support.
     */
    static supportsDecodingInfo(decodingInfo: {}): boolean {
        return false;
    }

    /**
     * Creates the expected [[THREE.BufferGeometry]] for the specified data and the [[Technique]]
     * associated with this [[TechniqueProcessor]].
     *
     * Internally calls `supportsData` and `supportsDecodingInfo` to check if data can be decoded.
     *
     * @param data Input data.
     * @param decodingInfo Required decoding info.
     * @param env Data environment variable.
     * @param params [[TechniqueParams]] to apply to this data.
     * @param target Optional target [[THREE.BufferGeometry]].
     */
    static createBuffers(
        data: ArrayBufferLike | {},
        decodingInfo: {},
        env: MapEnv,
        params: TechniqueParams,
        target?: THREE.BufferGeometry
    ): THREE.BufferGeometry | undefined {
        return undefined;
    }

    /**
     * Creates the expected array of [[THREE.Object3D]] for the specified [[THREE.BufferGeometry]]
     * and the [[Technique]] associated with this [[TechniqueProcessor]].
     *
     * Handles uniform updates for the created objects through the material `onBeforeRender`
     * callback.
     *
     * @param geometry Input geometry.
     * @param params [[TechniqueParams]] to apply to this geometry.
     * @param sceneState [[SceneState]] to apply to the generated objects.
     */
    static createObjects(
        geometry: THREE.BufferGeometry,
        params: TechniqueParams,
        sceneState: SceneState
    ): THREE.Object3D | THREE.Object3D[] {
        return [];
    }

    protected static updateUniforms(
        object: THREE.Object3D,
        params: TechniqueParams,
        sceneState: SceneState
    ) {
        object.onBeforeRender = (renderer, scene, camera, geom, mat, group) => {
            for (const [name, uniform] of this.uniforms) {
                (mat as any)[uniform.type] = getPropertyValue(
                    (params as any)[name],
                    scene.userData.zoomLevel
                );
            }
            mat.needsUpdate = true;
        };
    }
}
