import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Code, FileCode } from "lucide-react";
import Link from "next/link";
import FormComponent from "@/components/FormComponent";
import DocsList from "@/components/DocsList";
import { ModelSelector } from "@/components/ModelSelector";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center mx-auto p-8">
      {/* Header with GitHub Link */}
      <nav className="w-full max-w-6xl flex justify-between items-center mb-16">
        <div className="flex items-center font-semibold"><FileCode className="mr-2 h-4 w-4" /> cline-docs-generator
        </div>
        <Link
          href="https://github.com/prasanjit101/cline-docs-generator"
          className={cn(buttonVariants({ variant: "outline" }))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            height="20"
            width="20"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="text-gray-700"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Star on GitHub
        </Link>
      </nav>

      {/* Main Content */}
      <main className="w-full grid grid-cols-2 gap-16">
        <div className="flex flex-col md:px-16 space-y-6">
          <h1 className="text-5xl font-bold mb-8 text-gray-900">
            Generate your Cline docs
          </h1>

          <div className="text-center">
            <p className="mb-4">
              Generate docs that transforms Cline into a self-documenting development system that maintains context across sessions through a structured <strong>Memory Bank</strong>. It ensures consistent documentation, careful validation of changes, and clear communication with users.
            </p>
            <h3 className="text-lg font-semibold mb-2">What&apos;s it good for?</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Any project that needs context tracking</li>
              <li>Projects of any size or tech stack</li>
              <li>Both new and ongoing development</li>
              <li>Long-term maintenance work</li>
            </ul>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-lg font-semibold mb-2">How to use?</h3>
            <p>1. Enter your idea, tech stack, and features</p>
            <p>2. Click generate</p>
            <p>3. Download the docs as a zip file</p>
            <p>4. unzip the file and place the unzipped folder in the root of your project</p>
            <p>5. Create a new .clinerule file in the root of your project</p>
            <p>6. Add the following to the .clinerules file as guided in the official Cline docs :
              <a href="https://docs.cline.bot/improving-your-prompting-skills/custom-instructions-library/cline-memory-bank" target="_blank" className="text-blue-500" rel="noopener noreferrer">https://docs.cline.bot/improving-your-prompting-skills/custom-instructions-library/cline-memory-bank</a></p>
          </div>
        </div>

        {/* Form Section */}
        <div className="mt-12 text-left">
          <h2 className="text-2xl font-bold mb-6">AI Configuration</h2>
          <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
            <ModelSelector />
          </div>

          <h2 className="text-2xl font-bold mb-6">Generate Documentation</h2>
          <FormComponent />
        </div>
      </main>
    </div>
  );
}
