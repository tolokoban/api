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

// Register a new user, but do not login.
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

// Analyse thoughts.
// @secure
export interface thoughts {
    params: {
        text: string
    }
    result: {
        thoughtId: number
        text: string
        // A score (between 0.0 and 1.0) is mapped to every distortion label.
        distortions: Record<string, number>
    }
    error: {
        TEXT_IS_NOT_UNDERSTANDABLE
    }
}
