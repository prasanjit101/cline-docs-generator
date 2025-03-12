"use client";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Separator } from "./ui/separator";
import { modelsList } from "@/lib/utils";

export function ModelSelector() {
    const [provider, setProvider] = useState("openai");
    const [apiKey, setApiKey] = useState("");

    const handleSave = () => {
        if (apiKey) {
            localStorage.setItem("aiProvider", provider);
            localStorage.setItem("aiApiKey", apiKey);
            alert("API key saved successfully!");
        } else {
            alert("Please enter a valid API key");
        }
    };

    useEffect(() => {
        const provider = localStorage.getItem("aiProvider") ?? "openai";
        const apiKey = localStorage.getItem("aiApiKey") ?? "";
        setProvider(provider);
        setApiKey(apiKey);
    }, []);

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="model-settings">
                <AccordionTrigger>Model Settings</AccordionTrigger>
                <AccordionContent className="py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="provider">AI Provider</Label>
                            <Select value={provider} onValueChange={setProvider}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        modelsList.map((model, i) => (
                                            <SelectItem key={i} value={model.name + ':' + model.provider}>
                                                {model.name + ' (' + model.provider + ')'}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Save API Key
                        </button>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
