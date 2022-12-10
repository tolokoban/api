export interface auth_login {
    params: {
        email: string
        password: string
    }
    result: {
        // The token to use in subsequent requests
        token: string
    }
    error: {
        // User not found
        NOT_FOUND
        // Invalid password
        INVALID_PASSWORD
    }
}

export interface auth_register {
    params: {
        email: string
        password: string
    }
    result: {}
    error: {
        ALREADY_REGISTERED_WITH_ANOTHER_PASSWORD
    }
}

export interface thoughts {
    params: {
        text: string
    }
    result: {
        thoughtId: number
        text: string
        distortions: Array<{
            name: string
            score: number
        }>
    }
    error: {
        // Authentication token is missing or invalid
        INVALID_TOKEN
        TEXT_IS_NOT_UNDERSTANDABLE
    }
}
