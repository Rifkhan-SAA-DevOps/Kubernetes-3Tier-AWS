/**
 * Shared Mongoose schema transform: replaces `_id` with `id` (string)
 * and strips `__v`/`_id` so every model returns a consistent shape,
 * matching the MySQL backend's API contract.
 */
function applyToJSON(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  });
}

module.exports = { applyToJSON };
