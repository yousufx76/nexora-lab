import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'

export function useCollection(collectionName, orderField = null) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = collection(db, collectionName)
        const q = orderField ? query(ref, orderBy(orderField)) : ref
        const snap = await getDocs(q)
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setData(docs)
      } catch (err) {
        console.error('Firestore error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [collectionName, orderField])

  return { data, loading }
}