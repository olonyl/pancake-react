import Amplify from 'aws-amplify';
import config from '../src/aws-exports';

import React from 'react';
import Link from 'next/link'
import Layout from '../components/layout'
import TopBar from '../components/topbar'
import Notes from './notes'

Amplify.configure(config);
const initialFormState = { name: '', description: '' }

export default function Home() {
    return (
        <Notes />
    )
}

Home.getLayout = function getLayout(page) {
    return (
        <Layout>
            <TopBar />
            {page}
        </Layout>
    )
}
