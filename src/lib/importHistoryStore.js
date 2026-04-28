import { supabase } from "./supabase";

function isMissingTableError(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return error?.code === "42P01" || message.includes("import_sessions") || message.includes("relation");
}

function normalizeImportSession(record) {
  return {
    id: String(record.id),
    status: record.status || "review",
    documentType: record.document_type || "mixed",
    sourceFiles: Array.isArray(record.source_files) ? record.source_files : [],
    rawTextPreview: record.raw_text_preview || "",
    parsedItems: Array.isArray(record.parsed_items) ? record.parsed_items : [],
    costWarningItems: Array.isArray(record.cost_warning_items) ? record.cost_warning_items : [],
    totalCount: Number(record.total_count) || 0,
    approvedCount: Number(record.approved_count) || 0,
    duplicateCount: Number(record.duplicate_count) || 0,
    importedCount: Number(record.imported_count) || 0,
    skippedCount: Number(record.skipped_count) || 0,
    createdAt: record.created_at || "",
    updatedAt: record.updated_at || "",
    importedAt: record.imported_at || "",
  };
}

function buildSessionPayload(user, session) {
  return {
    user_id: user.id,
    status: session.status,
    document_type: session.documentType,
    source_files: session.sourceFiles,
    raw_text_preview: session.rawTextPreview,
    parsed_items: session.parsedItems,
    cost_warning_items: session.costWarningItems,
    total_count: session.totalCount,
    approved_count: session.approvedCount,
    duplicate_count: session.duplicateCount,
    imported_count: session.importedCount,
    skipped_count: session.skippedCount,
    imported_at: session.importedAt || null,
    updated_at: new Date().toISOString(),
  };
}

export async function loadImportHistory(user) {
  const { data, error } = await supabase
    .from("import_sessions")
    .select(`
      id,
      status,
      document_type,
      source_files,
      raw_text_preview,
      parsed_items,
      cost_warning_items,
      total_count,
      approved_count,
      duplicate_count,
      imported_count,
      skipped_count,
      created_at,
      updated_at,
      imported_at
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(8);

  if (error) {
    if (isMissingTableError(error)) {
      return [];
    }

    throw error;
  }

  return (data || []).map(normalizeImportSession);
}

export async function createImportSession(user, session) {
  const { data, error } = await supabase
    .from("import_sessions")
    .insert(buildSessionPayload(user, session))
    .select(`
      id,
      status,
      document_type,
      source_files,
      raw_text_preview,
      parsed_items,
      cost_warning_items,
      total_count,
      approved_count,
      duplicate_count,
      imported_count,
      skipped_count,
      created_at,
      updated_at,
      imported_at
    `)
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return null;
    }

    throw error;
  }

  return normalizeImportSession(data);
}

export async function updateImportSession(user, sessionId, session) {
  const { data, error } = await supabase
    .from("import_sessions")
    .update(buildSessionPayload(user, session))
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select(`
      id,
      status,
      document_type,
      source_files,
      raw_text_preview,
      parsed_items,
      cost_warning_items,
      total_count,
      approved_count,
      duplicate_count,
      imported_count,
      skipped_count,
      created_at,
      updated_at,
      imported_at
    `)
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return null;
    }

    throw error;
  }

  return normalizeImportSession(data);
}
