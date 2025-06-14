import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

const FormDetailsPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`/admin/forms/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error("Failed to fetch form", err);
        setError("Failed to load form details");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!form) return <div className="p-6">Form not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>

      <div className="mb-6 space-y-2">
        <p>
          <strong>Invite Code:</strong> {form.inviteCode}
        </p>
        <p>
          <strong>Created By:</strong> {form.createdBy?.name || "Unknown"}
        </p>
        <p>
          <strong>Finalized:</strong> {form.finalized ? "✅" : "❌"}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {form.createdAt
            ? new Date(form.createdAt).toLocaleString()
            : "Unknown"}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Fields</h2>
        {form.fields?.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {form.fields.map((field) => (
              <li key={field.id}>
                <strong>{field.label}</strong> ({field.fieldType})
              </li>
            ))}
          </ul>
        ) : (
          <p>No fields found.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Responses</h2>
        {form.response?.responses ? (
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap break-words text-sm">
              {JSON.stringify(form.response.responses, null, 2)}
            </pre>
          </div>
        ) : (
          <p>No responses yet.</p>
        )}
      </div>
    </div>
  );
};

export default FormDetailsPage;
