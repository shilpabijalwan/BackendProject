// export const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//         res.status(error.code || "error").json({
//         success: false,
//         message: error.message,
//     });
//   }
// };
 
// OR

export const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => {
    console.log(err);
    next(err);
  });
};
