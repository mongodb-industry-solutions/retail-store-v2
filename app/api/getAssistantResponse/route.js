import { NextResponse } from "next/server";
import { ROLE } from "@/lib/constants";

const service = process.env.DATAWORKZ_SERVICE
const agentId = process.env.DATAWORKZ_AGENT_ID
const llmId = process.env.DATAWORKZ_LLM_ID
const token = process.env.DATAWORKZ_TOKEN

export async function POST(request) {
    const { userId, userText, messages, ordersMinimizedSchema } = await request.json();
    const urlTemplate = service + "/api/qna/v1/agents/" + agentId + "/response?llmProviderId=" + llmId + "&userText=";
    let json_data = {};
    let string_dialogue = [];

    messages.map(message => {
        // Map OpenAI format roles to DATAWORKZ format
        const mappedRole = message.role === ROLE.assistant ? ROLE.assistant : ROLE.user;
        string_dialogue.push({ by: mappedRole, text: message.content })
    })
    string_dialogue.push({ by: ROLE.user, text: userText })

    const response = await fetch(`${urlTemplate}${userText}`, {
        method: "POST",
        headers: {
            "Authorization": "SSWS " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json_data)
    });
    console.log('-- response', response)
    let output = "I am sorry but I was unable to get a response.";
    let resJson = await response.json();
    
    console.log('-- resJson: ', resJson);
    if (response.ok) { // response.ok is true if the status code is in the 200-299 range
        output = resJson.answer || output;
    } else {
        console.log('-- ERROR: Response not OK. Status:', response.status, 'StatusText:', response.statusText);
        console.log('-- ERROR: Response body:', resJson);
    }
    return NextResponse.json({ message: output || null, resJson }, { status: 200 });
}
