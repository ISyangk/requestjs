export type OptionsType = {
    baseUrl?: string,
    contentType?: string,
    method?: string,
    [propName: string]: any,
}

export type MConfigObject = { 
    API_URL: string,
    APP_KEY: string,
    APP_SECRET: string,
    MOCK_URL: string,
    NET_ERROR: string,
    [propName: string]: any,
}

export type ReRegisterFunction = (code: number, baseUrl?: string) => any;