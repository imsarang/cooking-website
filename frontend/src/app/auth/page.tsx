"use client";

import '../../styles/auth/home.css'
import MainSection from "../../components/auth/MainSection"
import Layout from '@/app/layout'

const Auth = ()=>{
  return (
    <div className='auth-main'>
    <MainSection/>
    </div>
  )
}

Auth.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Auth