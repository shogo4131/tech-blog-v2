import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
	title?: ReactNode;
	subtitle?: string;
	showBackLink?: boolean;
};

export function Header({ title, subtitle, showBackLink }: Props) {
	return (
		<header className="border-b border-gray-800">
			<div className="max-w-6xl mx-auto px-6 py-4 flex items-start justify-between">
				<div className={showBackLink && !title ? "" : "py-4"}>
					{showBackLink && (
						<Link
							to="/"
							className="text-gray-400 hover:text-white transition-colors text-sm"
						>
							&larr; Back to Home
						</Link>
					)}
					{title && (
						<h1
							className={`text-3xl font-bold text-white ${showBackLink ? "mt-4" : ""}`}
						>
							{title}
						</h1>
					)}
					{subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
				</div>
				<a
					href="https://shogo-portfolio.vercel.app/"
					target="_blank"
					rel="noopener noreferrer"
					className={`text-gray-400 hover:text-white transition-colors text-sm ${showBackLink && !title ? "" : "py-4"}`}
				>
					About
				</a>
			</div>
		</header>
	);
}
