"use server";

import {ChatGPTResponse} from "@/services/ChatGPT/tempales";
import {registerUser} from "@/lib/actions/user.actions";
import {CompanyRegistrationProps} from "@/types";

export const registerCompany = async (data: CompanyRegistrationProps) => {

    try {
    } catch (error) {
        console.error("An error occurred while getting the accounts:", error);
    }
};

const  fetchChatGPTResponse = async (prompt: string):  Promise<ChatGPTResponse>  => {
    // const apiKey =  process.env.OPENAI_API_KEY! //'your-api-key';
    // const apiUrl = process.env.OPENAI_API_URL! //'https://api.openai.com/v1/chat/completions';


    const response = await fetch( process.env.OPENAI_API_URL!, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5',
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    const data: ChatGPTResponse = await response.json();
    return data;
}