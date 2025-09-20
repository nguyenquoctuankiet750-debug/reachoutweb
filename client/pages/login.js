import { useRouter } from "next/router";
import { Auth } from "@supabase/ui";
import { supabase } from "../utils/supabaseClient";
import { useState, useEffect } from "react";

const Home = (props) => {
  const { user } = Auth.useUser();
  const router = useRouter();
  const [type, setType] = useState(null);

  useEffect(() => {
    const createProfileIfNotExists = async () => {
      if (user && type) {
        // Kiểm tra xem profile đã tồn tại chưa
        const { data: existing } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!existing) {
          // Nếu chưa có thì insert
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

          if (error) {
            console.error("❌ Error inserting profile:", error.message);
          } else {
            console.log("✅ Profile created for new user");
          }
        }

        // Redirect sang /profile
        router.push("/profile");
      }
    };

    createProfileIfNotExists();
  }, [user, type]); // chạy lại khi user login hoặc chọn type

  return (
    <section className="lg:p-20 flex-col items-center my-10 lg:my-0">
      <div>
        <h1 className="mb-4 font-semibold text-gray-900 dark:text-white text-center">
          Login As
        </h1>

        {/* Chọn User */}
        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700">
          <input
            id="bordered-radio-1"
            type="radio"
            name="bordered-radio"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            onChange={() => {
              localStorage.setItem("accessLevel", "user");
              setType("user");
            }}
          />
          <label
            htmlFor="bordered-radio-1"
            className="py-4 ml-2 w-full text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            User
          </label>
        </div>

        {/* Chọn Company */}
        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700">
          <input
            id="bordered-radio-2"
            type="radio"
            name="bordered-radio"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            onChange={() => {
              localStorage.setItem("accessLevel", "company");
              setType("company");
            }}
          />
          <label
            htmlFor="bordered-radio-2"
            className="py-4 ml-2 w-full text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Company
          </label>
        </div>

        {/* Thông báo nếu chưa chọn role */}
        {user && !type && (
          <p className="text-red-500 text-center mt-4">
            👉 Vui lòng chọn "User" hoặc "Company" để tiếp tục
          </p>
        )}
      </div>

      {/* Form login mặc định của Supabase UI */}
      <article>{props.children}</article>
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
