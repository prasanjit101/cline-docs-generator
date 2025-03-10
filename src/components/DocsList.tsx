'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';
import { ArrowUpRight } from 'lucide-react';
import CopyToClipboard from './copyToClipboard';

interface DocItem {
    name: string;
    content: string;
    status: 'ready' | 'pending' | 'failed';
    path: string;
}

const DocsList = ({ docs }: { docs: DocItem[] }) => {
    const [openDoc, setOpenDoc] = useState<string | null>(null);
    const [currentDoc, setCurrentDoc] = useState<DocItem | null>(null);

    const handleOpenDoc = async (id: number) => {
        try {
            setCurrentDoc(docs[id]!);
            setOpenDoc(docs[id]!.content);
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    };

    return (
        <Card className="space-y-2">
            {
                docs.length === 0 && (
                    <div className='text-center text-sm text-gray-500'>
                        No docs yet.
                    </div>
                )
            }
            {docs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <span>{doc.name}</span>
                    <div className='flex items-center gap-2'>
                        <Badge variant={doc.status === 'ready' ? 'secondary' : doc.status === 'pending' ? 'outline' : 'destructive'}>
                            {doc.status === 'ready' ? 'Ready' : doc.status === 'pending' ? 'Pending' : 'Failed'}
                        </Badge>
                        <Button size='sm' onClick={() => handleOpenDoc(i)}><ArrowUpRight className='w-4 h-4' />Open</Button>
                    </div>
                </div>
            ))}

            <Dialog open={!!openDoc} onOpenChange={() => setOpenDoc(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                    <DialogHeader className='flex items-center justify-between'>
                        <DialogTitle>{currentDoc?.name}</DialogTitle>
                        <CopyToClipboard text={currentDoc?.content || ''} />
                    </DialogHeader>
                    <p className='text-sm text-gray-500'>save in docs folder: {currentDoc?.path}</p>
                    <pre className="whitespace-pre-wrap">{currentDoc?.content}</pre>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default DocsList;
