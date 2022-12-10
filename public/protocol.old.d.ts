// Request a file in order to open it. Will return the URL where the file
// can be fetched.
export interface RequestFile {
    params: IRequestFileParams,
    result: IRequestFileResult,
    error: RequestFileError
}

// Request an image file in order to open it. Will return the URL where the file
// can be fetched.

export interface RequestImage {
    params: IRequestImageParams,
    result: IRequestImageResult,
    error: RequestFileError
}

// private interfaces

interface IRequestImageParams extends IRequestFileParams {
    // Size of client display area.
    clientSize?: { width: number, height: number }
}

interface IRequestFileParams {
    // Path of the requsted file
    path: string
}

interface IRequestFileResult {
    // URL of file already available and ready to be served
    original: string,
    // URL to request thumbnail (will be generated upon request)
    thumbnail: string,
    // size in bytes
    size: number
}

interface IRequestImageResult extends IRequestFileResult {
    // URL to request a scaled down image. Size depends on clientSize parameter.
    scaled?: string,
}

declare enum RequestFileError {
    // File does not exist
    NOT_EXISTS = 0,
    // Not a file (e.g. directory)
    NOT_FILE = 1,
    // Permission denied can occur when:
    //
    // * user is not authorized to browse the folder
    PERMISSION_DENIED = 2,
    // Path not in application sandbox
    PATH_NOT_ALLOWED = 11
}


// List the content of a directory for available media.
export interface ListDirectory {
    params: {
        // Path to be browsed. Relative to configured MEDIA_PATH
        path: string
        // Optional list of extensions to filter the content.
        filters?: Array<string>
    },
    result: {
        // Array of directories (relative path, ommiting '.' and '..').
        directories: Array<string>,
        // Array of files (relative path).
        files: Array<{
            // name of the file
            name: string,
            //size in bytes
            size: number
        }>
    },
    error: {
        // Path not found
        NOT_EXISTS,
        // Permission denied can occur when:
        //
        // * user is not authorized to browse the folder
        NOT_A_DIRECTORY,
        PERMISSION_DENIED,
        EXECUTION_ERROR: 3,

    }
}


export interface Search {
    params: {
        // String to be search for in files and directories name.
        name: string
    },
    result: {
        // Array of directories (relative path, ommiting '.' and '..').
        directories: Array<string>,
        // Array of files (relative path).
        files: Array<{
            // name of the file
            name: string,
            //size in bytes
            size: number
        }>
    },
    error: {
        EXECUTION_ERROR: 3,
    }
}

// Delete the scene from a database
export interface DeleteScene {
    params: {
        // Scene to be deleted.
        name: string,
        clientId: string
    },
    result: {
        SCENE_REMOVED
    },
    error: {
        // Scene is locked by another display client
        SCENE_NOT_FOUND: 0,
        SCENE_LOCKED_BY_OTHER: 13,
        EXECUTION_ERROR: 3,
        MALFORMED: 4,
    }
}

// Persist the scene a the database
export interface SaveScene {
    params: {
        // Scene to be saved.
        scene: IScene,
        client_id: string

    },
    result: {
        SCENE_SAVED
    },
    error: {
        // Scene is locked by another display client
        SCENE_LOCKED_BY_OTHER: 13,
        EXECUTION_ERROR: 3,
        MALFORMED: 4,
    }
}

// List all available scenes.
// We will receive only summaries of the scenes.
// To get the whole scene, please call `LoadScene`.
// If the include filter is defined, sort the results that were filtered
// using the name, before those with the description.  
// When a tie occurs, sort by name.
export interface ListScenes {
    params: {
        // If defined, filter out scenes which name/description
        // does not contain any of the elements of the array.
        include?: Array<string>,
        // If defined, filter out scenes which name/description
        // contains at least one of the elements of the array.
        exclude?: Array<string>
    },
    result: {
        uuids: Array<string>,
        names: Array<string>
    },
    error: {
        EXECUTION_ERROR: 3,
    }
}

export interface SceneVersions {
    params: {
        name: string
    },
    result: Array<IScene>,
    error: {
        EXECUTION_ERROR: 3,
        MALFORMED: 4,
    }
}


// Request full information on a specific scene in order to load it
// and mark it as 'locked' on master preventing other clients from over-writing it.
export interface LoadScene {
    params: {
        name: string,
        client_id: string
    },
    result: {
        scene: IScene,
    },
    error: {
        SCENE_NOT_FOUND: 0,
        EXECUTION_ERROR: 3,
        MALFORMED: 4,
    }
}

export interface KeepSceneLocked {
    params: {
        name: string,
        client_id: string
    },
    result: {
        SCENE_LOCKED
    },
    error: {
        SCENE_NOT_FOUND: 0,
        SCENE_LOCKED_BY_OTHER: 13,
        EXECUTION_ERROR: 3,
        MALFORMED: 4,
        SCENE_NOT_LOCKED: 12,
    }
}

interface IScene {
    uuid: string,
    name: string,
    // The description can be used for searching.
    description: string,
    theme: ITheme
    topics: Array<ITopic>,
    // contains clientId which locked the scene.
    // if absent: scene not locked
    locked?: string
    // date in ISO format
    locked_timestamp?: string
    // when requesting an archived version of a scene
    version?: number
}

interface ITheme {
    name: string
    // To be defined...
}

interface ITopic {
    name: string,
    windows: Array<IWindow>
}

declare enum SceneMode {
    readwrite = 0,
    read = 1
}

// It should be an ENUM
declare enum WindowMode {
    // default mode, one can manipulate the window
    CONTAINER = 0,
    // mode to operate on the content, e.g. touch events are passed to the embedded object
    DOCUMENT = 1
}


// A Window is merely a __rectangle__.
// You can move it `around` and you can change its size.
interface IWindow {
    // Unique identifier
    uuid: string,
    // There are different types of windows: videos, images, PDF, settings, searchs, ...
    type: string,
    // Stringified JSON object depending on the type.
    // For images, it can be as simple as `{ src: "data/movies/bigbunny.mp4" }`.
    // But for videos, it will contain the currrent frame, the mute/unmute status, etc.
    content: string,
    // Aspect ratio: width / height
    aspect: number,
    // X (relative to the scene)
    x: number,
    //  Y (relative to the scene)
    y: number,
    // width (horizontal size, relative to the scene)
    width: number,
    // height (vertical size, relative to the scene)
    height: number
    // mode determining behaviour of the window
    mode: WindowMode
}
