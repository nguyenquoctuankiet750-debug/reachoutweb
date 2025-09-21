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
  const [CCCD, setCCCD] = useState('');
  const [disabilityType, setDisabilityType] = useState('');
  const [severity, setSeverity] = useState('');
  const [age, setAge] = useState('');
  const [disability, setDisability] = useState('');
  const [location, setLocation] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [publicURL, setPublicURL] = useState(null);
  const [resumeURL, setResumeURL] = useState(null);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({});

  const setupUser = async () => {
    console.log(user.id);
    const query = JSON.stringify({
      query: `query MyQuery {
        profile(where: {id: {_eq: "${user.id}"}}) {
          id
          CCCD
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
      }`
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
      }
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
      setCCCD(u.CCCD);
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
            CCCD: "${CCCD}", 
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
        }`
      });
      setNewUser(false);
    } else {
      query = JSON.stringify({
        query: `mutation MyMutation {
          update_profile(
            where: {id: {_eq: "${user.id}"}}, 
            _set: {
              CCCD: "${CCCD}", 
              age: "${age}", 
              disability: "${disability}", 
              disability_type: "${disabilityType}", 
              first_name: "${firstName}", 
              last_name: "${lastName}", 
              mobile: "${phone}", 
              place: "${location}", 
              qualifications: "${qualifications}", 
              severity: ${severity}
            }
          ) {
            returning { id }
          }
        }`
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
      }
    );

    const responseJson = await response.json();
    console.log(responseJson);
  };

  return (
    <div>
      <h3 className="text-3xl font-medium">Thông tin cá nhân</h3>
      <form className="p-5">
        <label>Họ</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

        <label>Tên</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

        <label>Số điện thoại</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>CCCD</label>
        <input value={CCCD} onChange={(e) => setCCCD(e.target.value)} />

        <label>Tuổi</label>
        <input value={age} onChange={(e) => setAge(e.target.value)} />

        <label>Nơi ở</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} />

        <label>Loại khuyết tật</label>
        <input value={disabilityType} onChange={(e) => setDisabilityType(e.target.value)} />

        <label>Mức độ khuyết tật</label>
        <input value={severity} onChange={(e) => setSeverity(e.target.value)} />

        <label>Bằng cấp</label>
        <input value={qualifications} onChange={(e) => setQualifications(e.target.value)} />

        <button type="button" onClick={submitForm}>
          {edit ? 'Lưu' : 'Sửa'}
        </button>
      </form>
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
