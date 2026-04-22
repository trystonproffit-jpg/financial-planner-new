import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Tesseract from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const FREE_TEXT_EXTENSIONS = [".txt", ".csv"];
const FREE_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"];
const PAID_FALLBACK_ESTIMATES = {
  scannedPdfPerPage: 0.02,
  unsupportedDocument: 0.05,
};

function getExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
}

function formatCostEstimate(value) {
  return `$${value.toFixed(2)}`;
}

function normalizeExtractedText(value) {
  return value.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function inspectFileForFreeImport(file) {
  const extension = getExtension(file.name);
  const mimeType = file.type || "";
  const isFreeText = mimeType.startsWith("text/") || FREE_TEXT_EXTENSIONS.includes(extension);
  const isPdf = mimeType === "application/pdf" || extension === ".pdf";
  const isFreeImage = mimeType.startsWith("image/") || FREE_IMAGE_EXTENSIONS.includes(extension);

  if (isFreeText || isPdf || isFreeImage) {
    return {
      freeSupported: true,
      extension,
      message: "",
      estimatedCost: 0,
    };
  }

  return {
    freeSupported: false,
    extension,
    message: "This file type is outside the free in-browser extraction pipeline and would need a paid parser/OCR service.",
    estimatedCost: PAID_FALLBACK_ESTIMATES.unsupportedDocument,
  };
}

async function extractPdfText(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();

    if (text) {
      pageTexts.push(text);
    }
  }

  return {
    text: normalizeExtractedText(pageTexts.join("\n")),
    pageCount: pdf.numPages,
  };
}

async function extractImageText(file) {
  const result = await Tesseract.recognize(file, "eng");
  return normalizeExtractedText(result.data.text || "");
}

export async function extractDocumentText(file) {
  const inspection = inspectFileForFreeImport(file);

  if (!inspection.freeSupported) {
    return {
      mode: "paid_required",
      fileName: file.name,
      text: "",
      estimatedCost: inspection.estimatedCost,
      reason: inspection.message,
    };
  }

  const extension = inspection.extension;
  const mimeType = file.type || "";
  const isText = mimeType.startsWith("text/") || FREE_TEXT_EXTENSIONS.includes(extension);
  const isPdf = mimeType === "application/pdf" || extension === ".pdf";
  const isImage = mimeType.startsWith("image/") || FREE_IMAGE_EXTENSIONS.includes(extension);

  if (isText) {
    return {
      mode: "free",
      fileName: file.name,
      text: normalizeExtractedText(await file.text()),
      estimatedCost: 0,
    };
  }

  if (isImage) {
    return {
      mode: "free",
      fileName: file.name,
      text: await extractImageText(file),
      estimatedCost: 0,
    };
  }

  if (isPdf) {
    const pdfResult = await extractPdfText(file);

    if (pdfResult.text) {
      return {
        mode: "free",
        fileName: file.name,
        text: pdfResult.text,
        estimatedCost: 0,
      };
    }

    const estimatedCost = Number((pdfResult.pageCount * PAID_FALLBACK_ESTIMATES.scannedPdfPerPage).toFixed(2));

    return {
      mode: "paid_required",
      fileName: file.name,
      text: "",
      estimatedCost,
      reason: `This PDF looks like a scanned document without a readable text layer. A paid OCR fallback would likely be needed for ${pdfResult.pageCount} page${pdfResult.pageCount === 1 ? "" : "s"}.`,
    };
  }

  return {
    mode: "paid_required",
    fileName: file.name,
    text: "",
    estimatedCost: PAID_FALLBACK_ESTIMATES.unsupportedDocument,
    reason: "This file format is not supported by the free extraction pipeline.",
  };
}

export function summarizeCostWarning(items) {
  const totalEstimate = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  return {
    totalEstimate,
    totalEstimateLabel: formatCostEstimate(totalEstimate),
    items: items.map((item) => ({
      ...item,
      estimatedCostLabel: formatCostEstimate(item.estimatedCost || 0),
    })),
  };
}
