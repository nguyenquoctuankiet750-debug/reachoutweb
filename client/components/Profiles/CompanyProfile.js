import { useState, useEffect } from "react";
import { Auth } from "@supabase/ui";
import { supabase } from "../../utils/supabaseClient";
import { useDropzone } from "react-dropzone";

function CompanyProfile({ user }) {
  const [edit, setEdit] = useState(false);
  const [edit2, setEdit2] = useState(false);
  const [newCompany, setNewCompany] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    email: user?.email || "",
    website: "",
    mobile: "",
    establishment_date: "",
    head: "",
    tax_id: "", // ✅ đổi từ gstin
    about: "",
  });
  const [publicURL, setPublicURL] = useState("");
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({});

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  // Lấy dữ liệu từ Supabase
  const fetchCompany = async () => {
    const { data, error } = await supabase
      .from("company")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(); // 👈 tránh lỗi khi nhiều/không có record

    if (error) {
      console.error("Error fetching company:", error);
      setNewCompany(true);
      setEdit(true);
      setEdit2(true);
    } else if (data) {
      setCompanyData({
        name: data.name || "",
        email: data.email || user.email,
        website: data.website || "",
        mobile: data.mobile || "",
        establishment_date: data.establishment_date || "",
        head: data.head || "",
        tax_id: data.tax_id || "", // ✅ đổi từ gstin
        about: data.about || "",
      });

      const { publicURL } = supabase.storage
        .from("association")
        .getPublicUrl(`public/${user.id}.pdf`);
      setPublicURL(publicURL || "");
    } else {
      setNewCompany(true);
      setEdit(true);
      setEdit2(true);
    }
  };

  useEffect(() => {
    if (user) fetchCompany();
  }, [user]);

  // Gửi dữ liệu lên Supabase
  const submitForm = async () => {
    const companyPayload = {
      id: user.id,
      name: companyData.name,
      email: companyData.email,
      website: companyData.website,
      mobile: companyData.mobile,
      establishment_date: companyData.establishment_date,
      head: companyData.head,
      tax_id: companyData.tax_id, // ✅ đổi từ gstin
      about: companyData.about,
    };

    let res;
    if (newCompany) {
      res = await supabase.from("company").insert([companyPayload]);
    } else {
      res = await supabase
        .from("company")
        .update(companyPayload)
        .eq("id", user.id);
    }

    if (res.error) {
      console.error("Error saving company:", res.error);
    } else {
      setNewCompany(false);
      console.log("Company saved:", res.data);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (edit) {
      await submitForm();
      setEdit(false);
    } else {
      setEdit(true);
    }
  };

  const handleEditSave2 = (e) => {
    e.preventDefault();
    setEdit2(!edit2);
  };

  const fileSelectedHandler = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const { error } = await supabase.storage
      .from("association")
      .upload(`public/${user.id}.pdf`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("File upload error:", error);
      return;
    }

    const { publicURL } = supabase.storage
      .from("association")
      .getPublicUrl(`public/${user.id}.pdf`);
    setPublicURL(publicURL);
  };

  return (
    <div className="p-10">
      {/* PDF Upload Section */}
      <div className="md:grid md:grid-cols-3 md:gap-6 mb-10">
        <div className="md:col-span-1">
          <h1 className="text-3xl font-medium text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            This information will be displayed publicly.
          </p>
        </div>
        <div className="md:col-span-2 mt-5 md:mt-0">
          <form className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white dark:bg-zinc-800 space-y-6">
              {!publicURL ? (
                <div {...getRootProps({ className: "dropzone" })}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white">
                    Upload Article of Association
                  </label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <input
                        {...getInputProps()}
                        onChange={fileSelectedHandler}
                        disabled={!edit2}
                      />
                      <aside className="text-xs text-gray-500">
                        <ul>{files}</ul>
                      </aside>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-sm font-medium text-gray-700 dark:text-white my-4">
                    Article of Association Uploaded
                  </h2>
                  <object
                    width="100%"
                    height="400"
                    data={publicURL}
                    type="application/pdf"
                  />
                </div>
              )}
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right dark:bg-zinc-800">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={handleEditSave2}
              >
                {edit2 ? "Save" : "Edit"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Company Info Section */}
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-3xl font-medium text-gray-900 dark:text-white">
            Company Information
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Details shown to other users and companies.
          </p>
        </div>
        <div className="md:col-span-2 mt-5 md:mt-0">
          <form className="shadow sm:rounded-md sm:overflow-hidden p-5 bg-white dark:bg-zinc-800">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {[
                "name",
                "email",
                "website",
                "mobile",
                "establishment_date",
                "head",
                "tax_id", // ✅ đổi từ gstin
              ].map((field) => (
                <div key={field}>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {field.replace("_", " ").toUpperCase()}
                  </label>
                  <input
                    type={
                      field === "email"
                        ? "email"
                        : field === "establishment_date"
                        ? "date"
                        : "text"
                    }
                    value={companyData[field]}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, [field]: e.target.value })
                    }
                    disabled={!edit}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full dark:bg-zinc-700 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white">
                About
              </label>
              <textarea
                rows="3"
                value={companyData.about}
                onChange={(e) =>
                  setCompanyData({ ...companyData, about: e.target.value })
                }
                disabled={!edit}
                className="shadow-sm mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2.5"
              />
            </div>
            <div className="px-4 py-3 text-right">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={handleEditSave}
              >
                {edit ? "Save" : "Edit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompanyProfileWrapper({ user }) {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <CompanyProfile user={user} />
    </Auth.UserContextProvider>
  );
}
