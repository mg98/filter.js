import Head from 'next/head'
import styles from '../styles/Home.module.css'
import DataTable from './components/dataTable'
import sample from '../sample.json'
import { match } from '@mg98/condition-js'
import { useState } from 'react'
import GitHubSvg from '../public/github.svg'

export default function Home() {
  const [val, setVal ] = useState("Age > 18 and Age < 30 and Address.City not in ('Hoover', 'Asheville')")
  let error = null
  let data = []
  
  const updateData = () => {
    try {
      data = sample.filter(el => match(el, val))
      error = null
    } catch (e) {
      error = e;
    }
  }

  updateData()

  const handleChange = e => {
    setVal(e.target.value);
    updateData()
  }

  return (
    <div className={styles.container}>
      <a href="https://github.com/mg98/condition-js" title='View source code'>
        <GitHubSvg />
      </a>

      <Head>
        <title>condition.js - A JS Library</title>
        <meta name="description" content="condition.js is a JS library that enables you to formulate complex conditions in a convenient string syntax." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>condition.js</h1>
        <a href="https://badge.fury.io/js/@mg98%2Fcondition-js">
          <img src='https://badge.fury.io/js/@mg98%2Fcondition-js.svg' alt='npm version' height='18' width='116' />
        </a>

        <p className={styles.description}>This is a JS library that enables you to formulate complex conditions in a convenient string syntax. 
          Give it a try!</p>

        <p className={styles.description}>
          <code className={styles.code}>Condition.match(data, &quot;
          <input value={val} onChange={handleChange} className={styles.query} />
          &quot;)</code>
        </p>

        {error && <p style={{color:'red'}}>Error: {error.message}</p>}

        <DataTable data={data} />
        <div className={styles.resultCount}>{data.length} results.</div>
      </main>

      {/* <footer className={styles.footer}>
      </footer> */}
    </div>
  )
}
