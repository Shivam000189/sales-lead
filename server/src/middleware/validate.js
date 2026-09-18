const validate = (schema) => {

  return (req, res, next) => {

    try {

      schema.parse(req.body);

      next();

    } catch (error) {

      return res.status(400).json({
        success:false,
        message:"Validation failed",
        errors:error.errors.map((err)=>({
          field:err.path[0],
          message:err.message,
        })),
      });

    }

  };

};


validate.query = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }
  };
};

module.exports = validate;