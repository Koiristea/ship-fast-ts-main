import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/libs/next-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron archivos" },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // El directorio ya existe
    }

    // Procesar cada archivo
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generar nombre único para evitar colisiones
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomString}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      // Guardar archivo
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        path: `/uploads/${fileName}`,
        uploadedBy: session.user.email,
        uploadedAt: new Date().toISOString(),
      });
    }

    // Aquí puedes guardar la información en la base de datos
    // Por ejemplo, usando el modelo User o creando un modelo File
    // await File.create({ userId: session.user.id, files: uploadedFiles });

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
    });
  } catch (error) {
    console.error("Error al subir archivos:", error);
    return NextResponse.json(
      { error: "Error al procesar los archivos" },
      { status: 500 }
    );
  }
}

// Obtener lista de archivos subidos
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Aquí deberías obtener los archivos de la base de datos
    // Por ahora devolvemos un array vacío
    return NextResponse.json({
      success: true,
      files: [],
    });
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    return NextResponse.json(
      { error: "Error al obtener los archivos" },
      { status: 500 }
    );
  }
}
