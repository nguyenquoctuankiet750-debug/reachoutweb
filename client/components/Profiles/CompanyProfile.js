import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function CompanyProfile({ user }) {
  const [form, setForm] = useState({
    name: "",
    head: "",
    mobile: "",
    website: "",
    gstin: "",
  });

  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu company từ DB
  useEffect(() => {
    const fetchCompany = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("company")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("❌ Error fetching company:", error.message);
        } else if (data) {
          setForm({
            name: data.name || "",
            head: data.head || "",
            mobile: data.mobile || "",
            website: data.website || "",
            gstin: data.gstin || "",
          });
        }
        setLoading(false);
      }
    };

    fetchCompany();
  }, [user]);

  // Lưu thay đổi vào DB
  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("company")
      .upsert({
        id: user.id,
        ...form,
      });

    if (error) {
      alert("❌ Lỗi khi lưu company: " + error.message);
    } else {
      alert("✅ Company profile đã được lưu!");
    }

    setLoading(false);
  };

  if (loading) return <h1>Loading...</h1>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Company Profile</h2>

      <input
        type="text"
        placeholder="Company Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Head of Company"
        value={form.head}
        onChange={(e) => setForm({ ...form, head: e.target.value })}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Mobile Number"
        value={form.mobile}
        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Website"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="GSTIN"
        value={form.gstin}
        onChange={(e) => setForm({ ...form, gstin: e.target.value })}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
