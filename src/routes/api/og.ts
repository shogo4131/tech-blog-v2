import { createFileRoute } from "@tanstack/react-router";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const fontUrl =
	"https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFJEk757Y0rw_qMHVdbR2L8Y9QhcLfg.ttf";

let fontCache: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
	if (fontCache) {
		return fontCache;
	}
	const response = await fetch(fontUrl);
	fontCache = await response.arrayBuffer();
	return fontCache;
}

function OgImageTemplate({
	title,
	date,
	tags,
}: {
	title: string;
	date?: string;
	tags?: string[];
}) {
	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "flex-start",
				width: "100%",
				height: "100%",
				padding: "60px",
				background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
				fontFamily: "Noto Sans JP",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							fontSize: "48px",
							fontWeight: "bold",
							color: "#ffffff",
							lineHeight: 1.4,
							maxWidth: "900px",
						},
						children: title,
					},
				},
				date
					? {
							type: "div",
							props: {
								style: {
									display: "flex",
									marginTop: "24px",
									fontSize: "24px",
									color: "#9ca3af",
								},
								children: date,
							},
						}
					: null,
				tags && tags.length > 0
					? {
							type: "div",
							props: {
								style: {
									display: "flex",
									gap: "12px",
									marginTop: "24px",
								},
								children: tags.map((tag) => ({
									type: "div",
									props: {
										style: {
											display: "flex",
											padding: "8px 16px",
											background: "#22d3ee",
											borderRadius: "9999px",
											fontSize: "18px",
											color: "#000000",
										},
										children: tag,
									},
								})),
							},
						}
					: null,
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							position: "absolute",
							bottom: "40px",
							right: "60px",
							fontSize: "28px",
							color: "#22d3ee",
							fontWeight: "bold",
						},
						children: "Tech Blog",
					},
				},
			].filter(Boolean),
		},
	};
}

export const Route = createFileRoute("/api/og")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const title = url.searchParams.get("title") ?? "Tech Blog";
				const date = url.searchParams.get("date") ?? undefined;
				const tags = url.searchParams.get("tags")
					? (url.searchParams.get("tags") as string).split(",").filter(Boolean)
					: [];

				const font = await getFont();

				const svg = await satori(OgImageTemplate({ title, date, tags }), {
					width: 1200,
					height: 630,
					fonts: [
						{
							name: "Noto Sans JP",
							data: font,
							weight: 700,
							style: "normal",
						},
					],
				});

				const resvg = new Resvg(svg, {
					fitTo: { mode: "width", value: 1200 },
				});
				const png = resvg.render().asPng();

				return new Response(png, {
					headers: {
						"Content-Type": "image/png",
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				});
			},
		},
	},
});
