import axios from 'axios';
import { DecentroConfig, DecentroKYCRequest, DecentroKYCResponse, DecentroErrorResponse } from './types';

const getDecentroConfig = (): DecentroConfig => {
    return {
        baseUrl: process.env.DECENTRO_BASE_URL || 'https://in.staging.decentro.tech',
        clientId: process.env.DECENTRO_CLIENT_ID || '',
        clientSecret: process.env.DECENTRO_CLIENT_SECRET || '',
        moduleSecret: process.env.DECENTRO_MODULE_SECRET || '',
    };
};

const getHeaders = () => {
    const config = getDecentroConfig();
    return {
        'accept': 'application/json',
        'content-type': 'application/json',
        'client_id': config.clientId,
        'client_secret': config.clientSecret,
        'module_secret': config.moduleSecret,
    };
};

export async function initiateKYCWorkflow(request: DecentroKYCRequest): Promise<DecentroKYCResponse> {
    try {
        const config = getDecentroConfig();

        console.log(`📤 Decentro API Request: POST /v2/kyc/workflows/uistream`);

        const response = await axios.post<DecentroKYCResponse>(
            `${config.baseUrl}/v2/kyc/workflows/uistream`,
            request,
            {
                headers: getHeaders(),
                timeout: 60000,
            }
        );

        console.log(`✅ Decentro API Response: ${response.status}`);

        return response.data;
    } catch (error: any) {
        console.error('❌ Decentro API Error:', error.response?.data || error.message);

        if (error.response) {
            const errorResponse: DecentroErrorResponse = error.response?.data || {
                status: 'FAILED',
                responseCode: 'ERROR',
                message: error.message,
                error: error.response?.statusText || 'Unknown error',
            };
            throw new Error(JSON.stringify(errorResponse));
        }
        throw error;
    }
}
