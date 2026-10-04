const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "10kb" }));

// Serve your existing frontend files
app.use(express.static(__dirname));

// AI Coach endpoint
app.post("/api/coach", async (req, res) => {
    try {
        const { situation } = req.body;

        if (!situation || typeof situation !== "string") {
            return res.status(400).json({
                error: "Please describe what is on your mind."
            });
        }

        if (situation.trim().length < 5) {
            return res.status(400).json({
                error: "Please give the AI Coach a little more detail."
            });
        }

        if (situation.length > 2000) {
            return res.status(400).json({
                error: "Please keep your message under 2000 characters."
            });
        }

        if (!process.env.HF_TOKEN) {
            return res.status(500).json({
                error: "AI Coach is not configured yet."
            });
        }

        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: "google/gemma-2-2b-it",

                    messages: [
                        {
                            role: "system",
                            content: `
You are NextStep AI Coach.

Your job is to help people turn an overwhelming situation
into 3 small, realistic and actionable next steps.

Rules:
- Give exactly 3 steps.
- Keep every step short and practical.
- Do not give medical, legal or financial advice.
- Do not be judgmental.
- Do not make the user feel overwhelmed.
- Focus on what the person can do next.
- Each step should be something that can become a task.
- Return ONLY valid JSON.
- Do not use markdown.

Use this exact format:

{
  "steps": [
    "First actionable step",
    "Second actionable step",
    "Third actionable step"
  ]
}
                            `
                        },

                        {
                            role: "user",
                            content: situation.trim()
                        }
                    ],

                    temperature: 0.7,

                    max_tokens: 300
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.error("Hugging Face error:", errorText);

            return res.status(502).json({
                error: "The AI Coach could not respond right now."
            });
        }

        const data = await response.json();

        const rawContent =
            data?.choices?.[0]?.message?.content;

        if (!rawContent) {
            return res.status(502).json({
                error: "The AI returned an empty response."
            });
        }

        let result;

        try {
            result = JSON.parse(rawContent);
        } catch (error) {

            // Try to extract JSON if model added extra text
            const jsonMatch =
                rawContent.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                return res.status(502).json({
                    error: "The AI returned an invalid response."
                });
            }

            result = JSON.parse(jsonMatch[0]);
        }

        if (
            !result.steps ||
            !Array.isArray(result.steps)
        ) {
            return res.status(502).json({
                error: "The AI response was incomplete."
            });
        }

        const steps = result.steps
            .filter(step => typeof step === "string")
            .map(step => step.trim())
            .filter(Boolean)
            .slice(0, 3);

        if (steps.length === 0) {
            return res.status(502).json({
                error: "No actionable steps were generated."
            });
        }

        res.json({
            steps
        });

    } catch (error) {

        console.error("AI Coach error:", error);

        res.status(500).json({
            error: "Something went wrong. Please try again."
        });
    }
});


// Fallback to the main page
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`NextStep running on port ${PORT}`);
});