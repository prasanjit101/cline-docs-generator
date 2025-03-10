import { useState } from 'react';
import { Button } from './ui/button';
import { Check, Copy } from 'lucide-react';

interface CopyToClipboardProps {
    text: string;
}

const CopyToClipboard = ({ text }: CopyToClipboardProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Optionally, provide user feedback that copying failed
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleCopy} disabled={isCopied}>
            {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {isCopied ? 'Copied!' : 'Copy'}
        </Button>
    );
};

export default CopyToClipboard;
