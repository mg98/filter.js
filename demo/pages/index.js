import { useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import DataTable from './components/dataTable'
import sample from '../sample.json'
import { matchCondition } from '@mg98/filter-js'
import { useState } from 'react'
import GitHubSvg from '../public/github.svg'
import CopySvg from '../public/copy.svg'

export default function Home() {
  const [val, setVal ] = useState("Age > 18 and Address.City not in ('Hoover', 'Asheville')")
  let [error, setError] = useState(null)

  let initData
  try {
    initData = sample.filter(el => matchCondition(el, val));
    error = ''
  } catch (err) {
    error = err;
  }
  let [data, setData] = useState(initData)

  const updateData = () => {
    try {
      setData(sample.filter(el => matchCondition(el, val)));
      setError(null);
    } catch (err) {
      setError(err)
    }
  }

  const CopyCommand = () => {
    useEffect(() => {
      navigator.clipboard.writeText('npm i @mg98/flter-js')
    })
  }

  const handleChange = e => {
    setVal(e.target.value);
    updateData()
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>filter.js - Query JSONs using SQL-like syntax!</title>
        <meta name="description" content="This JS library that enables you to formulate complex conditions in a convenient string syntax which can then be matched with objects and further query a JSON array." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <a href="https://github.com/mg98/filter-js" title="View source code">
        <GitHubSvg />
      </a>

      <main className={styles.main}>
        <h1 className={styles.title}>filter.js</h1>
        <a href="https://www.npmjs.com/package/@mg98/filter-js">
          <img src='https://badge.fury.io/js/@mg98%2Ffilter-js.svg' alt='npm version' height='18' width='116' />
        </a>

        <p className={styles.description}>This JS library enables you to formulate complex conditions in a convenient string syntax which can then be matched with objects and further query a JSON array. 
          Give it a try!</p>

        <p className={styles.install} title='Click to copy' onClick={CopyCommand()}>
          <code>npm i @mg98/filter-js</code>
          <CopySvg className={styles.copyBtn} alt='Copy' />
        </p>

        <p className={styles.description}>
          <code className={styles.code}>matchCondition(data, &quot;
          <input value={val} onChange={handleChange} className={styles.query} />
          &quot;)</code>
        </p>

        {error && <p style={{color:'red'}}>Error: {error.message}</p>}

        <DataTable data={data} />
        <div className={styles.resultCount}>{data.length} results.</div>
      </main>

      <footer className={styles.footer}>
        <a href="./docs">Documentation</a>
      </footer>
    </div>
  )
}
