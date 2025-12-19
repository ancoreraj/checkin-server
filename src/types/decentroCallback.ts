// Decentro KYC Callback Response Types

// ============================================
// Base Callback Interface
// ============================================

export interface DecentroCallbackBase {
    initialDecentroTxnId: string;
    status: 'SUCCESS' | 'FAILURE';
    message: string;
    responseKey: string;
    data: any;
}

// ============================================
// Common Data Structures
// ============================================

export interface ProofOfIdentity {
    dob: string;
    hashedEmail: string;
    gender: string;
    hashedMobileNumber: string;
    name: string;
}

export interface ProofOfAddress {
    careOf: string;
    country: string;
    district: string;
    house: string;
    landmark: string;
    locality: string;
    pincode: string;
    postOffice: string;
    state: string;
    street: string;
    subDistrict: string;
    vtc: string;
}

export interface AadhaarData {
    aadhaarReferenceNumber: string;
    aadhaarUid: string;
    ttl?: string;
    password?: string;
    proofOfIdentity: ProofOfIdentity;
    proofOfAddress: ProofOfAddress;
    image: string; // base64 string
    pdf: string; // base64 string
    xml: string; // base64 string
}

export interface AadhaarResponse {
    decentroTxnId: string;
    status: 'SUCCESS' | 'FAILURE';
    responseCode: string;
    message: string;
    data: AadhaarData;
    responseKey: string;
}

export interface PANData {
    documentIssuer: string;
    documentName: string;
    documentType: string;
    idNumber?: string;
    userName?: string;
    userDateOfBirth?: string;
    userGender?: string;
    documentVerifiedOn?: string;
    documentStatus?: string;
    documentBase64?: string;
    message?: string; // Error message or poller message
}

export interface IssuedFile {
    name: string;
    type: string;
    size: string;
    date: string;
    parent: string;
    mime: string[];
    uri: string;
    doctype: string;
    description: string;
    issuerid: string;
    issuer: string;
}

export interface IssuedFiles {
    items: IssuedFile[];
}

// ============================================
// Callback Type 1: Session Initiated
// ============================================

export interface SessionInitiatedCallback extends DecentroCallbackBase {
    status: 'SUCCESS';
    responseKey: 'event_uistream_session_initiated';
    data: null;
}

// ============================================
// Callback Type 2: All Documents Fetched (Happy Path)
// ============================================

export interface DocumentsFetchedCallback extends DecentroCallbackBase {
    status: 'SUCCESS';
    responseKey: 'success_uistream_documents_fetch';
    data: {
        AADHAAR?: AadhaarResponse;
        EAADHAAR?: AadhaarResponse;
        PAN?: PANData;
        ISSUED_FILES?: IssuedFiles;
    };
}

// ============================================
// Callback Type 3: Partial Documents Fetched (No Poller)
// ============================================

export interface PartialDocumentsFetchedCallback extends DecentroCallbackBase {
    status: 'SUCCESS';
    responseKey: 'success_uistream_partial_documents_fetch';
    data: {
        AADHAAR?: AadhaarResponse;
        EAADHAAR?: AadhaarResponse;
        PAN?: PANData; // Will have error message
        ISSUED_FILES?: IssuedFiles;
    };
}

// ============================================
// Callback Type 4: Partial Documents with Poller Initiated
// ============================================

export interface PartialDocumentsWithPollerCallback extends DecentroCallbackBase {
    status: 'SUCCESS';
    responseKey: 'success_uistream_partial_fetch_with_poller';
    data: {
        AADHAAR?: AadhaarResponse;
        EAADHAAR?: AadhaarResponse;
        PAN?: PANData; // Will have message: "Poller has been initiated..."
        ISSUED_FILES?: IssuedFiles;
    };
}

// ============================================
// Callback Type 5: Poller Success
// ============================================

export interface PollerSuccessCallback extends DecentroCallbackBase {
    status: 'SUCCESS';
    responseKey: 'success_uistream_poller';
    data: {
        PAN: PANData; // Complete PAN data
    };
}

export interface PollerRetriesExhaustedCallback extends DecentroCallbackBase {
    status: 'SUCCESS';
    responseKey: 'error_uistream_poller_retries_exhausted';
    data: null;
}

// ============================================
// Callback Type 7: Session Termination
// ============================================

export interface SessionTerminationCallback extends DecentroCallbackBase {
    status: 'FAILURE';
    responseKey: 'error_uistream_session_termination';
    data: null;
}

// ============================================
// Callback Type 8: Session Timeout
// ============================================

export interface SessionTimeoutCallback extends DecentroCallbackBase {
    status: 'SUCCESS';
    responseKey: 'event_uistream_session_timeout';
    data: null;
}

export type DecentroCallback =
    | SessionInitiatedCallback
    | DocumentsFetchedCallback
    | PartialDocumentsFetchedCallback
    | PartialDocumentsWithPollerCallback
    | PollerSuccessCallback
    | PollerRetriesExhaustedCallback
    | SessionTerminationCallback
    | SessionTimeoutCallback;

export function isSessionInitiated(callback: DecentroCallback): callback is SessionInitiatedCallback {
    return callback.responseKey === 'event_uistream_session_initiated';
}

export function isDocumentsFetched(callback: DecentroCallback): callback is DocumentsFetchedCallback {
    return callback.responseKey === 'success_uistream_documents_fetch';
}

export function isPartialDocumentsFetched(callback: DecentroCallback): callback is PartialDocumentsFetchedCallback {
    return callback.responseKey === 'success_uistream_partial_documents_fetch';
}

export function isPartialDocumentsWithPoller(callback: DecentroCallback): callback is PartialDocumentsWithPollerCallback {
    return callback.responseKey === 'success_uistream_partial_fetch_with_poller';
}

export function isPollerSuccess(callback: DecentroCallback): callback is PollerSuccessCallback {
    return callback.responseKey === 'success_uistream_poller';
}

export function isPollerRetriesExhausted(callback: DecentroCallback): callback is PollerRetriesExhaustedCallback {
    return callback.responseKey === 'error_uistream_poller_retries_exhausted';
}

export function isSessionTermination(callback: DecentroCallback): callback is SessionTerminationCallback {
    return callback.responseKey === 'error_uistream_session_termination';
}

export function isSessionTimeout(callback: DecentroCallback): callback is SessionTimeoutCallback {
    return callback.responseKey === 'event_uistream_session_timeout';
}
