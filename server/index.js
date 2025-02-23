
import express from 'express';
import cors from 'cors';
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Pica } from "@picahq/ai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pica = new Pica(process.env.PICA_SECRET_KEY);

async function execute(message) {
  const system = await pica.generateSystemPrompt();

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system,
    prompt: message,
    tools: { ...pica.oneTool },
    maxSteps: 10,
  });

  return text;
}

app.post('/api/execute-campaign', async (req, res) => {
  try {
    const { campaign } = req.body;
    console.log('Executing campaign:', campaign);

    const message = `send email to fluffyduck0222@gmail.com with subject ${campaign.title} and content ${campaign.caption} using gmail`;
    const result = await execute(message);

    console.log('Execution result:', result);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
