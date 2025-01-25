const updateValidation = (data) => {
  const ALLOWED_UPDATES = ["password", "age", "photoURL", "about", "skills"];

  const isEditAllowed = Object.keys(data).every((key) =>
    ALLOWED_UPDATES.includes(key)
  );
  if (!isEditAllowed) {
    throw new Error("Edit not allowed");
  }
};

module.exports = updateValidation;
