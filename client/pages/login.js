import { Auth } from "@supabase/ui";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import { useState, useEffect } from "react";

const Home = (props) => {
  const { user } = Auth.useUser();
  const router = useRouter();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createOrUpdateProfile = async () => {
      if (!user || !type) return;

      setLoading(true);
      try {
        // check có profile chưa
        const { data: existing, error: selectError } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          // PGRST116 = not found
          throw selectError;
        }

        if (!existing) {
          // chưa có thì insert
          const { error: insertError } = await supabase.from("profile").insert([
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
              role: type,
            },
          ]);

          if (insertError) throw insertError;
          console.log("✅ Profile created");
        } else {
          // có rồi thì update role
          const { error: updateError } = await supabase
            .from("profile")
            .update({ role: type })
            .eq("id", user.id);

          if (updateError) throw updateError;
          console.log("✅ Profile updated with role:", type);
        }

        router.push("/profile");
      } catch (error) {
        console.error("❌ Error handling profile:", error.message);
        alert("Đã có lỗi khi tạo/cập nhật profile: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    createOrUpdateProfile();
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

      {loading && <p className="mt-4 text-blue-600">Loading...</p>}

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
