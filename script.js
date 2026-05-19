// Replace with your Groq API key
const API_KEY = "";

// DOM Elements
const jobInput = document.getElementById('jobTitle');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const output = document.getElementById('output');
const errorDiv = document.getElementById('error');
const copyBtn = document.getElementById('copyBtn');

// Main function using OpenRouter
async function generateQuestions() {
    const title = jobInput.value.trim();

    if (!title) {
        showError("Please enter a job title first.");
        return;
    }

    toggleLoading(true);
    errorDiv.classList.add('hidden');
    resultContainer.classList.add('hidden');

    try {
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                    "HTTP-Referer": window.location.origin, // required by OpenRouter
                    "X-Title": "Job Interview Generator"
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3.1-8b-instruct",
                    messages: [
                        {
                            role: "user",
                            content:
`Task: Check if "${title}" is a realistic job title.

If NOT realistic, reply ONLY:
INVALID

If realistic, provide exactly 3 interview questions for that role.
Format as numbered list.`
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "Request failed");
        }

        const data = await response.json();
        const text = data.choices[0].message.content;

        if (text.includes("INVALID")) {
            showError("Please enter a valid job title (e.g. Product Manager).");
        } else {
            output.innerText = text.trim();
            resultContainer.classList.remove('hidden');
        }

    } catch (err) {
        showError("Error: " + err.message);
        console.error(err);
    } finally {
        toggleLoading(false);
    }
}

// Toggle Loading UI
function toggleLoading(isLoading) {
    submitBtn.disabled = isLoading;

    if (isLoading) {
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
    } else {
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

// Show Errors
function showError(message) {
    errorDiv.innerText = message;
    errorDiv.classList.remove('hidden');
}

// Copy Output
function copyToClipboard() {
    const text = output.innerText;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.innerText;

        copyBtn.innerText = "✓ Copied!";

        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    });
}

// Event Listeners
submitBtn.addEventListener('click', generateQuestions);

copyBtn.addEventListener('click', copyToClipboard);

jobInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateQuestions();
    }
});
