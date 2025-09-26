import { useEffect, useState } from "react";
import { Auth } from "@supabase/ui";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

const Login = () => {
  const { user } = Auth.useUser();
  const router = useRouter();
  const [type, setType] = useState(null);

  useEffect(() => {
    const createRecordIfNotExists = async () => {
      if (user && type) {
        if (type === "user") {
          // kiểm tra profile đã có chưa
          const { data: existing } = await supabase
            .from("profile")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!existing) {
            await supabase.from("profile").insert([
              {
                id: user.id,
                first_name: user.email.split("@")[0],
                last_name: "",
                age: null,
                place: "",
                disability_type: "",
                disability: "",
                severity: "",
                qualifications: "",
              },
            ]);
            console.log("✅ New user profile created");
          }
        } else if (type === "company") {
          // kiểm tra company đã có chưa
          const { data: existing } = await supabase
            .from("company")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!existing) {
            await supabase.from("company").insert([
              {
                id: user.id,
                name: user.email.split("@")[0] + " Company",
                head: "",
                mobile: "",
                website: "",
                gstin: "",
              },
            ]);
            console.log("✅ New company profile created");
          }
        }

        // lưu accessLevel để Profile.js biết render gì
        localStorage.setItem("accessLevel", type);

        // redirect sang /profile
        router.push("/profile");
      }
    };

    createRecordIfNotExists();
  }, [user, type]);

  return (
    <section className="lg:p-20 flex-col items-center my-10 lg:my-0">
      <div>
        <h1 className="mb-4 font-semibold text-gray-900 dark:text-white text-center">
          Login As
        </h1>

        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700 mb-2">
          <input
            id="bordered-radio-1"
            type="radio"
            name="bordered-radio"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
            onChange={() => setType("user")}
          />
          <label
            htmlFor="bordered-radio-1"
            className="py-4 ml-2 w-full text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            User
          </label>
        </div>

        <div className="flex items-center pl-4 rounded border border-gray-200 dark:border-gray-700">
          <input
            id="bordered-radio-2"
            type="radio"
            name="bordered-radio"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
            onChange={() => setType("company")}
          />
          <label
            htmlFor="bordered-radio-2"
            className="py-4 ml-2 w-full text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Company
          </label>
        </div>
      </div>

      <article className="mt-6">
        <Auth supabaseClient={supabase} />
      </article>
    </section>
  );
};

export default function logi() {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <Login />
    </Auth.UserContextProvider>
  );
}
