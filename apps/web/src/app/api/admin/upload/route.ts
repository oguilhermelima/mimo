import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";

import { auth } from "~/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const ALLOWED_FOLDERS = new Set(["product", "stamp", "bundle"]);

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "upload indisponível — BLOB_READ_WRITE_TOKEN não configurado" },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "arquivo ausente" }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "tipo de arquivo inválido" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "arquivo acima de 5MB" },
      { status: 413 },
    );
  }

  const folderInput = String(form.get("folder") ?? "product");
  const folder = ALLOWED_FOLDERS.has(folderInput) ? folderInput : "product";
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const pathname = `${folder}/${cleanName}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}
