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
    const [docs, setDocs] = useState<DocsResponse | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setDocs(null);

        try {
            const generatedDocs = await generateDocs(
                formValues.idea,
                formValues.techStack,
                formValues.features
            );
            setDocs(generatedDocs);
        } catch (err) {
            setError('Failed to generate documentation. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await generateAndDownloadDocs(
                formValues.idea,
                formValues.techStack,
                formValues.features
            );
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'memory-bank.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download documentation. Please try again.');
            console.error(err);
        }
    };

    return (
        <Card className='py-8'>
            <CardContent>
                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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

                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Documentation Files</h2>
                    {!docs && <div className='text-gray-500'>No docs yet.</div>}
                    {docs && (
                        <>
                            <Button
                                onClick={handleDownload}
                                className="mb-4"
                                disabled={!docs}
                            >
                                Download All as ZIP
                            </Button>
                            <DocsList docs={[
                        { name: 'Project Brief', content: docs.projectbrief, status: docs.projectbrief ? 'ready' : 'failed', path: 'docs/projectbrief.md' },
                        { name: 'Product Context', content: docs.productContext, status: docs.productContext ? 'ready' : 'failed', path: 'docs/productContext.md' },
                        { name: 'Active Context', content: docs.activeContext, status: docs.activeContext ? 'ready' : 'failed', path: 'docs/activeContext.md' },
                        { name: 'System Patterns', content: docs.systemPatterns, status: docs.systemPatterns ? 'ready' : 'failed', path: 'docs/systemPatterns.md' },
                        { name: 'Tech Context', content: docs.techContext, status: docs.techContext ? 'ready' : 'failed', path: 'docs/techContext.md' }
                            ]} />
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default FormComponent;
