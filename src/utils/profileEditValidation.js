const profileEditValidation = (data) => {
  const ALLOWED_EDITS = [
    "firstName",
    "lastName",
    "age",
    "photoURL",
    "gender",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(data).every((key) =>
    ALLOWED_EDITS.includes(key)
  );

  return isEditAllowed;
};

module.exports = profileEditValidation;
