import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

function AdminDashboard() {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await axios.get("/admin/forms");
        setForms(res.data);
      } catch (err) {
        console.error("Failed to fetch forms", err);
      }
    };
    fetchForms();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => navigate("/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Create New Form
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Created By</th>
            <th className="border px-4 py-2">Invite Code</th>
            <th className="border px-4 py-2">Fields</th>
            <th className="border px-4 py-2">Finalized</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form.id}>
              <td className="border px-4 py-2">{form.title}</td>
              <td className="border px-4 py-2">
                {form.createdBy?.name || "Unknown"}
              </td>
              <td className="border px-4 py-2">{form.inviteCode}</td>
              <td className="border px-4 py-2 text-center">
                {form.fields?.length || 0}
              </td>
              <td className="border px-4 py-2 text-center">
                {form.finalized ? "✅" : "❌"}
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => navigate(`/admin/forms/${form.id}`)}
                  className="bg-gray-200 text-blue-700 px-3 py-1 rounded hover:bg-blue-100"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
          {forms.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-4">
                No forms found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
