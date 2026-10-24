import type { Metadata } from "next";

import { DocumentsScreen } from "@/components/documents/documents-screen";

export const metadata: Metadata = { title: "Documents" };

const DocumentsPage = () => <DocumentsScreen />;

export default DocumentsPage;
