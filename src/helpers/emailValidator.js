export function emailValidator(email) {
  const re = /\S+@\S+\.\S+/
  if (!email || email.length <= 0) return "Email alanı boş bırakılamaz"
  if (!re.test(email)) return 'Ooops! Geçerli bir mail adresine ihtiyacımız var'
  return ''
}
