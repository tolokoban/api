/* tslint:disable:no-empty-interface */

import BaseApi from './base-api'

export default class Api extends BaseApi {
    constructor(hostname: string) { super(hostname) }

    /**
     *  Delete the scene from a database
     */
    callDeleteScene = (params: IDeleteSceneParams): Promise<IDeleteSceneReturns> =>
        new Promise((resolve, reject) =>
            this.call("DeleteScene", params, resolve, reject))

    /**
     *  List the content of a directory for available media.
     */
    callListDirectory = (params: IListDirectoryParams): Promise<IListDirectoryReturns> =>
        new Promise((resolve, reject) =>
            this.call("ListDirectory", params, resolve, reject))

    /**
     *  List all available scenes
     */
    callListScenes = (params: IListScenesParams): Promise<IListScenesReturns> =>
        new Promise((resolve, reject) =>
            this.call("ListScenes", params, resolve, reject))

    /**
     *  Request full information on a specific scene in order to load it
     *  and mark it as 'locked' on master preventing other clients from over-writing it.
     */
    callLoadScene = (params: ILoadSceneParams): Promise<ILoadSceneReturns> =>
        new Promise((resolve, reject) =>
            this.call("LoadScene", params, resolve, reject))

    /**
     *  Request a file in order to open it. Will return the URL where the file
     *  can be fetched.
     */
    callRequestFile = (params: IRequestFileParams): Promise<IRequestFileReturns> =>
        new Promise((resolve, reject) =>
            this.call("RequestFile", params, resolve, reject))

    /**
     *  Request an image file in order to open it. Will return the URL where the file
     *  can be fetched.
     */
    callRequestImage = (params: IRequestImageParams): Promise<IRequestImageReturns> =>
        new Promise((resolve, reject) =>
            this.call("RequestImage", params, resolve, reject))

    /**
     *  Persist the scene a the database
     */
    callSaveScene = (params: ISaveSceneParams): Promise<ISaveSceneReturns> =>
        new Promise((resolve, reject) =>
            this.call("SaveScene", params, resolve, reject))
}

export interface IDeleteSceneParams {
    uuid: string
}

export interface IDeleteSceneReturns {
    SCENE_REMOVED: number
}

export interface IListDirectoryParams {
    path: string
    filters?: Array<string>
}

export interface IListDirectoryReturns {
    directories: Array<string>
    files: Array<{
        name: string
        size: number
    }>
}

export interface IListScenesParams {
}

export type IListScenesReturns = Array<IScene>

export interface ILoadSceneParams {
    uuid: string
}

export interface ILoadSceneReturns {
    scene: IScene
}

export interface IRequestFileParams {
    path: string
}

export interface IRequestFileReturns {
    original: string
    thumbnail: string
    size: number
}

export interface IRequestImageParams extends RequestFileParams {
    clientSize?: {
        width: number
        height: number
    }
}

export interface IRequestImageReturns extends RequestFileResult {
    scaled?: string
}

export interface ISaveSceneParams {
    Scene: IScene
}

export interface ISaveSceneReturns {
    SCENE_SAVED: number
}

// ============================================================

interface IScene {
    uuid: string
    name: string
    theme: ITheme
    topics: Array<ITopic>
    mode: SceneMode
}

interface ITheme {
    name: string
}

interface ITopic {
    name: string
    windows: Array<IWindow>
}

interface IWindow {
    uuid: string
    src: string
    aspect: number
    x: number
    y: number
    width: number
    height: number
    mode: WindowMode
}

enum WindowMode {
    CONTAINER = 0,
    DOCUMENT = 1,
}

enum SceneMode {
    readwrite = 0,
    read = 1,
}

interface RequestFileParams {
    path: string
}

interface RequestFileResult {
    original: string
    thumbnail: string
    size: number
}

enum RequestFileError {
    FILE_MISSING = 0,
    NOT_FILE = 0,
    PERMISSION_DENIED = 0,
    PATH_NOT_ALLOWED = 0,
}

interface RequestImageParams {
    clientSize?: {
        width: number
        height: number
    }
}

interface RequestImageResult {
    scaled?: string
}
