'use client';

import React, { useState } from 'react';
import { generateDocs, generateAndDownloadDocs } from '@/lib/server/docsAgent';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import DocsList from './DocsList';

interface FormValues {
    idea: string;
    techStack: string;
    features: string;
}

interface DocsResponse {
    projectbrief: string;
    productContext: string;
    activeContext: string;
    systemPatterns: string;
    techContext: string;
    summary: string;
    status?: 'ready' | 'pending';
}

const FormComponent: React.FC = () => {
    const [formValues, setFormValues] = useState<FormValues>({
        idea: '',
        techStack: '',
        features: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    function getProviderConfig() {
        if (typeof window !== "undefined") {
            const provider = localStorage.getItem("aiProvider") || "openai";
            const apiKey = localStorage.getItem("aiApiKey") || "";
            return { provider, apiKey };
        }
        return { provider: "openai", apiKey: "" };
    }


    const handleDownload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { provider = "", apiKey = "" } = getProviderConfig();

        try {
            const { zipContent, fileName } = await generateAndDownloadDocs(
                formValues.idea,
                formValues.techStack,
                formValues.features,
                provider,
                apiKey
            );
            const byteCharacters = atob(zipContent);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download documentation. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className='py-8'>
            <CardContent>
                <form onSubmit={handleDownload} className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-2'>
                    <label htmlFor="idea">Idea:</label>
                        <Input
                        type="text"
                        id="idea"
                        name="idea"
                        value={formValues.idea}
                        onChange={handleChange}
                            placeholder='What is the project about?'
                        disabled={loading}
                    />
                </div>
                    <div className='flex flex-col gap-2'>
                    <label htmlFor="techStack">Tech Stack:</label>
                        <Input
                        type="text"
                        id="techStack"
                        name="techStack"
                        value={formValues.techStack}
                        onChange={handleChange}
                            placeholder='What is the tech stack?'
                        disabled={loading}
                    />
                </div>
                    <div className='flex flex-col gap-2'>
                    <label htmlFor="features">Features:</label>
                        <Textarea
                        id="features"
                        name="features"
                        value={formValues.features}
                        onChange={handleChange}
                        disabled={loading}
                            placeholder='What are the features?'
                            rows={4}
                    />
                </div>
                    <Button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Submit'}
                    </Button>
            </form>

                {error && <div className='text-red-500 mt-4'>{error}</div>}
            </CardContent>
        </Card>
    );
};

export default FormComponent;
