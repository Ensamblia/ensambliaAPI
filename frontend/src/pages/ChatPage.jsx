import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatBox } from '../components/chat/ChatBox';
import { PageHeader } from '../components/ui';
import styles from './ChatPage.module.css';

export function ChatPage() {
  return (
    <main className={styles.page}>
      <PageHeader
        title="Mensajes"
        icon={<MessageCircle size={22} />}
        tone="purple"
        subtitle="Habla directamente con otros músicos, sin salir de Ensamblia."
        className={styles.header}
      />
      <ChatBox />
    </main>
  );
}
