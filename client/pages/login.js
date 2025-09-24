import { Auth } from "@supabase/ui";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { useState, useEffect } from "react";

const Home = (props) => {
  const { user } = Auth.useUser();
  const router = useRouter();
  const [type, setType] = useState(null);

  useEffect(() => {
    const createProfileIfNotExists = async () => {
      if (user && type) {
        if (type === "user") {
          // kiểm tra user profile
          const { data: existing } = await supabase
            .from("profile")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!existing) {
            const { error } = await supabase.from("profile").insert([
              {
                id: user.id,
                first_name: user.email.split("@")[0], // lấy phần trước @
                last_name: user.email,
              },
            ]);
            if (error) {
              console.error("❌ Error creating user profile:", error.message);
            } else {
              console.log("✅ Created user profile");
            }
          }
        } else if (type === "company") {
          // kiểm tra company profile
          const { data: existing } = await supabase
            .from("company")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!existing) {
            const { error } = await supabase.from("company").insert([
              {
                id: user.id,
                name: user.email.split("@")[0] + " Company",
                head: user.email,
              },
            ]);
            if (error) {
              console.error("❌ Error creating company profile:", error.message);
            } else {
              console.log("✅ Created company profile");
            }
          }
        }

        // chuyển hướng sang /profile
        router.push("/profile");
      }
    };

    createProfileIfNotExists();
  }, [user, type]);

  return (
    <section className="lg:p-20 flex-col items-center my-10 lg:my-0">
      <div>
        <h1 className="mb-4 font-semibold text-gray-900 dark:text-white text-center">
          Login As
        </h1>

        {/* Chọn User */}
        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700 mb-2">
          <input
            id="radio-user"
            type="radio"
            name="login-type"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600"
            onChange={() => {
              localStorage.setItem("accessLevel", "user");
              setType("user");
            }}
          />
          <label
            htmlFor="radio-user"
            className="py-2 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            User
          </label>
        </div>

        {/* Chọn Company */}
        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700">
          <input
            id="radio-company"
            type="radio"
            name="login-type"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600"
            onChange={() => {
              localStorage.setItem("accessLevel", "company");
              setType("company");
            }}
          />
          <label
            htmlFor="radio-company"
            className="py-2 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Company
          </label>
        </div>
      </div>

      {/* Form Supabase Auth */}
      <article className="mt-6">{props.children}</article>
    </section>
  );
};

export default function LoginPage() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Home supabaseClient={supabase}>
        <Auth supabaseClient={supabase} />
      </Home>
    </Auth.UserContextProvider>
  );
}
