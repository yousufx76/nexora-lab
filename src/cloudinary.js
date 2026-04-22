export const CLOUDINARY_CLOUD = 'dvigquyok'
export const CLOUDINARY_PRESET = 'nexora_preset'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_PRESET)
  formData.append('cloud_name', CLOUDINARY_CLOUD)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  if (data.secure_url) return data.secure_url
  throw new Error('Upload failed')
}