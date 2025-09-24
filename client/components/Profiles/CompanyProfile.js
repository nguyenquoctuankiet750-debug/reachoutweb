import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

function CompanyProfile({ user, profile }) {
  const [edit, setEdit] = useState(false);

  const [name, setName] = useState(profile?.name || "");
  const [head, setHead] = useState(profile?.head || "");
  const [mobile, setMobile] = useState(profile?.mobile || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [gstin, setGstin] = useState(profile?.gstin || "");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setHead(profile.head || "");
      setMobile(profile.mobile || "");
      setWebsite(profile.website || "");
      setGstin(profile.gstin || "");
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("company")
        .upsert([
          {
            id: user.id,
            name,
            head,
            mobile,
            website,
            gstin,
          },
        ]);

      if (error) throw error;
      console.log("✅ Company profile saved:", data);
      setEdit(false);
    } catch (err) {
      console.error("❌ Lỗi khi lưu company:", err.message);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold mb-6">🏢 Company Profile</h1>

      <form
        className="shadow sm:rounded-md sm:overflow-hidden p-5 border border-gray-300 dark:bg-zinc-800"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Company Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!edit}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-zinc-700"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Company Head
            </label>
            <input
              type="text"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              disabled={!edit}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-zinc-700"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Mobile
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={!edit}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-zinc-700"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={!edit}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-zinc-700"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              GSTIN
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              disabled={!edit}
              className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-zinc-700"
            />
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setEdit(!edit)}
            className="mr-4 px-4 py-2 bg-gray-400 text-white rounded-lg"
          >
            {edit ? "Cancel" : "Edit"}
          </button>

          {edit && (
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CompanyProfile;
