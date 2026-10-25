"use client";

import { useEffect, useState } from "react";
import { IconMessage, IconMail } from "@/components/store/Icons";

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Demandes reçues via le formulaire de contact
        </p>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="p-10 text-center text-neutral-500">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <IconMessage size={20} />
            </div>
            <p className="text-neutral-500">Aucun message pour l'instant.</p>
            <p className="mt-1 text-xs text-neutral-400">
              Les messages du formulaire de contact apparaîtront ici.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {messages.map((m) => (
              <li key={m.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                    <IconMail size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{m.name}</div>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-sm text-neutral-500 hover:text-black"
                        >
                          {m.email}
                        </a>
                      </div>
                      <span className="text-xs text-neutral-400">
                        {new Date(m.createdAt).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-neutral-700">{m.message}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}