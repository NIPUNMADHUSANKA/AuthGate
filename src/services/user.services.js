const dbConnection = require("./dbConnection");

const saveUser = async (userData) => {
  const { email, password } = userData;
  try {
    const [result] = await dbConnection.query(
      "INSERT INTO users (email, password_hash) VALUES (?,?)",
      [email, password]
    );
    return { id: result.insertId, email };
  } catch (error) {
    // Let the controller / global error handler deal with it
    throw error;
  }
};

const saveToken = async(user_id, token_hash, expires_at) =>{
  try {
    const [result] = await dbConnection.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND))",
      [user_id, token_hash, expires_at]
    )
    return { id: result.insertId, user_id, expires_at };
  } catch (error) {
    throw error;
  }
}

const getUserByEmail = async (email) =>{
  try {
    const [result] = await dbConnection.query(
      "SELECT id, password_hash FROM users where email = ?", 
      [email]
    );
    return result[0];
  } catch (error) {
      throw error; 
  }
};

const getUserById = async (id) =>{
  try {
    const [result] = await dbConnection.query(
      "SELECT id, email, role FROM users where id = ?", 
      [id]
    );
    return result[0];
  } catch (error) {
      throw error; 
  }
};

const getRefreshToken = async (user_id) => {
  try {
    const [result] = await dbConnection.query(
      "SELECT id, token_hash FROM refresh_tokens where user_id = ? AND expires_at > NOW()",
      [user_id]);
    return result[0];
  } catch (error) {
    throw error;
  }
}

module.exports = { saveUser, getUserByEmail, getUserById, saveToken, getRefreshToken };
