import React, { useState } from 'react';

interface FormValues {
    idea: string;
    techStack: string;
    features: string;
}

const FormComponent: React.FC = () => {
    const [formValues, setFormValues] = useState<FormValues>({
        idea: '',
        techStack: '',
        features: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formValues);
        // TODO: Implement form submission logic
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="idea">Idea:</label>
                <input
                    type="text"
                    id="idea"
                    name="idea"
                    value={formValues.idea}
                    onChange={handleChange}
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
                />
            </div>
            <div>
                <label htmlFor="features">Features:</label>
                <textarea
                    id="features"
                    name="features"
                    value={formValues.features}
                    onChange={handleChange}
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default FormComponent;
