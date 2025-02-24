async handleNormalMessage(ws, message, conversation) {
    if (message.type === 'take_task') {
        try {
            const { prompt } = message;
            if (!prompt) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Prompt no proporcionado."
                }));
                return;
            }

            // Se usa el agent normal (ollama) para la transcripción
            const transcribedText = await ollama.transcribeBase64Audio(prompt);
            const transcribe = limpiarTexto(transcribedText);

            // Se usa el agente 'ollama' para generar la respuesta
            const completion = await ollama.create([
                {
                    content: `
                        You are Navigation Command Interpreter. Analyze the user's input and respond only with a JSON object containing a "type" field.
            
                        Valid Types (Strict Enforcement):
                        "next" → When the user wants to proceed or get the next item.
                        "back" → When the user wants to go back or get the previous item, including repeating the last one.
                        "repeat" → When the user wants to hear something again.
                        "content" → When the user asks to repeat the content or requests specific content.
                        "ready" → When the user indicates an item confirm.
                        "remove" → When the user wants to unconfirm an item.
                        "status" → When the user asks about the status of ready items.
                        
                        Strict Rules:
                        Respond only with one of the valid types listed above.
                        If the input is unclear or does not match any category, return: { "type": "none" }.
                        You must understand and process the language in which the user's input is provided (e.g., English, Spanish, etc.) to accurately determine their intention.
                    `,
                    role: "system"
                },
                {
                    content: transcribe,
                    role: "user"
                }
            ]);

            ws.send(JSON.stringify({
                type: 'take_task.response',
                response: completion.type
            }));
        } catch (error) {
            console.error("Error en WebSocket normal:", error);
            ws.send(JSON.stringify({
                type: "error",
                message: "Error al procesar el mensaje."
            }));
        }
    }
}

wssNormal.on('message', async (message) => {
    try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'take_task') {
            const { prompt } = parsedMessage;
            if (!prompt) {
                ws.send(JSON.stringify({
                    type: "error",
                    message: "Prompt no proporcionado."
                }));
                return;
            }
            // Transcribir el audio usando el agente normal (ollama)
            const transcribedText = await ollama.transcribeBase64Audio(prompt);
            const transcribe = limpiarTexto(transcribedText);
            
            // Generar la respuesta usando el método create() del agente normal
            const completion = await ollama.create([
                { 
                    content: `
                        You are Navigation Command Interpreter. Analyze the user's input and respond only with a JSON object containing a "type" field.
            
                        Valid Types (Strict Enforcement):
                        "next" → When the user wants to proceed or get the next item.
                        "back" → When the user wants to go back or get the previous item, including repeating the last one.
                        "repeat" → When the user wants to hear something again.
                        "content" → When the user asks to repeat the content or requests specific content.
                        "ready" → When the user indicates an item confirm.
                        "remove" → When the user wants to unconfirm an item.
                        "status" → When the user asks about the status of ready items.
                        
                        Strict Rules:
                        Respond only with one of the valid types listed above.
                        If the input is unclear or does not match any category, return: { "type": "none" }.
                        You must understand and process the language in which the user's input is provided (e.g., English, Spanish, etc.) to accurately determine their intention.
                    `,
                    role: "system"
                },
                { 
                    content: transcribe, 
                    role: "user" 
                }
            ]);
            
            ws.send(JSON.stringify({
                type: 'take_task.response',
                response: completion.type
            }));
        } else {
            ws.send(JSON.stringify({
                type: "error",
                message: "Tipo de mensaje desconocido en WebSocket normal."
            }));
        }
    } catch (error) {
        console.error("Error en WebSocket normal:", error);
        ws.send(JSON.stringify({
            type: "error",
            message: "Error al procesar el mensaje en WebSocket normal."
        }));
    }
}); 