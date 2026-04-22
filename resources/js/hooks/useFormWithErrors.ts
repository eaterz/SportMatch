import { useState } from 'react';
import axios from 'axios';

export function useFormWithErrors<T extends Record<string, any>>(initialData: T) {
    const [data, setData] = useState<T>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [processing, setProcessing] = useState(false);

    const setField = (field: keyof T, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const post = async (url: string, options?: {
        onSuccess?: () => void;
        redirectTo?: string;
        resetFields?: (keyof T)[];
        transformData?: (data: T) => Record<string, any>;
    }) => {
        setProcessing(true);
        setErrors({});

        try {
            const sendData = options?.transformData ? options.transformData(data) : data;

            await axios.post(url, sendData, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (options?.resetFields) {
                const resetData = { ...data };
                options.resetFields.forEach(field => {
                    resetData[field] = '' as any;
                });
                setData(resetData);
            }

            if (options?.redirectTo) {
                window.location.href = options.redirectTo;
            } else {
                options?.onSuccess?.();
            }

        } catch (error: any) {
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                const flatErrors: Partial<Record<keyof T, string>> = {};
                Object.keys(validationErrors).forEach(key => {
                    flatErrors[key as keyof T] = validationErrors[key][0];
                });
                setErrors(flatErrors);
            } else {
                console.error('Unexpected error:', error);
            }
        } finally {
            setProcessing(false);
        }
    };

    return { data, setField, errors, processing, post };
}
