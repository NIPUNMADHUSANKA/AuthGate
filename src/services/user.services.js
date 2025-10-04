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

module.exports = { saveUser };
