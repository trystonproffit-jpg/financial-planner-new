import { useEffect, useRef } from "react";

function ChatPage({
  coachError,
  coachInput,
  coachLoading,
  coachMessages,
  coachPromptOptions,
  coachResponses,
  financials,
  insights,
  onCoachInputChange,
  onSendCoachMessage,
}) {
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (!chatScrollRef.current) {
      return;
    }

    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [coachLoading, coachMessages]);

  function handleSubmit(event) {
    event.preventDefault();
    onSendCoachMessage();
  }

  return (
    <>
      <section className="page-intro">
        <span className="eyebrow">Coach Chat</span>
        <h2 className="page-title">Ask questions about your spending, income, and budget.</h2>
        <p className="page-copy">
          Your coach can use your saved planner data to give practical suggestions based on your actual numbers.
        </p>
      </section>

      <section className="coach-layout">
        <article className="panel coach-context-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Your planner snapshot</h2>
              <p className="panel-subtitle">These numbers help the coach tailor its advice to your current budget.</p>
            </div>
          </div>

          <div className="coach-summary-grid">
            <div className="coach-summary-card">
              <span className="field-label">Income</span>
              <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(financials.income)}</strong>
            </div>
            <div className="coach-summary-card">
              <span className="field-label">Expenses</span>
              <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(financials.expenses)}</strong>
            </div>
            <div className="coach-summary-card">
              <span className="field-label">Net balance</span>
              <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(financials.balance)}</strong>
            </div>
            <div className="coach-summary-card">
              <span className="field-label">Recurring items</span>
              <strong>{financials.recurringCount}</strong>
            </div>
          </div>
        </article>

        <article className="panel coach-main-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Financial coach</h2>
              <p className="panel-subtitle">Ask for help with spending, income, recurring bills, or budget decisions.</p>
            </div>
          </div>

          <div className="coach-chat-panel">
            <div className="coach-prompt-row">
              {coachPromptOptions.map((prompt) => (
                <button key={prompt} type="button" className="coach-prompt-chip" onClick={() => onSendCoachMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <div ref={chatScrollRef} className="coach-chat-window">
              <div className="coach-chat-list">
                {coachMessages.map((message) => (
                  <div key={message.id} className="coach-chat-card">
                    <div className={`coach-bubble ${message.role === "user" ? "user" : "assistant"}`}>{message.content}</div>
                  </div>
                ))}
                {coachLoading ? <div className="coach-bubble assistant">Reviewing the planner and drafting advice...</div> : null}
              </div>
            </div>

            {coachError ? <div className="status-banner info">{coachError}</div> : null}

            <form className="coach-input-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field-label">Ask the coach</span>
                <textarea
                  className="field-input min-h-32"
                  value={coachInput}
                  onChange={(event) => onCoachInputChange(event.target.value)}
                  placeholder="Where should I cut back first this month?"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="primary-button" disabled={coachLoading || !coachInput.trim()}>
                  {coachLoading ? "Thinking..." : "Send question"}
                </button>
              </div>
            </form>
          </div>
        </article>
      </section>

      <article className="panel coach-reference-section">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Reference</span>
            <h2 className="panel-title">Budget notes and example prompts</h2>
            <p className="panel-subtitle">
              Use this section for a quick summary of your budget and a few ideas for questions you can ask.
            </p>
          </div>
        </div>

        <div className="insight-list">
          {insights.map((insight) => (
            <div key={insight} className="insight-row">
              {insight}
            </div>
          ))}
        </div>

        <div className="coach-reference-grid">
          {coachPromptOptions.map((prompt) => (
            <div key={prompt} className="coach-reference-card">
              <strong>{prompt}</strong>
              <p className="preview-meta">{coachResponses[prompt]}</p>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}

export default ChatPage;
