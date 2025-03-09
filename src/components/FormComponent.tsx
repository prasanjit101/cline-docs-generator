import React, { useState } from 'react';
import { generateDocs, writeDocsToFiles } from '@/lib/server/docsAgent';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="idea">Idea:</label>
                    <input
                        type="text"
                        id="idea"
                        name="idea"
                        value={formValues.idea}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="techStack">Tech Stack:</label>
                    <input
                        type="text"
                        id="techStack"
                        name="techStack"
                        value={formValues.techStack}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                <div>
                    <label htmlFor="features">Features:</label>
                    <textarea
                        id="features"
                        name="features"
                        value={formValues.features}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Submit'}
                </button>
            </form>

            {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}

            {docs && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>Generated Documentation</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setDocs({ ...docs, status: 'ready' })}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                            Mark as Ready
                        </button>
                        <button
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
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                            Download as ZIP
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                            <h4>Project Brief</h4>
                            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{docs.projectbrief}</div>
                        </div>
                        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                            <h4>Product Context</h4>
                            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{docs.productContext}</div>
                        </div>
                        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                            <h4>Active Context</h4>
                            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{docs.activeContext}</div>
                        </div>
                        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                            <h4>System Patterns</h4>
                            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{docs.systemPatterns}</div>
                        </div>
                        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                            <h4>Tech Context</h4>
                            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{docs.techContext}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormComponent;
