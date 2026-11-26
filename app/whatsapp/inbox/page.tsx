import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import WhatsappInboxClient from "./WhatsappInboxClient";

export default function WhatsappInbox(){
 return <AppShell><PageHeader title="WhatsApp Inbox" description="Shared WhatsApp conversations for your customer care team."/><WhatsappInboxClient/></AppShell>;
}
