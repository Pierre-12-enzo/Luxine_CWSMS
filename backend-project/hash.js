const bcrypt = require('bcrypt')

const hashPassword = async (password) => {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return console.log(hashedPassword)
}

hashPassword('admin123')