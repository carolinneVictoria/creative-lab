
export type ImageFormat = "png" | "svg";

export async function svgToBlob(
  svg: SVGSVGElement,
  format: ImageFormat
): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const viewBox = svg.viewBox.baseVal;

  const width = viewBox.width || svg.clientWidth || 800;
  const height = viewBox.height || svg.clientHeight || 800;

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const svgBlob = new Blob(
    [new XMLSerializer().serializeToString(clone)],
    { type: "image/svg+xml;charset=utf-8" }
  );

  let blob: Blob;

  if (format === "svg") {
    blob = svgBlob;
  } else {
    const url = URL.createObjectURL(svgBlob);

    try {
      const image = new Image();
      image.src = url;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error("Não foi possível gerar a imagem."));
      });

      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível.");

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result
              ? resolve(result)
              : reject(new Error("Falha ao exportar PNG.")),
          "image/png"
        );
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return blob;
}

export async function exportImage(
  svg: SVGSVGElement,
  format: ImageFormat,
  fileName = "creative-lab"
) {
  const blob = await svgToBlob(svg, format);
  // Remove caracteres inválidos em nomes de arquivo
  const safeName = fileName.replace(/[\\/:*?"<>|]/g, "").trim() || "creative-lab";
  const fullName = `${safeName}.${format}`;

  // Celular: o atributo download não funciona bem (principalmente no iOS),
  // então usa o menu nativo, que permite salvar a imagem na galeria/arquivos
  const isMobile = window.matchMedia("(pointer: coarse)").matches;
  if (isMobile && typeof navigator.canShare === "function") {
    const file = new File([blob], fullName, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (error) {
        // Usuário cancelou: não cai no download
        if ((error as Error).name === "AbortError") return;
      }
    }
  }

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fullName;
  link.rel = "noopener";
  // Alguns navegadores móveis só disparam o download se o link estiver no DOM
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000);
}
