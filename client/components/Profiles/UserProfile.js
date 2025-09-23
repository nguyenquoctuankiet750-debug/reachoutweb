import { useState, useEffect } from 'react';
import { Auth } from '@supabase/ui';
import { supabase } from '../../utils/supabaseClient';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { useDropzone } from 'react-dropzone';

function UserProfile({ user }) {
  const [edit, setEdit] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [disabilityType, setDisabilityType] = useState('');
  const [severity, setSeverity] = useState('');
  const [age, setAge] = useState('');
  const [cccd, setCCCD] = useState('');
  const [disability, setDisability] = useState('');
  const [location, setLocation] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [publicURL, setPublicURL] = useState(null);
  const [resumeURL, setResumeURL] = useState(null);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({});

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const setupUser = async () => {
    const query = JSON.stringify({
      query: `query MyQuery {
        profile(where: {id: {_eq: "${user.id}"}}) {
          id
          cccd
          age
          disability
          disability_type
          first_name
          last_name
          mobile
          place
          qualifications
          severity
        }
      }`,
    });

    const response = await fetch(
      'https://reachout-sih.hasura.app/v1/graphql',
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        },
        method: 'POST',
        body: query,
      },
    );

    const responseJson = await response.json();
    console.log(responseJson);

    if (responseJson.data.profile.length !== 0) {
      const u = responseJson.data.profile[0];
      setFirstName(u.first_name);
      setLastName(u.last_name);
      setPhone(u.mobile);
      setDisability(u.disability);
      setSeverity(u.severity);
      setCCCD(u.cccd);
      setLocation(u.place);
      setDisabilityType(u.disability_type);
      setQualifications(u.qualifications);
    } else {
      setNewUser(true);
      setEdit(true);
    }
  };

  useEffect(() => {
    setupUser();
  }, []);

  const submitForm = async () => {
    let query;
    if (newUser) {
      query = JSON.stringify({
        query: `mutation MyMutation {
          insert_profile(objects: {
            cccd: "${cccd}", 
            age: "${age}", 
            disability: "${disability}", 
            disability_type: "${disabilityType}", 
            first_name: "${firstName}", 
            last_name: "${lastName}", 
            mobile: "${phone}", 
            place: "${location}", 
            qualifications: "${qualifications}", 
            severity: "${severity}", 
            id: "${user.id}"
          }) {
            returning { id }
          }
        }`,
      });
      setNewUser(false);
    } else {
      query = JSON.stringify({
        query: `mutation MyMutation {
          update_profile(
            where: {id: {_eq: "${user.id}"}}, 
            _set: {
              cccd: "${cccd}", 
              age: "${age}", 
              disability: "${disability}", 
              disability_type: "${disabilityType}", 
              first_name: "${firstName}", 
              last_name: "${lastName}", 
              mobile: "${phone}", 
              place: "${location}", 
              qualifications: "${qualifications}", 
              severity: "${severity}"
            }
          ) {
            returning { id }
          }
        }`,
      });
    }

    const response = await fetch(
      'https://reachout-sih.hasura.app/v1/graphql',
      {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        },
        method: 'POST',
        body: query,
      },
    );

    const responseJson = await response.json();
    console.log(responseJson);
    if (responseJson.errors) {
      alert("❌ Lỗi khi lưu profile: " + responseJson.errors[0].message);
    } else {
      alert("✅ Lưu profile thành công!");
    }
  };

  function formResponse(e) {
    e.preventDefault();
    if (edit) {
      setEdit(false);
      submitForm();
    } else {
      setEdit(true);
    }
  }

  return (
    <div>
      <div className="mt-10 sm:mt-0 p-10">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-3xl font-medium leading-6 text-gray-900 dark:text-white">
                Thông tin cá nhân
              </h3>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2 ">
            <form className="shadow sm:rounded-md sm:overflow-hidden p-5 border-gray-300 dark:bg-zinc-800">
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Họ
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!edit}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Tên
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!edit}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="cccd" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Số CCCD
                </label>
                <input
                  type="text"
                  id="cccd"
                  className="input"
                  value={cccd}
                  onChange={(e) => setCCCD(e.target.value)}
                  disabled={!edit}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="severity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Mức độ khuyết tật
                </label>
                <select
                  id="severity"
                  className="input"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  disabled={!edit}
                >
                  <option value="">Chọn mức độ</option>
                  <option value="Nhẹ">Nhẹ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Nặng">Nặng</option>
                </select>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 dark:bg-zinc-800">
                <button
                  type="submit"
                  className="btn-primary"
                  onClick={(e) => formResponse(e)}
                >
                  {edit ? 'Lưu' : 'Chỉnh sửa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function logi({ user }) {
  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <UserProfile supabaseClient={supabase} user={user} />
    </Auth.UserContextProvider>
  );
}
