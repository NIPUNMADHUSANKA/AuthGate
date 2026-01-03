const dbConnection = require("./dbConnection");

const saveUser = async (userData) => {
  const { email, password } = userData;
  try {
    const result = await dbConnection.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password]
    );
    return result.rows[0];
  } catch (error) {
    // Let the controller / global error handler deal with it
    throw error;
  }
};

const saveToken = async(user_id, token_hash, expires_at) =>{
  try {
    const expiresAt = new Date(Date.now() + expires_at * 1000);
    const result = await dbConnection.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)  RETURNING id",
      [user_id, token_hash, expiresAt]
    )
    return { id: result.rows[0].id, user_id, expiresAt };;
  } catch (error) {
    throw error;
  }
}

const getUserByEmail = async (email) =>{
  try {
    const result = await dbConnection.query(
      "SELECT id, password_hash, email_verified FROM users where email = $1", 
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
      throw error; 
  }
};

const getUserByGoogle = async (google_id) =>{
  try {
    const result = await dbConnection.query(
      "SELECT id, password_hash, email, email_verified FROM users where google_id = $1", 
      [google_id]
    );
    return result.rows[0] || null;
  } catch (error) {
      throw error; 
  }
};

const updateUserByGoogle = async (email, google_id) =>{
  try {
    const result = await dbConnection.query(
      "UPDATE users SET google_id=$1 WHERE email=$2", 
      [google_id, email]
    );
    return result.rowCount > 0;
  } catch (error) {
      throw error; 
  }
};

const getUserById = async (id) =>{
  try {
    const result = await dbConnection.query(
      "SELECT id, email, role FROM users where id = $1", 
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
      throw error; 
  }
};

const getRefreshToken = async (user_id) => {
  try {
    const result = await dbConnection.query(
      "SELECT id, token_hash FROM refresh_tokens where user_id = $1 AND expires_at > NOW() ORDER BY expires_at DESC LIMIT 1",
      [user_id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

const deleteRefreshToken = async(user_id) =>{
  try {
    const result = await dbConnection.query(
      "DELETE FROM refresh_tokens WHERE user_id = $1",
      [user_id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
}

const userAccountActivate = async(user_id, email_verified) =>{
  try {
    const result = await dbConnection.query(
      "UPDATE users SET email_verified = $1 WHERE id = $2",
      [email_verified, user_id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
}

const userPasswordUpdate = async(user_id, hashPassword) =>{
  try {
    const result = await dbConnection.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [hashPassword, user_id]);
    return result.rowCount > 0;
  } catch (error) {
    throw error;
  }
}

const checkAccountActivate = async(user_id) =>{
  try {
    const result = await dbConnection.query(
      "SELECT email_verified FROM users WHERE id = $1",
      [user_id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
}

const deleteUserAccountService = async(user_id) =>{
  try {
    const result = await dbConnection.query(
      "DELETE FROM users WHERE id=$1",
      [user_id]);

    const res = await dbConnection.query(
      "DELETE FROM sessions WHERE JSON_UNQUOTE(JSON_EXTRACT(CAST(data AS JSON), '$.passport.user')) = $1",
      [user_id]);

    return true && res.rowCount > 0;
  } catch (error) {
    throw error;
  }
}


module.exports = { saveUser, getUserByEmail, getUserById, saveToken, getRefreshToken, updateUserByGoogle, getUserByGoogle, deleteRefreshToken, userAccountActivate, checkAccountActivate, userPasswordUpdate, deleteUserAccountService};
