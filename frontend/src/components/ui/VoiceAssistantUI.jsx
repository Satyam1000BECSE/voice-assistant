import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Send, Clock, Calendar, BookOpen } from "lucide-react";
import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function VoiceAssistantUI() {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("Hello, I am your voice assistant, " + "  How may i help you?");
  const [heard, setHeard] = useState("");
  const [loading, setLoading] = useState(false);

  // Speak out every new assistant response
  useEffect(() => {
    if (response) {
      const utter = new SpeechSynthesisUtterance(response);
      utter.rate = 1; // normal speed
      utter.pitch = 1;
      utter.lang = "en-IN"; // Indian English voice
      window.speechSynthesis.cancel(); // stop ongoing speech
      window.speechSynthesis.speak(utter);
    }
  }, [response]);

  // =============================
  //  Send text or mic command
  // =============================
  const sendCommand = async (useMic = false) => {
    const trimmed = (command || "").trim();

    if (!useMic && !trimmed) {
      setResponse("Please type a command (e.g., time, date, play <song>, wikipedia <topic>).");
      return;
    }

    setLoading(true);
    setResponse("Processing...");
    setHeard("");

    try {
      const res = await fetch("http://localhost:8000/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed, use_mic: useMic }),
      });

      if (!res.ok) {
        setResponse("Backend responded with status: " + res.status);
      } else {
        const data = await res.json();
        setResponse(data.response || "No response");
        setHeard(data.heard || (useMic ? "(heard from mic)" : trimmed));
      }
    } catch (err) {
      setResponse("Cannot reach backend. Make sure FastAPI server is running. Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container">


      <Card>
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Mic className="text-blue-400" size={36} /> Voice Assistant
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Type a command or use your microphone
          </p>
        </motion.div>


        <div className="output" role="log">
          {loading ? (
            <span>🕐 Listening or processing...</span>
          ) : (
            <>
              {heard && (
                <div style={{ marginBottom: "8px", color: "#888" }}>
                  <strong>You said:</strong> {heard}
                </div>
              )}
              <div>
                <strong>Assistant:</strong> {response}
              </div>
            </>
          )}
        </div>
        <div className="input-row">
          <input
            className="input"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder='e.g. "time" or "play shape of you"'
            onKeyDown={(e) => e.key === "Enter" && sendCommand(false)}
          />
          <button
            onClick={() => sendCommand(false)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-3 flex items-center justify-center transition-colors">
            <Send size={25} />
          </button>
          <motion.button
            onClick={() => sendCommand(true)}
            className="rounded-full p-6 mt-6 bg-gray-700 hover:bg-blue-600 text-blue-400 mx-auto block"
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: [
                "0 0 0px #3b82f6",
                "0 0 20px #3b82f6",
                "0 0 0px #3b82f6",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Mic size={28} />
          </motion.button>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: "10px" }}>

          <Button
            onClick={() => {
              setCommand("time");
              sendCommand(false);
            }}
          >
            <Clock size={16} className="inline mr-1" /> Time
          </Button>
          <Button
            onClick={() => {
              setCommand("date");
              sendCommand(false);
            }}
          >
            <Calendar size={16} className="inline mr-1" /> Date
          </Button>
          <Button
            onClick={() => {
              setCommand("wikipedia India");
              sendCommand(false);
            }}
          >
            <BookOpen size={16} className="inline mr-1" /> Wiki
          </Button>
        </div>
      </Card>
    </div>
  );
}  