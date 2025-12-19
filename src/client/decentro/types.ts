export interface DecentroKYCRequest {
    consent: boolean;
    purpose: string;
    redirect_url: string;
    uistream: string;
    skip_survey?: boolean;
    disable_multiple_tabs?: boolean;
    language?: string;
    force_aadhaar?: boolean;
    force_mobile?: boolean;
    clear_cookies?: boolean;
    callback_url: string;
    reference_id: string;
}

export interface DecentroKYCResponse {
    decentroTxnId: string;
    status: string;
    responseCode: string;
    message: string;
    data: {
        url: string;
    };
    responseKey: string;
}

export interface DecentroErrorResponse {
    status: string;
    responseCode: string;
    message: string;
    error?: string;
}

export interface DecentroConfig {
    baseUrl: string;
    clientId: string;
    clientSecret: string;
    moduleSecret: string;
}
