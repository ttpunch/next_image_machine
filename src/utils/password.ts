import {genSaltSync,hashSync} from "bcryptjs"
export function saltAndHashPassword(password: string): string {
  // Use a library like bcrypt to salt and hash the password
  //using bcrypt provide code
    const saltRounds = 10
    const salt = genSaltSync(saltRounds)
    const hash = hashSync(password, salt)
    return hash
  
}