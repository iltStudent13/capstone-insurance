const isCastError = (err) => err?.name === "CastError";
const isDuplicateKeyError = (err) => err?.code === 11000;

export default function errorHandler(err, req, res, next) {
  if (isCastError(err)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (isDuplicateKeyError(err)) {
    return res.status(409).json({ message: "Duplicate value" });
  }

  return res.status(500).json({ message: "Server error" });
}
