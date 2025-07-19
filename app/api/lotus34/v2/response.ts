export type ResponseMeta = {
    message: string
}

export type ListResponseMeta = {
    message: string
    page: number
    total: number
    previousPage: number | null
    nextPage: number | null
}

export type APIResponse = {
    data: any
    meta: ResponseMeta | ListResponseMeta
}
