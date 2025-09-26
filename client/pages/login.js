import { Auth } from "ui"; // nếu bạn dùng @supabase/ui thì thay "ui" thành "@supabase/ui"
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { useState, useEffect } from "react";

const Home = (props) => {
  const { user } = Auth.useUser();
  const router = useRouter();
  const [type, setType] = useState(null);

  useEffect(() => {
    const createRecordIfNotExists = async () => {
      if (!user || !type) return;

      if (type === "user") {
        const { data: existing } = await supabase
          .from("profile")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const { error } = await supabase.from("profile").insert([
            {
              id: user.id,
              first_name: user.email.split("@")[0],
              last_name: user.email,
              age: null,
              place: null,
              disability_type: null,
              disability: null,
              severity: null,
              qualifications: null,
            },
          ]);
          if (error) console.error("❌ Error creating profile:", error.message);
          else console.log("✅ New user profile created");
        }
      }

      if (type === "company") {
        const { data: existing } = await supabase
          .from("company")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existing) {
          const { error } = await supabase.from("company").insert([
            {
              id: user.id,
              name: user.email.split("@")[0],
              head: user.email,
              mobile: null,
              website: null,
              gstin: null,
            },
          ]);
          if (error) console.error("❌ Error creating company:", error.message);
          else console.log("✅ New company profile created");
        }
      }

      // redirect sang profile
      router.push("/profile");
    };

    createRecordIfNotExists();
  }, [user, type]);

  return (
    <section className="lg:p-20 flex-col items-center my-10 lg:my-0">
      <div>
        <h1 className="mb-4 font-semibold text-gray-900 dark:text-white text-center">
          Login As
        </h1>

        {/* Radio chọn User */}
        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700">
          <input
            id="radio-user"
            type="radio"
            name="role"
            className="w-4 h-4 text-blue-600"
            onChange={() => {
              localStorage.setItem("accessLevel", "user");
              setType("user");
            }}
          />
          <label
            htmlFor="radio-user"
            className="py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            User
          </label>
        </div>

        {/* Radio chọn Company */}
        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700">
          <input
            id="radio-company"
            type="radio"
            name="role"
            className="w-4 h-4 text-blue-600"
            onChange={() => {
              localStorage.setItem("accessLevel", "company");
              setType("company");
            }}
          />
          <label
            htmlFor="radio-company"
            className="py-4 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Company
          </label>
        </div>
      </div>

      <article>{props.children}</article>
    </section>
  );
};

export default function Login() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Home supabaseClient={supabase}>
        <Auth supabaseClient={supabase} />
      </Home>
    </Auth.UserContextProvider>
  );
}
