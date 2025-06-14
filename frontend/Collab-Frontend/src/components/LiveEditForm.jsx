import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import api from "../api/axios";

export default function LiveEditForm({ form, currentUser }) {
  const [responses, setResponses] = useState({});
  const [locks, setLocks] = useState({});
  const [saving, setSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(form.finalized); 

  const formId = form.id;
  const heartbeatRef = useRef({});

  useEffect(() => {
    if (form.response?.responses) {
      setResponses(form.response.responses);
    }

    socket.emit("join_form", { formId });

    socket.on("field_update", ({ fieldKey, value }) => {
      setResponses((prev) => ({ ...prev, [fieldKey]: value }));
    });

    socket.on("field_locked", ({ fieldKey, userId }) => {
      setLocks((prev) => ({ ...prev, [fieldKey]: userId }));
    });

    socket.on("field_unlocked", ({ fieldKey }) => {
      setLocks((prev) => {
        const newLocks = { ...prev };
        delete newLocks[fieldKey];
        return newLocks;
      });
    });

    socket.on("field_lock_denied", ({ fieldKey, lockedBy }) => {
      setLocks((prev) => ({ ...prev, [fieldKey]: lockedBy }));
    });

    socket.on("field_lock_acquired", ({ fieldKey }) => {
      setLocks((prev) => {
        const newLocks = { ...prev };
        delete newLocks[fieldKey];
        return newLocks;
      });
    });

    socket.on("form_finalized", ({ message }) => {
      alert(message || "Form has been finalized.");
      setIsFinalized(true); 
    });

    return () => {
      socket.emit("leave_form", { formId });
      socket.off("field_update");
      socket.off("field_locked");
      socket.off("field_unlocked");
      socket.off("field_lock_denied");
      socket.off("field_lock_acquired");
      socket.off("form_finalized");
    };
  }, [formId]);

  const handleFocus = (fieldKey) => {
    if (isFinalized) return;
    socket.emit("field_lock", { formId, fieldKey, userId: currentUser.name });
  };

  const handleChange = async (fieldKey, value) => {
    if (isFinalized) return;

    const currentLock = locks[fieldKey];
    const isOwner = currentLock === currentUser.name || !currentLock;

    if (!isOwner) {
      socket.emit("field_lock", { formId, fieldKey, userId: currentUser.name });
      return;
    }

    const now = Date.now();
    const last = heartbeatRef.current[fieldKey] || 0;
    if (now - last > 5000) {
      socket.emit("lock_heartbeat", { formId, fieldKey, userId: currentUser.name });
      heartbeatRef.current[fieldKey] = now;
    }

    setResponses((prev) => ({ ...prev, [fieldKey]: value }));
    socket.emit("field_update", { formId, fieldKey, value });

    setSaving(true);
    try {
      await api.put(`/responses/form/${formId}`, { fieldKey, value });
    } catch (err) {
      console.error(" Failed to save", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    try {
      await api.post("/responses/form/finalize", { formId });
      alert("Form finalized!");
      setIsFinalized(true);
    } catch (err) {
      console.error(err);
      alert("Failed to finalize.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{form.title}</h1>

      {isFinalized && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
          This form has been finalized and is no longer editable.
        </div>
      )}

      <div className="space-y-6">
        {form.fields.map((field) => {
          const isLocked = locks[field.id] && locks[field.id] !== currentUser.name;
          const isDisabled = isLocked || isFinalized;

          return (
            <div
              key={field.id}
              className={`border p-5 rounded-2xl shadow-sm transition ${
                isLocked
                  ? "bg-red-50 border-red-300"
                  : isFinalized
                  ? "bg-gray-50 border-gray-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <label className="block text-lg font-medium text-gray-700 mb-2">
                {field.label}
              </label>

              {isLocked && (
                <p className="text-sm text-red-500 mb-2">
                  Being edited by {locks[field.id]}
                </p>
              )}

              {field.fieldType === "text" || field.fieldType === "number" ? (
                <input
                  type={field.fieldType}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={responses[field.id] || ""}
                  disabled={isDisabled}
                  onFocus={() => handleFocus(field.id)}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                />
              ) : field.fieldType === "dropdown" ? (
                <select
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={responses[field.id] || ""}
                  disabled={isDisabled}
                  onFocus={() => handleFocus(field.id)}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          );
        })}
      </div>

      { !isFinalized && (
        <button
          className="mt-8 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 shadow-sm"
          onClick={handleFinalize}
        >
          Finalize Form
        </button>
      )}

      {saving && <p className="mt-4 text-sm text-gray-500">Saving...</p>}
    </div>
  );
}
