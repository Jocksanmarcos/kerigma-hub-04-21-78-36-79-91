import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();

    let prompt = '';
    let responseFormat = 'json';

    switch (action) {
      case 'generate_palette':
        prompt = generatePalettePrompt(payload.baseColors, payload.context);
        break;
      case 'generate_section':
        prompt = generateSectionPrompt(payload.prompt, payload.context, payload.designSystem);
        break;
      case 'refine_styles':
        prompt = refineStylesPrompt(payload.elementId, payload.currentStyles, payload.designSystem);
        break;
      default:
        throw new Error('Invalid action');
    }

    console.log('AI Assistant Request:', { action, prompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um assistente de design especializado em websites de igrejas. Sempre responda em JSON válido seguindo exatamente o formato solicitado.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('AI Response:', generatedContent);

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in design-ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePalettePrompt(baseColors: string[], context: string): string {
  return `
Com base nas cores base: ${baseColors.join(', ')}, gere uma paleta de cores profissional para um website de ${context}.

Retorne APENAS um JSON no seguinte formato:
{
  "palette": {
    "primary": "213 90% 58%",
    "secondary": "45 100% 65%", 
    "background": "0 0% 100%",
    "foreground": "215 25% 15%"
  },
  "description": "Descrição da paleta criada",
  "harmony": "tipo de harmonia usada (monocromática, complementar, etc)"
}

Todas as cores devem estar no formato HSL (hue saturation lightness) como no exemplo. 
A paleta deve ser acessível, com bom contraste e adequada para um ambiente religioso.
`;
}

function generateSectionPrompt(userPrompt: string, context: string, designSystem: any): string {
  return `
Crie uma seção de website para ${context} baseada na seguinte descrição: "${userPrompt}"

Use o sistema de design atual:
- Cores: ${JSON.stringify(designSystem?.colors || {})}
- Fontes: ${JSON.stringify(designSystem?.fonts || {})}

Retorne APENAS um JSON no seguinte formato:
{
  "section": {
    "title": "Título da seção",
    "layout": "grid" ou "flex" ou "stack",
    "components": [
      {
        "type": "heading",
        "content": "Conteúdo do título",
        "level": 2,
        "className": "text-2xl font-bold mb-4"
      },
      {
        "type": "paragraph", 
        "content": "Texto do parágrafo",
        "className": "text-muted-foreground mb-6"
      },
      {
        "type": "card",
        "content": {
          "title": "Título do card",
          "description": "Descrição",
          "image": "/placeholder-image.jpg"
        },
        "className": "bg-card p-6 rounded-lg shadow-md"
      }
    ],
    "containerClassName": "py-16 px-4 max-w-6xl mx-auto",
    "description": "Descrição da seção criada"
  }
}

A seção deve usar classes Tailwind CSS e ser responsiva. Inclua conteúdo realista adequado para uma igreja.
`;
}

function refineStylesPrompt(elementId: string, currentStyles: any, designSystem: any): string {
  return `
Analise e refine os estilos CSS do elemento ${elementId} para melhorar:
- Contraste e acessibilidade
- Hierarquia visual
- Espaçamento e respirabilidade  
- Consistência com o design system

Estilos atuais: ${JSON.stringify(currentStyles)}
Design System: ${JSON.stringify(designSystem)}

Retorne APENAS um JSON no seguinte formato:
{
  "suggestions": {
    "backgroundColor": "valor CSS",
    "textColor": "valor CSS", 
    "padding": "valor CSS",
    "margin": "valor CSS",
    "borderRadius": "valor CSS",
    "fontSize": "valor CSS"
  },
  "improvements": [
    "Lista de melhorias aplicadas",
    "Outra melhoria"
  ],
  "reasoning": "Explicação das escolhas feitas"
}

Foque em valores CSS diretos e práticos. Use unidades rem/px adequadas.
`;
}