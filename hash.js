const bcrypt = require("bcrypt");
async function hashPassword() {
    const hash = await bcrypt.hash("123456AdminCMS", 10);
    console.log(hash);
}
hashPassword();