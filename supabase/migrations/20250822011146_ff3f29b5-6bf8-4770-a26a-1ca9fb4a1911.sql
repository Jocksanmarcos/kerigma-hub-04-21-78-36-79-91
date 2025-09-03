-- Criar apenas as tabelas que não existem ainda

-- Tabela para armazenar conhecimento do chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'page', 'document', 'manual', 'conversation'
  source_url TEXT,
  keywords TEXT[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para conversas do WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'transferred'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas à tabela whatsapp_messages existente se necessário
ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS message_id TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'outgoing',
ADD COLUMN IF NOT EXISTS response_to UUID;

-- Tabela para treinamento do chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'conversation', 'manual', 'imported'
  confidence_score DECIMAL(3,2),
  user_feedback INTEGER, -- 1-5 rating
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações do chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_keywords ON chatbot_knowledge USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_active ON chatbot_knowledge(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_training_active ON chatbot_training(active) WHERE active = true;

-- Triggers para updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chatbot_knowledge_updated_at') THEN
    CREATE TRIGGER update_chatbot_knowledge_updated_at
        BEFORE UPDATE ON chatbot_knowledge
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chatbot_settings_updated_at') THEN
    CREATE TRIGGER update_chatbot_settings_updated_at
        BEFORE UPDATE ON chatbot_settings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();
  END IF;
END $$;

-- RLS Policies
ALTER TABLE public.chatbot_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores (criar apenas se não existem)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Administradores podem gerenciar conhecimento' AND tablename = 'chatbot_knowledge') THEN
    CREATE POLICY "Administradores podem gerenciar conhecimento" 
    ON public.chatbot_knowledge FOR ALL 
    USING (is_sede_admin() OR is_pastor_missao());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Administradores podem ver conversas WhatsApp' AND tablename = 'whatsapp_conversations') THEN
    CREATE POLICY "Administradores podem ver conversas WhatsApp" 
    ON public.whatsapp_conversations FOR ALL 
    USING (is_sede_admin() OR is_pastor_missao());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Administradores podem gerenciar treinamento' AND tablename = 'chatbot_training') THEN
    CREATE POLICY "Administradores podem gerenciar treinamento" 
    ON public.chatbot_training FOR ALL 
    USING (is_sede_admin() OR is_pastor_missao());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Administradores podem gerenciar configurações' AND tablename = 'chatbot_settings') THEN
    CREATE POLICY "Administradores podem gerenciar configurações" 
    ON public.chatbot_settings FOR ALL 
    USING (is_sede_admin() OR is_pastor_missao());
  END IF;
END $$;

-- Inserir configurações padrão (apenas se não existem)
INSERT INTO public.chatbot_settings (setting_key, setting_value, description) 
SELECT 'whatsapp_welcome_message', 
       '{"message": "Olá! 👋 Sou o assistente virtual da Igreja. Como posso ajudá-lo hoje?"}',
       'Mensagem de boas-vindas do WhatsApp'
WHERE NOT EXISTS (SELECT 1 FROM chatbot_settings WHERE setting_key = 'whatsapp_welcome_message');

INSERT INTO public.chatbot_settings (setting_key, setting_value, description) 
SELECT 'chatbot_personality', 
       '{"tone": "friendly", "style": "helpful", "context": "Você é um assistente virtual de uma igreja cristã. Seja sempre respeitoso, acolhedor e útil. Use emojis quando apropriado e mantenha um tom caloroso e pastoral."}',
       'Personalidade e tom do chatbot'
WHERE NOT EXISTS (SELECT 1 FROM chatbot_settings WHERE setting_key = 'chatbot_personality');

INSERT INTO public.chatbot_settings (setting_key, setting_value, description) 
SELECT 'auto_learning', 
       '{"enabled": true, "confidence_threshold": 0.8}',
       'Configurações de aprendizado automático'
WHERE NOT EXISTS (SELECT 1 FROM chatbot_settings WHERE setting_key = 'auto_learning');