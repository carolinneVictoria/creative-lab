
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
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  // Remove caracteres inválidos em nomes de arquivo
  const safeName = fileName.replace(/[\\/:*?"<>|]/g, "").trim() || "creative-lab";
  link.download = `${safeName}.${format}`;
  link.click();

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
