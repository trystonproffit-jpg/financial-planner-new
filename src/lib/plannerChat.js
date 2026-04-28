import { supabase } from "./supabase";

export async function requestPlannerChatResponse({ messages, plannerContext }) {
  const { data, error } = await supabase.functions.invoke("planner-chat", {
    body: {
      messages,
      plannerContext,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.reply) {
    throw new Error("The coach chat service did not return a reply.");
  }

  return data.reply;
}
