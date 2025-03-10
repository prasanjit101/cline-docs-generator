'use client';

import React, { useState } from 'react';
import { generateDocs, writeDocsToFiles } from '@/lib/server/docsAgent';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

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
                    />
                </div>
                    <Button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Submit'}
                    </Button>
            </form>

                {error && <div className='text-red-500 mt-4'>{error}</div>}

            {docs && (
                    <div className='mt-4'>
                    <h3>Generated Documentation</h3>
                        <div className='flex gap-4 mb-4'>
                            <Button
                                onClick={() => setDocs({ ...docs, status: 'ready' })}
                        >
                            Mark as Ready
                            </Button>
                            <Button
                            onClick={async () => {
                                try {
                                    await writeDocsToFiles(docs);
                                    const zip = new JSZip();
                                    const files = [
                                        'projectbrief.md',
                                        'productContext.md',
                                        'activeContext.md',
                                        'systemPatterns.md',
                                        'techContext.md'
                                    ];

                                    for (const file of files) {
                                        const content = await fetch(`/docs/${file}`).then(res => res.text());
                                        zip.file(file, content);
                                    }

                                    const content = await zip.generateAsync({ type: 'blob' });
                                    saveAs(content, 'docs.zip');
                                } catch (err) {
                                    setError('Failed to download documentation');
                                    console.error(err);
                                }
                                }}
                        >
                            Download as ZIP
                            </Button>
                    </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                            <h4>Project Brief</h4>
                                <div className='whitespace-pre-wrap font-mono'>{docs.projectbrief}</div>
                        </div>
                            <div>
                            <h4>Product Context</h4>
                                <div className='whitespace-pre-wrap font-mono'>{docs.productContext}</div>
                        </div>
                            <div>
                            <h4>Active Context</h4>
                                <div className='whitespace-pre-wrap font-mono'>{docs.activeContext}</div>
                        </div>
                            <div>
                            <h4>System Patterns</h4>
                                <div className='whitespace-pre-wrap font-mono'>{docs.systemPatterns}</div>
                        </div>
                            <div>
                            <h4>Tech Context</h4>
                                <div className='whitespace-pre-wrap font-mono'>{docs.techContext}</div>
                        </div>
                    </div>
                </div>
            )}
            </CardContent>
        </Card>
    );
};

export default FormComponent;
