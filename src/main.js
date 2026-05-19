// src/main.js
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

if (!API_KEY) {
    console.error("❌ OpenRouter API Key is missing from .env file");
}

const jobInput = document.getElementById('jobTitle');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const output = document.getElementById('output');
const errorDiv = document.getElementById('error');
const copyBtn = document.getElementById('copyBtn');

async function generateQuestions() {
    if (!API_KEY) {
        showError("API key is not configured. Please add it to .env file.");
        return;
    }

    const title = jobInput.value.trim();
    if (!title) {
        showError("Please enter a job title.");
        return;
    }

    toggleLoading(true);
    errorDiv.classList.add('hidden');
    resultContainer.classList.add('hidden');

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": window.location.origin,
                "X-Title": "InterviewGen",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct",
                messages: [{
                    role: "user",
                    content: `Task: Check if "${title}" is a realistic job title.

If NOT realistic, reply ONLY: INVALID

If realistic, provide exactly 3 strong interview questions for that role.
Format as a numbered list.`
                }]
            })
        });

        if (!response.ok) throw new Error("Request failed");

        const data = await response.json();
        const text = data.choices[0].message.content;

        if (text.includes("INVALID")) {
            showError("Please enter a valid job title (e.g. Product Manager, Software Engineer)");
        } else {
            output.textContent = text.trim();
            resultContainer.classList.remove('hidden');
        }
    } catch (err) {
        showError("Failed to generate questions. Please try again.");
        console.error(err);
    } finally {
        toggleLoading(false);
    }
}

function toggleLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.classList.toggle('hidden', isLoading);
    loader.classList.toggle('hidden', !isLoading);
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function copyToClipboard() {
    const text = output.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const original = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Copied!';
        setTimeout(() => copyBtn.innerHTML = original, 2000);
    });
}

// Event Listeners
submitBtn.addEventListener('click', generateQuestions);

jobInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateQuestions();
});

copyBtn.addEventListener('click', copyToClipboard);
