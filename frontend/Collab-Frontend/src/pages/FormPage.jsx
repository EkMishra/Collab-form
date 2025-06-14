import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import LiveEditForm from '../components/LiveEditForm';

export default function FormPage() {
  const { inviteCode } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      const name = prompt("Enter your name"); 
      const newUser = {
        name: name || `User-${Math.floor(Math.random() * 10000)}`,
        role: 'user',
      };
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
    }
  }, []);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await api.post(`/users/forms/${inviteCode}/join`);
        setForm(data);
      } catch (err) {
        console.error('Failed to fetch form:', err);
        alert('Form not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [inviteCode]);

  if (loading || !currentUser) return <p className="p-6">Loading...</p>;

  if (!form) return <p className="p-6 text-red-600">Form not found.</p>;

  return (
    <LiveEditForm form={form} currentUser={currentUser} />
  );
}
