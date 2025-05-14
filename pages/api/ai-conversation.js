// pages/api/ai-conversation.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { message, sessionId } = req.body;
  
    try {
      // Call AI backend or model
      const aiResponse = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
          max_tokens: 100,
        }),
      }).then((res) => res.json());
  
      // Return AI response
      res.status(200).json({ content: aiResponse.choices[0].message.content });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong!" });
    }
  }
  