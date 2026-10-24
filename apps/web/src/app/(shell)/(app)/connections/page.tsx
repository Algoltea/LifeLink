import type { Metadata } from "next";

import { ConnectionsScreen } from "@/components/connections/connections-screen";

export const metadata: Metadata = { title: "Connections" };

const ConnectionsPage = () => <ConnectionsScreen />;

export default ConnectionsPage;
