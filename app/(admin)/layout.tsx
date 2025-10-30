"use client";

import { ReactNode, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TokenManager } from "@/lib/utils/menory-manager";
import { DashboardProvider } from "@/lib/dashboard-provider";

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const router = useRouter();
	const [ready, setReady] = useState(false);

	useLayoutEffect(() => {
		const isAuthed = TokenManager.isAuthenticated();
		if (!isAuthed) {
			router.replace("/auth/login");
			return;
		}
		setReady(true);
	}, [router]);

	if (!ready) {
		return null;
	}

	return <DashboardProvider>{children}</DashboardProvider>;
}
