import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  author: string; // "me" | "team"
  text: string;
  at: string; // ISO
  authorId?: string;
  authorName?: string;
}

const initialMessages: Message[] = [
  { id: "1", author: "team", text: "Bem-vindos ao chat do Ministério!", at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "2", author: "me", text: "Olá! Podemos confirmar o ensaio de sábado às 16h?", at: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
  { id: "3", author: "team", text: "Perfeito. Vou avisar os instrumentistas.", at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
];

export default function ChatInterno({ roomId = "ministerios-geral" }: { roomId?: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Eu");
  const channelRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const u = data.user as any;
        if (u) {
          setUserId(u.id);
          setUserName(u?.user_metadata?.full_name || u?.email || "Membro");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const channel = supabase.channel(`ministerios-chat:${roomId}`, { config: { broadcast: { self: false } } });
    channel.on('broadcast', { event: 'message' }, ({ payload }) => {
      const incoming: any = payload;
      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        const msg: Message = {
          id: incoming.id,
          author: incoming.authorId === userId ? 'me' : 'team',
          text: incoming.text,
          at: incoming.at,
          authorId: incoming.authorId,
          authorName: incoming.authorName,
        };
        return [...prev, msg];
      });
    });
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch {}
      }
      channelRef.current = null;
    };
  }, [roomId, userId]);

  const sorted = useMemo(() =>
    [...messages].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()),
  [messages]);

  const onSend = () => {
    if (!text.trim()) return;
    const id = Math.random().toString(36).slice(2);
    const now = new Date().toISOString();
    const m: Message = {
      id,
      author: "me",
      text: text.trim(),
      at: now,
      authorId: userId || undefined,
      authorName: userName,
    };
    setMessages((prev) => [...prev, m]);
    setText("");
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: { id, text: m.text, at: now, authorId: userId, authorName: userName }
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comunicação Interna do Ministério
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[360px] px-4 py-4">
          <div className="space-y-4">
            {sorted.map((m) => {
              const mine = m.author === "me";
              const initials = mine ? "EU" : "EQ";
              return (
                <div key={m.id} className="flex gap-3 items-start">
                  {!mine && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] rounded-kerigma px-3 py-2 text-sm shadow-kerigma ${mine ? "ml-auto bg-primary/10 text-foreground" : "bg-card text-card-foreground"}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <span className="block mt-1 text-[10px] text-muted-foreground">
                      {new Date(m.at).toLocaleString()}
                    </span>
                  </div>
                  {mine && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="flex w-full items-center gap-2">
          <Input
            placeholder="Escreva uma mensagem para sua equipe..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            aria-label="Mensagem"
          />
          <Button onClick={onSend} className="shrink-0" aria-label="Enviar mensagem">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
