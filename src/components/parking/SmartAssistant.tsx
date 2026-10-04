import { useState } from "react";
import { useParking } from "@/lib/parking/useParking";
import { assistantReply, availableSpaces, recommendParking } from "@/lib/parking/service";
import { PageTitle, Panel, Field, Hint, Status } from "./ui";
export function SmartAssistant() {
  const { state } = useParking();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const suggestions = [
    "Where did I park?",
    "What is my wallet balance?",
    "How much is my current parking charge?",
    "Which parking facility has availability?",
    "How do I reach the exit?",
    "Show my latest transaction.",
  ];
  function ask(q: string) {
    if (!q.trim()) return;
    setMessages([...messages, { question: q, answer: assistantReply(state, q) }]);
    setQuestion("");
  }
  return (
    <>
      <PageTitle
        title="SPM Smart Assistant"
        description="State-aware parking help through a controlled demo adapter."
      />
      <div className="parking-two-column">
        <Panel title="Ask about your journey">
          <Hint>
            Controlled demo assistant. No online AI model or trained ML service is connected.
          </Hint>
          <div className="parking-suggestions">
            {suggestions.map((q) => (
              <button key={q} onClick={() => ask(q)}>
                {q}
              </button>
            ))}
          </div>
          <div className="parking-chat" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i}>
                <p className="parking-chat-question">{m.question}</p>
                <p className="parking-chat-answer">{m.answer}</p>
              </div>
            ))}
          </div>
          <form
            className="parking-form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <Field label="Your question">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about your booking, wallet or parking…"
              />
            </Field>
            <button className="eco-button">Ask demo assistant</button>
          </form>
        </Panel>
        <Panel title="Demo intelligence">
          <h3>Parking recommendations</h3>
          <Hint>
            Transparent heuristic based on availability, distance and price; not a trained model.
          </Hint>
          {recommendParking(state).map(({ facility: f }, i) => (
            <a className="parking-list-row" href={`/app/parking/${f.id}`} key={f.id}>
              <div>
                <h3>
                  {i + 1}. {f.name}
                </h3>
                <p>
                  {availableSpaces(f)} available · {f.distanceKm} km
                </p>
              </div>
            </a>
          ))}
          <h3>Demo demand forecast</h3>
          {state.facilities.map((f) => {
            const occupancy = (f.slots.length - availableSpaces(f)) / f.slots.length;
            return (
              <div className="parking-list-row" key={f.id}>
                <span>{f.name}</span>
                <Status value={occupancy >= 0.8 ? "HIGH" : occupancy >= 0.4 ? "MEDIUM" : "LOW"} />
              </div>
            );
          })}
          <p>
            Demo duration estimate: 75 minutes for the campus presentation. Booking conflict checks
            flag duplicate reservations deterministically.
          </p>
          <Hint>
            Forecast labels are scenario estimates, not accuracy claims. Replace the adapter with a
            validated model service when available.
          </Hint>
        </Panel>
      </div>
    </>
  );
}
